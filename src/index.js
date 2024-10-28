import {Router} from '@modules/router/router';

// import reset from '@components/Shared/reset.scss';
import {} from '@partials/roller/roller.scss'
import navbar from "@pages/navbar/navbar";

const router = new Router();
window.router = router;

async function init() {
    await navbar();
    return router.redirect('/files');
}

await init();
