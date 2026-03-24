import privacyTemplate from "@pages/privacy/privacy.hbs";

import {} from "@pages/privacy/privacy.scss";

const privacy = () => {
  const KEY = "noted_cookie_consent_v1"; 
  const overlay = document.getElementById("cookieOverlay");
  overlay.innerHTML = privacyTemplate();
  if (!overlay) return;

  function open() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify({
      ts: Date.now()
    }));
  }

  open();

   document.addEventListener("click", (e) => {
    if (e.target.closest("[data-cookie-accept]")) {
      save();
      close();
    }
  });
}

export default privacy;