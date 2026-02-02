import codingTemplate from "@pages/coding/coding.hbs";
import { Api } from "@modules/api";
import { marked } from "marked";
import { NotebookClient } from "@pages/coding/client.js"
import * as monaco from "monaco-editor";
import MD5 from "crypto-js/md5";
import * as Automerge from "@automerge/automerge/slim";
import { } from '@static/scripts/mathjax'
import hljs from 'highlight.js';
import { } from '@pages/coding/coding.scss'
let editorsCount = 0
let editor_id = {}
let id = ''
let attempts = 0
let order = []
let lorder = []
let texSources = []
let texSourcesSizes = []
let curr_id = ''
let curr_block_id = ''
let blocksCount = 0;
let textingCount = 0;
let socket = null;
let nc = null;
let kernel_ws = null;
let faking = false;

function resizeMonaco(e) {
    let editorEl = e.target.closest('.coding-wrap')
    if (!editorEl) {
        editorEl = e.target.closest('.texting-wrap')
    }
    // const coding = document.getElementById(`coding-${editorId}`)
    // if ((e.key === 'Enter' ) || (e.key === 'Backspace')) {
    //     const str = monaco.editor.getEditors()[Number(editorId)].getValue().toString()
    //     let add = 2;
    //     if (e.key === 'Backspace') {
    //         add = 1;
    //     }
    //     const blocks = str.match(/\r\n|\r|\n/).length + add;
    //     coding.style.height = (blocks*19).toString() + 'px';
    // }
}

function uzbek(e) {
    alert('uzbek')
}


async function onclick3(e) {
    let attr = e.target.getAttribute('text-id')
    let editorNum = e.target.getAttribute('ed-num')
    e.target.style.display = 'none'
    const tojik2 = document.getElementById(`edit-${attr}`)
    tojik2.style.display = 'inline'
    const texSource = monaco.editor.getEditors()[editorNum].getValue()
    console.log(texSource)
    const html = await marked.parse(texSource);
    let texting = document.getElementById(`texting-${attr}`);
    texting.innerHTML = html;
    texting.setAttribute('text-id', attr);
    const elements = document.getElementsByClassName("language-go")
    Array.from(elements).forEach((element) => {
        element.innerHTML = hljs.highlight(element.innerHTML, { language: 'golang' }).value
    })
    MathJax.typeset()
    texting.style.height = 'fit-content'
    texting.style.marginTop = '0px';
    texting.style.marginLeft = '20px'
    texting.style.marginBottom = '0px';
    document.getElementById(`edit-${attr}`).addEventListener('click', editTex)
    if (!faking) {
        nc.finishedEdit(e.target.getAttribute('block-id'));
    }
}

async function editTex(e) {
    let attr = e.target.getAttribute('text-id')
    const texting = document.getElementById(`texting-${attr}`)
    e.target.style.display = 'none'
    let texSource = texSources[attr]
    texting.innerHTML = ''
    texting.style.marginTop = '10px';
    texting.style.marginLeft = '0'
    texting.style.marginBottom = '10px';
    const tojik2 = document.getElementById(`save-${attr}`)
    tojik2.style.display = 'inline'
    let blocks = texSourcesSizes[attr]
    texting.style.height = (blocks * 19).toString() + 'px'
    const editor = monaco.editor.create(texting, {
        value: texSource,
        language: 'markdown',
        theme: 'vs-dark',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        autoIndent: "full",
        overviewRulerBorder: false,
        autoClosingBrackets: true,
        tabSize: 1,
        foldingStrategy: 'indentation',
        readOnly: false,
        minimap: { enabled: false },
        stickyScroll: {
            enabled: false,
        },
        scrollbar: {
            vertical: "hidden",
            handleMouseWheel: false,
            ignoreHorizontalScrollbarInContentHeight: true,
            verticalScrollbarSize: 0,
            verticalSliderSize: 0,
            horizontal: "hidden",
        }
    });
    texting.setAttribute("editor-id", editorsCount)
    editor.getModel().setEOL(monaco.editor.EndOfLineSequence.CR)
    const num = editorsCount




    texting.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter') || (e.key === 'Backspace')) {
            const blocks = monaco.editor.getEditors()[num].getModel().getLineCount()
            // let add = 2;
            // if (e.key === 'Backspace') {
            //     add = 1;
            // }
            // blocks = str.match(/\r\n|\r|\n/).length + add;
            texting.style.height = (blocks * 19).toString() + 'px';
        }
        //monaco.editor.getEditors()[0].revealLine(0, 0);
    })
    const editorNum = editorsCount
    document.getElementById(`save-${attr}`).setAttribute('ed-num', editorNum)
    editorsCount++;
    tojik2.addEventListener('click', onclick3, (event) => onclick3(event))
    editor_id[editor.getId()] = e.target.getAttribute('block-id')
    document.getElementById(`save-${attr}`).setAttribute('block-id', e.target.getAttribute('block-id'))

    editor.updateOptions({ readOnly: false });
    // editor.onDidFocusEditorWidget(() => {
    //     curr_id = editor_id[editor.getId()]
    //     socket.send(JSON.stringify({ "type": "block", "message": editor.getValue(), "id": editor_id[editor.getId()] }))
    // });
    // editor.getModel().onDidChangeContent((event) => {
    //     socket.send(JSON.stringify({ "type": "addTex", "message": editor.getValue(), offset: 0, rlength: 0, "id": editor_id[editor.getId()] }))
    // })

    const blockId = editor_id[editor.getId()];
    nc.joinBlock(blockId);

    let state = {
        doc: Automerge.from({ text: editor.getValue() }),
        syncState: Automerge.initSyncState(),
        editor: editor,
    };

    nc.blocks.set(blockId, state);
    editor.onDidChangeModelContent(() => {
        const state = nc.blocks.get(blockId);
        const text = editor.getValue();
        state.doc = Automerge.change(state.doc, d => {
            d.text = text;
        });
        nc.pumpOutgoing(blockId);
    });

    editor.onDidFocusEditorWidget(() => {
        if (curr_block_id !== '') {
            nc.wdone(curr_block_id);
        }
        curr_block_id = blockId;
    })

    if (!faking) {
        nc.editBlock(e.target.getAttribute('block-id'));
    }
}










