import navbarTemplate from "@pages/navbar/navbar.hbs";

import {} from "@pages/navbar/havbar.scss";

const navbar = async () => {
    const navbarEl = document.getElementById('navbar');
    navbarEl.innerHTML = navbarTemplate();
}

export default navbar;
