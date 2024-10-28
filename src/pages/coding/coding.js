import {ROOT_ELEMENT_ID} from "@configs/common_config";
import codingTemplate from "@pages/coding/coding.hbs";

import * as monaco from 'monaco-editor';
import {Api} from "@modules/api";
import { marked } from 'marked';
import *  as MonacoCollab from '@convergencelabs/monaco-collab-ext'

import {} from '@static/scripts/mathjax'
import {} from "@pages/coding/coding.scss"

let tries = 1

function moveKentCursor(pos, colStr='') {
    let kentCursor = document.getElementById('kent-cursor');
    const rect =  document.querySelector('.view-lines').getBoundingClientRect()
    kentCursor.style.top = (rect.top - 85 + 19 * (pos.lineNumber-1)).toString() + 'px'
    const fontSize = 14;
    const test = document.getElementById("test");
    test.textContent = colStr;
    test.style.fontSize = fontSize;
    const width = test.clientWidth
    //alert(width)
    kentCursor.style.left = (rect.left-52 + width + 2).toString() + 'px'
    kentCursor.style.display = 'block'
}

async function onDirClick(e) {
    const id = e.target.getAttribute("id")
    const isOpened = e.target.getAttribute("opened")
    if (isOpened === 'y') {
        while (e.target.lastElementChild) {
            e.target.removeChild(e.target.lastElementChild);
        }
        e.target.setAttribute("opened", false)
    } else {
        const api = new Api();
        const dirList = await api.getDirs(id)
        let ul = document.createElement('ul')

        const dirs = dirList.data
        dirs.forEach((dir) => {
            let li = document.createElement('li')
            li.setAttribute("id", dir.fileId)
            li.addEventListener('click', (e) => onDirClick(e))
            let cl = 'goifile'
            if (dir.dir === true) {
                cl = 'dir'
            }
            li.classList.add(cl)
            li.textContent = dir.name
            ul.appendChild(li)
        });
        e.target.appendChild(ul)
        e.target.setAttribute("opened", 'y')
    }
}

async function onclick(e, idx) {
    const api = new Api()
    let fname = 'block230' + tries.toString()
    if (idx === 0) {
        fname = 'block228' + tries.toString()
    }
    tries++
    const result = await api.compile(monaco.editor.getEditors()[idx].getValue().toString(), fname);
    const outObj = document.getElementById('output-'+idx.toString())
    if (result.data.error === '') {
        outObj.style.color = 'white';
        outObj.textContent = 'SUCC: ' + result.data.body;
    } else {
        outObj.style.color = 'red';
        outObj.textContent = 'FAIL: ' + result.data.error;
    }
}

async function onclick3(e) {
    e.target.style.display = 'none'
    const tojik2 = document.getElementById('tojik')
    tojik2.style.display = 'inline'
    const texSource = monaco.editor.getEditors()[1].getValue()
    const html = await marked.parse(texSource);
    let texting = document.getElementById('texting');
    texting.innerHTML = html;
    MathJax.typeset()
    texting.style.height = 'fit-content'
}

async function onclick2(e, texSource) {
    const texting = document.getElementById('texting')
    e.target.style.display = 'none'
    texting.innerHTML = ''
    const tojik2= document.getElementById('tojik2')
    tojik2.addEventListener('click', onclick3)
    tojik2.style.display = 'inline'
    let blocks = texSource.match(/[^\n]*\n[^\n]*/gi).length + 1
    texting.style.height = (blocks*19).toString() + 'px'
    monaco.editor.create(texting, {
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

    texting.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' ) || (e.key === 'Backspace')) {
            const str = monaco.editor.getEditors()[0].getValue().toString()
            let add = 2;
            if (e.key === 'Backspace') {
                add = 1;
            }
            blocks = str.match(/[^\n]*\n[^\n]*/gi).length + add;
            coding.style.height = (blocks*19).toString() + 'px';
        }
        //monaco.editor.getEditors()[0].revealLine(0, 0);
    })
}

