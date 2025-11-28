document.addEventListener('DOMContentLoaded', function () {

    // --------------------------------------
    // 1. Swiper Listing Sliders
    // --------------------------------------
    function initListingSliders() {
        if (typeof Swiper === 'undefined') {
            console.error('Swiper not found. Make sure Swiper JS is loaded.');
            return;
        }

        const wrappers = document.querySelectorAll('.listing-slider-wrap');
        if (!wrappers.length) return;

        wrappers.forEach(function (wrap, idx) {
            const containerEl =
                wrap.querySelector('.swiper-container') ||
                wrap.querySelector('.swiper');

            const paginationEl =
                wrap.querySelector('.ss-slider-pagination') ||
                wrap.querySelector('.swiper-pagination');

            const nextEl =
                wrap.querySelector('.ss-slider-cont-next') ||
                wrap.querySelector('.swiper-button-next');

            const prevEl =
                wrap.querySelector('.ss-slider-cont-prev') ||
                wrap.querySelector('.swiper-button-prev');

            if (!containerEl) return;

            const config = {
                preloadImages: false,
                slidesPerView: 1,
                spaceBetween: 0,
                loop: true,
                autoHeight: true,
                grabCursor: true,
                mousewheel: false,
                autoplay: {
                    delay: 3500,
                    disableOnInteraction: false,
                },
                observer: true,
                observeParents: true,
                speed: 600,
                pagination: paginationEl
                    ? {
                          el: paginationEl,
                          clickable: true,
                      }
                    : undefined,
                navigation: {
                    nextEl: nextEl || undefined,
                    prevEl: prevEl || undefined,
                },
            };

            try {
                const swiper = new Swiper(containerEl, config);
                containerEl.swiper = swiper;

                if (nextEl) {
                    nextEl.addEventListener('click', (e) => {
                        e.preventDefault();
                        swiper.slideNext();
                    });
                }

                if (prevEl) {
                    prevEl.addEventListener('click', (e) => {
                        e.preventDefault();
                        swiper.slidePrev();
                    });
                }

                [nextEl, prevEl, paginationEl].forEach((el) => {
                    if (el?.style) {
                        el.style.zIndex = 9999;
                        el.style.pointerEvents = 'auto';
                    }
                });
            } catch (e) {
                console.error(
                    `Swiper init failed for wrapper #${idx}`,
                    e
                );
            }
        });
    }

    if (document.readyState === 'complete') {
        setTimeout(initListingSliders, 100);
    } else {
        window.addEventListener('load', () =>
            setTimeout(initListingSliders, 100)
        );
    }

    // --------------------------------------
    // 2. Slide Counter for Inner Sliders
    // --------------------------------------
    setTimeout(() => {
        document
            .querySelectorAll('.listing-inner-slider')
            .forEach((sliderEl) => {
                const counter = sliderEl.querySelector(
                    '.custom-image-counter .counter-text'
                );
                const swiper = sliderEl.swiper;
                if (!swiper || !counter) return;

                const totalSlides =
                    swiper.slides.length - swiper.loopedSlides * 2;

                function updateCounter() {
                    counter.textContent = `${swiper.realIndex + 1}/${totalSlides}`;
                }

                swiper.on('slideChange', updateCounter);
                updateCounter();
            });
    }, 200);
});

// Close desktop offcanvas when clicking anywhere outside it
document.addEventListener('click', function (e) {
    const panel   = document.getElementById('moreFiltersPanel');
    const overlay = document.getElementById('offcanvasOverlay');
    const openBtn = document.getElementById('openMoreFilters');

    if (!panel || !overlay) return;
    if (!panel.classList.contains('active')) return; // nothing open

    const clickedInsidePanel = e.target.closest('#moreFiltersPanel');
    const clickedOpenBtn     = e.target.closest('#openMoreFilters');

    // Ignore clicks inside the panel or on the open button itself
    if (clickedInsidePanel || clickedOpenBtn) return;

    panel.classList.remove('active');
    overlay.classList.remove('active');
});

let modalSwiper;

