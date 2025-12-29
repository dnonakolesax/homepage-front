import login from '@pages/login/login.js';
import coding from "@pages/coding/coding";
import session from "@pages/session/session";
import main from "@pages/main/main";
import notfound from "@pages/404/notfound";

/**
 * Массив объектов с url и функциями отрисовки страниц
 */
export const routes = {
    login: {
        render: login,
    },
    files: {
        render: main,
    },
    sessions: {
        render: session,
    },
    "": {
        render: main
    },
    "404": {
        render: notfound
    }
};