const coding = async () => {
    const rootElement = document.querySelector(ROOT_ELEMENT_ID);
    rootElement.innerHTML = codingTemplate();
    const loadingElement = document.getElementById('loader')
    rootElement.style.visibility = 'hidden';

    let texSource = '# The beginning of noted\n\n ## Как пользоваться:\n- Не надо ничего импортировать: доступны все стандартные библиотеки\n- Запускайте в любом порядке, как в Ipynb\n- Main не нужен, вызывайте функции и создавайте объекты в глобальном скопе\n- Блоки комментариев в markdown и tex (формулы пишутся внутри двойных долларов)\n\n ## Закон Амдала:\n\n $$S_p = \\frac{1}{\\alpha +\\frac{1-\\alpha}{p}} $$'
    const html = await marked.parse(texSource);

    let coding = document.getElementById('coding-first');
    let coding2 = document.getElementById('coding-second');
    let texting = document.getElementById('texting');
    texting.innerHTML = html

    let blocks = 6;
    const heightPX = blocks*19;;
    const heightPX2 = 2*19;
    coding.style.height = heightPX.toString() + 'px'
    coding2.style.height = heightPX2.toString() + 'px'

    coding.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' ) || (e.key === 'Backspace')) {
            const str = monaco.editor.getEditors()[0].getValue().toString()
            let add = 2;
            if (e.key === 'Backspace') {
                add = 1;
            }
            blocks = str.match(/[^\n]*\n[^\n]*/gi).length + add;
            coding.style.height = (blocks*19).toString() + 'px';
        }
        //monaco.editor.getEditors()[0].revealLine(0, 0);
    })

    const api = new Api()
    const result = await api.getCode("uzbek.txt")
    const dirList = await api.getDirs("00000000-0000-0000-0000-000000000000")
    const parentList = document.getElementById("dirlist")

    const dirs = dirList.data
    console.log(dirs)
    dirs.forEach((dir)  => {
        let li = document.createElement('li')
        li.setAttribute("opened", 'n')
        li.setAttribute("id", dir.fileId)
        li.addEventListener('click', (e) => onDirClick(e))
        let cl = 'goifile'
        if (dir.dir === true) {
            cl = 'dir'
        }
        li.classList.add(cl)
        li.textContent = dir.name
        parentList.appendChild(li)
    });

    const compBut = document.getElementById('compile-first');
    compBut.addEventListener('click', (e) => onclick(e, 0));
    const compBut2 = document.getElementById('compile-second');
    compBut2.addEventListener('click', (e) => onclick(e, 1));


    const editBut = document.getElementById('tojik');
    editBut.addEventListener('click', (e) => onclick2(e, texSource));

    let editor = monaco.editor.create(document.getElementById('coding-first'), {
        value: result.data.text,
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
        scrollbar: {vertical: "hidden",
            handleMouseWheel: false,
            ignoreHorizontalScrollbarInContentHeight: true,
            verticalScrollbarSize:  0,
            verticalSliderSize: 0,
            horizontal: "hidden",
        }
    });

    const result2 = await api.getCode("tojik.txt")

    let editor2 = monaco.editor.create(document.getElementById('coding-second'), {
        value: result2.data.text,
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
        scrollbar: {vertical: "hidden",
            handleMouseWheel: false,
            ignoreHorizontalScrollbarInContentHeight: true,
            verticalScrollbarSize:  0,
            verticalSliderSize: 0,
            horizontal: "hidden",
        }
    });

    const remoteCursorManager = new MonacoCollab.RemoteCursorManager({
        editor: editor,
        tooltips: true,
        tooltipDuration: 228
    });

    console.log(monaco.editor.getEditors()[0].getValue())

    let socket = new WebSocket("ws://localhost:5004/nigger");
    let block = false
    //moveKentCursor({lineNumber:1, column:0})

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data)
        if (data.type === 'conn') {
            return
        }
        //alert(data["message"])
        let newVal
        let oldVal = editor.getValue()
        if (data.message === "") {
            newVal = oldVal.substring(0, data.offset) + oldVal.substring(data.offset+data.rlength)
            block = true
            editor.setValue(newVal)
            block = false
        } else {
            newVal = oldVal.substring(0, data.offset) + data.message + oldVal.substring(data.offset)
            const pos = editor.getModel().getPositionAt(data.offset + data.message.length-1)
            block = true
            editor.setValue(newVal)
            block = false
            moveKentCursor(pos, editor.getModel().getLineContent(pos.lineNumber).substring(0, pos.column + data.message.length))
        }
        // alert(oldVal.substring(0, data.offset))
        // alert(oldVal.substring(data.offset))
        // alert(newVal)
        blocks = newVal.match(/[^\n]*\n[^\n]*/gi).length + 1;
        coding.style.height = (blocks*19).toString() + 'px';
    }

    monaco.editor.getEditors()[0].getModel().onDidChangeContent((event) => {
        console.log(event)
        if (!block) {
            socket.send(JSON.stringify({"type": "add", "message": event.changes[0].text, offset: event.changes[0].rangeOffset, rlength: event.changes[0].rangeLength}))
        }
    })

    rootElement.style.visibility= 'visible';
    loadingElement.style.display = 'none';
}

export default coding;
