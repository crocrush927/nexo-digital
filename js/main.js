/* NEXO DIGITAL - main script
   Requires js/config.js (window.SITE_CONFIG) and js/i18n.js (window.I18N) to be loaded first. */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var DICT = window.I18N || {};
  var LANG_KEY = "nexo_lang";
  var lang = "fa";

  function $(id) { return document.getElementById(id); }

  function pick(obj, l) {
    if (!obj) return "";
    return typeof obj === "string" ? obj : (obj[l] || obj.en || obj.fa || "");
  }

  /* ---------- Config: colors, brand, contact ---------- */
  function applyColors() {
    var c = CFG.colors || {};
    var root = document.documentElement.style;
    ["bg", "bg2", "violet", "blue", "cyan", "text", "muted"].forEach(function (k) {
      if (c[k]) root.setProperty("--" + k, c[k]);
    });
  }

  function applyBrand() {
    $("logoMain").textContent = CFG.logoMain || CFG.brandName || "";
    $("logoAccent").textContent = CFG.logoAccent || "";
    $("footBrand").textContent = CFG.brandName || "";
    if (CFG.logoImage) {
      var img = $("logoImg");
      img.src = CFG.logoImage;
      img.alt = CFG.brandName || "";
      img.hidden = false;
    }
    $("year").textContent = new Date().getFullYear();
  }

  function applyContact() {
    var c = CFG.contact || {};
    var email = $("cEmail");
    email.textContent = c.email || "";
    email.href = c.email ? "mailto:" + c.email : "#";
    var phone = $("cPhone");
    phone.textContent = c.phone || "";
    phone.href = c.phone ? "tel:" + c.phone.replace(/[^\d+]/g, "") : "#";

    var social = CFG.social || {};
    var box = $("social");
    box.innerHTML = "";
    var names = { linkedin: "LinkedIn", instagram: "Instagram", telegram: "Telegram", github: "GitHub" };
    Object.keys(names).forEach(function (k) {
      if (social[k]) {
        var a = document.createElement("a");
        a.href = social[k];
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = names[k];
        box.appendChild(a);
      }
    });
  }

  function applyWhatsApp() {
    var c = CFG.contact || {};
    var btn = $("waBtn");
    var num = (c.whatsapp || "").replace(/\D/g, "");
    if (!num) { btn.hidden = true; return; }
    btn.hidden = false;
    btn.href = "https://wa.me/" + num + "?text=" + encodeURIComponent(pick(c.whatsappMessage, lang));
  }

  /* ---------- Language ---------- */
  function setLang(l) {
    if (!DICT[l]) l = "fa";
    lang = l;
    var d = DICT[l];
    var html = document.documentElement;
    html.lang = l;
    html.dir = l === "fa" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (d[k] !== undefined) el.textContent = d[k];
    });

    document.title = d.page_title || CFG.brandName || document.title;
    $("langBtn").textContent = d.lang_switch;
    $("cAddress").textContent = pick((CFG.contact || {}).address, l);
    applyWhatsApp();
    $("formStatus").textContent = "";

    try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* storage may be unavailable */ }
  }

  function initialLang() {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* ignore */ }
    return saved || CFG.defaultLang || "fa";
  }

  /* ---------- Menu and header ---------- */
  function initMenu() {
    var btn = $("menuBtn");
    var nav = $("nav");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
    var header = $("header");
    function onScroll() { header.classList.toggle("scrolled", window.scrollY > 10); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Contact form (opens the visitor's email app) ---------- */
  function initForm() {
    var form = $("contactForm");
    var status = $("formStatus");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var msg = form.elements.message.value.trim();
      var ok = name && msg && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok) {
        status.textContent = DICT[lang].f_err;
        status.className = "form-status err";
        return;
      }
      var to = (CFG.contact || {}).email || "";
      var subject = encodeURIComponent((CFG.brandName || "Website") + " - " + name);
      var body = encodeURIComponent(msg + "\n\n" + name + "\n" + email);
      status.textContent = DICT[lang].f_ok;
      status.className = "form-status";
      window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
      form.reset();
    });
  }

  /* ---------- Start ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    applyColors();
    applyBrand();
    applyContact();
    initMenu();
    initForm();
    setLang(initialLang());
    $("langBtn").addEventListener("click", function () {
      setLang(lang === "fa" ? "en" : "fa");
    });
  });
})();
