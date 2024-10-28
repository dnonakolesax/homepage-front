import {} from '@pages/main/main.scss'
import {ROOT_ELEMENT_ID} from "@configs/common_config";
import mainTemplate from "@pages/main/main.hbs";
import {Api} from "@modules/api";
import {marked} from "marked";
import * as monaco from "monaco-editor";

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
            let cl = 'goifile'
            if (dir.dir === true) {
                cl = 'dir'
                li.addEventListener('click', (e) => onDirClick(e))
            } else {
                li.addEventListener('click', (e) => onFileClick(e))
            }
            li.classList.add(cl)
            li.textContent = dir.name
            ul.appendChild(li)
        });
        e.target.appendChild(ul)
        e.target.setAttribute("opened", 'y')
    }
}

async function onFileClick(e) {
    const id = e.target.getAttribute("id")
    const api = new Api();
    const blocks = await api.getBlocks(id)
    const codeEl = document.getElementById('code')
    codeEl.innerHTML = `<div class="file-by">
            Sample text by <span class="nickname">
            <img src="https://avatars.githubusercontent.com/u/90285641?v=4" class="ava-au">dnonakolesax</span>;
            <span class="access">Access: rwx; Access settings:</span>
            <buton class="settings">⚙</buton>
        </div>`
    const blockList = blocks.data.blocks
    console.log(blockList)
    console.log(blockList.length)
    for (let i = 0; i < blockList.length; i++) {
        console.log(blockList[i].language)
        if (blockList[i].language === 'md') {
            const tw = document.createElement('div')
            tw.classList.add("texting-wrap")
            tw.innerHTML = `
            <div id="texting" class="md-div"></div>
            <div class="text-buttons">
                <button id="tojik">🖊</button>
                <button id="tojik2" style="display: none">done_md</button>
                <button class="add_up">+↑</button>
                <button class="add_down">+↓</button>
            </div>
          `
            codeEl.appendChild(tw)
            const html = await marked.parse(blockList[i].code);
            let texting = document.getElementById('texting');
            texting.innerHTML = html;
            MathJax.typeset()
            texting.style.height = 'fit-content'
        } else if (blockList[i].language === 'go') {
            const tw = document.createElement('div')
            tw.classList.add("coding-wrap")
            let id = 'coding-first'
            if (i === 1) {
                tw.innerHTML = `
                <div id="coding-left">
                    <div id="coding-first"></div>
                    <div id="output-0" class="output"></div>
                </div>
                <div class="code-buttons">
                    <button id="compile-first">▷</button>
                    <button class="add_up">+↑</button>
                    <button class="add_down">+↓</button>
                </div>
          `
                codeEl.appendChild(tw)
            } else if (i === 2) {
                id = 'coding-second'
                tw.innerHTML = `
                <div id="coding-left">
                    <div id="coding-second"></div>
                    <div id="output-1" class="output"></div>
                </div>
                <div class="code-buttons">
                    <button id="compile-second">▷</button>
                    <button class="add_up">+↑</button>
                    <button class="add_down">+↓</button>
                </div>
          `
                codeEl.appendChild(tw)
            }

            let coding = document.getElementById(id);

            let blocks = 6;
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
        }
    }
}

const main = async () => {
    const rootElement = document.querySelector(ROOT_ELEMENT_ID);
    rootElement.innerHTML = mainTemplate();

    const loadingElement = document.getElementById('loader')
    rootElement.style.visibility = 'hidden';

    const api = new Api()
    const dirList = await api.getDirs("00000000-0000-0000-0000-000000000000")
    const parentList = document.getElementById("dirlist")

    const dirs = dirList.data
    console.log(dirs)
    dirs.forEach((dir)  => {
        let li = document.createElement('li')
        li.setAttribute("opened", 'n')
        li.setAttribute("id", dir.fileId)
        let cl = 'goifile'
        if (dir.dir === true) {
            cl = 'dir'
            li.addEventListener('click', (e) => onDirClick(e))
        } else {
            li.addEventListener('click', (e) => onFileClick(e))
        }
        li.classList.add(cl)
        li.textContent = dir.name
        parentList.appendChild(li)
    })


    rootElement.style.visibility = 'visible';
    loadingElement.style.display = 'none';
}

export default main;
