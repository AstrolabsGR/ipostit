// js/custom-index.js
// All index-only JS: sub-tabs, custom multiselect, date pair, clear X, niceSelect.

document.addEventListener("DOMContentLoaded", function () {
    // =========================================
    // 1. SUB-TABS HANDLER (vehicles, jobs, other)
    // =========================================
    document.addEventListener("click", function (e) {
        const link = e.target.closest(".vehicle-tab-link");
        if (!link) return;

        e.preventDefault();

        const li = link.closest(".vehicle-tab");
        const list = li && li.closest(".vehicle-tabs-list");
        if (!list) return;

        // Set active button
        list.querySelectorAll(".vehicle-tab").forEach((tab) =>
            tab.classList.remove("current")
        );
        li.classList.add("current");

        const mainWrap = list.closest(".main-search-input-wrap");
        if (!mainWrap) return;

        const subContainer = mainWrap.querySelector(".sub-tabs-container");
        if (!subContainer) return;

        const targetSelector = link.getAttribute("href"); // "#real1", "#job3", "#other2", etc.
        if (!targetSelector) return;

        const target = subContainer.querySelector(targetSelector);
        if (!target) return;

        subContainer.querySelectorAll(".sub-tab-content").forEach((panel) => {
            const isActive = panel === target;
            panel.classList.toggle("visible", isActive);
            panel.classList.toggle("hidden", !isActive);
            // Optional fallback if you don't have .visible/.hidden styles:
            // panel.style.display = isActive ? "" : "none";
        });
    });

    // =========================================
    // 2. MULTISELECT (Πρόσθετα)
    // =========================================

    // Prevent label clicks inside multiselect from triggering outer close
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
        true // capture phase
    );

    document.addEventListener("click", function (e) {
        // Ignore .toggle-filter-btn (other UI)
        if (e.target.closest(".toggle-filter-btn")) return;

        // ----- OPEN/CLOSE WHEN CLICKING SELECT BOX -----
        const selectBox = e.target.closest(".custom-multiselect .select-box");
        if (selectBox) {
            const dropdown = selectBox.closest(".custom-multiselect");
            const isOpen = dropdown.classList.contains("open");

            document
                .querySelectorAll(".custom-multiselect.open")
                .forEach((d) => d.classList.remove("open"));

            if (!isOpen) dropdown.classList.add("open");

            return;
        }

        // ----- UPDATE LABEL WHEN CHECKING A CHECKBOX -----
        const checkbox = e.target.closest(
            ".custom-multiselect input[type='checkbox']"
        );
        if (checkbox) {
            const dropdown = checkbox.closest(".custom-multiselect");
            updateMultiselectText(dropdown);
            return;
        }

        // ----- CLICK OUTSIDE: CLOSE ALL -----
        if (!e.target.closest(".custom-multiselect")) {
            document
                .querySelectorAll(".custom-multiselect.open")
                .forEach((d) => d.classList.remove("open"));
        }
    });

    function updateMultiselectText(wrapper) {
        if (!wrapper) return;
        const label = wrapper.querySelector(".selected-text");
        if (!label) return;

        const placeholder =
            label.dataset.placeholder || label.getAttribute("data-placeholder") || "Πρόσθετα";

        const selectedValues = Array.from(
            wrapper.querySelectorAll("input[type='checkbox']:checked")
        ).map((c) => c.value || c.parentElement.textContent.trim());

        if (!selectedValues.length) {
            label.textContent = placeholder;
        } else if (selectedValues.length <= 2) {
            label.textContent = selectedValues.join(", ");
        } else {
            label.textContent = selectedValues.length + " επιλεγμένα";
        }
    }

    // Initialize label text for any pre-checked options (if any)
    document.querySelectorAll(".custom-multiselect").forEach(updateMultiselectText);

    // =========================================
    // 3. DATE RANGE PAIR (daterangepicker)
    // =========================================

    const DATE_FORMAT = "DD/MM/YYYY";

    function initDatePair(pair) {
        if (!pair) return;

        const inputs = pair.querySelectorAll('input[type="text"]');
        const fromInput = inputs[0];
        const toInput = inputs[1];
        if (!fromInput || !toInput) return;

        // Destroy old pickers if any (important for clones)
        if (window.jQuery) {
            const $from = jQuery(fromInput);
            const $to = jQuery(toInput);

            if ($from.data("daterangepicker")) $from.data("daterangepicker").remove();
            if ($to.data("daterangepicker")) $to.data("daterangepicker").remove();

            // FROM
            $from
                .daterangepicker({
                    singleDatePicker: true,
                    showDropdowns: true,
                    autoUpdateInput: false,
                    locale: { format: DATE_FORMAT, cancelLabel: "Clear" },
                })
                .on("apply.daterangepicker", function (ev, picker) {
                    this.value = picker.startDate.format(DATE_FORMAT);

                    const toPicker = $to.data("daterangepicker");
                    if (toPicker) {
                        toPicker.minDate = picker.startDate;
                        toPicker.updateCalendars();
                    }
                })
                .on("cancel.daterangepicker", function () {
                    this.value = "";
                });

            // TO
            $to
                .daterangepicker({
                    singleDatePicker: true,
                    showDropdowns: true,
                    autoUpdateInput: false,
                    locale: { format: DATE_FORMAT, cancelLabel: "Clear" },
                })
                .on("apply.daterangepicker", function (ev, picker) {
                    this.value = picker.startDate.format(DATE_FORMAT);

                    const fromPicker = $from.data("daterangepicker");
                    if (fromPicker) {
                        fromPicker.maxDate = picker.startDate;
                        fromPicker.updateCalendars();
                    }
                })
                .on("cancel.daterangepicker", function () {
                    this.value = "";
                });
        }
    }

    // init all existing date-range-pair on index
    document
        .querySelectorAll(".date-range-pair")
        .forEach((pair) => initDatePair(pair));

    // Expose helpers for cloned blocks
    window.initDatePair = initDatePair;
    window.initDatePairsIn = function (root) {
        if (!root) return;
        root
            .querySelectorAll(".date-range-pair")
            .forEach((pair) => initDatePair(pair));
    };

    // =========================================
    // 4. CLEAR SINGLE INPUT (X icon)
    // =========================================
    document.addEventListener("click", function (e) {
        const clearBtn = e.target.closest(".clear-singleinput");
        if (!clearBtn) return;

        e.preventDefault();

        const container = clearBtn.closest(".date-container");
        const input =
            container &&
            container.querySelector("input[type='text'], input[type='date']");
        if (!input) return;

        // Clear the input
        input.value = "";
        input.dispatchEvent(new Event("change", { bubbles: true }));

        // Reset daterangepicker restrictions if initialized
        if (window.jQuery && window.moment) {
            const $input = jQuery(input);
            const drp = $input.data("daterangepicker");
            if (drp) {
                const now = window.moment();
                drp.setStartDate(now);
                drp.setEndDate(now);
                drp.minDate = false;
                drp.maxDate = false;
                drp.updateCalendars();
            }
        }
    });

    // =========================================
    // 5. CUSTOM SELECTS (niceSelect) FOR INDEX
    // =========================================
    function initNiceSelect(root) {
        if (!window.jQuery || !jQuery.fn.niceSelect) return;
        jQuery(root || document)
            .find("select.chosen-select")
            .not(".nice-select-initialized")
            .each(function () {
                jQuery(this).addClass("nice-select-initialized").niceSelect();
            });
    }

    initNiceSelect(document);

    // Expose helper for cloned blocks
    window.initNiceSelectIn = initNiceSelect;

    // If you later clone the whole search block:
    // window.initNiceSelectIn(clone);
    // window.initDatePairsIn(clone);
});
