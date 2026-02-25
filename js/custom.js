/* =========================================================
   Wallet / Dashboard UI JS (FULL)
   - Vehicle tabs
   - Astro multiselect
   - Date pairs (Notifications + Publish)
   - Wallet offcanvas (works from header button + menu item)
   - Wallet modals (NEWSPAPER works from header button + menu href)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initVehicleTabs();
  initAstroMultiselects();

  initNotifDatePairs();        // notifications page
  initPublishNotifDatePairs(); // publish page

  initWalletOffcanvas();       // wallet offcanvas (if exists on page)

  // Wallet dashboard modals (if exist on page)
  initTopupModal();
  initWithdrawModal();
  initReferralModal();
  initNewspaperModal();
});

/* =========================================================
   Small utilities
   ========================================================= */

function isElOpenById(id) {
  var el = document.getElementById(id);
  return !!(el && el.classList.contains("is-open"));
}

function isThemeModalOpen() {
  return !!document.querySelector(".modal_main.vis_mr");
}

function isWalletOffcanvasOpen() {
  var off = document.getElementById("walletOffcanvas");
  return !!(off && off.classList.contains("is-open"));
}

function closeTownhubMobileMenuIfOpen() {
  var mainMenu = document.querySelector(".main-menu");
  var btnWrap = document.querySelector(".nav-button-wrap");

  if (mainMenu && mainMenu.classList.contains("vismobmenu")) {
    mainMenu.classList.remove("vismobmenu");
  }
  if (btnWrap && btnWrap.classList.contains("vismobmenu_btn")) {
    btnWrap.classList.remove("vismobmenu_btn");
  }
}

function lockBodyScroll() {
  document.documentElement.classList.add("hid-body");
  document.body.classList.add("hid-body");
  document.body.classList.add("wallet-modal-open");
}

function unlockBodyScrollIfSafe() {
  if (isThemeModalOpen()) return;
  if (isWalletOffcanvasOpen()) return;

  if (isElOpenById("topupModal")) return;
  if (isElOpenById("withdrawModal")) return;
  if (isElOpenById("referralModal")) return;
  if (isElOpenById("newspaperModal")) return;

  document.documentElement.classList.remove("hid-body");
  document.body.classList.remove("hid-body");
  document.body.classList.remove("wallet-modal-open");
}

function ensureNiceSelectIn(scopeEl) {
  if (!window.jQuery) return;
  var $ = window.jQuery;
  if (typeof $.fn.niceSelect !== "function") return;
  if (!scopeEl) return;

  $(scopeEl)
    .find("select.chosen-select")
    .each(function () {
      var $sel = $(this);
      var $wrap = $sel.next(".nice-select");
      try {
        if ($wrap.length) $sel.niceSelect("update");
        else $sel.niceSelect();
      } catch (e) {}
    });
}

/* =========================================================
   VEHICLE SUB-TABS (inside .tab-content)
   ========================================================= */

function initVehicleTabs(scope) {
  scope = scope || document;

  var tabContents = scope.querySelectorAll(".tab-content");
  if (!tabContents.length) return;

  tabContents.forEach(function (tabContent) {
    var vehicleLinks = tabContent.querySelectorAll(".vehicle-tab-link");
    var vehicleTabs = tabContent.querySelectorAll(".vehicle-tab");
    var vehicleContents = tabContent.querySelectorAll(".sub-tab-content");

    if (!vehicleLinks.length) return;

    vehicleLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        vehicleTabs.forEach(function (tab) {
          tab.classList.remove("current");
        });

        vehicleContents.forEach(function (content) {
          content.classList.remove("visible");
          content.classList.add("hidden");
        });

        if (this.parentElement) this.parentElement.classList.add("current");

        var targetSelector = this.getAttribute("href");
        var targetContent = targetSelector
          ? tabContent.querySelector(targetSelector)
          : null;

        if (targetContent) {
          targetContent.classList.add("visible");
          targetContent.classList.remove("hidden");
        }
      });
    });
  });
}

/* =========================================================
   ASTRO MULTISELECT
   ========================================================= */

function setAstroSelectedText(txtEl, label) {
  if (!txtEl) return;

  var icon = txtEl.querySelector(
    'i[class*="fa"], i.fal, i.far, i.fas, i.fa-solid, i.fa-regular, i.fa-light, i.fa-duotone'
  );
  var iconClone = icon ? icon.cloneNode(true) : null;

  txtEl.textContent = "";
  if (iconClone) {
    txtEl.appendChild(iconClone);
    txtEl.appendChild(document.createTextNode(" "));
  }
  txtEl.appendChild(document.createTextNode(label));
}