document.querySelectorAll('.listing-item').forEach((item) => {
    item.addEventListener('click', (e) => {
        const target = e.target;

        // Ignore UI elements that shouldn't trigger modal
        if (
            target.closest(
                '.swiper-button, .swiper-button-next, .swiper-button-prev, .ss-slider-cont-next, .ss-slider-cont-prev, .swiper-pagination, .geodir-opt-list, .listing-avatar, .facilities-list, .geodir-category-footer, .custom-sticker, .geodir_status_date'
            )
        ) {
            return;
        }

        const isImageClick = target.closest('.geodir-category-img-wrap');
        const isTitleClick = target.closest('.title-sin_map a');
        if (!isImageClick && !isTitleClick) return;

        e.preventDefault();
        const modal = document.getElementById('listingModal');
        modal.style.display = 'block';

        setTimeout(() => {
            const containerEl = modal.querySelector(
                '.listing-inner-slider.swiper-container'
            );
            const nextEl =
                modal.querySelector('.ss-slider-cont-next');
            const prevEl =
                modal.querySelector('.ss-slider-cont-prev');
            const counter = modal.querySelector('.counter-text');

            if (window.modalSwiper?.destroy) {
                window.modalSwiper.destroy(true, true);
            }

            window.modalSwiper = new Swiper(containerEl, {
                slidesPerView: 1,
                loop: true,
                autoHeight: false,

                allowTouchMove: false,
                simulateTouch: false,
                keyboard: false,
                mousewheel: false,
                noSwiping: true,
                noSwipingClass: 'swiper-no-swiping',
                touchRatio: 0,
                followFinger: false,

                navigation: { nextEl, prevEl },

                on: {
                    init() {
                        const totalSlides =
                            this.slides.length -
                            this.loopedSlides * 2;
                        counter.textContent = `${this.realIndex + 1}/${totalSlides}`;
                    },
                    slideChange() {
                        const totalSlides =
                            this.slides.length -
                            this.loopedSlides * 2;
                        counter.textContent = `${this.realIndex + 1}/${totalSlides}`;
                    },
                },
            });
        }, 100);
    });
});

// Close modal
const modal = document.getElementById('listingModal');
const closeBtn = modal.querySelector('.listing-modal-close');

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    modalSwiper?.destroy?.(true, true);
    modalSwiper = null;
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        modalSwiper?.destroy?.(true, true);
        modalSwiper = null;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Desktop
    const moreFiltersBtn = document.getElementById('openMoreFilters');
    const closeMoreFiltersBtn = document.getElementById('closeMoreFilters');
    const moreFiltersPanel = document.getElementById('moreFiltersPanel');
    const overlay = document.getElementById('offcanvasOverlay');

    // Mobile
    const mobileFiltersBtn = document.getElementById('openMobileFilters');
    const mobileFiltersPanel = document.getElementById('mobileFiltersPanel');
    const closeMobileFiltersBtn = document.getElementById('closeMobileFilters');

    if (moreFiltersBtn && moreFiltersPanel && overlay) {
        moreFiltersBtn.addEventListener('click', () => {
            if (window.innerWidth > 1070) {
                moreFiltersPanel.classList.add('active');
                overlay.classList.add('active');
            }
        });
        mobileFiltersBtn.addEventListener('click', () => {
    if (window.innerWidth <= 1070) {
        mobileFiltersPanel.classList.add('active');
        overlay.classList.add('active');
    }
});


        closeMoreFiltersBtn?.addEventListener('click', () => {
            moreFiltersPanel.classList.remove('active');
            overlay.classList.remove('active');
        });

        overlay.addEventListener('click', () => {
            moreFiltersPanel.classList.remove('active');
            overlay.classList.remove('active');
            mobileFiltersPanel?.classList.remove('active');
        });
    }

    // This is the part that was broken !!!
    closeMobileFiltersBtn?.addEventListener('click', () => {
        mobileFiltersPanel.classList.remove('active');
        overlay.classList.remove('active');
    });
});


const phoneBtn = document.getElementById('phoneBtn');
const phonePopup = document.getElementById('phonePopup');
const closePopup = document.getElementById('closePopup');
const popupOverlay = document.getElementById('popupOverlay');

if (phoneBtn && phonePopup && popupOverlay) {
    phoneBtn.addEventListener('click', () => {
        phonePopup.style.display = 'block';
        popupOverlay.style.display = 'block';
        document.body.classList.add('modal-active');
    });

    popupOverlay.addEventListener('click', () => {
        phonePopup.style.display = 'none';
        popupOverlay.style.display = 'none';
        document.body.classList.remove('modal-active');
    });
}

if (closePopup && phonePopup && popupOverlay) {
    closePopup.addEventListener('click', () => {
        phonePopup.style.display = 'none';
        popupOverlay.style.display = 'none';
        document.body.classList.remove('modal-active');
    });
}
// Prevent label clicks inside multiselect from triggering outside-close
document.addEventListener('click', (e) => {
    const isLabelInside = e.target.tagName === 'LABEL' && e.target.closest('.custom-multiselect');
    if (isLabelInside) {
        e.stopPropagation();
        return;
    }
}, true); // capture phase!

