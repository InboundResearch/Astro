let circleFraction = function (angle) {
    let seconds = angle.seconds;
    let minutes = angle.minutes + (seconds / 60.0);
    if ("hours" in angle) {
        return angle.sign * ((angle.hours + (minutes / 60.0)) / 24.0);
    } else if ("degrees" in angle) {
        return angle.sign * (angle.degrees + (minutes / 60.0)) / 360.0;
    }
};

let angleToRadians = function (angle) {
    return circleFraction (angle) * 2.0 * Math.PI;
};

String.prototype.test = function (re) {
    return re.test (this);
};

let angleFromString = function (string) {
    // ε = 23° 26′ 21″.406 − 46″.836769 T − 0″.0001831 T2 + 0″.00200340 T3 − 0″.576×10−6 T4 − 4″.34×10−8 T5
    // ε = 23° 26′ 21.45″ − 46.815″ T − 0.0006″ T2 + 0.00181″ T3
    // "1h 30m 31s"
    let result = Object.create (null);
    let signIndex = string.indexOf ("-");
    if (signIndex >= 0) {
        result.sign = -1.0;
        string = string.substring (signIndex + 1);
    } else {
        result.sign = 1.0;
    }
    let components = string.split (/[″"s]\s*/i);
    let fractional = parseFloat (((components.length > 1) && (components[1].length > 0)) ? components[1] : 0);
    components = components[0].split (/[′'m]\s*/i);
    result.seconds = parseFloat (((components.length > 1) && (components[1].length > 0)) ? components[1] : 0) + fractional;

    if (string.test (/[°d]/)) {
        components = components[0].split (/[°d]\s*/i);
        result.minutes = parseFloat (((components.length > 1) && (components[1].length > 0)) ? components[1] : 0);
        result.degrees = parseFloat (components[0]);
    } else {
        components = components[0].split (/[h]\s*/i);
        result.minutes = parseFloat (((components.length > 1) && (components[1].length > 0)) ? components[1] : 0);
        result.hours = parseFloat (components[0]);
    }
    return result;
};

let utc = function (year, month, day, hour, minutes, seconds) {
    let now = new Date ();
    now.setUTCFullYear (year, month - 1, day);
    now.setUTCHours (hour, minutes, seconds);
    return now;
};

let computeJ2000 = function (date) {
    let hours = date.getUTCHours ();
    let minutes = date.getUTCMinutes ();
    let seconds = date.getUTCSeconds ();
    let milliseconds = date.getUTCMilliseconds ();
    let h = hours + (minutes / 60) + (seconds / (60 * 60)) + (milliseconds / (1000 * 60 * 60));
    let m = date.getUTCMonth () + 1;
    let d = date.getUTCDate ();
    let y = date.getUTCFullYear ();
    let f = Math.floor;
    return 367 * y - f (7 * (y + f ((m + 9) / 12)) / 4) + f (275 * m / 9) + d - 730531.5 + (h / 24);
};

let computeGmstFromJ2000 = function (jd) {
    let jc = jd / 36525;
    let gmst = 67310.54841 + (((876600 * 60 * 60) + 8640184.812866) * jc) + (0.093104 * jc * jc) - (6.2e-6 * jc * jc * jc);
    return Utility.unwindDegrees (gmst / 240);
};