function updateAstroSelectedText(dd) {
  var txt = dd.querySelector(".selected-text");
  if (!txt) return;

  var placeholder = txt.dataset.placeholder || "Επιλογή";
  var checked = Array.prototype.slice
    .call(dd.querySelectorAll('input[type="checkbox"]:checked'))
    .map(function (c) {
      return c.value;
    });

  if (!checked.length) {
    setAstroSelectedText(txt, placeholder);
  } else if (checked.length <= 2) {
    setAstroSelectedText(txt, checked.join(", "));
  } else {
    setAstroSelectedText(
      txt,
      checked.slice(0, 2).join(", ") + " +" + (checked.length - 2) + " ακόμη"
    );
  }
}

function initAstroMultiselects(scope) {
  scope = scope || document;

  var dropdowns = scope.querySelectorAll(".custom-multiselect.astro-dd");
  if (!dropdowns.length) return;

  function closeAll(except) {
    except = except || null;
    document
      .querySelectorAll(".custom-multiselect.astro-dd.open")
      .forEach(function (dd) {
        if (dd !== except) dd.classList.remove("open");
      });
  }

  if (!window.__astroDD_bound) {
    window.__astroDD_bound = true;

    document.addEventListener("click", function (e) {
      var box = e.target.closest(".custom-multiselect.astro-dd .select-box");
      if (box) {
        var dd = box.closest(".custom-multiselect.astro-dd");
        var willOpen = !dd.classList.contains("open");

        closeAll(dd);
        dd.classList.toggle("open", willOpen);

        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (!e.target.closest(".custom-multiselect.astro-dd")) closeAll(null);
    });

    document.addEventListener("keydown", function (e) {
      var box = e.target.closest(".custom-multiselect.astro-dd .select-box");
      if (!box) return;

      if (e.key === "Enter" || e.key === " ") {
        var dd = box.closest(".custom-multiselect.astro-dd");
        var willOpen = !dd.classList.contains("open");

        closeAll(dd);
        dd.classList.toggle("open", willOpen);

        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === "Escape") closeAll(null);
    });

    document.addEventListener("change", function (e) {
      var input = e.target;
      if (!(input instanceof HTMLInputElement)) return;
      if (!input.matches('.custom-multiselect.astro-dd input[type="checkbox"]'))
        return;

      var dd = input.closest(".custom-multiselect.astro-dd");
      if (!dd) return;

      if (dd.dataset.single === "1" && input.checked) {
        dd.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
          if (cb !== input) cb.checked = false;
        });
      }

      updateAstroSelectedText(dd);
    });
  }

  dropdowns.forEach(function (dd) {
    if (dd.dataset.astroBound === "1") return;
    dd.dataset.astroBound = "1";

    updateAstroSelectedText(dd);

    var options = dd.querySelector(".dropdown-options");
    if (options) {
      options.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }
  });
}

/* =========================================================
   NOTIFICATIONS PAGE: Date "Από/Έως"
   Root: .page-wallet-notifications .notif-settings
   ========================================================= */

