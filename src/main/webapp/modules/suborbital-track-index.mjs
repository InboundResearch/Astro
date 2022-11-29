import {SuborbitalTrack} from "./suborbital-track.mjs";

window.addEventListener ("load", event => {
    window.suborbitalTrack = SuborbitalTrack ("render-canvas-div", suborbitalTrack => {});
});
