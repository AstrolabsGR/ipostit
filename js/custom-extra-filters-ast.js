(function () {
  var btn = document.getElementById("ef-files-btn");
  var input = document.getElementById("ef-files");
  var hint = document.getElementById("ef-files-hint");

  if (btn && input) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      input.click();
    });

    input.addEventListener("change", function () {
      if (!hint) return;

      if (!input.files || !input.files.length) {
        hint.textContent = "Δεν έχουν επιλεγεί αρχεία";
        return;
      }

      hint.textContent =
        input.files.length === 1
          ? "Επιλέχθηκε: " + input.files[0].name
          : "Επιλέχθηκαν " + input.files.length + " αρχεία";
    });
  }

  document.addEventListener("click", function (e) {
    var clearBtn = e.target.closest(".clear-singleinput");
    if (!clearBtn) return;

    e.preventDefault();

    var wrapper = clearBtn.parentElement;
    var field = wrapper ? wrapper.querySelector("input, textarea") : null;
    if (!field) return;

    field.value = "";
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    field.focus();
  });
})();