function initNotifDatePairs() {
  if (!window.jQuery) return;
  var $ = window.jQuery;
  if (typeof $.fn.daterangepicker !== "function") return;
  if (typeof window.moment === "undefined") return;

  var $root = $(".page-wallet-notifications .notif-settings");
  if (!$root.length) return;

  var DATE_FORMAT = "DD/MM/YYYY";

  function destroyPicker($input) {
    var drp = $input.data("daterangepicker");
    if (drp && typeof drp.remove === "function") drp.remove();
  }

  function initDatePair($pair) {
    var $from = $pair.find('input[type="text"]').eq(0);
    var $to = $pair.find('input[type="text"]').eq(1);
    if (!$from.length || !$to.length) return;

    destroyPicker($from);
    destroyPicker($to);

    $from
      .daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: false,
        locale: { format: DATE_FORMAT, cancelLabel: "Clear" },
        parentEl: $("body"),
      })
      .off("apply.daterangepicker cancel.daterangepicker")
      .on("apply.daterangepicker", function (ev, picker) {
        $(this).val(picker.startDate.format(DATE_FORMAT));

        var toPicker = $to.data("daterangepicker");
        if (toPicker) {
          toPicker.minDate = picker.startDate;
          toPicker.updateCalendars();
        }

        var toVal = $to.val();
        if (toVal) {
          var toDate = moment(toVal, DATE_FORMAT);
          if (toDate.isBefore(picker.startDate, "day")) $to.val("");
        }

        setTimeout(function () {
          $to.trigger("click");
        }, 120);
      })
      .on("cancel.daterangepicker", function () {
        $(this).val("");
        var toPicker = $to.data("daterangepicker");
        if (toPicker) {
          toPicker.minDate = false;
          toPicker.updateCalendars();
        }
      });

    $to
      .daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: false,
        locale: { format: DATE_FORMAT, cancelLabel: "Clear" },
        parentEl: $("body"),
        isInvalidDate: function (date) {
          var fromVal = $from.val();
          return fromVal
            ? date.isBefore(moment(fromVal, DATE_FORMAT), "day")
            : false;
        },
      })
      .off("apply.daterangepicker cancel.daterangepicker")
      .on("apply.daterangepicker", function (ev, picker) {
        $(this).val(picker.startDate.format(DATE_FORMAT));

        var fromPicker = $from.data("daterangepicker");
        if (fromPicker) {
          fromPicker.maxDate = picker.startDate;
          fromPicker.updateCalendars();
        }
      })
      .on("cancel.daterangepicker", function () {
        $(this).val("");
      });

    $pair
      .off("click.notifClearOne")
      .on("click.notifClearOne", ".clear-singleinput", function (e) {
        e.preventDefault();

        var $input = $(this)
          .closest(".date-container")
          .find('input[type="text"]');
        if (!$input.length) return;

        $input.val("");

        var drp = $input.data("daterangepicker");
        if (drp) {
          drp.setStartDate(moment());
          drp.setEndDate(moment());
        }

        if ($input.is($from)) {
          var toPicker = $to.data("daterangepicker");
          if (toPicker) {
            toPicker.minDate = false;
            toPicker.updateCalendars();
          }
        }

        if ($input.is($to)) {
          var fromPicker = $from.data("daterangepicker");
          if (fromPicker) {
            fromPicker.maxDate = false;
            fromPicker.updateCalendars();
          }
        }
      });
  }

  $root.find(".date-range-pair").each(function () {
    initDatePair($(this));
  });

  $(document).on(
    "focus",
    ".page-wallet-notifications .notif-settings .date-range-pair input[type='text']",
    function () {
      var $pair = $(this).closest(".date-range-pair");
      var $from = $pair.find('input[type="text"]').eq(0);
      if ($from.data("daterangepicker")) return;
      initDatePair($pair);
    }
  );
}

/* =========================================================
   PUBLISH PAGE: Date "Από/Έως"
   Root: .wallet-publish-page
   ========================================================= */

