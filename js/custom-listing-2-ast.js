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
                autoHeight: false,
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

            if (sliderEl.closest('#listingModal')) return;

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

    
// --------------------------------------
// 3. Clamp card description to 3 lines + inline "Read more" (responsive)
// --------------------------------------
function applyInlineReadMore(root = document) {
    const paragraphs = root.querySelectorAll('.geodir-category-text .small-text');
    const MAX_LINES = 3;

    paragraphs.forEach((p) => {
        // Get original full text (once) and keep it
        const fullText = (p.dataset.fullText || p.textContent).trim();
        p.dataset.fullText = fullText;

        // Reset to full text before measuring (clear any previous clamp)
        p.textContent = fullText;
        p.style.maxHeight = '';
        p.style.overflow = '';

        const style = window.getComputedStyle(p);
        const fontSize = parseFloat(style.fontSize) || 14;
        const lineHeight = parseFloat(style.lineHeight);
        const effectiveLineHeight = isNaN(lineHeight)
            ? fontSize * 1.4
            : lineHeight;

        const paddingTop = parseFloat(style.paddingTop) || 0;
        const paddingBottom = parseFloat(style.paddingBottom) || 0;

        const maxHeight =
            MAX_LINES * effectiveLineHeight +
            paddingTop +
            paddingBottom +
            2; // small buffer

        // If it fits in 3 lines at THIS width, no clamp / no link
        if (p.scrollHeight <= maxHeight) {
            return;
        }

        // Build truncated version with "… Read more"
        const readMoreLink = document.createElement('a');
        readMoreLink.href = '#';
        readMoreLink.className = 'read-more-link';
        readMoreLink.textContent = 'Read more';

        const textNode = document.createTextNode('');

        p.textContent = '';
        p.appendChild(textNode);
        p.appendChild(document.createTextNode('… '));
        p.appendChild(readMoreLink);

        function fits() {
            return p.scrollHeight <= maxHeight + 1;
        }

        const words = fullText.split(' ');
        let low = 0;
        let high = words.length;
        let best = 0;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const candidate = words.slice(0, mid).join(' ');

            textNode.data = candidate;

            if (fits()) {
                best = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        textNode.data = words.slice(0, best).join(' ');
        if (!textNode.data) {
            textNode.data = fullText.slice(0, 80);
        }

        p.style.maxHeight = maxHeight + 'px';
        p.style.overflow = 'hidden';

        // Click opens the correct modal for this card
        readMoreLink.addEventListener('click', function (e) {
            e.preventDefault();

            const card =
                p.closest('.geodir-category-listing') ||
                p.closest('.listing-item');

            if (typeof openListingModalFromItem === 'function' && card) {
                openListingModalFromItem(card);
                return;
            }

            const badge =
                card &&
                card.querySelector('.custom-video-badge, .open-modal-trigger');
            if (badge) badge.click();
        });
    });
}

// run once on load (for backend-rendered items)
applyInlineReadMore();

// re-run on resize (responsive)
let readMoreResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(readMoreResizeTimer);
    readMoreResizeTimer = setTimeout(() => {
        applyInlineReadMore();
    }, 150);
});


// Click on the little round video badge → open modal on the video slide
document.addEventListener('click', (e) => {
    const badge = e.target.closest('.custom-video-badge');
    if (!badge) return;

    // Don't let this also trigger the generic .listing-item click handler
    e.preventDefault();
    e.stopPropagation();

    // Find the parent listing card
    const item = badge.closest('.listing-item');
    if (!item) return;

    // The slide in that card that has the <video>
    const videoSlideEl = item.querySelector('.swiper-slide-video');

    // Use the helper we wrote earlier to open the modal
    // and start on that specific slide
    openListingModalFromItem(item, { clickedSlideEl: videoSlideEl });
});




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

