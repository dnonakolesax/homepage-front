import {routes} from '@configs/link_config.js';

/**
 * Класс роутинга по приложению
 * @class
 */
export class Router {
    /**
     * Добавляет в окно обработчики перехода по ссылке и нажатия на стрелки вперёд/назад
     * @constructor
     */
    constructor() {
        /**
         * Добавляет обработку нажатия на ссылки
         */
        window.addEventListener('click', (event) => {
            const target = event.target.getAttribute('href');
            if (target !== null) {
               event.preventDefault();
              window.open(target, '_blank');
               // this.redirect(target);
            }
        });

        /**
         * Добавляет обработку нажатия на стрелки
         */
        window.addEventListener('popstate', (event) => {
            const path = window.location.pathname;
            this.redirect(path, window.history.state);
        });
    }

    /**
     * Редиректит пользователя по указанному пути внутри приложения
     * @param path - путь внутри приложения
     * @param state - состояние (unused)
     */
    redirect(path, state = null) {
        let renderer = path.replace(/[/0-9]*/g, ''); // удалить лишние цифры если ссылка связана с каким-то id (e.g. id профиля)
        const pathSplit = path.split('/')
        if ((pathSplit.length > 1) && (path.split('/')[0] == 'files')) {
            renderer = 'files'
            path = path.substr(5)
        } 
        if (pathSplit.length == 0) {
            renderer = 'files'
            path = path.substr(5)
        }
        let route = routes[renderer];
        if (!path.startsWith('blob')) {
            //location.href = location.href.split('/')[0] + path

            if (route === undefined) {
                //route = routes.notfound;
            }

            if (renderer == 'files') {
                window.history.pushState(state, null, new URL("http://192.168.1.70:7676/files" + path));
                return route.render(path)
            }
            
            window.history.pushState(state, null, new URL("http://192.168.1.70:7676" + path));
            return route.render();
        }
    }
}
