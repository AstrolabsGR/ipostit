// js/custom-index.js
// INDEX page logic: toggles, custom multiselect, date range, helpers for clones

document.addEventListener('DOMContentLoaded', function () {

    // =========================================
    // 1. GLOBAL TOGGLE BUTTON (.toggle-filter-btn) - "Εγγύηση" etc.
    // =========================================
    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".toggle-filter-btn");
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        btn.classList.toggle("tsb_act");

        const hidden = btn.closest(".listsearch-input-item")
            ?.querySelector("input[type='hidden']");
        if (hidden) {
            hidden.value = btn.classList.contains("tsb_act") ? "true" : "false";
        }
    });

    // =========================================
    // 2. ON/OFF SWITCHES (.onoffswitch) - e.g. Parking
    //    Works even when block is duplicated (IDs collide).
    // =========================================
    document.addEventListener("click", function (e) {
        const label = e.target.closest(".onoffswitch-label");
        if (!label) return;

        // Avoid native label+for behavior (which may hit the *first* id on page)
        e.preventDefault();

        const wrapper = label.closest(".onoffswitch");
        if (!wrapper) return;

        const input = wrapper.querySelector(".onoffswitch-checkbox");
        if (!input) return;

        input.checked = !input.checked;
        input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // =========================================
    // 3. Prevent LABEL inside custom multiselect from closing dropdown
    // =========================================
    document.addEventListener(
        "click",
        function (e) {
            const isLabelInside =
                e.target.tagName === "LABEL" &&
                e.target.closest(".custom-multiselect");
            if (isLabelInside) {
                e.stopPropagation();
            }
        },
        true
    );
    
        // 3.5 NUMBER INPUT ARROWS (range filters: year, price, etc.)
    document.addEventListener("click", function (e) {
        // Find a click on .arrow inside .custom-number-input
        const arrowBtn = e.target.closest(".arrow");
        if (!arrowBtn) return;
        if (!arrowBtn.closest(".custom-number-input")) return;

        e.preventDefault(); // don't submit form

        const wrapper = arrowBtn.closest(".custom-number-input");
        const input = wrapper.querySelector('input[type="number"]');
        if (!input) return;

        if (arrowBtn.classList.contains("up")) {
            input.stepUp();
        } else if (arrowBtn.classList.contains("down")) {
            input.stepDown();
        }

        // optional: notify any listeners
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });


    // =========================================
    // 4. CUSTOM MULTISELECT (checkbox dropdown)
    // =========================================
    document.addEventListener("click", function (e) {

        // Ignore other toggle buttons
        if (e.target.closest(".toggle-filter-btn")) return;

        // --- Open / close on select-box click ---
        const selectBox = e.target.closest(".custom-multiselect .select-box");
        if (selectBox) {
            const dropdown = selectBox.closest(".custom-multiselect");
            const isOpen = dropdown.classList.contains("open");

            document
                .querySelectorAll(".custom-multiselect.open")
                .forEach(d => d.classList.remove("open"));

            if (!isOpen) dropdown.classList.add("open");
            return;
        }

        // --- Checkbox click: update label text ---
        const checkbox = e.target.closest(".custom-multiselect input[type='checkbox']");
        if (checkbox) {
            const dropdown = checkbox.closest(".custom-multiselect");
            const selectedText = dropdown.querySelector(".selected-text");
            const checkboxes = dropdown.querySelectorAll("input[type='checkbox']");

            const values = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.value || c.parentElement.textContent.trim());

            if (!values.length) {
                const ph = selectedText.dataset.placeholder ||
                           selectedText.getAttribute("data-placeholder") || "";
                selectedText.textContent = ph;
            } else if (values.length <= 2) {
                selectedText.textContent = values.join(", ");
            } else {
                selectedText.textContent =
                    `${values.slice(0, 2).join(", ")} +${values.length - 2} ακόμη`;
            }
            return;
        }

        // --- Click outside: close all ---
        if (!e.target.closest(".custom-multiselect")) {
            document
                .querySelectorAll(".custom-multiselect.open")
                .forEach(d => d.classList.remove("open"));
        }
    });

    // Initialise label text for any pre-checked checkbox values
    document.querySelectorAll(".custom-multiselect").forEach(dropdown => {
        const selectedText = dropdown.querySelector(".selected-text");
        if (!selectedText) return;

        const checkboxes = dropdown.querySelectorAll("input[type='checkbox']");
        const values = Array.from(checkboxes)
            .filter(c => c.checked)
            .map(c => c.value || c.parentElement.textContent.trim());

        if (!values.length) return;
        if (values.length <= 2) {
            selectedText.textContent = values.join(", ");
        } else {
            selectedText.textContent =
                `${values.slice(0, 2).join(", ")} +${values.length - 2} ακόμη`;
        }
    });

    // =========================================
    // 5. DATE RANGE PAIRS (daterangepicker)
    //    Works on initial and cloned blocks.
    // =========================================
    const DATE_FORMAT = "DD/MM/YYYY";

    function initDatePair(pairOrJq) {
        if (!window.jQuery || !jQuery.fn.daterangepicker) return;

        const $pair = pairOrJq instanceof jQuery ? pairOrJq : jQuery(pairOrJq);
        if (!$pair.length) return;

        const $inputs = $pair.find('input[type="text"]');
        const $from = $inputs.eq(0);
        const $to = $inputs.eq(1);
        if (!$from.length || !$to.length) return;

        // Destroy old instances (important for clones)
        const destroy = $input => {
            const drp = $input.data("daterangepicker");
            if (drp && typeof drp.remove === "function") {
                drp.remove();
            }
        };
        destroy($from);
        destroy($to);

        // ---- FROM ----
        $from
            .daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                autoUpdateInput: false,
                locale: { format: DATE_FORMAT, cancelLabel: "Clear" },
                parentEl: jQuery("body"),
            })
            .off("apply.daterangepicker cancel.daterangepicker")
            .on("apply.daterangepicker", function (ev, picker) {
                jQuery(this).val(picker.startDate.format(DATE_FORMAT));

                const toPicker = $to.data("daterangepicker");
                if (toPicker) {
                    toPicker.minDate = picker.startDate;
                    toPicker.updateCalendars();
                }
            })
            .on("cancel.daterangepicker", function () {
                jQuery(this).val("");
                const toPicker = $to.data("daterangepicker");
                if (toPicker) {
                    toPicker.minDate = false;
                    toPicker.updateCalendars();
                }
            });

        // ---- TO ----
        $to
            .daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                autoUpdateInput: false,
                locale: { format: DATE_FORMAT, cancelLabel: "Clear" },
                parentEl: jQuery("body"),
            })
            .off("apply.daterangepicker cancel.daterangepicker")
            .on("apply.daterangepicker", function (ev, picker) {
                jQuery(this).val(picker.startDate.format(DATE_FORMAT));

                const fromPicker = $from.data("daterangepicker");
                if (fromPicker) {
                    fromPicker.maxDate = picker.startDate;
                    fromPicker.updateCalendars();
                }
            })
            .on("cancel.daterangepicker", function () {
                jQuery(this).val("");
                const fromPicker = $from.data("daterangepicker");
                if (fromPicker) {
                    fromPicker.maxDate = false;
                    fromPicker.updateCalendars();
                }
            });

        // ---- CLEAR BUTTON (X) for this pair ----
        $pair
            .off("click.clearOne")
            .on("click.clearOne", ".clear-singleinput", function (e) {
                e.preventDefault();
                const $input = jQuery(this)
                    .closest(".date-container")
                    .find('input[type="text"]');

                if (!$input.length) return;

                $input.val("");

                const drp = $input.data("daterangepicker");
                if (drp) {
                    drp.setStartDate(moment());
                    drp.setEndDate(moment());
                }

                // Reset min/max
                if ($input.is($from)) {
                    const toPicker = $to.data("daterangepicker");
                    if (toPicker) {
                        toPicker.minDate = false;
                        toPicker.updateCalendars();
                    }
                }

                if ($input.is($to)) {
                    const fromPicker = $from.data("daterangepicker");
                    if (fromPicker) {
                        fromPicker.maxDate = false;
                        fromPicker.updateCalendars();
                    }
                }
            });
    }

    // Expose helpers so you can call them on clones
    window.initDatePair = initDatePair;
    window.initDatePairsIn = function (root) {
        if (!root) root = document;
        jQuery(root)
            .find(".date-range-pair")
            .each(function () {
                initDatePair(jQuery(this));
            });
    };

    // Initialise all current pairs on index
    if (window.jQuery) {
        jQuery(function () {
            window.initDatePairsIn(document);
        });
    }

    // Safety: if a pair is inserted dynamically and you forget to call initDatePairsIn,
    // the FIRST focus in its inputs will auto-init it.
    document.addEventListener("focusin", function (e) {
        const input = e.target.closest(".date-range-pair input[type='text']");
        if (!input || !window.jQuery) return;

        const $input = jQuery(input);
        if ($input.data("daterangepicker")) return;

        const pair = input.closest(".date-range-pair");
        if (pair) initDatePair(jQuery(pair));
    });

    // =========================================
    // 6. HELPER for cloned search blocks
    //    Fixes niceSelect + datepicker on a clone.
    // =========================================
    window.setupIndexSearchClone = function (cloneRoot) {
        if (!cloneRoot || !window.jQuery || !jQuery.fn.niceSelect) return;

        const $root = jQuery(cloneRoot);

        // Remove existing .nice-select wrappers in the clone
        $root.find(".nice-select").remove();

        // Reset <select> and re-init niceSelect with proper events
        $root.find("select.chosen-select").each(function () {
            const $s = jQuery(this);
            $s.show(); // remove inline display:none, if any
            $s.removeClass("nice-select-initialized");
            $s.niceSelect();
        });

        // Init datepickers inside the clone
        if (typeof window.initDatePairsIn === "function") {
            window.initDatePairsIn(cloneRoot);
        }
    };
});