function initPublishNotifDatePairs() {
  if (!window.jQuery) return;
  var $ = window.jQuery;

  if (typeof $.fn.daterangepicker !== "function") return;
  if (typeof window.moment === "undefined") return;

  var $root = $(".wallet-publish-page");
  if (!$root.length) return;

  var DATE_FORMAT = "DD/MM/YYYY";

  function destroyPicker($input) {
    var drp = $input.data("daterangepicker");
    if (drp && typeof drp.remove === "function") drp.remove();
  }

  function initDatePair($pair) {
    var $from = $pair.find('input[type="text"]').eq(0);
    var $to = $pair.find('input[type="text"]').eq(1);
    if (!$from.length || !$to.length) return;

    if ($pair.data("publishDateBound") === 1) return;
    $pair.data("publishDateBound", 1);

    destroyPicker($from);
    destroyPicker($to);

    $from
      .daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: false,
        locale: { format: DATE_FORMAT, cancelLabel: "Clear" },
        parentEl: $("body"),
      })
      .off("apply.daterangepicker cancel.daterangepicker")
      .on("apply.daterangepicker", function (ev, picker) {
        $(this).val(picker.startDate.format(DATE_FORMAT));

        var toPicker = $to.data("daterangepicker");
        if (toPicker) {
          toPicker.minDate = picker.startDate;
          toPicker.updateCalendars();
        }

        var toVal = $to.val();
        if (toVal) {
          var toDate = moment(toVal, DATE_FORMAT);
          if (toDate.isBefore(picker.startDate, "day")) $to.val("");
        }

        setTimeout(function () {
          $to.trigger("click");
        }, 120);
      })
      .on("cancel.daterangepicker", function () {
        $(this).val("");
        var toPicker = $to.data("daterangepicker");
        if (toPicker) {
          toPicker.minDate = false;
          toPicker.updateCalendars();
        }
      });

    $to
      .daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: false,
        locale: { format: DATE_FORMAT, cancelLabel: "Clear" },
        parentEl: $("body"),
        isInvalidDate: function (date) {
          var fromVal = $from.val();
          return fromVal
            ? date.isBefore(moment(fromVal, DATE_FORMAT), "day")
            : false;
        },
      })
      .off("apply.daterangepicker cancel.daterangepicker")
      .on("apply.daterangepicker", function (ev, picker) {
        $(this).val(picker.startDate.format(DATE_FORMAT));

        var fromPicker = $from.data("daterangepicker");
        if (fromPicker) {
          fromPicker.maxDate = picker.startDate;
          fromPicker.updateCalendars();
        }
      })
      .on("cancel.daterangepicker", function () {
        $(this).val("");
      });

    $pair
      .off("click.publishClearOne")
      .on("click.publishClearOne", ".clear-singleinput", function (e) {
        e.preventDefault();

        var $input = $(this)
          .closest(".date-container")
          .find('input[type="text"]');
        if (!$input.length) return;

        $input.val("");

        var drp = $input.data("daterangepicker");
        if (drp) {
          drp.setStartDate(moment());
          drp.setEndDate(moment());
        }

        if ($input.is($from)) {
          var toPicker = $to.data("daterangepicker");
          if (toPicker) {
            toPicker.minDate = false;
            toPicker.updateCalendars();
          }
        }

        if ($input.is($to)) {
          var fromPicker = $from.data("daterangepicker");
          if (fromPicker) {
            fromPicker.maxDate = false;
            fromPicker.updateCalendars();
          }
        }
      });
  }

  $root.find(".date-range-pair").each(function () {
    initDatePair($(this));
  });

  $(document)
    .off("focus.publishDatePair")
    .on(
      "focus.publishDatePair",
      ".wallet-publish-page .date-range-pair input[type='text']",
      function () {
        initDatePair($(this).closest(".date-range-pair"));
      }
    );
}

/* =========================================================
   WALLET OFFCANVAS
   ========================================================= */