function sortByChainOptimized(arr) {
    // Создаем два Map для быстрого поиска
    const byId = new Map();
    const byPrevId = new Map();

    for (const item of arr) {
        byId.set(item.id, item);
        byPrevId.set(item.prev_id, item);
    }

    // Начинаем с нулевого prev_id
    const result = [];
    let currentId = '00000000-0000-0000-0000-000000000000';

    // Пока находим следующий элемент в цепочке
    while (byPrevId.has(currentId)) {
        const next = byPrevId.get(currentId);
        result.push(next);
        currentId = next.id;

        // Защита от циклов
        if (result.length > arr.length) {
            throw new Error('Обнаружена циклическая зависимость');
        }
    }

    // Проверяем, что отсортировали все элементы
    if (result.length !== arr.length) {
        console.warn('Внимание: не все элементы попали в цепочку');
    }

    return result;
}


async function compileCode(event, editorId, blockId) {
    event.target.innerHTML = `
        <div id="loader-${blockId}" class="loading"></div>
    `
    const code = monaco.editor.getEditors()[editorId].getValue().toString()
    const api = new Api()
    const result = await api.compile(code, blockId + attempts.toString(), id)
    const outObj = document.getElementById('output-' + editorId.toString())
    if (result.data.error === '') {
        outObj.style.color = 'white';
        outObj.textContent = 'stdout: ' + result.data.body;
    } else {
        outObj.style.color = 'red';
        outObj.textContent = 'stderr: ' + result.data.error;
    }
    attempts++;
    event.target.innerHTML = '▷'
}