// =============================================
// GLOBAL TOGGLE HANDLER (works for clones too)
// =============================================
document.addEventListener(
    "click",
    function (e) {
        const btn = e.target.closest(".toggle-filter-btn");
        if (!btn) return;

        e.preventDefault();

        if (typeof e.stopImmediatePropagation === "function") {
            e.stopImmediatePropagation();
        }
        e.stopPropagation();

        // Our unified toggle logic
        btn.classList.toggle("tsb_act");

        const hidden = btn.closest(".listsearch-input-item")
            ?.querySelector("input[type='hidden']");
        if (hidden) {
            hidden.value = btn.classList.contains("tsb_act")
                ? "true"
                : "false";
        }
    },
    true
);



// ------------------------
// MULTISELECT GLOBAL CLICK HANDLER
// ------------------------
document.addEventListener("click", function (e) {

    // Ignore toggle buttons completely (VERY important)
    if (e.target.closest(".toggle-filter-btn")) return;

    // ------------------------
    // MULTISELECT DROPDOWN CLICK
    // ------------------------
    const selectBox = e.target.closest('.custom-multiselect .select-box');
    if (selectBox) {
        const dropdown = selectBox.closest('.custom-multiselect');
        const isOpen = dropdown.classList.contains('open');

        document.querySelectorAll('.custom-multiselect.open')
            .forEach(d => d.classList.remove('open'));

        if (!isOpen) dropdown.classList.add('open');

        return;
    }

    // ------------------------
    // MULTISELECT CHECKBOX
    // ------------------------
    const checkbox = e.target.closest('.custom-multiselect input[type="checkbox"]');
    if (checkbox) {
        const dropdown = checkbox.closest('.custom-multiselect');
        const selectedText = dropdown.querySelector('.selected-text');
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

        const values = [...checkboxes]
            .filter(c => c.checked)
            .map(c => c.value);

        if (!values.length) {
            selectedText.textContent = selectedText.dataset.placeholder;
        } else if (values.length <= 2) {
            selectedText.textContent = values.join(', ');
        } else {
            selectedText.textContent =
                `${values.slice(0, 2).join(', ')} +${values.length - 2} ακόμη`;
        }

        return; 
    }

    // ------------------------
    // CLICK OUTSIDE CLOSE
    // ------------------------
    document.querySelectorAll('.custom-multiselect.open')
        .forEach(d => d.classList.remove('open'));
});



document.querySelectorAll('.custom-number-input').forEach((wrapper) => {
    const input = wrapper.querySelector('input[type="number"]');
    const up = wrapper.querySelector('.arrow.up');
    const down = wrapper.querySelector('.arrow.down');

    up.addEventListener('click', () => {
        if (input.value === '') input.value = input.min || 0;
        else if (parseInt(input.value) < input.max) input.stepUp();
    });

    down.addEventListener('click', () => {
        if (input.value === '') input.value = input.min || 0;
        else if (parseInt(input.value) > input.min) input.stepDown();
    });
});

