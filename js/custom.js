document.addEventListener("DOMContentLoaded", function () {
    const tabContents = document.querySelectorAll(".tab-content");

    tabContents.forEach(tabContent => {
        const vehicleLinks = tabContent.querySelectorAll(".vehicle-tab-link");
        const vehicleTabs = tabContent.querySelectorAll(".vehicle-tab");
        const vehicleContents = tabContent.querySelectorAll(".sub-tab-content");

        vehicleLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();

                // Remove 'current' from all sub-tabs in this tab content
                vehicleTabs.forEach(tab => tab.classList.remove("current"));
                vehicleContents.forEach(content => {
                    content.classList.remove("visible");
                    content.classList.add("hidden");
                });

                // Set current tab
                this.parentElement.classList.add("current");

                // Show the targeted sub-tab content
                const targetSelector = this.getAttribute("href");
                const targetContent = tabContent.querySelector(targetSelector);

                if (targetContent) {
                    targetContent.classList.add("visible");
                    targetContent.classList.remove("hidden");
                }
            });
        });
    });
});
