import login from '@pages/login/login.js';
import coding from "@pages/coding/coding";
import main from "@pages/main/main";

/**
 * Массив объектов с url и функциями отрисовки страниц
 */
export const routes = {
    login: {
        render: login,
    },
    files: {
        render: main,
    }
};
