import {SuborbitalTrack} from "./suborbital-track.mjs";

let updateVisData = null;
let suborbitalTrack = null;

window.addEventListener ("load", event => {
    SuborbitalTrack ("render-canvas-div", suborbitalTrackIn => {
        suborbitalTrack = suborbitalTrackIn;
    });

    if (updateVisData) {
        suborbitalTrack.updateVis(updateVisData.idsToShow,
            ("timeToShow") in updateVisData ? updateVisData.timeToShow : Date.now());
        updateVisData = null;
    }
});

window.addEventListener("message", event => {
    if (suborbitalTrack) {
        updateVisData = event.data;
    } else {
        suborbitalTrack.updateVis(event.data.idsToShow,
            ("timeToShow") in event.data ? event.data.timeToShow : Date.now());
    }
});