async function renderBlocks(blockList, write, run) {
    const codeEl = document.getElementById('code')
    blockList = sortByChainOptimized(blockList)
    for (let i = 0; i < blockList.length; i++) {
        order.push(blockList[i].id)
        lorder.push(blockList[i].language)
        if (blockList[i].language === 'md') {
            const tw = document.createElement('div')
            tw.classList.add("texting-wrap")
            tw.classList.add("wwrap")
            tw.innerHTML = ``
            if (write) {
                tw.innerHTML = tw.innerHTML + `<button id = "up_${blockList[i].id}" style="display:none;margin-left:25px;">↑</button>`
                tw.innerHTML = tw.innerHTML + `<button id = "down_${blockList[i].id}" style="display:none;margin-left:10px;">↓</button>`
                tw.innerHTML = tw.innerHTML + `
                <button id="edit-${textingCount}" style="margin-left:5px;">🖊</button>
                <button id="delete_${blockList[i].id}" style="margin-left:10px;">🗑</button>
                <button id="save-${textingCount}" style="margin-left:5px; display:none">✓</button>
                `
            }
            tw.innerHTML = tw.innerHTML + `
                <div id="texting-${textingCount}" class="md-div texting"></div>
            `
            codeEl.appendChild(tw)
            const html = await marked.parse(blockList[i].code);


            const blocks = blockList[i].code.split(/\r\n|\r|\n/).length

            texSources.push(blockList[i].code);
            texSourcesSizes.push(blocks)
            let texting = document.getElementById(`texting-${textingCount}`);
            texting.innerHTML = html;
            document.querySelectorAll(".language-go").forEach((element) => {
                element.innerHTML = hljs.highlight(element.innerHTML, { language: 'go' }).value
            })
            texting.style.height = 'fit-content'



            if (write) {
                if (i !== 0) {
                    const up_button = document.getElementById(`up_${blockList[i].id}`);
                    up_button.style.display = 'inline-block'
                }
                if (i !== blockList.length - 1) {
                    const down_button = document.getElementById(`down_${blockList[i].id}`);
                    down_button.style.display = 'inline-block'
                    if (i == 0) {
                        down_button.style.marginLeft = "25px";
                    } else {
                        down_button.style.marginLeft = "10px";
                    }
                }
                document.getElementById(`edit-${textingCount}`).setAttribute('text-id', textingCount)
                document.getElementById(`edit-${textingCount}`).setAttribute('block-id', blockList[i].id)
                document.getElementById(`save-${textingCount}`).setAttribute('text-id', textingCount)
                document.getElementById(`edit-${textingCount}`).addEventListener('click', editTex)
                document.getElementById(`delete_${blockList[i].id}`).addEventListener('click', deleteBlock)
            }
            blocksCount++
            textingCount++
        } else if (blockList[i].language === 'go') {
            const tw = document.createElement('div')
            tw.classList.add("coding-wrap")
            tw.classList.add("wwrap")
            let id = `coding-${blockList[i].id}`
            tw.innerHTML = `<div id="coding-left">`
            if (write) {
                tw.innerHTML = tw.innerHTML + `<button id = "up_${blockList[i].id}" style="display:none;margin-left:25px;">↑</button>`
                tw.innerHTML = tw.innerHTML + `<button id = "down_${blockList[i].id}" style="display:none;margin-left:10px;">↓</button>`
                tw.innerHTML = tw.innerHTML + `
                    <button id="delete_${blockList[i].id}" style="margin-left:10px;">🗑</button>
                `
            }
            tw.innerHTML = tw.innerHTML + `
                <div id="coding-${blockList[i].id}"></div>
                <div id="output-${blockList[i].id}" class="output"></div>
             </div>
            `
            if (run) {
                tw.innerHTML = tw.innerHTML + `
                <div class="code-buttons">
                    <button id="compile-${editorsCount}" data-block-id=${blockList[i].id} class="compile-btn compiler-button">▷</button>
                </div>
            `
            }
            codeEl.appendChild(tw)

            let coding = document.getElementById(id);

            const blocks = blockList[i].code.split(/\r\n|\r|\n/).length

            const heightPX = blocks * 19;;
            coding.style.height = heightPX.toString() + 'px'
            let editor = monaco.editor.create(document.getElementById(id), {
                value: blockList[i].code,
                language: 'go',
                theme: 'vs-dark',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                autoIndent: "full",
                overviewRulerBorder: false,
                autoClosingBrackets: true,
                tabSize: 4,
                foldingStrategy: 'indentation',
                readOnly: false,
                minimap: { enabled: false },
                stickyScroll: {
                    enabled: false,
                },
                scrollbar: {
                    vertical: "hidden",
                    handleMouseWheel: false,
                    ignoreHorizontalScrollbarInContentHeight: true,
                    verticalScrollbarSize: 0,
                    verticalSliderSize: 0,
                    horizontal: "hidden",
                }
            });
            editor.getModel().setEOL(monaco.editor.EndOfLineSequence.CR)
            tw.setAttribute("editor-id", editorsCount)
            editor_id[editor.getId()] = blockList[i].id
            tw.addEventListener('keydown', resizeMonaco)
            const editorNum = editorsCount
            if (run) {
                const compileButton = document.getElementById(`compile-${editorsCount}`)
                compileButton?.addEventListener('click', (event) => compileCode(event, editorNum, blockList[i].id))
            }
            editorsCount++
            if (write) {
                if (i !== 0) {
                    const up_button = document.getElementById(`up_${blockList[i].id}`);
                    up_button.style.display = 'inline-block'
                }
                if (i !== blockList.length - 1) {
                    const down_button = document.getElementById(`down_${blockList[i].id}`);
                    down_button.style.display = 'inline-block'
                    if (i == 0) {
                        down_button.style.marginLeft = "25px";
                    } else {
                        down_button.style.marginLeft = "10px";
                    }
                }
                document.getElementById(`delete_${blockList[i].id}`).addEventListener('click', deleteBlock)
            }
            blocksCount++
        } else if (blockList[i].language === 'png') {
            const tw = document.createElement('div')
            tw.classList.add("img-wrap")
            tw.classList.add("wwrap")
            let id = `pic-${blocksCount}`
            tw.innerHTML = ``
            if (write) {
                tw.innerHTML = tw.innerHTML + `<button id = "up_${blockList[i].id}" style="display:none;margin-left:25px;">↑</button>`
                tw.innerHTML = tw.innerHTML + `<button id = "down_${blockList[i].id}" style="display:none;margin-left:10px;">↓</button>`
                tw.innerHTML = tw.innerHTML + `<button id="delete_${blockList[i].id}" style="margin-left:10px;">🗑</button>`
            }
            tw.innerHTML = tw.innerHTML + `
                <div class = "img-wrapper">
                <img id = "${id}" src = "">
                </div>
            `
            codeEl.appendChild(tw)
            const picEl = document.getElementById(id)
            if (write) {
                if (i !== 0) {
                    const up_button = document.getElementById(`up_${blockList[i].id}`);
                    up_button.style.display = 'inline-block'
                }
                if (i !== blockList.length - 1) {
                    const down_button = document.getElementById(`down_${blockList[i].id}`);
                    down_button.style.display = 'inline-block'
                    if (i == 0) {
                        down_button.style.marginLeft = "25px";
                    } else {
                        down_button.style.marginLeft = "10px";
                    }
                }
                document.getElementById(`delete_${blockList[i].id}`).addEventListener('click', deleteBlock)

            }
            blocksCount++
            try {
                picEl.src = blockList[i].code
            } catch (e) {
            }
        }
    }

    console.log(order);
    for (let i = 0; i < blockList.length; i++) {
        document.getElementById(`up_${blockList[i].id}`)?.addEventListener('click', async (e) => {
            const realIdx = order.indexOf(blockList[i].id);
            if (!faking) {
                const api = new Api()
                const response = await api.moveBlock(order[realIdx], order[realIdx - 1], "up", id);

                if (!response || response.status !== 200) {
                    alert('Ошибка при перемещении блока');
                    return;
                }
                nc.moveBlock(order[realIdx], order[realIdx - 1]);
            }

            const parent = document.getElementById(`up_${order[realIdx]}`).parentNode.parentNode;

            const first = document.getElementById(`up_${order[realIdx]}`).parentNode;
            const second = document.getElementById(`down_${order[realIdx - 1]}`).parentNode;

            parent.insertBefore(first, second);
            if (realIdx == 1) {
                const selfUp = document.getElementById(`up_${order[realIdx]}`);
                selfUp.style.display = 'none';
                const downUp = document.getElementById(`up_${order[realIdx - 1]}`);
                downUp.style.display = 'inline-block';
            }

            if (realIdx == order.length - 1) {
                const selfDown = document.getElementById(`down_${order[realIdx]}`);
                selfDown.style.display = 'inline-block';
                const downDown = document.getElementById(`down_${order[realIdx - 1]}`);
                downDown.style.display = 'none';
            }
            const tempSwap = order[realIdx];
            order[realIdx] = order[realIdx - 1];
            order[realIdx - 1] = tempSwap;
            console.log(order);
        })
        document.getElementById(`down_${blockList[i].id}`)?.addEventListener('click', async (e) => {
            const realIdx = order.indexOf(blockList[i].id);
            if (!faking) {
                const api = new Api()
                const response = await api.moveBlock(order[realIdx], order[realIdx + 1], "down", id)

                if (!response || response.status !== 200) {
                    alert('Ошибка при перемещении блока');
                    return;
                }
                nc.moveBlock(order[realIdx], order[realIdx + 1]);
            }
            const parent = document.getElementById(`down_${order[realIdx]}`).parentNode.parentNode;

            const first = document.getElementById(`down_${order[realIdx]}`).parentNode;
            const second = document.getElementById(`up_${order[realIdx + 1]}`).parentNode;

            parent.insertBefore(second, first);

            if (realIdx == 0) {
                const selfUp = document.getElementById(`up_${order[realIdx]}`);
                selfUp.style.display = 'inline-block';
                const downUp = document.getElementById(`up_${order[realIdx + 1]}`);
                downUp.style.display = 'none';
            }

            if (realIdx == order.length - 2) {
                const selfDown = document.getElementById(`down_${order[realIdx]}`);
                selfDown.style.display = 'none';
                const downDown = document.getElementById(`down_${order[realIdx + 1]}`);
                downDown.style.display = 'inline-block';
            }
            const tempSwap = order[realIdx];
            order[realIdx] = order[realIdx + 1];
            order[realIdx + 1] = tempSwap;
            console.log(order);
        })
    }
    loader.style.visibility = 'none'
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

function openDir(dir) {
    //TODO
}

function compileMd(event, editorNum) {
    //TODO
}

async function openPic(event) {
    let input = document.createElement('input');
    input.accept = "image/*"
    const newId = "block_" + MD5(uuidv4()).toString()
    input.type = 'file';
    input.click();
    const lang = 'png'

    input.addEventListener('change', async (e) => {
        let file = e.target.files[0];
        const codeEl = document.getElementById('code')
        const tw = document.createElement('div')
        tw.classList.add("img-wrap")
        tw.classList.add("wwrap")
        let nk_id = `pic-${blocksCount}`
        tw.innerHTML = `
            <button id = "up_${blocksCount}" style="margin-left:25px; margin-bottom:10px">↑</button>
            <button id = "down_${blocksCount}" style="margin-left:0px;">↓</button>
            <button id="delete_${blockList[i].id}" style="margin-left:5px;">🗑</button>
            <div class = "img-wrapper">
                <img id = "${nk_id}" src = "">
            </div>
        `
        let prev_id = ''
        if (curr_id === '') {
            if (order.length !== 0) {
                prev_id = order[order.length - 1];
            }
            order.push(newId)
            lorder.push(lang)
            codeEl.appendChild(tw)
        } else {
            prev_id = curr_id
            const idx = order.findIndex(ordId => ordId === curr_id)
            order.splice(idx, 0, newId)
            lorder.splice(idx, 0, lang)
            const inBefore = codeEl.children[idx + 2]
            codeEl.insertBefore(tw, inBefore)
        }
        const picEl = document.getElementById(nk_id)
        picEl.src = URL.createObjectURL(file)
        blocksCount++
        const api = new Api()
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await api.addBlock(id, prev_id, 'png');
        //socket.send(JSON.stringify({"type": "add", "message": btoa(file), offset: 0, rlength: 0, "id": newId}))
    })
}

async function deleteBlock(event, fake = false) {
    const tid = event.target.id
    const uidx = tid.split('_')[1];
    const idx = order.indexOf(uidx);
    const toRemove = event.target.closest(".wwrap")
    if (!fake) {
        const api = new Api()
        const resp = await api.deleteBlock(id, uidx);
        if (resp.status === 200) {
            order.splice(idx, 1)
            lorder.splice(idx, 1)
            toRemove.remove();
            if (idx === 0 && order.length !== 0) {
                const up1 = document.getElementById(`up_${order[0]}`)
                up1.style.display = 'none';
            }
            if (idx === order.length && order.length != 0) {
                const downL = document.getElementById(`down_${order[order.length - 1]}`)
                downL.style.display = 'none';
            }
        } else {
        }
        nc.deleteBlock(id);
    } else {
        order.splice(idx, 1)
        lorder.splice(idx, 1)
        toRemove.remove();
        if (idx === 0 && order.length !== 0) {
            const up1 = document.getElementById(`up_${order[0]}`)
            up1.style.display = 'none';
        }
        if (idx === order.length && order.length != 0) {
            const downL = document.getElementById(`down_${order[order.length - 1]}`)
            downL.style.display = 'none';
        }
    }
}

async function addCode(event, lang, blockID = '', parentID = '') {
    const api = new Api()
    const codeEl = document.getElementById('code')
    let prev_id = '';

    if (parentID != '') {
        prev_id = parentID;
    }
    else if ((curr_id === '') && (order.length !== 0)) {
        prev_id = order[order.length - 1];
    } else if (curr_id !== '') {
        prev_id = curr_id;
    } else {
        prev_id = "00000000-0000-0000-0000-000000000000"
    }

    let apiResponse = {};

    if (blockID == '') {
        apiResponse = await api.addBlock(id, prev_id, lang);

        if (apiResponse.status !== 200) {
            alert("Ошибка при добавлении блока!");
            return;
        }
    } else {
        apiResponse.data = {};
        apiResponse.data.id = blockID;
    }


    const tw = document.createElement('div')
    let th_id = `coding-${apiResponse.data.id}`
    if (lang == 'go') {
        tw.classList.add("coding-wrap")
        tw.classList.add("wwrap")
        tw.innerHTML = `
        <div id="coding-left">
            <button id = "up_${apiResponse.data.id}" style="margin-left:25px; margin-bottom:10px">↑</button>
            <button id = "down_${apiResponse.data.id}" style="margin-left:0px;">↓</button>
            <button id="delete_${apiResponse.data.id}" style="margin-left:5px;">🗑</button>
            <div id="coding-${apiResponse.data.id}"></div>
            <div id="output-${editorsCount}" class="output"></div>
        </div>
        <div class="code-buttons">
            <button id="compile-${editorsCount}" class="compile-btn compiler-button">▷</button>
        </div>
      `
    } else {
        th_id = `texting-${textingCount}`
        tw.classList.add("texting-wrap")
        tw.classList.add("wwrap")
        tw.innerHTML = `
            <button id = "up_${apiResponse.data.id}" style="margin-left:25px; margin-bottom:10px">↑</button>
            <button id = "down_${apiResponse.data.id}" style="margin-left:0px;">↓</button>
            <button id="edit-${textingCount}" style="margin-left:5px;display:none">🖊</button>
            <button id="delete_${apiResponse.data.id}" style="margin-left:5px;">🗑</button>
            <button id="save-${textingCount}" style="margin-left:5px; ">✓</button>
            <div id="texting-${textingCount}" class="md-div texting"></div>
        `
    }


    const newId = apiResponse.data.id;
    if (curr_id === '') {
        order.push(newId)
        lorder.push(lang)
        codeEl.appendChild(tw)
        const upEl = document.getElementById(`up_${apiResponse.data.id}`);
        const downEl = document.getElementById(`down_${apiResponse.data.id}`);
        if (order.length === 1) {
            upEl.style.display = 'none';
        }
        downEl.style.display = 'none';
        if (order.length > 1) {
            const downPrev = document.getElementById(`down_${order[order.length - 2]}`);
            downPrev.style.display = 'inline-block';
        }
    } else {
        const idx = order.findIndex(ordId => ordId === curr_id)
        order.splice(idx, 0, newId)
        lorder.splice(idx, 0, lang)
        const inBefore = codeEl.children[idx + 2]
        codeEl.insertBefore(tw, inBefore)

        const downEl = document.getElementById(`down_${apiResponse.data.id}`);
        if (order[order.length - 1] === curr_id) {
            downEl.style.display = 'none';
            if (order.length > 1) {
                const downPrev = document.getElementById(`down_${order[order.length - 2]}`);
                downPrev.style.display = 'inline-block';
            }
        }
    }

    if (lang == 'md') {
        const saveButton = document.getElementById(`save-${textingCount}`)
        saveButton.addEventListener('click', (e) => onclick3(e))
        saveButton.setAttribute('text-id', textingCount)
        saveButton.setAttribute('ed-num', editorsCount)
        textingCount++
    }


    const deleteButton = document.getElementById(`delete_${apiResponse.data.id}`)

    deleteButton.addEventListener('click', deleteBlock);

    let coding = document.getElementById(th_id);

    const heightPX = 2 * 19;;
    coding.style.height = heightPX.toString() + 'px'
    let language = 'go'
    if (lang == 'md') {
        language = 'markdown'
    }
    let editor = monaco.editor.create(document.getElementById(th_id), {
        value: "",
        language: language,
        theme: 'vs-dark',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        autoIndent: "full",
        overviewRulerBorder: false,
        autoClosingBrackets: true,
        tabSize: 4,
        foldingStrategy: 'indentation',
        readOnly: false,
        minimap: { enabled: false },
        stickyScroll: {
            enabled: false,
        },
        scrollbar: {
            vertical: "hidden",
            handleMouseWheel: false,
            ignoreHorizontalScrollbarInContentHeight: true,
            verticalScrollbarSize: 0,
            verticalSliderSize: 0,
            horizontal: "hidden",
        }
    });
    editor.getModel().setEOL(monaco.editor.EndOfLineSequence.CR)


    const blockId = newId;
    nc.joinBlock(blockId);

    let state = {
        doc: Automerge.from({ text: editor.getValue() }),
        syncState: Automerge.initSyncState(),
        editor: editor,
    };

    nc.blocks.set(blockId, state);
    editor.onDidChangeModelContent(() => {
        const state = nc.blocks.get(blockId);
        const text = editor.getValue();
        state.doc = Automerge.change(state.doc, d => {
            d.text = text;
        });
        nc.pumpOutgoing(blockId);
    });

    editor.onDidFocusEditorWidget(() => {
        if (curr_block_id !== '') {
            nc.wdone(curr_block_id);
        }
        curr_block_id = blockId;
    })

    document.getElementById(`up_${newId}`)?.addEventListener('click', async (e) => {
        const realIdx = order.indexOf(newId);
        if (!faking) {
            const api = new Api()
            const response = await api.moveBlock(order[realIdx], order[realIdx - 1], "down", id)

            if (!response || response.status !== 200) {
                alert('Ошибка при перемещении блока');
                return;
            }
            nc.moveBlock(order[realIdx], order[realIdx - 1]);
        }

        const parent = document.getElementById(`up_${order[realIdx]}`).parentNode.parentNode;

        const first = document.getElementById(`up_${order[realIdx]}`).parentNode;
        const second = document.getElementById(`down_${order[realIdx - 1]}`).parentNode;

        parent.insertBefore(first, second);
        if (realIdx == 1) {
            const selfUp = document.getElementById(`up_${order[realIdx]}`);
            selfUp.style.display = 'none';
            const downUp = document.getElementById(`up_${order[realIdx - 1]}`);
            downUp.style.display = 'inline-block';
        }

        if (realIdx == order.length - 1) {
            const selfDown = document.getElementById(`down_${order[realIdx]}`);
            selfDown.style.display = 'inline-block';
            const downDown = document.getElementById(`down_${order[realIdx - 1]}`);
            downDown.style.display = 'none';
        }
        const tempSwap = order[realIdx];
        order[realIdx] = order[realIdx - 1];
        order[realIdx - 1] = tempSwap;
        console.log(order);
    })
    document.getElementById(`down_${newId}`)?.addEventListener('click', async (e) => {
        const realIdx = order.indexOf(newId);
        if (!faking) {
            const api = new Api()
            const response = await api.moveBlock(order[realIdx], order[realIdx + 1], "down", id)

            if (!response || response.status !== 200) {
                alert('Ошибка при перемещении блока');
                return;
            }
            nc.moveBlock(order[realIdx], order[realIdx + 1]);
        }
        const parent = document.getElementById(`down_${order[realIdx]}`).parentNode.parentNode;

        const first = document.getElementById(`down_${order[realIdx]}`).parentNode;
        const second = document.getElementById(`up_${order[realIdx + 1]}`).parentNode;

        parent.insertBefore(second, first);

        if (realIdx == 0) {
            const selfUp = document.getElementById(`up_${order[realIdx]}`);
            selfUp.style.display = 'inline-block';
            const downUp = document.getElementById(`up_${order[realIdx + 1]}`);
            downUp.style.display = 'none';
        }

        if (realIdx == order.length - 2) {
            const selfDown = document.getElementById(`down_${order[realIdx]}`);
            selfDown.style.display = 'none';
            const downDown = document.getElementById(`down_${order[realIdx + 1]}`);
            downDown.style.display = 'inline-block';
        }
        const tempSwap = order[realIdx];
        order[realIdx] = order[realIdx + 1];
        order[realIdx + 1] = tempSwap;
        console.log(order);
    })

    tw.setAttribute("editor-id", editorsCount)
    editor_id[editor.getId()] = newId
    tw.addEventListener('keydown', resizeMonaco)
    const compileButton = document.getElementById(`compile-${editorsCount}`)
    const editorNum = editorsCount
    if (lang == 'go') {
        compileButton.addEventListener('click', (event) => compileCode(event, editorNum, newId))
    } else {
        //compileButton.addEventListener('click', (event) => compileMd(event, editorNum))
    }
    editorsCount++

    if (blockID == '') {
        nc.newBlock(apiResponse.data.id, prev_id, lang)
    }
}

async function addNote(event) {

}

async function startKernel(event) {
    //alert("ща падажжи не задеплоил раннер пока");
    event.target.innerHTML = `
        <div id="loader" class="loading"></div>
    `
    kernel_ws = new WebSocket("wss://dnk33.com/api/v1/compiler/ws/?kernel-id=" + id);

    kernel_ws.onopen = () => {
        const kernelStarted = document.getElementById('kernel-started')
        event.target.style.display = 'none'
        kernelStarted.style.display = 'inline-block'
        document.querySelectorAll('.compile-btn').forEach((el) => {
            el.style.display = 'inline-block'
            el.addEventListener('click', (e) => {
                const block_id = e.target.dataset.blockId;
                kernel_ws.send(block_id);
            })
        });
    }

    kernel_ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const bid = data.block_id.replaceAll('_', '-')
        const outObj = document.getElementById('output-' + bid);
        const loader = document.getElementById('loader-' + bid);
        if (data.fail === false) {
            outObj.style.color = 'white';
            outObj.textContent = 'stdout: ' + data.result;
        } else {
            outObj.style.color = 'red';
            outObj.textContent = 'stderr: ' + data.result;;
        }
        loader.parentNode.innerHTML = '▷';
    }

    kernel_ws.onerror = (err) => {
        console.error("ws error", err);
    };

    kernel_ws.onclose = () => {
        event.target.innerHTML = `▷`;
    }
}