function initWalletOffcanvas() {
  if (window.__walletOffcanvas_bound) return;
  window.__walletOffcanvas_bound = true;

  var offcanvas = document.getElementById("walletOffcanvas");
  if (!offcanvas) return;

  var panel = offcanvas.querySelector(".wallet-offcanvas__panel");
  var closers = offcanvas.querySelectorAll("[data-wallet-close]");
  var views = function () {
    return offcanvas.querySelectorAll("[data-wallet-view]");
  };

  var lastActiveEl = null;

  function lockScroll() {
    document.documentElement.classList.add("hid-body");
    document.body.classList.add("hid-body");
  }

  function unlockScrollIfNoOtherModal() {
    if (isThemeModalOpen()) return;
    if (isElOpenById("topupModal")) return;
    if (isElOpenById("withdrawModal")) return;
    if (isElOpenById("referralModal")) return;
    if (isElOpenById("newspaperModal")) return;

    document.documentElement.classList.remove("hid-body");
    document.body.classList.remove("hid-body");
  }

  function ensureNiceSelect() {
    if (!window.jQuery) return;
    var $ = window.jQuery;
    if (typeof $.fn.niceSelect !== "function") return;

    var $active = $(offcanvas).find(".wallet-view.is-active");
    if (!$active.length) return;

    $active.find("select.chosen-select").each(function () {
      var $sel = $(this);
      var $wrap = $sel.next(".nice-select");
      try {
        if ($wrap.length) $sel.niceSelect("update");
        else $sel.niceSelect();
      } catch (e) {}
    });
  }

  function setActiveAction(viewName) {
    offcanvas.querySelectorAll(".wallet-offcanvas__action").forEach(function (a) {
      a.classList.toggle(
        "is-active",
        a.getAttribute("data-wallet-open") === viewName
      );
    });
  }

  function showView(name) {
    var target = offcanvas.querySelector('[data-wallet-view="' + name + '"]');
    if (!target) return false;

    views().forEach(function (v) {
      v.classList.toggle("is-active", v.getAttribute("data-wallet-view") === name);
    });

    setActiveAction(name);
    ensureNiceSelect();
    return true;
  }

  function openWallet() {
    if (offcanvas.classList.contains("is-open")) return;

    lastActiveEl = document.activeElement;

    offcanvas.classList.add("is-open");
    offcanvas.setAttribute("aria-hidden", "false");

    lockScroll();
    showView("home");

    setTimeout(function () {
      if (panel) panel.focus();
    }, 30);
  }

  function closeWallet() {
    if (!offcanvas.classList.contains("is-open")) return;

    offcanvas.classList.remove("is-open");
    offcanvas.setAttribute("aria-hidden", "true");

    unlockScrollIfNoOtherModal();
    showView("home");

    if (lastActiveEl && typeof lastActiveEl.focus === "function") {
      lastActiveEl.focus();
    }
  }

  function parseMoney(val) {
    if (val == null) return 0;
    var s = String(val).replace(",", ".").replace(/[^\d.]/g, "");
    var n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  function updateTopupTotals(amount) {
    var sumEl = offcanvas.querySelector(".js-topup-sum");
    var feeEl = offcanvas.querySelector(".js-topup-fee");
    var totalEl = offcanvas.querySelector(".js-topup-total");

    var feeVal = 0;
    var totalVal = amount + feeVal;

    if (sumEl) sumEl.textContent = amount.toFixed(2) + " €";
    if (feeEl) feeEl.textContent = feeVal.toFixed(2) + " €";
    if (totalEl) totalEl.textContent = totalVal.toFixed(2) + " €";
  }

  function resetCreditsSelection() {
    offcanvas.querySelectorAll(".wallet-credit-card").forEach(function (c) {
      c.classList.remove("is-active");
    });

    offcanvas.querySelectorAll(".wallet-credit-card__btn").forEach(function (b) {
      if (!b.dataset.defaultText) b.dataset.defaultText = b.textContent.trim();
      b.textContent = b.dataset.defaultText;
    });
  }

  function setActiveCreditCard(card) {
    if (!card) return;

    resetCreditsSelection();
    card.classList.add("is-active");

    var btn = card.querySelector(".wallet-credit-card__btn");
    if (btn) {
      if (!btn.dataset.defaultText) btn.dataset.defaultText = btn.textContent.trim();
      btn.textContent = "Επιλεγμένο";
    }
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest(".js-wallet-offcanvas-open");
    if (!opener) return;

    e.preventDefault();
    closeTownhubMobileMenuIfOpen();
    openWallet();
  });

  offcanvas.addEventListener("click", function (e) {
    var a = e.target.closest("[data-wallet-open]");
    if (a) {
      var view = a.getAttribute("data-wallet-open");
      if (!view) return;

      var ok = showView(view);
      if (ok) e.preventDefault();
      return;
    }

    var back = e.target.closest("[data-wallet-back]");
    if (back) {
      e.preventDefault();
      showView("home");
      return;
    }

    var amtBtn = e.target.closest(".wallet-topup__amount");
    if (amtBtn) {
      e.preventDefault();

      offcanvas.querySelectorAll(".wallet-topup__amount").forEach(function (b) {
        b.classList.remove("is-active");
      });
      amtBtn.classList.add("is-active");

      var val = parseMoney(amtBtn.getAttribute("data-amount") || "0");

      var input = offcanvas.querySelector(".wallet-topup__input");
      if (input) input.value = "";

      updateTopupTotals(val);
      return;
    }

    var creditBtn = e.target.closest(".wallet-credit-card__btn");
    var creditCard = e.target.closest(".wallet-credit-card");

    if (creditBtn || creditCard) {
      if (
        e.target.closest(".nice-select") ||
        e.target.closest(".dropdown-options") ||
        e.target.closest(".custom-multiselect.astro-dd")
      ) {
        return;
      }

      var card = creditBtn ? creditBtn.closest(".wallet-credit-card") : creditCard;
      if (!card) return;

      var inCreditsView = !!card.closest('[data-wallet-view="credits"]');
      if (!inCreditsView) return;

      e.preventDefault();
      setActiveCreditCard(card);
      return;
    }
  });

  offcanvas.addEventListener("input", function (e) {
    var input = e.target.closest(".wallet-topup__input");
    if (!input) return;

    offcanvas.querySelectorAll(".wallet-topup__amount").forEach(function (b) {
      b.classList.remove("is-active");
    });

    updateTopupTotals(parseMoney(input.value));
  });

  closers.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      closeWallet();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;

    if (isElOpenById("topupModal")) return;
    if (isElOpenById("withdrawModal")) return;
    if (isElOpenById("referralModal")) return;
    if (isElOpenById("newspaperModal")) return;

    closeWallet();
  });

  ensureNiceSelect();
  updateTopupTotals(0);
}

