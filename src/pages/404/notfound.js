import notfoundTemplate from "@pages/404/404.hbs";

import { } from "@pages/404/404.scss";

const notfound = () => {
    const rootEl = document.getElementById('root');
    rootEl.innerHTML = notfoundTemplate();

    const loadingElement = document.getElementById('loader');
    loadingElement.style.visibility = 'hidden';

    document.getElementById('okButton').addEventListener('click', () => {
        window.location.href = '/';
    });
}

export default notfound;