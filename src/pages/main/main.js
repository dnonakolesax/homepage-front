import { } from '@pages/main/main.scss'
import { ROOT_ELEMENT_ID } from "@configs/common_config";
import mainTemplate from "@pages/main/main.hbs";
import { Api } from "@modules/api";
import coding from "@pages/coding/coding";
import MD5 from "crypto-js/md5";
import * as monaco from "monaco-editor";

let editorsCount = 0

async function onDirClick(e, did) {
    const id = e.target.getAttribute("id")
    if (did !== id) {
        return
    }
    const path = e.target.getAttribute("path")
    const isOpened = e.target.getAttribute("opened")
    if (isOpened === 'y') {
        while (e.target.lastElementChild) {
            e.target.removeChild(e.target.lastElementChild);
        }
        e.target.setAttribute("opened", "n")
        return
    } else {

        let ul = document.createElement('ul')
        e.target.appendChild(ul)
        if (e.target.children.length !== 1) {
            return
        }
        const api = new Api();
        const dirList = await api.getDirs(id)

        const dirs = dirList.data
        dirs.forEach((dir) => {
            let li = document.createElement('li')
            li.setAttribute("id", dir.fileId)
            let cl = 'goifile'
            if (dir.dir === true) {
                cl = 'dir'
                li.addEventListener('click', (e) => onDirClick(e, dir.fileId))
                li.setAttribute("path", path + "/" + dir.name)
                li.addEventListener('contextmenu', (e) => onDirRmb(e, dir.fileId))
            } else {
                li.addEventListener('click', (e) => onFileClick(e, dir.fileId))
                li.setAttribute("path", path + "/" + dir.name.substr(0, dir.name.length - 4))
                li.addEventListener('contextmenu', (e) => onFileRmb(e, dir.fileId))
            }
            li.classList.add(cl)
            li.textContent = dir.name
            ul.appendChild(li)
        });
        e.target.setAttribute("opened", 'y')
    }
}

function resizeMonaco(e) {
    const editorId = e.target.closest('.coding-wrap').getAttribute("editor-id")
    const coding = document.getElementById(`coding-${editorId}`)
    if ((e.key === 'Enter') || (e.key === 'Backspace')) {
        const str = monaco.editor.getEditors()[Number(editorId)].getValue().toString()
        let add = 2;
        if (e.key === 'Backspace') {
            add = 1;
        }
        const blocks = str.match(/[^\n]*\n[^\n]*/gi).length + add;
        coding.style.height = (blocks * 19).toString() + 'px';
    }
}