$(function () {
    const DATE_FORMAT = 'DD/MM/YYYY';

    function destroyPicker($input) {
        const drp = $input.data('daterangepicker');
        if (drp && typeof drp.remove === 'function') {
            drp.remove();
        }
    }

    // One function that can be reused everywhere (desktop + offcanvas + mobile clones)
    function initDatePair($pair) {
        const $from = $pair.find('input[type="text"]').eq(0);
        const $to   = $pair.find('input[type="text"]').eq(1);
    
        if (!$from.length || !$to.length) return;
    
        // 🔧 Remove the old theme handler that was clearing BOTH inputs
        $pair.find('.clear-singleinput').off('click');
    
        // Clean old instances (if any)
        destroyPicker($from);
        destroyPicker($to);


        // ---------------------- FROM ----------------------
        $from
            .daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                autoUpdateInput: false,
                locale: { format: DATE_FORMAT, cancelLabel: 'Clear' },
                parentEl: $('body'),
            })
            .off('apply.daterangepicker cancel.daterangepicker')
            .on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format(DATE_FORMAT));

                const toPicker = $to.data('daterangepicker');
                if (toPicker) {
                    toPicker.minDate = picker.startDate;
                    toPicker.updateCalendars();
                }

                const toVal = $to.val();
                if (toVal) {
                    const toDate = moment(toVal, DATE_FORMAT);
                    if (toDate.isBefore(picker.startDate, 'day')) {
                        $to.val('');
                    }
                }

                // ❗ Don't auto-open the "to" calendar inside the mobile clone
                if (!$(this).closest('#mobileFiltersContent').length) {
                    setTimeout(() => $to.trigger('click'), 120);
                }
            })
            .on('cancel.daterangepicker', function () {
                $(this).val('');
                const toPicker = $to.data('daterangepicker');
                if (toPicker) {
                    toPicker.minDate = false;
                    toPicker.updateCalendars();
                }
            });

        // ---------------------- TO ----------------------
        $to
            .daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                autoUpdateInput: false,
                locale: { format: DATE_FORMAT, cancelLabel: 'Clear' },
                parentEl: $('body'),
                isInvalidDate(date) {
                    const fromVal = $from.val();
                    return fromVal
                        ? date.isBefore(moment(fromVal, DATE_FORMAT), 'day')
                        : false;
                },
            })
            .off('apply.daterangepicker cancel.daterangepicker')
            .on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format(DATE_FORMAT));

                const fromPicker = $from.data('daterangepicker');
                if (fromPicker) {
                    fromPicker.maxDate = picker.startDate;
                    fromPicker.updateCalendars();
                }

                const fromVal = $from.val();
                if (fromVal) {
                    const fromDate = moment(fromVal, DATE_FORMAT);
                    if (fromDate.isAfter(picker.startDate, 'day')) {
                        $from.val('');
                    }
                }
            })
            .on('cancel.daterangepicker', function () {
                $(this).val('');
            });

        // ---------------------- CLEAR BUTTON ----------------------
        $pair
            .off('click.clearOne')
            .on('click.clearOne', '.clear-singleinput', function (e) {
                e.preventDefault();
                const $input = $(this)
                    .closest('.date-container')
                    .find('input[type="text"]');

                if (!$input.length) return;

                $input.val('');

                const drp = $input.data('daterangepicker');
                if (drp) {
                    drp.setStartDate(moment());
                    drp.setEndDate(moment());
                }

                if ($input.is($from)) {
                    const toPicker = $to.data('daterangepicker');
                    if (toPicker) {
                        toPicker.minDate = false;
                        toPicker.updateCalendars();
                    }
                }

                if ($input.is($to)) {
                    const fromPicker = $from.data('daterangepicker');
                    if (fromPicker) {
                        fromPicker.maxDate = false;
                        fromPicker.updateCalendars();
                    }
                }
            });
    }

    window.initDatePair = initDatePair;

    // Helper: init all pairs inside a root element
    function initAllPairsIn($root) {
        $root.find('.date-range-pair').each(function () {
            initDatePair($(this));
        });
    }

    //  Init ALL existing pairs (desktop, offcanvas, etc.)
    initAllPairsIn($(document));

    //  Re-init when opening desktop offcanvas
    $('#openMoreFilters').on('click', function () {
        setTimeout(() => {
            initAllPairsIn($('#moreFiltersPanel'));
        }, 350);
    });

    //  Re-init when opening mobile offcanvas
    $('#openMobileFilters').on('click', function () {
        setTimeout(() => {
            initAllPairsIn($('#mobileFiltersPanel'));
        }, 350);
    });

    //  Safety net: if in the future you clone a pair via JS AFTER page load,
    // this will init it on first focus
    $(document).on('focus', '.date-range-pair input[type="text"]', function () {
        const $pair = $(this).closest('.date-range-pair');
        if (!$pair.length) return;

        const $from = $pair.find('input[type="text"]').eq(0);
        if ($from.data('daterangepicker')) return; // already has picker

        initDatePair($pair);
    });
});



// ==============================
// MOBILE FILTERS DYNAMIC LOADER
// ==============================

// 1. Re-init Chosen inside cloned mobile content
function reinitializeFilterPlugins(container) {
    if (window.jQuery) {
        $(container).find(".chosen-select").each(function () {
            const $s = $(this);
            if (typeof $.fn.chosen === "function") {
    if ($s.data("chosen")) $s.chosen("destroy");
    $s.chosen({ width: "100%" });
}

        });
    }
}

// 2. Make ALL cloned IDs unique (avoids collisions)
function fixAllMobileIds(container) {
    const elements = container.querySelectorAll("[id]");
    elements.forEach((el, i) => {
        const oldId = el.id;
        const newId = oldId + "_m" + i;

        container.querySelectorAll(`label[for="${oldId}"]`)
            .forEach(lb => lb.setAttribute("for", newId));

        el.id = newId;
    });
}