// --------------------------------------
// Helper: open modal for ANY listing
// - Slider cards: clone only slides that have img/video
// - Single-image cards: show one image, no nav/counter
// - No-media cards: hide slider completely
// --------------------------------------
function openListingModalFromItem(item, options = {}) {
    const modal = document.getElementById('listingModal');
    if (!modal) return;

    const modalSlider  = modal.querySelector('.listing-inner-slider.swiper-container');
    const modalWrapper = modalSlider?.querySelector('.swiper-wrapper');
    if (!modalSlider || !modalWrapper) return;

    const navNext     = modal.querySelector('.ss-slider-cont-next');
    const navPrev     = modal.querySelector('.ss-slider-cont-prev');
    const counterBox  = modal.querySelector('.custom-image-counter');
    const counterText = counterBox?.querySelector('.counter-text');

    // ============= 1. Collect raw slides from the CARD =============
    const cardSlider  = item.querySelector('.listing-inner-slider.swiper-container');
    const cardWrapper = cardSlider?.querySelector('.swiper-wrapper');

    let rawSlides   = [];
    let startIndex  = 0;

if (cardSlider && cardWrapper) {
    // CARD HAS A SWIPER: get all real slides (no duplicates)
    rawSlides = Array.from(
        cardWrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')
    );

    const clickedSlideEl = options.clickedSlideEl?.closest('.swiper-slide') || null;

    if (clickedSlideEl) {
        let idx = rawSlides.indexOf(clickedSlideEl);

        // If we clicked on a loop-duplicate, use the original index
        if (idx < 0) {
            const loopIdxAttr = clickedSlideEl.getAttribute('data-swiper-slide-index');
            if (loopIdxAttr !== null) {
                const loopIdx = parseInt(loopIdxAttr, 10);
                if (!Number.isNaN(loopIdx) && loopIdx >= 0 && loopIdx < rawSlides.length) {
                    idx = loopIdx;
                }
            }
        }

        if (idx >= 0) {
            startIndex = idx;
        }
    }
} else {
    // CARD HAS NO SWIPER: maybe a single plain image
    const clickedMediaEl =
        options.clickedMediaEl ||
        item.querySelector('.geodir-category-img img, .geodir-category-img-wrap img');

    if (clickedMediaEl) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        const wrap = document.createElement('div');
        wrap.className = 'geodir-category-img-wrap fl-wrap';

        const imgClone = clickedMediaEl.cloneNode(true);
        wrap.appendChild(imgClone);
        slide.appendChild(wrap);

        rawSlides = [slide];
        startIndex = 0;
    } else {
        rawSlides = [];
    }
}


    // ============= 2. Keep only slides that REALLY have media =============
    const slidesSource = rawSlides.filter(slide =>
        slide.querySelector('img, video, iframe')
    );

    // Clear any previous modal content
    modalWrapper.innerHTML = '';

    // ============= 3. NO MEDIA CASE (no img/video anywhere) =============
    if (!slidesSource.length) {
        // Hide slider + nav + counter
        modalSlider.style.display = 'none';
        if (navNext)    navNext.style.display = 'none';
        if (navPrev)    navPrev.style.display = 'none';
        if (counterBox) counterBox.style.display = 'none';

        // Destroy old swiper if needed
        if (modalSwiper && typeof modalSwiper.destroy === 'function') {
            modalSwiper.destroy(true, true);
            modalSwiper = null;
        }

        // Just show the modal text / content
        modal.style.display = 'block';
        return;
    }

    // ============= 4. WE HAVE 1+ MEDIA SLIDES =============
    // Show slider container
    modalSlider.style.display = '';

    // Clone slides into the modal
    slidesSource.forEach(slide => {
        const clone = slide.cloneNode(true);

        // videos in modal should have controls
        const video = clone.querySelector('video');
        if (video) {
            video.setAttribute('controls', 'controls');
        }

        modalWrapper.appendChild(clone);
    });

    const isMultiSlide = slidesSource.length > 1;

    // Show/hide arrows + counter based on slide count
    if (navNext)    navNext.style.display    = isMultiSlide ? '' : 'none';
    if (navPrev)    navPrev.style.display    = isMultiSlide ? '' : 'none';
    if (counterBox) counterBox.style.display = isMultiSlide ? '' : 'none';

    // Open modal
    modal.style.display = 'block';

    setTimeout(() => {
        if (modalSwiper && typeof modalSwiper.destroy === 'function') {
            modalSwiper.destroy(true, true);
        }

        const nextEl = navNext || modal.querySelector('.ss-slider-cont-next');
        const prevEl = navPrev || modal.querySelector('.ss-slider-cont-prev');

        function updateCounter(swiper) {
            if (!counterText || !isMultiSlide) return;

            const totalSlides = swiper.slides.length - swiper.loopedSlides * 2;
            const currentIndex = swiper.realIndex + 1;
            counterText.textContent = `${currentIndex}/${totalSlides}`;
        }

        function handleVideoAutoplay(swiper) {
            Array.from(swiper.slides).forEach(slide => {
                slide.querySelectorAll('video').forEach(v => {
                    try { v.pause(); } catch(e) {}
                });
            });

            const activeSlide = swiper.slides[swiper.activeIndex];
            if (!activeSlide) return;
            const video = activeSlide.querySelector('video');
            if (video) {
                try { video.play(); } catch(e) {}
            }
        }

        modalSwiper = new Swiper(modalSlider, {
            slidesPerView: 1,
            loop: isMultiSlide,
            autoHeight: false,

            allowTouchMove: false,
            simulateTouch: false,
            keyboard: false,
            mousewheel: false,
            noSwiping: true,
            noSwipingClass: 'swiper-no-swiping',
            touchRatio: 0,
            followFinger: false,

            navigation: isMultiSlide ? { nextEl, prevEl } : {},

            initialSlide: Math.min(startIndex, slidesSource.length - 1),

            on: {
                init() {
                    updateCounter(this);
                    handleVideoAutoplay(this);
                },
                slideChange() {
                    updateCounter(this);
                    handleVideoAutoplay(this);
                },
            },
        });
    }, 50);
}




