import {Astro} from "./astro-debug.mjs"
import {SuborbitalTrack} from "./suborbital-track.mjs";

let updateVisData = null;
let updateVis = function (data) {
    if (data && (data !== "ready")) {
        let timeToShow = ("timeToShow" in data) ? data.timeToShow : Date.now();

        // workaround to a minor bug in the webapp calling this
        if (Array.isArray (data.idsToShow[0])) {
            data.idsToShow = data.idsToShow[0];
        }

        // update the vis...
        astro.updateVis(data.idsToShow, timeToShow);
        updateVisData = null;
    }
};

let astro = null;

let create = function (canvasDivId, fpsDivId, cameraDivId, loadingDivId, buttonBarDivId) {
    let selectedBorderWidth = "3px";

    window.astro = Astro (canvasDivId, fpsDivId, cameraDivId, loadingDivId, astroIn => {
        astro = astroIn;
        let currentButton;
        let buttonBar = document.getElementById(buttonBarDivId);
        let addButton = function (innerText, filterCriteria, clickIfMatches) {
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
            if (innerText === clickIfMatches) {
                clickHandler({target: button});
            }
            buttonBar.appendChild(button);
            return button;
        }

        // figure out the default set of TLEs to display
        const urlParams = new URLSearchParams(window.location.search);
        let clickButtonName = urlParams.get("display") || "all";

        // add the display buttons, default click one if a name is supplied
        addButton("all", false, clickButtonName);
        addButton("oneweb", "ONEWEB", clickButtonName);
        addButton("starlink", "STARLINK", clickButtonName);
        addButton("iss", "ISS (ZARYA)", clickButtonName);
        //addButton("test", ["25544", "47258", "47284", "47293"], clickButtonName);
        addButton("none", "[none]", clickButtonName);

        if (window.parent) {
            window.parent.postMessage("ready","*");
        }

        updateVis (updateVisData);
    });
};

window.addEventListener ("load", event => {
    create ("mainCanvasDiv", "fpsDiv", "cameraDiv", "loadingDiv", "buttonBarDiv");

    // this is here for test purposes when putting multiple visualizations on the same page
    if (!!document.getElementById("mainCanvasDiv2")) {
        create ("mainCanvasDiv2", "fpsDiv2", "cameraDiv2", "loadingDiv2", "buttonBarDiv2");
    }
});

window.addEventListener("message", event => {
    if (astro) {
        updateVis (event.data);
    } else {
        updateVisData = event.data;
    }
});
