import {Router} from '@modules/router/router';

// import reset from '@components/Shared/reset.scss';

const router = new Router();
window.router = router;

async function init() {
    return router.redirect('/login');
}

await init();
