/* =========================================================
   Nebrass Car — Script principal
   ========================================================= */

/* ---------- CONFIGURATION : à modifier ici ---------- */
const CONFIG = {
  whatsapp: "212607291514",   // numéro WhatsApp sans "+" ni espaces
  defaultLang: "fr"
};

/* ---------- FLOTTE : ajoutez / retirez des voitures ici ----------
   cat   : eco | sedan | suv | family
   gear  : man | auto
   fuel  : diesel | essence
   color : couleur de l'illustration
   isNew : true pour afficher le badge "Nouveau"                      */
const FLEET = [
  { name: "Dacia Sandero",     cat: "eco",    seats: 5, gear: "man",  fuel: "diesel",  color: "#fbf5ef" },
  { name: "Renault Clio 5",    cat: "eco",    seats: 5, gear: "man",  fuel: "diesel",  color: "#ffb347" },
  { name: "Peugeot 208",       cat: "eco",    seats: 5, gear: "auto", fuel: "essence", color: "#3b1d4a" },
  { name: "Dacia Logan",       cat: "sedan",  seats: 5, gear: "man",  fuel: "diesel",  color: "#b8a9c2" },
  { name: "Hyundai Accent",    cat: "sedan",  seats: 5, gear: "auto", fuel: "essence", color: "#24112f" },
  { name: "Dacia Duster",      cat: "suv",    seats: 5, gear: "man",  fuel: "diesel",  color: "#d9783a" },
  { name: "Hyundai Tucson",    cat: "suv",    seats: 5, gear: "auto", fuel: "diesel",  color: "#5a3a6b" },
  { name: "Kia Sportage",      cat: "suv",    seats: 5, gear: "auto", fuel: "diesel",  color: "#e8ddd2" },
  { name: "Dacia Jogger",      cat: "family", seats: 7, gear: "man",  fuel: "essence", color: "#8a3f6a" }
];