// 3. Mobile-only behavior (multiselect, toggles, numbers, date)
function initMobileBehaviors(container) {
    // NUMBER INPUT ARROWS
    container.querySelectorAll(".custom-number-input").forEach(wrap => {
        const input = wrap.querySelector("input[type='number']");
        wrap.querySelector(".arrow.up")?.addEventListener("click", () => input.stepUp());
        wrap.querySelector(".arrow.down")?.addEventListener("click", () => input.stepDown());
    });

    // DATE PICKERS for all cloned pairs inside mobile panel
    if (typeof window.initDatePair === "function") {
        $(container).find(".date-range-pair").each(function () {
            window.initDatePair($(this));
        });
    }
}
function initMobileBehaviors(container) {
    // NUMBER INPUT ARROWS
    container.querySelectorAll(".custom-number-input").forEach(wrap => {
        const input = wrap.querySelector("input[type='number']");
        wrap.querySelector(".arrow.up")?.addEventListener("click", () => input.stepUp());
        wrap.querySelector(".arrow.down")?.addEventListener("click", () => input.stepDown());
    });

    // DATE PICKERS for all cloned pairs inside mobile panel
    if (typeof window.initDatePair === "function") {
        $(container).find(".date-range-pair").each(function () {
            window.initDatePair($(this));
        });
    }
}



// 4. Fix ON/OFF switches (unique IDs)
function fixMobileFilterIdsAndEvents(mobileContainer) {
    const switches = mobileContainer.querySelectorAll(".onoffswitch-checkbox");
    switches.forEach((input, i) => {
        const label = input.closest(".onoffswitch")?.querySelector("label");
        const newId = "mobile-onoffswitch-" + i;

        input.id = newId;
        if (label) label.setAttribute("for", newId);
    });
}

// 5. Move all submit/reset buttons to mobile bottom bar
function moveMobileBottomButtons(mobileContainer) {
    // Remove old wrapper if exists
    const oldWrapper = mobileContainer.querySelector(".mobile-bottom-actions-wrapper");
    if (oldWrapper) oldWrapper.remove();

    // Search anywhere inside mobileContainer (NOT only #filters-search)
    const searchBtn = mobileContainer.querySelector(".header-search-button");
    const searchBlock = searchBtn ? searchBtn.closest(".listsearch-input-item") : null;
    const actionsBlock = mobileContainer.querySelector(".filter-actions");

    if (!searchBlock && !actionsBlock) return;

    const bottomWrapper = document.createElement("div");
    bottomWrapper.className = "mobile-bottom-actions-wrapper";

    if (searchBlock) bottomWrapper.appendChild(searchBlock);
    if (actionsBlock) bottomWrapper.appendChild(actionsBlock);

    mobileContainer.appendChild(bottomWrapper);

    // Hide "More filters" from bottom bar
    const moreBtn = bottomWrapper.querySelector("#openMoreFilters");
    if (moreBtn) moreBtn.style.display = "none";
}


function loadMobileFilters() {
    const mobileContainer = document.getElementById("mobileFiltersContent");
    if (!mobileContainer) return

    mobileContainer.innerHTML = "";

    const header = document.querySelector(".always-fixed.list-main-wrap-header .row.display-desktop-only-p-2");
    if (header) {
        const clone = header.cloneNode(true);
        clone.classList.remove("display-desktop-only-p-2");
        mobileContainer.appendChild(clone);
    }

    const sidebar = document.querySelector(".filter-sidebar .tab-content#filters-search");
    if (sidebar) mobileContainer.appendChild(sidebar.cloneNode(true));

    const more = document.querySelector("#moreFiltersPanel .offcanvas-content");
    if (more) {
        const box = document.createElement("div");
        box.className = "more-filters-section-mobile";
        [...more.children].forEach(el => box.appendChild(el.cloneNode(true)));
        mobileContainer.appendChild(box);
    }

    fixAllMobileIds(mobileContainer);          // make all IDs unique in mobile DOM
    reinitializeFilterPlugins(mobileContainer);
    initMobileBehaviors(mobileContainer);
    moveMobileBottomButtons(mobileContainer);
}


// 7. Open/close mobile offcanvas
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("openMobileFilters");
    const panel = document.getElementById("mobileFiltersPanel");
    const close = document.getElementById("closeMobileFilters");
    const overlay = document.getElementById("offcanvasOverlay");

    if (!btn || !panel || !overlay) return;

    btn.addEventListener("click", () => {
        if (window.innerWidth <= 1070) {
            loadMobileFilters();
            panel.classList.add("active");
            overlay.classList.add("active");
        }
    });

    close?.addEventListener("click", () => {
        panel.classList.remove("active");
        overlay.classList.remove("active");
    });

    overlay.addEventListener("click", () => {
        panel.classList.remove("active");
        overlay.classList.remove("active");
    });
});