async function textCallback(msg) {
    faking = true;
    switch (msg.kind) {
        case msg.kind === "block-add":
            addCode(null, msg.lang, msg.blockId, msg.parentId);
            break;
        case msg.kind === "block-move":
            const blockPos = order.findIndex(msg.blockId);
            if (order[blockPos - 2] === msg.parentId) {
                const upButton = document.getElementById(`up-${msg.blockID}`);
                upButton.click();
            } else if (order[blockPos + 1] === msg.parentID) {
                const downButton = document.getElementById(`down-${msg.blockID}`);
                downButton.click();
            } else {
                console.log("couldnt find parent for move", msg.parentID);
            }
            break;
        case msg.kind === "delete-block":
            const event = {};
            event.target = document.getElementById(`delete-${msg.blockId}`);
            deleteBlock(event, true);
            break;
        case msg.kind === "block-edit":
            const tgt = document.querySelector(`[block-id="${msg.blockId}"]`);
            tgt.click();
            break;
        case msg.kind === "finished-edit":
            const tgt2 = document.querySelector(`[block-id="${msg.blockId}"]`);
            tgt2.click();
            break;
    }
    faking = false;
}

const coding = async (pathStr) => {
    editorsCount = 0
    editor_id = {}
    id = ''
    attempts = 0
    order = []
    lorder = []
    texSources = []
    texSourcesSizes = []
    curr_id = ''
    blocksCount = 0;
    textingCount = 0;
    socket = null;
    monaco.editor.getModels().forEach(model => model.dispose());
    //    const pathSplit = window.location.href.split('/')
    const api = new Api()

    // console.log(pathSplit)
    // let pathStr = ''
    // for (let i = 4; i < pathSplit.length; i++) {
    //     pathStr += '/'
    //     pathStr += pathSplit[i]
    //     if (i !== pathSplit.length-1) {
    //         openDir(pathSplit[i])
    //     }
    // }
    const pathSplit = pathStr.split('/')
    const codingElement = document.getElementById("code")
    codingElement.innerHTML = ''
    const blocks = await api.getFileBlocks(pathStr)

    if (blocks.status === 401) {
        alert('Авторизуйтесь, чтобы просматривать эту страницу!')
        return
    }

    if (blocks.status === 403) {
        alert('У вас недостаточно прав для просмотра данной страницы')
        return
    }

    if (blocks.status !== 200) {
        alert('not found')
        return
    }

    const access = blocks.data.rights;
    const own = blocks.data.rights.includes('o');
    const write = blocks.data.rights.includes('w');
    const exec = blocks.data.rights.includes('x');
    const userOwner = await api.getUser(blocks.data.author);
    console.log(userOwner);
    let nickname = "one-of-our-users";

    if (userOwner.status === 200) {
        nickname = userOwner.data.login;
    }
    //const exec = true;
    id = pathSplit[pathSplit.length - 1]
    codingElement.innerHTML = codingTemplate({ nickname: nickname, edit: true, fname: blocks.data.owner, owner: own, write: write, run: exec, access: access })
    await renderBlocks(blocks.data.blocks, write, exec);
    MathJax.typeset()


    if (write) {
        if (Automerge.initializeWasm) {
            await Automerge.initializeWasm(
                fetch("https://esm.sh/@automerge/automerge@3.2.1/dist/automerge.wasm")
            );
        }

        nc = new NotebookClient(id, textCallback);
        const editors = monaco.editor.getEditors();
        curr_block_id = '';

        nc.ws.onopen = () => {
            editors.forEach((editor) => {
                const blockId = editor_id[editor.getId()];

                // сразу блокируем ввод, пока не получим initial sync
                editor.updateOptions({ readOnly: false });

                if (!write) {
                    return;
                }

                // можно, но не обязательно, отправить “join” (если сервер его использует)
                nc.joinBlock(blockId);

                const state = {
                    doc: Automerge.from({ text: editor.getValue() }),
                    syncState: Automerge.initSyncState(),
                    editor: editor,
                    isApplyingRemote: false,
                    hasInitialSync: false,
                };

                nc.blocks.set(blockId, state);

                let oldContentHeight = editor.getContentHeight();
                const container = document.getElementById(`coding-${blockId}`);

                editor.updateOptions({ readOnly: false });
                editor.onDidChangeModelContent(() => {
                    const contentHeight = editor.getContentHeight();
                    if (oldContentHeight !== contentHeight) {
                        container.style.height = `${contentHeight}px`;
                        oldContentHeight = contentHeight;
                    }

                    const state = nc.blocks.get(blockId);
                    if (!state) return;

                    // 1) если сейчас применяются удалённые изменения — не считаем это локальным вводом
                    if (state.isApplyingRemote) return;

                    // 2) если ещё не было initial sync — не даём печатать (режим “sync on focus”)
                    if (!state.hasInitialSync) {
                        // опционально можно просто вернуть курсор в конец / показать лоадер
                        //editor.updateOptions({ readOnly: true });
                        //return;
                    }

                    const text = editor.getValue();
                    state.doc = Automerge.change(state.doc, d => {
                        d.text = text;
                    });

                    nc.pumpOutgoing(blockId);
                });

                editor.onDidFocusEditorWidget((e) => {

                    // при первом фокусе на блок — запускаем sync
                    const state = nc.blocks.get(blockId);
                    if (state && !state.hasInitialSync) {
                        // сбрасываем syncState и запускаем обмен
                        state.syncState = Automerge.initSyncState();
                        nc.pumpOutgoing(blockId); // первый sync → сервер пришлёт снапшот блока
                    }

                    if (curr_block_id !== '' && curr_block_id !== blockId) {
                        nc.wdone(curr_block_id); // если хочешь что-то сообщать на сервер
                    }
                    curr_block_id = blockId;
                });
            });
        };

    }

    if (exec) {
        const kernelButton = document.getElementById('start-kernel')
        kernelButton.addEventListener('click', startKernel)
    }

    if (write) {
        const addCodeButton = document.getElementById('add-code')
        addCodeButton.addEventListener('click', (event) => addCode(event, 'go'))
        const addMDButton = document.getElementById('add-md')
        addMDButton.addEventListener('click', (event) => addCode(event, 'md'))
        const addPicButton = document.getElementById('add-pic')
        addPicButton?.addEventListener('click', openPic)
    }


    const selectedFile = document.getElementById(pathSplit[1]);
    selectedFile.classList.add("selected-goifile");

    const overlay = document.getElementById("access-settings");

    let openedFirst = true;

    async function openOverlay() {
        if (openedFirst) {
            const aclList = document.getElementById("acl-list");

            aclList.innerHTML = ``;

            const aclListResponse = await api.listAccess(pathStr);

            if (aclListResponse.status !== 200) {
                alert("error")
                return
            }

            for (let i = 0; i < aclListResponse.data.length; i++) {
                const userId = aclListResponse.data[i].user_id;
                const access = aclListResponse.data[i].access;

                aclList.innerHTML += `
                <div class="dos-tr acl-row" id="acl-entry-${userId}" data-acl-user-id="${userId}">
                                    <div class="dos-td col-uid mono" data-label="USER ID">${userId}</div>

                                    <div class="dos-td col-perm" data-label="PERMS">
                                        ${access}
                                    </div>

                                    <div class="dos-td col-act" data-label="ACTION">
                                        <button class="dos-btn" type="button" data-acl-edit="${userId}">edit</button>
                                        <button class="dos-btn danger" type="button" id="revoke-${userId}"
                                            data-acl-revoke="${userId}">revoke</button>
                                    </div>
                </div>
                    `;
                const revokeEL = document.getElementById(`revoke-${userId}`);
                revokeEL.addEventListener('click', async () => {
                    const removeAcResult = await api.revokeAccess(pathStr, userId);

                    if (removeAcResult !== 200) {
                        alert("error");
                        return;
                    }
                    const entry = document.getElementById(`acl-entry-${userId}`);
                    entry.remove();
                })
            }
            openedFirst = false;
        }
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        const firstFocusable =
            overlay.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
        firstFocusable?.focus();


        const checkLoginButton = document.getElementById("ac-uid-checkbtn");

        checkLoginButton.addEventListener('click', async () => {
            const username = document.getElementById("usernameInput").value;
            alert(username)

            const unameResult = await api.userByName(username);

            if (unameResult.status !== 200) {
                alert("error: no such user")
                return;
            }

            const idLine = document.getElementById("userIdLine");

            idLine.textContent = unameResult.login;
        })

        const applyChangesButton = document.getElementById("access-apply-btn");

        const checkR = document.getElementById("permRead");
        const checkW = document.getElementById("permWrite");
        const checkX = document.getElementById("permExec");

        applyChangesButton.addEventListener('click', async () => {
            const idLine = document.getElementById("userIdLine");
            const userID = idLine.textContent;
            let access = "";
            if (checkR.checked) {
                access += "r"
            } else {
                access += "-"
            }
            if (checkW.checked) {
                if (access[0] == "-") {
                    alert("нельзя сделать write без read")
                }
                access += "w"
            } else {
                access += "-"
            }
            if (checkX.checked) {
                if (access[0] == "-") {
                    alert("нельзя сделать execute без read")
                }
                access += "x"
            } else {
                access += "-"
            }

            const applyResult = await api.grantAccess(pathStr, userID, access);

            if (applyResult.status !== 200) {
                alert("ошибка!")
            } else {
                aclList.innerHTML += `
                <div class="dos-tr acl-row" id="acl-entry-${userID}" data-acl-user-id="${userID}">
                                    <div class="dos-td col-uid mono" data-label="USER ID">${userID}</div>

                                    <div class="dos-td col-perm" data-label="PERMS">
                                        ${access}
                                    </div>

                                    <div class="dos-td col-act" data-label="ACTION">
                                        <button class="dos-btn" type="button" data-acl-edit="${userID}">edit</button>
                                        <button class="dos-btn danger" type="button" id="revoke-${userID}"
                                            data-acl-revoke="${userID}">revoke</button>
                                    </div>
                </div>
                    `;
            }
        })
    }

    function closeOverlay() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    }

    const openAccessButton = document.getElementById("access-settings-button");
    const closeAccessButton = document.getElementById("access-cancel-btn");
    const closeAccessButton2 = document.getElementById("close-acc-settings");

    openAccessButton.addEventListener("click", (e) => {
        openOverlay();
    });
    closeAccessButton.addEventListener("click", (e) => {
        closeOverlay();
    });
    closeAccessButton2.addEventListener("click", (e) => {
        closeOverlay();
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeOverlay();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("is-open")) {
            closeOverlay();
        }
    });

}

export default coding
