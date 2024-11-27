import {ROOT_ELEMENT_ID} from "@configs/common_config";
import loginTemplate from "@pages/login/login.hbs";

import video from '@static/videos/Untitled.mp4'

import style from '@pages/login/login.scss';

function handleLogin (event) {
    const videoEl = document.getElementById('terry-a-davis');
    videoEl.src = video;
    videoEl.autoplay = 'autoplay';
    videoEl.muted = false;
    const videoDiv = document.querySelector('.login__wrong-password');
    videoDiv.style.display = 'block';
    videoEl.addEventListener('ended', () => {
        videoDiv.style.display = 'none';
    })
}

const login = async () => {
    const rootElement = document.querySelector(ROOT_ELEMENT_ID);
    rootElement.innerHTML = loginTemplate();

    const loadingElement = document.getElementById('loader');
    loadingElement.style.display = 'none';

    const loginBtn = document.getElementById('login-btn');
    loginBtn.addEventListener('click', handleLogin)
}

export default login;