// --------------------------------------
// Click on card image / title → open modal for ALL items
// --------------------------------------
document.querySelectorAll('.listing-item').forEach((item) => {
    item.addEventListener('click', (e) => {
        const target = e.target;

        // Ignore stuff that should NOT open the modal
        if (
            target.closest(
                '.swiper-button, .swiper-button-next, .swiper-button-prev, .geodir-category-footer, .custom-sticker, .geodir_status_date, .custom-video-badge'
            )
        ) {
            return;
        }

        const mediaClick = target.closest(
            '.geodir-category-img-wrap, .swiper-slide-video'
        );
        const isTitleClick = target.closest('.title-sin_map a');

        if (!mediaClick && !isTitleClick) return;

        e.preventDefault();

        let clickedSlideEl = null;
        let clickedMediaEl = null;

        if (mediaClick) {
            clickedSlideEl = mediaClick.closest('.swiper-slide') || null;
            clickedMediaEl = mediaClick.querySelector('img, video') || mediaClick;
        }

        openListingModalFromItem(item, { clickedSlideEl, clickedMediaEl });
    });
});

// Close modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('listingModal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.listing-modal-close');

    function stopAllModalMedia() {
        // Pause & reset any HTML5 <video> in the modal
        modal.querySelectorAll('video').forEach((v) => {
            try {
                v.pause();
                v.currentTime = 0;
            } catch (e) {}
        });

        // Stop any <iframe> (e.g. YouTube) by resetting its src
        modal.querySelectorAll('iframe').forEach((frame) => {
            const src = frame.getAttribute('src');
            if (src) {
                frame.setAttribute('src', src);
            }
        });
    }

    closeBtn?.addEventListener('click', () => {
        stopAllModalMedia();
        modal.style.display = 'none';
        modalSwiper?.destroy?.(true, true);
        modalSwiper = null;
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            stopAllModalMedia();
            modal.style.display = 'none';
            modalSwiper?.destroy?.(true, true);
            modalSwiper = null;
        }
    });
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

