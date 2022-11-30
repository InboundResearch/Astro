import {SuborbitalTrack} from "./suborbital-track.mjs";

let updateVisData = null;
let suborbitalTrack = null;

window.addEventListener ("load", event => {
    SuborbitalTrack ("render-canvas-div", suborbitalTrackIn => {
        suborbitalTrack = suborbitalTrackIn;
        if (window.parent) {
            window.parent.postMessage("ready","*");
        }

        if (updateVisData && (updateVisData !== "ready")) {
            let timeToShow = ("timeToShow" in updateVisData) ? updateVisData.timeToShow : Date.now();
            suborbitalTrack.updateVis(updateVisData.idsToShow, timeToShow);
            updateVisData = null;
        }
    });

});

window.addEventListener("message", event => {
    if (suborbitalTrack) {
        if (event.data !== "ready") {
            let timeToShow = ("timeToShow" in event.data) ? event.data.timeToShow : Date.now();
            suborbitalTrack.updateVis(event.data.idsToShow, timeToShow);
        }
    } else {
        updateVisData = event.data;
    }
});
