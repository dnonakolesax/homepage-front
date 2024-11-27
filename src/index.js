import {Router} from '@modules/router/router';

// import reset from '@components/Shared/reset.scss';
import {} from '@partials/roller/roller.scss'
import navbar from "@pages/navbar/navbar";
import {Api} from "@modules/api";

const router = new Router();
window.router = router;

async function init() {
    await navbar();
    let url = ''
    const api  = new Api()
    api.abc()
    const urlArr = window.location.href.split('/');
    for (let i = 3; i < urlArr.length; i++) {
        if (i !== 3) {
            url += '/'
        }
        url += urlArr[i]
    }
    return router.redirect(url);
}

await init();