/* =========================================================
   Generic wallet modal initializer
   ========================================================= */

function initWalletModal(opts) {
  if (!opts || !opts.id || !opts.openerSelector || !opts.closeSelector) return;
  if (opts._boundFlag && window[opts._boundFlag]) return;

  var modal = document.getElementById(opts.id);
  if (!modal) return;

  if (opts._boundFlag) window[opts._boundFlag] = true;

  var panel = modal.querySelector(".wallet-modal__panel");
  var lastFocus = null;

  function openModal(e) {
    if (e) e.preventDefault();

    closeTownhubMobileMenuIfOpen();

    if (modal.classList.contains("is-open")) return;

    lastFocus = document.activeElement;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    lockBodyScroll();

    if (opts.ensureNiceSelect) ensureNiceSelectIn(modal);

    if (typeof opts.onOpen === "function") opts.onOpen(modal);

    requestAnimationFrame(function () {
      if (panel) panel.focus();
    });
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    if (typeof opts.onClose === "function") opts.onClose(modal);

    unlockBodyScrollIfSafe();

    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest(opts.openerSelector);
    if (!opener) return;
    openModal(e);
  });

  modal.addEventListener("click", function (e) {
    var closer = e.target.closest(opts.closeSelector);
    if (!closer) return;
    e.preventDefault();
    closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;
    if (e.key !== "Escape") return;
    e.preventDefault();
    closeModal();
  });

  modal.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;
    if (e.key !== "Tab") return;

    var focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    var list = Array.prototype.slice.call(focusables).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
    if (!list.length) return;

    var first = list[0];
    var last = list[list.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  if (typeof opts.afterBind === "function") opts.afterBind(modal);
}

/* =========================================================
   TOPUP MODAL
   ========================================================= */

function initTopupModal() {
  initWalletModal({
    id: "topupModal",
    openerSelector: "[data-open-topup-modal]",
    closeSelector: "[data-modal-close]",
    ensureNiceSelect: true,
    _boundFlag: "__topupModal_bound",
  });
}

/* =========================================================
   WITHDRAW MODAL
   ========================================================= */

function initWithdrawModal() {
  initWalletModal({
    id: "withdrawModal",
    openerSelector: "[data-open-withdraw-modal]",
    closeSelector: "[data-withdraw-close]",
    ensureNiceSelect: true,
    _boundFlag: "__withdrawModal_bound",
  });
}

/* =========================================================
   REFERRAL MODAL
   ========================================================= */

function initReferralModal() {
  initWalletModal({
    id: "referralModal",
    openerSelector: "[data-open-referral-modal]",
    closeSelector: "[data-referral-close]",
    ensureNiceSelect: false,
    _boundFlag: "__referralModal_bound",
    afterBind: function (modal) {
      modal.addEventListener("click", async function (e) {
        var btn = e.target.closest("[data-copy-referral]");
        if (!btn) return;

        var input = modal.querySelector("#referralCodeInput");
        var val = input && input.value ? input.value : "";
        if (!val) return;

        try {
          await navigator.clipboard.writeText(val);
        } catch (err) {
          if (input) {
            input.focus();
            input.select();
            try {
              document.execCommand("copy");
            } catch (e2) {}
          }
        }
      });
    },
  });
}

/* =========================================================
   NEWSPAPER MODAL
   ========================================================= */

function initNewspaperModal() {
  initWalletModal({
    id: "newspaperModal",
    openerSelector:
      "[data-open-newspaper-modal], .main-header .nav-holder a[href$='buy-newspaper.html']",
    closeSelector: "[data-newspaper-close]",
    ensureNiceSelect: true,
    _boundFlag: "__newspaperModal_bound",
    onOpen: function (modal) {
      initAstroMultiselects(modal);
      ensureNiceSelectIn(modal);
    },
  });
}
