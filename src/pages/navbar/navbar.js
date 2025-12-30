import navbarTemplate from "@pages/navbar/navbar.hbs";

import { } from "@pages/navbar/havbar.scss";
import { Api } from "@modules/api";

const navbar = async () => {
    const api = new Api();
    const userRes = await api.self();
    const navbarEl = document.getElementById('navbar');

   if (userRes.status !== 200) {
        navbarEl.innerHTML = navbarTemplate({ auth: false });
    } else {
       navbarEl.innerHTML = navbarTemplate({ auth: true, username: userRes.data.login });
    }

    const menu = document.querySelector("[data-user-menu]");
    if (!menu) return;

    const btn = menu.querySelector(".user-button");
    const dropdown = menu.querySelector(".dropdown");

    const close = () => {
        menu.classList.remove("open");
        btn?.setAttribute("aria-expanded", "false");
    };

    const open = () => {
        menu.classList.add("open");
        btn?.setAttribute("aria-expanded", "true");
    };

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.contains("open") ? close() : open();
    });

    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target)) close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
}

export default navbar;
