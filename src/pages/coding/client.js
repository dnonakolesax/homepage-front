
import * as Automerge from "@automerge/automerge/slim";

const BLOCK_ID_LEN = 36;
const enc = new TextEncoder();
const dec = new TextDecoder();

function encodeFrame(blockId, payload /* Uint8Array */) {
    const idBytes = enc.encode(blockId); // длина 36
    const buf = new Uint8Array(idBytes.length + payload.length);
    buf.set(idBytes, 0);
    buf.set(payload, idBytes.length);
    return buf;
}

function decodeFrame(buf /* Uint8Array */) {
    const idBytes = buf.slice(0, BLOCK_ID_LEN);
    const blockId = dec.decode(idBytes);
    const payload = buf.slice(BLOCK_ID_LEN);
    return { blockId, payload };
}

export class BlockState {
    constructor(blockId, containerEl, textareaEl) {
        this.blockId = blockId;
        this.containerEl = containerEl;
        this.textareaEl = textareaEl;

        // Документ Automerge для этого блока
        const initialText = textareaEl?.value || "";
        this.doc = Automerge.from({ text: initialText });
        this.syncState = Automerge.initSyncState();

        this.isApplyingRemote = false;
    }
}

export class NotebookClient {
    constructor(nbID) {
        this.nbID = nbID;
        this.blockId = null; // активный блок по умолчанию

        this.ws = null;
        this.editor = null;
        this.model = null;
        this.blocks = new Map();
        this.doc = Automerge.from({ text: "" });
        this.syncState = Automerge.initSyncState();
        this.isApplyingRemote = false;

        this.connectWS();
    }

    initEditor() {
        this.editor =
            this.model = this.editor.getModel();

        this.editor.onDidChangeModelContent(() => {
            if (this.isApplyingRemote) return;

            const text = this.model.getValue();
            this.doc = Automerge.change(this.doc, d => {
                d.text = text;
            });

            //this.pumpOutgoing();
        });
    }

    setStatus(text) {
        //this.statusEl.textContent = text;
    }

    wsUrl() {
        const url = `ws://127.0.0.1:5004/api/v1/fm/ws?nb=${encodeURIComponent(this.nbID)}`;
        return url;
    }

    connectWS() {
        if (this.ws) {
            try { this.ws.close(); } catch { }
        }

        this.setStatus("connecting...");

        this.ws = new WebSocket(this.wsUrl());
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = () => {
            this.setStatus("connected");
            // сообщаем серверу, какой блок сейчас активен
            //this.sendBlockSelect();
            // и запускаем sync для текущего блока
            //this.pumpOutgoing();
        };


        this.ws.onmessage = (event) => {
            if (!(event.data instanceof ArrayBuffer)) return;

            const arrayBuffer = event.data;
            const buf = new Uint8Array(arrayBuffer);
            const { blockId, payload } = decodeFrame(buf);

            const state = this.blocks.get(blockId);
            if (!state) return;

            state.isApplyingRemote = true;
            try {
                const [doc2, syncState2] =
                    Automerge.receiveSyncMessage(state.doc, state.syncState, payload);

                state.doc = doc2;
                state.syncState = syncState2;

                const newText = state.doc.text ?? "";
                const editor = state.editor;
                if (!editor) return;

                const model = editor.getModel();
                const oldText = model.getValue();

                if (newText === oldText) {
                    return; // ничего не меняем — курсор остаётся где был
                }

                // 1. Запоминаем текущее положение курсора в offset’ах
                const selection = editor.getSelection();
                const isCollapsed = selection && selection.isEmpty();

                let startOffset = 0;
                let endOffset = 0;
                if (selection) {
                    const startPos = selection.getStartPosition();
                    const endPos = selection.getEndPosition();
                    startOffset = model.getOffsetAt(startPos);
                    endOffset = model.getOffsetAt(endPos);
                }

                // 2. Обновляем текст
                model.setValue(newText);

                // 3. Восстанавливаем позицию относительно нового текста
                const docLen = newText.length;
                const clampedStart = Math.min(startOffset, docLen);
                const clampedEnd = Math.min(endOffset, docLen);

                const newStartPos = model.getPositionAt(clampedStart);
                const newEndPos = model.getPositionAt(clampedEnd);

                if (isCollapsed) {
                    // просто каретка
                    editor.setPosition(newStartPos);
                } else {
                    // выделение
                    editor.setSelection(
                        new monaco.Selection(
                            newStartPos.lineNumber, newStartPos.column,
                            newEndPos.lineNumber, newEndPos.column,
                        )
                    );
                }

                // если это был первый sync по блоку — считаем initial sync завершённым
                state.hasInitialSync = true;
                editor.updateOptions({ readOnly: false });
            } catch (e) {
                console.error("receiveSyncMessage error", e);
            } finally {
                state.isApplyingRemote = false;
            }

            // при необходимости — ответный sync
            this.pumpOutgoing(blockId);
        };


        this.ws.onclose = () => {
            this.setStatus("reconnecting...");
            setTimeout(() => this.connectWS(), 1000);
        };

        this.ws.onerror = (err) => {
            console.error("ws error", err);
        };
    }