async function onFileClick(e, did) {
    const id = e.target.getAttribute("id")
    // if (did !== id) {
    //     alert(did)
    //     alert(id)
    //     return
    // }
    e.preventDefault()
    window.router.redirect("files/" + id);
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

async function onCreateFile(e, parent_id) {
    let result = prompt("Введите имя файла");
    if (result.length < 3) {
        alert('Больше 3 символов надо')
    } else {
        result = result + '.goi'
        const api = new Api()

        const response = await api.addFile(parent_id, result, false)

        let li = document.createElement('li')
        li.setAttribute("id", response.data.id)
        let cl = 'goifile'
        li.addEventListener('click', (e) => onFileClick(e))
        //li.setAttribute("path", path + "/" + result)
        li.addEventListener('contextmenu', (e) => onFileRmb(e, response.data.id))
        li.classList.add(cl)
        li.textContent = result
        if ((e.target.getAttribute("opened") === "y")) {
            e.target.appendChild(li)
        }
        if ((parent_id === "mainlist")) {
            const dirList = document.getElementById("dirlist")
            dirList.appendChild(li)
        }
    }
}

async function onDeleteFile(e, id) {
    const api = new Api();
    await api.deleteFile(id);
    let fileEl = document.getElementById(id);
    fileEl.remove();
}

async function onRenameFile(e, id) {
    let result = prompt("Введите имя файла");
    if (result.length < 3) {
        alert('Больше 3 символов надо')
    } else {
        const api = new Api();
        let fileEl = document.getElementById(id);
        let oldName = fileEl.textContent;
        if (oldName.slice(-4) === ".goi") {
            result += ".goi";
        }
        await api.renameFile(id, result);
        fileEl.textContent = result;
    }
}

async function onDirRmb(e, did) {
    const oldcreate = document.getElementById('create')
    if (oldcreate) {
        oldcreate.style.display = 'none'
    }
    const oldedit = document.getElementById('edit')
    if (oldedit) {
        oldedit.style.display = 'none'
    }

    const id = e.target.getAttribute("id")
    if ((did !== id) && (id != "mainlist")) {
        return
    }
    e.preventDefault()
    //const path = '/' + e.target.getAttribute("path")

    const create = document.getElementById('create')
    create.style.display = 'inline'
    let x = e.clientX;
    let y = e.clientY;
    create.style.left = `${x}px`;
    create.style.top = `${y}px`;
    document.getElementById('cfile').addEventListener('click', (e) => onCreateFile(e, id));
    e.stopPropagation()
}

async function onFileRmb(e) {
    const oldcreate = document.getElementById('create')
    if (oldcreate) {
        oldcreate.style.display = 'none'
    }
    const oldedit = document.getElementById('edit')
    if (oldedit) {
        oldedit.style.display = 'none'
    }

    const id = e.target.getAttribute("id")
    e.preventDefault()
    const paths = e.target.getAttribute("path").split('/')
    let path = '/'
    for (let i = 0; i < paths.length - 1; i++) {
        path += paths[i]
    }
    const create = document.getElementById('edit');
    create.style.display = 'inline';
    let x = e.clientX;
    let y = e.clientY;
    create.style.left = `${x}px`;
    create.style.top = `${y}px`;
    document.getElementById('dfile').addEventListener('click', (e) => onDeleteFile(e, id))
    document.getElementById('rfile').addEventListener('click', (e) => onRenameFile(e, id))
    e.stopPropagation()
}

const main = async () => {
    const pathSplit = window.location.href.split('/')
    console.log(pathSplit)
    let pathStr = ''
    const rootElement = document.querySelector(ROOT_ELEMENT_ID);
    rootElement.innerHTML = mainTemplate();
    for (let i = 4; i < pathSplit.length; i++) {
        pathStr += '/'
        pathStr += pathSplit[i]
    }

    const loadingElement = document.getElementById('loader')
    rootElement.style.visibility = 'hidden';

    const api = new Api()
    const dirList = await api.getDirs("00000000-0000-0000-0000-000000000000")
    const parentList = document.getElementById("dirlist")

    const dirs = dirList.data
    console.log(dirs)
    dirs.forEach((dir) => {
        let li = document.createElement('li')
        li.setAttribute("opened", 'n')
        li.setAttribute("id", dir.fileId)
        li.setAttribute("path", dir.name)
        let cl = 'goifile'
        if (dir.dir === true) {
            cl = 'dir'
            li.addEventListener('click', (e) => onDirClick(e, dir.fileId))
            if (dir.rights[0] == 'o') {
                li.addEventListener('contextmenu', (e) => onDirRmb(e, dir.fileId))
            }
        } else {
            li.addEventListener('click', (e) => onFileClick(e, "00000000-0000-0000-0000-000000000000"))
            if (dir.rights[0] == 'o') {
                li.addEventListener('contextmenu', (e) => onFileRmb(e, dir.fileId));
            }
        }
        li.classList.add(cl)
        li.textContent = dir.name
        parentList.appendChild(li)
    })

    if (pathStr != '') {
        await coding(pathStr)
    }

    const mainList = document.getElementById("mainlist")
    mainList.addEventListener('contextmenu', (e) => {
        onDirRmb(e, "00000000-0000-0000-0000-000000000000")
    })
    rootElement.style.visibility = 'visible';
    loadingElement.style.display = 'none';
    document.addEventListener('click', (e) => {
        const create = document.getElementById('create')
        if (create) {
            create.style.display = 'none'
        }
        const edit = document.getElementById('edit')
        if (edit) {
            edit.style.display = 'none'
        }
    })
}

export default main;
