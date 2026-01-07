/* ================================
   Offer Modal (your existing code) - SAFER (guards)
   ================================ */
(function () {
  const modal = document.getElementById("offerModal");
  const btn = document.getElementById("offerBtn");
  const span = document.querySelector(".offer-close");

  if (modal && btn && span) {
    btn.addEventListener("click", () => {
      modal.style.display = "flex";
      document.body.classList.add("modal-active");
    });

    span.addEventListener("click", () => {
      modal.style.display = "none";
      document.body.classList.remove("modal-active");
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        document.body.classList.remove("modal-active");
      }
    });

    const counterOfferForm = document.getElementById("counterOfferForm");
    if (counterOfferForm) {
      counterOfferForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const amountEl = document.getElementById("offerPrice");
        const amount = amountEl ? amountEl.value : "";

        alert(`Η προσφορά σου (€${amount}) καταχωρήθηκε επιτυχώς!`);

        modal.style.display = "none";
        document.body.classList.remove("modal-active");
        this.reset();
      });
    }
  }

  const phoneBtn = document.getElementById("phoneBtn");
  const phonePopup = document.getElementById("phonePopup");
  const closePopup = document.getElementById("closePopup");
  const popupOverlay = document.getElementById("popupOverlay");

  if (phoneBtn && phonePopup && closePopup && popupOverlay) {
    phoneBtn.addEventListener("click", () => {
      phonePopup.style.display = "block";
      popupOverlay.style.display = "block";
      document.body.classList.add("modal-active");
    });

    closePopup.addEventListener("click", () => {
      phonePopup.style.display = "none";
      popupOverlay.style.display = "none";
      document.body.classList.remove("modal-active");
    });

    popupOverlay.addEventListener("click", () => {
      phonePopup.style.display = "none";
      popupOverlay.style.display = "none";
      document.body.classList.remove("modal-active");
    });
  }
})();

/* ================================
   Ipostit: Report Modal open/close + submit (vanilla)
   ================================ */
(function () {
  function isVisible(el) {
    return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }

  document.addEventListener("DOMContentLoaded", function () {
    const ipModal = document.getElementById("ipReportModal");
    if (!ipModal) return;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    function openModal() {
      ipModal.classList.add("is-open");
      ipModal.setAttribute("aria-hidden", "false");
      htmlEl.classList.add("ip-modal-open");
      bodyEl.classList.add("ip-modal-open");

      // if wrapper is the scroller, start at top
      ipModal.scrollTop = 0;

      // focus first visible input/textarea/button
      setTimeout(() => {
        const focusables = ipModal.querySelectorAll("input, textarea, button, select, a[href]");
        for (const el of focusables) {
          if (isVisible(el) && !el.disabled) {
            el.focus();
            break;
          }
        }
      }, 0);
    }

    function closeModal() {
      ipModal.classList.remove("is-open");
      ipModal.setAttribute("aria-hidden", "true");
      htmlEl.classList.remove("ip-modal-open");
      bodyEl.classList.remove("ip-modal-open");
    }

    // Open (anywhere in the document)
    document.addEventListener("click", function (e) {
      const opener = e.target.closest("[data-ip-open-report]");
      if (!opener) return;
      e.preventDefault();
      openModal();
    });

    // Close button inside modal
    ipModal.addEventListener("click", function (e) {
      const closer = e.target.closest("[data-ip-report-close]");
      if (closer) {
        e.preventDefault();
        closeModal();
        return;
      }

      // Optional: click on overlay closes (if you want it)
      const overlay = e.target.classList.contains("ip-report__overlay")
        ? e.target
        : null;

      if (overlay) {
        closeModal();
      }
    });

    // ESC closes
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ipModal.classList.contains("is-open")) {
        closeModal();
      }
    });

    // Submit
    const form = document.getElementById("ipReportForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const reasons = Array.from(
          form.querySelectorAll('input[name="report_reason"]:checked')
        ).map((x) => x.value);

        const emailEl = form.querySelector('[name="report_email"]');
        const commentEl = form.querySelector('[name="report_comment"]');

        const payload = {
          email: (emailEl ? emailEl.value : "").trim(),
          reasons: reasons,
          comment: (commentEl ? commentEl.value : "").trim(),
          url: window.location.href,
        };

        // TODO: εδώ κάνεις POST σε API
        console.log("REPORT payload:", payload);

        const toast = form.querySelector(".ip-report__toast");
        if (toast) toast.classList.add("is-show");

        setTimeout(() => {
          if (toast) toast.classList.remove("is-show");
          closeModal();
          form.reset();
        }, 1400);
      });
    }
  });
})();

/* ================================
   Custom Share (WhatsApp/Viber/Email/Copy) - vanilla
   ================================ */
(function () {
  const CUSTOM_HTML = `
    <a href="#" class="ip-share-btn ip-share-whatsapp mt-0" aria-label="WhatsApp">
      <i class="fab fa-whatsapp"></i><span>WhatsApp</span>
    </a>
    <a href="#" class="ip-share-btn ip-share-viber" aria-label="Viber">
      <i class="fab fa-viber"></i><span>Viber</span>
    </a>
    <a href="#" class="ip-share-btn ip-share-email" aria-label="Email">
      <i class="far fa-envelope"></i><span>Email</span>
    </a>
    <a href="#" class="ip-share-btn ip-share-copy" aria-label="Copy link">
      <i class="far fa-link"></i><span>Copy link</span>
    </a>
  `;

  function getShareUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    return (canonical && canonical.getAttribute("href")) || window.location.href;
  }

  function getShareTitle() {
    return document.title || "";
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function mount(container) {
    container.dataset.ipCustomShare = "1";
    container.innerHTML = CUSTOM_HTML;
  }

  function ensureOnlyCustom(container) {
    const hasAnyNonCustom =
      container.querySelector("ul, li, .share-icon, .share-btn") ||
      container.querySelector('a:not(.ip-share-btn)');

    const hasCustom = container.querySelector(".ip-share-btn");

    if (!hasCustom || hasAnyNonCustom) mount(container);
  }

  function observe(container) {
    const obs = new MutationObserver(() => {
      ensureOnlyCustom(container);
    });

    obs.observe(container, { childList: true, subtree: true });
  }

  function initAll() {
    const containers = document.querySelectorAll(".share-container");


    containers.forEach((c) => {
      mount(c);
      observe(c);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAll();

    window.addEventListener("load", () => {
      initAll();
      setTimeout(initAll, 250);
    });
  });

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("a.ip-share-btn");
    if (!btn) return;

    e.preventDefault();

    const url = getShareUrl();
    const title = getShareTitle();
    const text = encodeURIComponent(title + " " + url);

    if (btn.classList.contains("ip-share-whatsapp")) {
      window.open("https://wa.me/?text=" + text, "_blank");
      return;
    }

    if (btn.classList.contains("ip-share-viber")) {
      window.location.href = "viber://forward?text=" + text;
      return;
    }

    if (btn.classList.contains("ip-share-email")) {
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(url);
      window.location.href = "mailto:?subject=" + subject + "&body=" + body;
      return;
    }

    if (btn.classList.contains("ip-share-copy")) {
      const span = btn.querySelector("span");
      const old = span ? span.textContent : "Copy link";

      copyToClipboard(url).then(() => {
        if (span) span.textContent = "Copied!";
        setTimeout(() => {
          if (span) span.textContent = old;
        }, 900);
      });
    }
  });
})();