    joinBlock(blockId) {
        this.ws.send(JSON.stringify({
            kind: "block-join",
            blockId: blockId
        }));
    }

    wdone(blockId) {
        this.ws.send(JSON.stringify({
            kind: "block-join",
            blockId: blockId
        }));
    }

    handleTextMessage(text) {
        // Для теста достаточно логировать. Здесь могут приходить:
        // - block-select от других пользователей
        // - любые другие текстовые сообщения
        try {
            const msg = JSON.parse(text);
            if (msg.kind === "block-select") {
                console.log("Другой клиент переключился на блок:", msg.blockId);
            }
            // добавить мув удаление добавление блоков
            // при желании можно что-то рисовать в UI
        } catch {
            // не JSON — игнорируем
        }
    }

    handleBinaryMessage(bytes) {
        // Automerge sync для активного блока
        this.isApplyingRemote = true;
        try {
            const [newDoc, newState] =
                Automerge.receiveSyncMessage(this.doc, this.syncState, bytes);

            this.doc = newDoc;
            this.syncState = newState;

            const newText = this.doc.text ?? "";
            // возможно, сервер ожидает ответные сообщения
            //this.pumpOutgoing();
        } catch (e) {
            console.error("receiveSyncMessage error", e);
        } finally {
            this.isApplyingRemote = false;
        }
    }

    pumpOutgoing(blockId) {
        const state = this.blocks.get(blockId);
        if (!state || this.ws.readyState !== WebSocket.OPEN) return;
        try {
            while (true) {
                const [newState, msg] = Automerge.generateSyncMessage(
                    state.doc,
                    state.syncState,
                );
                state.syncState = newState;
                if (!msg) break;

                const frame = encodeFrame(blockId, msg);
                this.ws.send(frame);
            }
        } catch (e) {
            console.error("sync error", e);
        }
    }

    sendBlockSelect() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const msg = {
            kind: "block-select",
            blockId: this.blockId
        };
        this.ws.send(JSON.stringify(msg));
    }

    setModel(model) {
        this.model = model;
    }

    switchBlock(newBlockId) {
        if (newBlockId === this.blockId) return;

        this.blockId = newBlockId;

        // Обнуляем локальный doc и syncState для простоты:
        // сервер при смене блока пошлёт полное состояние через sync.
        this.doc = Automerge.from({ text: "" });
        this.syncState = Automerge.initSyncState();

        // Ставим пустой текст в редактор, не триггеря sync
        this.isApplyingRemote = true;
        try {
            this.model.setValue("");
        } finally {
            this.isApplyingRemote = false;
        }

        // Сообщаем серверу о смене блока и запускаем sync
        this.sendBlockSelect();
        //this.pumpOutgoing();
    }
}
