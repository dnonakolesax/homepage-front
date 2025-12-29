import sessionsTemplate from "@pages/session/session.hbs";

import { } from "@pages/session/session.scss";
import { Api } from "@modules/api";

async function revoke(sessionId) {
  const res = await fetch("/api/sessions/" + encodeURIComponent(sessionId) + "/revoke", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("Failed to revoke session. HTTP " + res.status + (text ? (": " + text) : ""));
  }
}

function fmtTime(unixSeconds) {
  const n = Number(unixSeconds);
  if (!Number.isFinite(n) || n <= 0) return "-";
  const d = new Date(n * 1000);

  // YYYY-MM-DD HH:mm:ss (локальное время сервера)
  const pad = (x) => String(x).padStart(2, "0");
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

const session = async () => {
  const api = new Api();
  const sessions = await api.getSessions();
  if ((sessions.status === 401) || (sessions.status === 403)) {
    //return window.location.href = "/api/v1/iam/openid-connect/auth?redirect_uri=" + encodeURIComponent(window.location.href); 
    return window.location.href = "/api/v1/iam/openid-connect/auth";
  }
  sessions.data.forEach(session => {
    session.started = fmtTime(session.started);
    session.lastAccess = fmtTime(session.lastAccess);
    session.expires = fmtTime(session.expires);
    session.sessions.forEach(sess => {
      sess.started = fmtTime(sess.started);
      sess.lastAccess = fmtTime(sess.lastAccess);
      sess.expires = fmtTime(sess.expires);
    });
  });
  const rootEl = document.getElementById('root');
  console.log(sessions.data);
  rootEl.innerHTML = sessionsTemplate({ devices: sessions.data, amount: sessions.data.length });

  const loadingElement = document.getElementById('loader')
  loadingElement.style.visibility = 'hidden';

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-revoke-session]");
    if (!btn) return;

    const id = btn.getAttribute("data-revoke-session");
    if (!id) return;

    const ok = confirm("Прекратить сессию " + id + " ?");
    if (!ok) return;

    btn.disabled = true;
    btn.textContent = "выходим...";

    try {
      await revoke(id);
      window.location.reload();
    } catch (err) {
      console.log(err.message || String(err));
      alert('Ошибка');
      btn.disabled = false;
      btn.textContent = "ВЫХОД";
    }
  });
}

export default session;