/* ---------- Helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const LANGS = ["fr", "en", "ar"];
let lang = CONFIG.defaultLang;
let filter = "all";
const t = k => (I18N[lang] && I18N[lang][k] !== undefined) ? I18N[lang][k] : (I18N.fr[k] ?? k);
const store = {
  get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
};
const waLink = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

/* ---------- Car illustration ---------- */
function carSVG(color, big = false) {
  const id = "g" + Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="0 0 340 130" ${big ? 'width="100%"' : ""} aria-hidden="true">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <ellipse cx="170" cy="117" rx="150" ry="8" fill="rgba(0,0,0,.18)"/>
  <path d="M24 90 Q24 70 54 64 L106 58 Q132 30 176 28 L222 28 Q252 30 274 58 L306 64 Q322 68 322 88 L322 100 Q322 106 314 106 L30 106 Q22 106 22 98 Z" fill="${color}"/>
  <path d="M24 90 Q24 70 54 64 L106 58 Q132 30 176 28 L222 28 Q252 30 274 58 L306 64 Q322 68 322 88 L322 100 Q322 106 314 106 L30 106 Q22 106 22 98 Z" fill="url(#${id})"/>
  <path d="M116 58 Q138 38 172 36 L184 36 L184 58 Z" fill="#cfdceb"/>
  <path d="M192 36 L220 36 Q246 38 262 58 L192 58 Z" fill="#cfdceb"/>
  <path d="M116 58 Q138 38 172 36 L184 36 L184 58 Z M192 36 L220 36 Q246 38 262 58 L192 58 Z" fill="url(#${id})"/>
  <path d="M60 80 H312" stroke="rgba(0,0,0,.15)" stroke-width="2"/>
  <rect x="296" y="70" width="20" height="8" rx="4" fill="#ffe4a3"/>
  <rect x="26" y="74" width="12" height="7" rx="3" fill="#ff5a45"/>
  <rect x="200" y="66" width="16" height="3" rx="1.5" fill="rgba(0,0,0,.3)"/>
  <circle cx="92" cy="104" r="19" fill="#151515"/><circle cx="92" cy="104" r="9" fill="#b9c0c9"/><circle cx="92" cy="104" r="3" fill="#151515"/>
  <circle cx="256" cy="104" r="19" fill="#151515"/><circle cx="256" cy="104" r="9" fill="#b9c0c9"/><circle cx="256" cy="104" r="3" fill="#151515"/>
</svg>`;
}

/* ---------- Renderers ---------- */
function renderFleet() {
  const list = FLEET.filter(c => filter === "all" || c.cat === filter);
  $("#fleet").innerHTML = list.map(c => `
    <article class="car-card" data-tilt>
      <div class="cc-top">
        <div><h3 dir="ltr" style="text-align:start">${c.name}</h3><small>${t("sim")}</small></div>
        <span class="badge ${c.isNew ? "new" : ""}">${c.isNew ? t("new") : t("f_" + c.cat)}</span>
      </div>
      <div class="cc-img">${carSVG(c.color)}</div>
      <div class="specs">
        <div class="spec"><b>${c.seats}</b>${t("capacity")}</div>
        <div class="spec"><b>${t(c.gear)}</b>${t("gearbox")}</div>
        <div class="spec"><b>${t(c.fuel)}</b>${t("fuel")}</div>
      </div>
      <div class="cc-foot">
        <div class="p">${t("price")}<small>${t("price2")}</small></div>
        <a class="btn btn-red btn-sm" target="_blank" rel="noopener" href="${waLink(t("msg_quote") + " " + c.name + ".")}">${t("quote")}</a>
      </div>
    </article>`).join("");
}

function renderFAQ() {
  $("#faqList").innerHTML = t("faq").map(([q, a], i) => `
    <details ${i === 0 ? "open" : ""}>
      <summary>${q}<span class="pm">+</span></summary>
      <div class="ans">${a}</div>
    </details>`).join("");
}

function renderMarquee() {
  const items = t("marquee").map(x => `<span>${x}</span>`).join("");
  $("#track").innerHTML = items + items;
}

/* ---------- Language ---------- */
function setLang(l, save = true) {
  if (!LANGS.includes(l)) l = CONFIG.defaultLang;
  lang = l;
  const html = document.documentElement;
  html.lang = l;
  html.dir = l === "ar" ? "rtl" : "ltr";
  document.title = t("meta_title");
  $('meta[name="description"]').setAttribute("content", t("meta_desc"));

  $$("[data-i]").forEach(el => {
    const v = t(el.dataset.i);
    if (typeof v !== "string") return;
    if (el.hasAttribute("data-html")) el.innerHTML = v; else el.textContent = v;
  });
  $$(".langs button").forEach(b => b.classList.toggle("on", b.dataset.l === l));

  renderFleet(); renderFAQ(); renderMarquee();
  $("#bookErr").textContent = "";

  if (save) {
    store.set("nebrass_lang", l);
    const u = new URL(location.href);
    u.searchParams.set("lang", l);
    history.replaceState(null, "", u);
  }
}

function initialLang() {
  const q = new URLSearchParams(location.search).get("lang");
  if (LANGS.includes(q)) return q;
  const s = store.get("nebrass_lang");
  if (LANGS.includes(s)) return s;
  const n = (navigator.language || "").slice(0, 2);
  return LANGS.includes(n) ? n : CONFIG.defaultLang;
}

/* ---------- Events ---------- */
$$(".langs button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.l)));
$$("[data-setlang]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault(); setLang(a.dataset.setlang); scrollTo({ top: 0, behavior: "smooth" });
}));

$$("#tabs .tab").forEach(b => b.addEventListener("click", () => {
  $$("#tabs .tab").forEach(x => x.classList.remove("on"));
  b.classList.add("on"); filter = b.dataset.f; renderFleet();
}));

/* Booking -> WhatsApp */
const today = new Date();
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
$("#d1").min = iso(today);
$("#d2").min = iso(today);
$("#d1").addEventListener("change", e => { $("#d2").min = e.target.value; });

$("#bookForm").addEventListener("submit", e => {
  e.preventDefault();
  const err = $("#bookErr");
  const d1 = $("#d1").value, d2 = $("#d2").value, name = $("#name").value.trim();
  if (!name) { err.textContent = t("err_name"); $("#name").focus(); return; }
  if (!d1 || !d2 || d2 <= d1) { err.textContent = t("err_dates"); $(d1 ? "#d2" : "#d1").focus(); return; }
  err.textContent = "";
  const fmt = d => d.split("-").reverse().join("/");
  const opt = id => { const s = $(id); return s.options[s.selectedIndex].textContent; };
  const msg = [
    t("msg_hello"), "",
    `${t("msg_name")} : ${name}`,
    `${t("msg_pick")} : ${opt("#pick")}`,
    `${t("msg_from")} ${fmt(d1)} ${t("msg_to")} ${fmt(d2)}`,
    `${t("msg_cat")} : ${opt("#cat")}`,
    `${t("msg_gear")} : ${opt("#gear")}`
  ].join("\n");
  window.open(waLink(msg), "_blank", "noopener");
});

/* Nav */
const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 50), { passive: true });
$("#burger").addEventListener("click", () => $("#links").classList.toggle("show"));
$$("#links a").forEach(a => a.addEventListener("click", () => $("#links").classList.remove("show")));

/* Reveal on scroll */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .1 });
  $$(".rev").forEach(el => io.observe(el));
} else {
  $$(".rev").forEach(el => el.classList.add("in"));
}

/* ---------- Effet 3D : inclinaison des cartes au survol ---------- */
(function tilt3D() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const SEL = "[data-tilt], .bx, .step, .pr, .score";
  let cur = null;
  const reset = el => { el.style.transform = ""; el.style.removeProperty("--mx"); el.style.removeProperty("--my"); };
  document.addEventListener("pointermove", e => {
    const el = e.target.closest(SEL);
    if (cur && cur !== el) { reset(cur); cur.classList.remove("tilting"); }
    cur = el;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    const max = el.classList.contains("car-card") ? 10 : 6;
    el.classList.add("tilting");
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0)`;
    el.style.setProperty("--mx", (px * 100) + "%");
    el.style.setProperty("--my", (py * 100) + "%");
  }, { passive: true });
  document.addEventListener("pointerleave", () => { if (cur) { reset(cur); cur.classList.remove("tilting"); cur = null; } });
})();

/* Init */
$("#heroCar").innerHTML = carSVG("#fbf5ef", true);
$("#yr").textContent = new Date().getFullYear();
setLang(initialLang(), false);
