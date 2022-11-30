import {Astro} from "./astro.mjs"

let astro;

let create = function (canvasDivId, fpsDivId, cameraDivId, loadingDivId, buttonBarDivId) {
    let selectedBorderWidth = "3px";

    window.astro = Astro (canvasDivId, fpsDivId, cameraDivId, loadingDivId, astroIn => {
        astro = astroIn;
        let currentButton;
        let buttonBar = document.getElementById(buttonBarDivId);
        let addButton = function (innerText, filterCriteria, doClick = false) {
            let button = document.createElement("div");
            button.classList.add("divButton");
            button.innerText = innerText;
            let clickHandler = function (event) {
                if (event.target !== currentButton) {
                    if (currentButton) {
                        currentButton.style.borderWidth = "1px";
                    }
                    currentButton = button;
                    currentButton.style.borderWidth = selectedBorderWidth;
                    astro.addTle (filterCriteria);
                }
            };
            button.addEventListener("click", clickHandler);
            if (doClick) {
                clickHandler({target: button});
            }
            buttonBar.appendChild(button);
            return button;
        }

        addButton("all", false, true);
        addButton("oneweb", "ONEWEB");
        addButton("starlink", "STARLINK");
        addButton("iss", "ISS (NAUKA)");
        addButton("none", "[none]");
    });
};

window.addEventListener ("load", event => {
    create ("mainCanvasDiv", "fpsDiv", "cameraDiv", "loadingDiv", "buttonBarDiv");

    if (!!document.getElementById("mainCanvasDiv2")) {
        create ("mainCanvasDiv2", "fpsDiv2", "cameraDiv2", "loadingDiv2", "buttonBarDiv2");
    }

});

window.addEventListener("message", event => {
    astro.updateVis(event.data.idsToShow,
        ("timeToShow") in event.data ? event.data.timeToShow : Date.now());
});
