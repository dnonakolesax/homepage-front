import codingTemplate from "@pages/coding/coding.hbs";
import {Api} from "@modules/api";
import {marked} from "marked";
import * as monaco from "monaco-editor";
import MD5 from "crypto-js/md5";

import {} from '@static/scripts/mathjax'
import hljs from 'highlight.js';
import {} from '@pages/coding/coding.scss'
let editorsCount = 0
let editor_id = {}
let id = ''
let attempts = 0
let order = []
let lorder = []
let texSources = []
let texSourcesSizes = []
let curr_id = ''
let blocksCount = 0;
let textingCount = 0;
let socket = null;

function resizeMonaco (e) {
    let editorEl = e.target.closest('.coding-wrap')
    if (!editorEl) {
        editorEl = e.target.closest('.texting-wrap')
    }
    console.log(editorEl) 
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
    const html = await marked.parse(texSource);
    let texting = document.getElementById(`texting-${attr}`);
    texting.innerHTML = html;
    document.getElementsByClassName("language-go").forEach( (element) => {
        element.innerHTML = hljs.highlight(element.innerHTML, {language: 'golang'}).value
    } )
    MathJax.typeset()
    texting.style.height = 'fit-content'
    texting.style.marginTop = '0px';
    texting.style.marginLeft = '20px'
    texting.style.marginBottom = '0px';
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
    const tojik2= document.getElementById(`save-${attr}`)
    tojik2.style.display = 'inline'
    let blocks = texSourcesSizes[attr]
    console.log(texSource)
    texting.style.height = (blocks*19).toString() + 'px'
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
        scrollbar: {vertical: "hidden",
            handleMouseWheel: false,
            ignoreHorizontalScrollbarInContentHeight: true,
            verticalScrollbarSize:  0,
            verticalSliderSize: 0,
            horizontal: "hidden",
        }
    });
    texting.setAttribute("editor-id", editorsCount)
    editor.getModel().setEOL(monaco.editor.EndOfLineSequence.CR)
    const num = editorsCount

    texting.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' ) || (e.key === 'Backspace')) {
            const blocks = monaco.editor.getEditors()[num].getModel().getLineCount()
            // let add = 2;
            // if (e.key === 'Backspace') {
            //     add = 1;
            // }
            // blocks = str.match(/\r\n|\r|\n/).length + add;
            texting.style.height = (blocks*19).toString() + 'px';
        }
        //monaco.editor.getEditors()[0].revealLine(0, 0);
    })
    const editorNum = editorsCount
    document.getElementById(`save-${attr}`).setAttribute('ed-num', editorNum)
    editorsCount++;
    tojik2.addEventListener('click', onclick3, (event) => onclick3(event))
    editor_id[editor.getId()] = e.target.getAttribute('block-id')

    editor.updateOptions({readOnly: false});
    editor.onDidFocusEditorWidget(()=>{
        curr_id = editor_id[editor.getId()]
        socket.send(JSON.stringify({"type": "block", "message": editor.getValue(), "id": editor_id[editor.getId()]}))
    });
    editor.getModel().onDidChangeContent( (event) => {
        socket.send(JSON.stringify({"type": "addTex", "message": editor.getValue(), offset: 0, rlength: 0, "id": editor_id[editor.getId()]}))
    }) 


}













