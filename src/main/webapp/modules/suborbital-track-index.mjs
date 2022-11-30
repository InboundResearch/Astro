import {SuborbitalTrack} from "./suborbital-track.mjs";

let suborbitalTrack;
window.addEventListener ("load", event => {
    SuborbitalTrack ("render-canvas-div", suborbitalTrackIn => {
        suborbitalTrack = suborbitalTrackIn;
    });
});

window.addEventListener("message", event => {
    suborbitalTrack.updateVis(event.data.idsToShow,
        ("timeToShow") in event.data ? event.data.timeToShow : Date.now());
});
