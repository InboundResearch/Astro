import {Astro} from "./astro.mjs"

let create = function (canvasDivId, fpsDivId, cameraDivId, loadingDivId, buttonBarDivId) {
    let selectedBorderWidth = "3px";

    Astro (canvasDivId, fpsDivId, cameraDivId, loadingDivId, astro => {
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