async function compileCode(event, editorId, blockId) {
    event.target.innerHTML = `
        <div id="loader" class="loading"></div>
    `
    const code = monaco.editor.getEditors()[editorId].getValue().toString()
    const api = new Api()
    const result = await api.compile(code, blockId + attempts.toString(), id)
    const outObj = document.getElementById('output-'+editorId.toString())
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

async function renderBlocks(blockList) {
    const codeEl = document.getElementById('code')
    console.log(blockList)
    console.log(blockList.length)
    for (let i = 0; i < blockList.length; i++) {
        console.log(blockList[i].language)
        order.push(blockList[i].id)
        lorder.push(blockList[i].language)
        if (blockList[i].language === 'md') {
            const tw = document.createElement('div')
            tw.classList.add("texting-wrap")
            if (i !== 0) {
                tw.innerHTML = `<button id = "up-${blocksCount}" style="margin-left:25px; margin-bottom:10px">↑</button>`
            }
            if (i !== blockList.length-1) {
                if (i == 0) {
                tw.innerHTML = tw.innerHTML + `<button id = "down-${blocksCount}" style="margin-left:25px;">↓</button>`
                } else {
                tw.innerHTML = tw.innerHTML + `<button id = "down-${blocksCount}" style="margin-left:0px;">↓</button>`
                }
            }
            tw.innerHTML = tw.innerHTML + `
                <button id="edit-${textingCount}" style="margin-left:5px;">🖊</button>
                <button id="delete-${blocksCount}" style="margin-left:5px;">🗑</button>
                <button id="save-${textingCount}" style="margin-left:5px; display:none">✓</button>
                <div id="texting-${textingCount}" class="md-div texting"></div>
          `
            codeEl.appendChild(tw)
            const html = await marked.parse(blockList[i].code);
            
            
            const blocks = blockList[i].code.split(/\r\n|\r|\n/).length

            texSources.push(blockList[i].code);
            texSourcesSizes.push(blocks)
            let texting = document.getElementById(`texting-${textingCount}`);
            texting.innerHTML = html;
            document.querySelectorAll(".language-go").forEach( (element) => {
                element.innerHTML = hljs.highlight(element.innerHTML, {language: 'go'}).value
            } )
            texting.style.height = 'fit-content'
            
            document.getElementById(`edit-${textingCount}`).setAttribute('text-id', textingCount)
            document.getElementById(`edit-${textingCount}`).setAttribute('block-id', blockList[i].id)
            document.getElementById(`save-${textingCount}`).setAttribute('text-id', textingCount)
            document.getElementById(`edit-${textingCount}`).addEventListener('click', editTex)
            document.getElementById(`delete-${blocksCount}`).addEventListener('click', deleteBlock)
            blocksCount++
            textingCount++
        } else if (blockList[i].language === 'go') {
            const tw = document.createElement('div')
            tw.classList.add("coding-wrap")
            let id = `coding-${editorsCount}`
            tw.innerHTML = `
            <div id="coding-left">
                <button id = "up-${blocksCount}" style="margin-left:25px; margin-bottom:10px">↑</button>
                <button id = "down-${blocksCount}" style="margin-left:0px;">↓</button>
                <button id="delete-${blocksCount}" style="margin-left:5px;">🗑</button>
                <div id="coding-${editorsCount}"></div>
                <div id="output-${editorsCount}" class="output"></div>
            </div>
            <div class="code-buttons">
                <button id="compile-${editorsCount}" class="compile-btn compiler-button">▷</button>
            </div>
          `
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
                minimap: {enabled: false},
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
            const compileButton = document.getElementById(`compile-${editorsCount}`)
            const editorNum = editorsCount
            compileButton.addEventListener('click', (event) => compileCode(event, editorNum, blockList[i].id))
            editorsCount++
            document.getElementById(`delete-${blocksCount}`).addEventListener('click', deleteBlock)
            blocksCount++
        } else if (blockList[i].language === 'png') {
            const tw = document.createElement('div')
            tw.classList.add("img-wrap")
            let id = `pic-${blocksCount}`
            tw.innerHTML = `
                <button id = "up-${blocksCount}" style="margin-left:25px; margin-bottom:10px">↑</button>
                <button id = "down-${blocksCount}" style="margin-left:0px;">↓</button>
                <button id="delete-${blocksCount}" style="margin-left:5px;">🗑</button>
                
                <div class = "img-wrapper">
                <img id = "${id}" src = "">
                </div>
            `
            codeEl.appendChild(tw)
            const picEl = document.getElementById(id)
            document.getElementById(`delete-${blocksCount}`).addEventListener('click', deleteBlock)
            blocksCount++
            try {
                picEl.src = blockList[i].code
            } catch (e) {
                console.log(blockList[i].code)
            }
        }
    }
    loader.style.visibility = 'none'
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

function openDir (dir) {
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

    input.addEventListener('change', async (e) =>  {
        let file = e.target.files[0];
        const codeEl = document.getElementById('code')
        const tw = document.createElement('div')
        tw.classList.add("img-wrap")
        let nk_id = `pic-${blocksCount}`
        tw.innerHTML = `
            <button id = "up-${blocksCount}" style="margin-left:25px; margin-bottom:10px">↑</button>
            <button id = "down-${blocksCount}" style="margin-left:0px;">↓</button>
            <button id="delete-${blocksCount}" style="margin-left:5px;">🗑</button>
            <div class = "img-wrapper">
                <img id = "${nk_id}" src = "">
            </div>
        `
        if (curr_id === '') {
            order.push(newId)
            lorder.push(lang)
            codeEl.appendChild(tw)
        } else {
            const idx = order.findIndex(ordId => ordId === curr_id)
            order.splice(idx, 0, newId)
            lorder.splice(idx, 0, lang)
            const inBefore = codeEl.children[idx+2]
            codeEl.insertBefore(tw ,inBefore)
        }
        const picEl = document.getElementById(nk_id)
        picEl.src = URL.createObjectURL(file)
        blocksCount++
        const api = new Api()
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await api.addBlock(id, order, newId, lorder);
        socket.send(JSON.stringify({"type": "add", "message": btoa(file), offset: 0, rlength: 0, "id": newId}))
    })
}

async function deleteBlock(event) {
    const tid = event.target.id
    const idx = tid.split('-')[1]
    const toRemove = event.target.parentNode
    toRemove.remove()
    order.splice(idx, 1)
    lorder.splice(idx, 1)
    const api = new Api()
    await api.addBlock(id, order, "", lorder);
}

async function addCode(event, lang) {
    
    const newId = "block_" + MD5(uuidv4()).toString()
    
    const api = new Api()
    const tw = document.createElement('div')
    let th_id = `coding-${editorsCount}`
    if (lang == 'go') {
        tw.classList.add("coding-wrap")
        tw.innerHTML = `
        <div id="coding-left">
            <button id = "up-${blocksCount}" style="margin-left:25px; margin-bottom:10px">↑</button>
            <button id = "down-${blocksCount}" style="margin-left:0px;">↓</button>
            <button id="delete-${blocksCount}" style="margin-left:5px;">🗑</button>
            <div id="coding-${editorsCount}"></div>
            <div id="output-${editorsCount}" class="output"></div>
        </div>
        <div class="code-buttons">
            <button id="compile-${editorsCount}" class="compile-btn compiler-button">▷</button>
        </div>
      `
    } else {
        th_id = `texting-${textingCount}`
        tw.classList.add("texting-wrap")
        tw.innerHTML = `
            <button id = "up-${blocksCount}" style="margin-left:25px; margin-bottom:10px">↑</button>
            <button id = "down-${blocksCount}" style="margin-left:0px;">↓</button>
            <button id="edit-${textingCount}" style="margin-left:5px;display:none">🖊</button>
            <button id="delete-${blocksCount}" style="margin-left:5px;">🗑</button>
            <button id="save-${textingCount}" style="margin-left:5px; ">✓</button>
            <div id="texting-${textingCount}" class="md-div texting"></div>
        `
    }   
    const codeEl = document.getElementById('code')
    if (curr_id === '') {
        order.push(newId)
        lorder.push(lang)
        codeEl.appendChild(tw)
    } else {
        const idx = order.findIndex(ordId => ordId === curr_id)
        order.splice(idx, 0, newId)
        lorder.splice(idx, 0, lang)
        const inBefore = codeEl.children[idx+2]
        codeEl.insertBefore(tw ,inBefore)
    }

    if (lang == 'md') {
        const saveButton = document.getElementById(`save-${textingCount}`)
        saveButton.addEventListener('click', (e) => onclick3(e))
        saveButton.setAttribute('text-id', textingCount)
        saveButton.setAttribute('ed-num', editorsCount)
        textingCount++
    }

    await api.addBlock(id, order, newId, lorder)

    let coding = document.getElementById(th_id);

    const heightPX = 2*19;;
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
        minimap: {enabled: false},
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
    editor.onDidFocusEditorWidget(()=>{
        curr_id = editor_id[editor.getId()]
        socket.send(JSON.stringify({"type": "block", "message": editor.getValue(), "id": editor_id[editor.getId()]}))
    });
    if (lang == 'md') {
        editor.getModel().onDidChangeContent( (event) => {
            socket.send(JSON.stringify({"type": "addTex", "message": editor.getValue(), offset: 0, rlength: 0, "id": editor_id[editor.getId()]}))
        }) 
    } else {
        editor.getModel().onDidChangeContent( (event) => {
            socket.send(JSON.stringify({"type": "add", "message": event.changes[0].text, offset: event.changes[0].rangeOffset, rlength: event.changes[0].rangeLength, "id": editor_id[editor.getId()]}))
        }) 
    }
    tw.setAttribute("editor-id", editorsCount)
    editor_id[editor.getId()] = newId
    tw.addEventListener('keydown', resizeMonaco)
    const compileButton = document.getElementById(`compile-${editorsCount}`)
    const editorNum = editorsCount
    if (lang == 'go') {
        compileButton.addEventListener('click', (event) => compileCode(event, editorNum, newId))
    } else {
        compileButton.addEventListener('click', (event) => compileMd(event, editorNum))
    }
    editorsCount++
}

async function addNote(event) {

}

async function startKernel(event) {
    event.target.innerHTML = `
        <div id="loader" class="loading"></div>
    `
    const api = new Api()
    const response = await api.startKernel(id)
    if (response.status.code > 200) {
        alert(500)
        event.target.innerHTML = `▷`
    } else {
        const kernelStarted = document.getElementById('kernel-started')
        event.target.style.display = 'none' 
        kernelStarted.style.display = 'inline-block'
        alert('kernel started')
        document.querySelectorAll('.compile-btn').forEach( (el) => {
            el.style.display = 'inline-block'
        });
    }
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
    if (blocks.status !== 200) {
        alert('not found')
        return
    }
    console.log(blocks.data)
    codingElement.innerHTML = codingTemplate({nickname: "domnakolesax", edit: true, fname: pathSplit[pathSplit.length-1]})
    await renderBlocks(blocks.data.blocks)
    MathJax.typeset()
    
    socket = new WebSocket("ws://192.168.0.70:5004/socket_" + blocks.data.id);
    id = blocks.data.id
    
    const editors = monaco.editor.getEditors()
    editors.forEach( (editor) => {
        editor.updateOptions({readOnly: false});
        editor.onDidFocusEditorWidget(()=>{
            curr_id = editor_id[editor.getId()]
            socket.send(JSON.stringify({"type": "block", "message": editor.getValue(), "id": editor_id[editor.getId()]}))
        });
        editor.getModel().onDidChangeContent( (event) => {
            socket.send(JSON.stringify({"type": "add", "message": event.changes[0].text, offset: event.changes[0].rangeOffset, rlength: event.changes[0].rangeLength, "id": editor_id[editor.getId()]}))
        }) 
    });

    const addCodeButton = document.getElementById('add-code')
    addCodeButton.addEventListener('click', (event) => addCode(event, 'go'))

    
    const addMDButton = document.getElementById('add-md')
    addMDButton.addEventListener('click', (event) => addCode(event, 'md'))

    const addPicButton = document.getElementById('add-pic')
    addPicButton.addEventListener('click', openPic)

    const kernelButton = document.getElementById('start-kernel')
    kernelButton.addEventListener('click', startKernel)


}

export default coding
