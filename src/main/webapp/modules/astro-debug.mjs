// class hierarchy
// default values...
// vector manipulation macros
import "https://astro.irdev.us/modules/satellite.mjs";
import {WebGL2, LogLevel, Utility, Float2, Float3, Float4x4} from "https://webgl.irdev.us/modules/webgl.mjs";
export let Astro = function (mainCanvasDivId, fpsDivId, cameraDivId, loadingDivId, onReadyCallback = function (astro) {}) {
    let $ = Object.create (null);
    let wgl = $.wgl = WebGL2();
    let ClassBase = wgl.ClassBase;
    let RollingStats = wgl.RollingStats;
    let PointerTracker = wgl.PointerTracker;
    let OnReady = wgl.OnReady;
    let Render = wgl.Render;
    let LoaderShader = wgl.LoaderShader;
    let LoaderPath = wgl.LoaderPath;
    let Texture = wgl.Texture;
    let TextFile = wgl.TextFile;
    let Loader = wgl.Loader;
    let Program = wgl.Program;
    let makeBall = wgl.makeBall;
    let Shape = wgl.Shape;
    let Node = wgl.Node;
    let Thing = wgl.Thing;
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
/*
I am using a geocentric/celestial J2000 coordinate frame with the Earth at the origin.
Stars and other elements referring to celestial J2000 RA/Dec ar to be plotted directly on the sky
sphere at the coordinates given
 */
const daysPerJulianCentury = 36525.0;
// radii in km so I can do some reasoning about scales...
const earthRadius = 6378.1370;
const sunRadius = 695700.0;
const earthOrbit = 149597870.700;
const sunDistance = earthOrbit / earthRadius;
const starSphereRadius = sunDistance + 1.0;
const moonRadius = 1737.1;
//let moonOrbit = 384405.0;
const moonScale = moonRadius / earthRadius; // approx 0.273
const moonSiderealMonth = daysPerJulianCentury / 27.321662; // one rotation per, on average...
let solarSystem = Object.create (null);
let updateSolarSystem = function (time) {
    // cos and sin routines that work on degrees (unwraps intrinsically)
    let cos = Utility.cos;
    let sin = Utility.sin;
    // compute the julian century, time is already a J2000 date
    let jc = time / daysPerJulianCentury;
    // SUN
    {
        let computeSunPosition = function (julianCentury) {
            let result = Object.create (null);
            // compute the mean longitude and mean anomaly of the sun (degrees)
            // updated 2022/11/28 from https://gml.noaa.gov/grad/solcalc/NOAA_Solar_Calculations_day.xls
            let meanLongitude = (280.46646 + julianCentury * (36000.76983 + (julianCentury * 0.0003032))) % 360;
            let meanAnomaly = 357.52911 + (julianCentury * (35999.05029 - (0.0001537 * julianCentury)));
            // compute the ecliptic longitude of the sun (degrees)
            let eclipticLongitude = meanLongitude +
                (sin(meanAnomaly) * (1.914602 - (julianCentury * (0.004817 + (0.000014 * julianCentury))))) +
                (sin(2 * meanAnomaly) * (0.019993 - (0.000101 * julianCentury))) +
                (sin(3 * meanAnomaly) * 0.000289);
            let apparentLongitude = eclipticLongitude - 0.00569 - (0.00478 * sin(125.04 - (1934.136 * julianCentury)));
            let sinApparentLongitude = sin(apparentLongitude);
            // compute the distance to the sun in astronomical units
            result.r = 1.000140612 - (0.016708617 * cos (meanAnomaly)) - (0.000139589 * cos (meanAnomaly + meanAnomaly));
            // compute the ecliptic obliquity (degrees)
            let meanObliqueEcliptic = 23 + (26 + ((21.448 - (julianCentury * (46.815 + (julianCentury * (0.00059 - (julianCentury * 0.001813))))))) / 60) / 60;
            let correctedObliqueEcliptic = meanObliqueEcliptic + (0.00256 * cos(125.04 - (1934.136 * julianCentury)));
            // compute geocentric equatorial direction, note that these are re-ordered to reflect the
            // rotation of the solar system coordinate frame into my Y-up viewing frame
            let I = cos (eclipticLongitude);
            let J = cos (correctedObliqueEcliptic) * sinApparentLongitude;
            let K = sin (correctedObliqueEcliptic) * sinApparentLongitude;
            result.direction = Float3.normalize ([-I, K, J]);
            return result;
        };
        let sunPosition = computeSunPosition (jc);
        solarSystem.sunR = sunPosition.r;
        solarSystem.sunDirection = sunPosition.direction;
    }
    // MOON
    {
        // function to compute the moon position at a time
        let computeMoonPosition = function (t_jc) {
            let result = Object.create (null);
            let eclipticLongitude = 218.32 + (481267.8813 * t_jc)
                + (6.29 * sin (134.9 + (477198.85 * t_jc)))
                - (1.27 * sin (259.2 - (413335.38 * t_jc)))
                + (0.66 * sin (235.7 + (890534.23 * t_jc)))
                + (0.21 * sin (269.9 + (954397.70 * t_jc)))
                - (0.19 * sin (357.5 + (35999.05 * t_jc)))
                - (0.11 * sin (186.6 + (966404.05 * t_jc)));
            let eclipticLatitude =
                (5.13 * sin (93.3 + (483202.03 * t_jc)))
                + (0.28 * sin (228.2 + (960400.87 * t_jc)))
                - (0.28 * sin (318.3 + (6003.18 * t_jc)))
                - (0.17 * sin (217.6 - (407332.20 * t_jc)));
            let horizontalParallax = 0.9508
                + (0.0518 * cos (134.9 + (477198.85 * t_jc)))
                + (0.0095 * cos (259.2 - (413335.38 * t_jc)))
                + (0.0078 * cos (235.7 + (890534.23 * t_jc)))
                + (0.0028 * cos (269.9 + (954397.70 * t_jc)));
            // compute the distance from the earth to the moon, in earth radii
            result.r = 1.0 / sin (horizontalParallax);
            // compute the ecliptic obliquity (degrees)
            let eclipticObliquity = 23.439291 - (0.0130042 * t_jc);
            // compute the geocentric equatorial direction to the moon
            let cosEclipticLongitude = cos (eclipticLongitude);
            let sinEclipticLongitude = sin (eclipticLongitude);
            let cosEclipticLatitude = cos (eclipticLatitude);
            let sinEclipticLatitude = sin (eclipticLatitude);
            let cosEclipticObliquity = cos (eclipticObliquity);
            let sinEclipticObliquity = sin (eclipticObliquity);
            // note that these are re-ordered to reflect the rotation of the solar system coordinate
            // frame into my Y-up viewing frame
            let I = cosEclipticLatitude * cosEclipticLongitude;
            let J = ((cosEclipticObliquity * cosEclipticLatitude * sinEclipticLongitude) - (sinEclipticObliquity * sinEclipticLatitude));
            let K = ((sinEclipticObliquity * cosEclipticLatitude * sinEclipticLongitude) + (cosEclipticObliquity * sinEclipticLatitude));
            result.direction = Float3.normalize ([-I, K, J]);
            return result;
        };
        let moonPosition = computeMoonPosition(jc);
        solarSystem.moonR = moonPosition.r;
        solarSystem.moonDirection = moonPosition.direction;
        // XXX this is wrong, but pretty close... I need to rotate the moon on its axis, and then
        // XXX rotate its axis in the right place. For the moment, this shows the affect of
        // XXX libration due to the eccentricity of the moon's orbit, but does not PERFECTLY match
        // XXX any reference values I can find.
        // XXX I *think* I am only missing the moon's axial tilt... it's only about 1.5 degrees
        // XXX OR... the angle is bigger, because the moon is rotated about 1.5 degrees off the
        // XXX ecliptic. If the angle is greater, it's probably effectively a rotation around the
        // XXX X-axis, giving a small apparent error, because my result right now matches several
        // XXX reference sources pretty closely (just not perfectly)
        // XXX I am unable to find any computation for the moon's orientation that is an explicit
        // XXX statement of its physical rotation around its own axis from some starting point...
        // XXX clearly I am thinking about this problem very differently than other people do
        // compute the moon position at J2000, and spew an angle on the y-axis to use as a J2000
        // origin
        /*
        let moonPositionJ2000 = computeMoonPosition(0);
        let angle = Math.atan2(moonPositionJ2000.direction[0], moonPositionJ2000.direction[2]);
        angle = Utility.radiansToDegrees (angle) - 90.0;
        console.log("moonPositionJ2000 = " + angle + " degrees");

        // the angle is 42.427549902001715
        */
        // compute the current rotation of the moon as a function of the rotational period. I
        // *think* this should be the sideral month, and I got the libration for the J2000 origin
        // from a Java App at http://jgiesen.de/moonlibration/index.htm
        solarSystem.moonTheta = Utility.degreesToRadians (42.427549902001715 + -6.77 + (360.0 * moonSiderealMonth * jc));
    }
    // positions for rendering eclipse
    {
        // figure a coordinate system for the sun
        //let zAxis = solarSystem.sunDirection;
        //let xAxis = Float3.normalize (Float3.cross ([0, 1, 0], zAxis));
        //let yAxis = Float3.normalize (Float3.cross (zAxis, xAxis));
        // project the moon into the solar coordinate system, both in earth radii
        let sp = Float3.scale (solarSystem.sunDirection, (solarSystem.sunR * sunDistance));
        solarSystem.sunPosition = [sp[0], sp[1], sp[2], sunRadius / earthRadius];
        let mp = Float3.scale (solarSystem.moonDirection, solarSystem.moonR);
        solarSystem.moonPosition = [mp[0], mp[1], mp[2], moonRadius / earthRadius];
    }
};
let Blackbody = function () {
    let _ = Object.create (null);
    // there are 41 steps at 10nm/step from 380nm to 780nm (inclusive) (the visible spectrum)
    const TEN_NM_STEPS = 41;
    const PI = Math.PI;
    // CIE standard   1       2       3       4       5       6       7       8       9      10       1       2       3       4       5       6       7       8       9      20       1       2       3       4       5       6       7       8       9      30       1       2       3       4       5       6       7       8       9      40       1
    let CIE_x = [0.0014, 0.0042, 0.0143, 0.0435, 0.1344, 0.2839, 0.3483, 0.3362, 0.2908, 0.1954, 0.0956, 0.0320, 0.0049, 0.0093, 0.0633, 0.1655, 0.2904, 0.4334, 0.5945, 0.7621, 0.9163, 1.0263, 1.0622, 1.0026, 0.8544, 0.6424, 0.4479, 0.2835, 0.1649, 0.0874, 0.0468, 0.0227, 0.0114, 0.0058, 0.0029, 0.0014, 7.0E-4, 3.0E-4, 2.0E-4, 1.0E-4, 0.0000];
    let CIE_y = [0.0000, 1.0E-4, 4.0E-4, 0.0012, 0.0040, 0.0116, 0.0230, 0.0380, 0.0600, 0.0910, 0.1390, 0.2080, 0.3230, 0.5030, 0.7100, 0.8620, 0.9540, 0.9950, 0.9950, 0.9520, 0.8700, 0.7570, 0.6310, 0.5030, 0.3810, 0.2650, 0.1750, 0.1070, 0.0610, 0.0320, 0.0170, 0.0082, 0.0041, 0.0021, 0.0010, 5.0E-4, 3.0E-4, 1.0E-4, 1.0E-4, 0.0000, 0.0000];
    let CIE_z = [0.0065, 0.0201, 0.0679, 0.2074, 0.6456, 1.3856, 1.7471, 1.7721, 1.6692, 1.2876, 0.8130, 0.4652, 0.2720, 0.1582, 0.0782, 0.0422, 0.0203, 0.0087, 0.0039, 0.0021, 0.0017, 0.0011, 8.0E-4, 3.0E-4, 2.0E-4, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000];
    let XYZW = [[0.67, 0.33], [0.21, 0.71], [0.14, 0.08], [0.31, 0.316]];
    // plot an energy curve for an ideal black body at the requested temperature
    let computeBlackbody = function (temperature) {
        let blackbody = [];
        let h = 6.626176E-34, k = 1.380662E-23, c = 2.997925E8;
        let hc = h * c, c1 = 2.0 * PI * hc * c, c2 = hc / k;
        for(let i = 0; i < TEN_NM_STEPS; ++i) {
            let wavelength = ((i * 10.0) + 380.0) * 1.0E-9;
            let value = c1 / (Math.pow(wavelength, 5.0) * (Math.pow(Math.exp(1.0), c2 / (wavelength * temperature)) - 1.0));
            blackbody.push (value);
        }
        return blackbody;
    };
    let normalizeRGBColor = function (red, green, blue) {
        let max = Math.max (Math.max (red, green), blue);
        return [red / max, green / max, blue / max];
    };
    let normalizeXYZColor = function (x, y, z) {
        let result = [];
        let xw = XYZW[3][0], yw = XYZW[3][1];
        let Xw = xw / yw, Yw = 1.0, Zw = (1.0 - xw - yw) / yw;
        result.push (x + ((Xw - x) * 0.005));
        result.push (y + ((Yw - y) * 0.005));
        result.push (z + ((Zw - z) * 0.005));
        return result;
    };
    let XYZtoRGB = function (x, y, z) {
        // XXX these should be matrix operations
        let xr = XYZW[0][0], xg = XYZW[1][0], xb = XYZW[2][0], xw = XYZW[3][0];
        let yr = XYZW[0][1], yg = XYZW[1][1], yb = XYZW[2][1], yw = XYZW[3][1];
        let Cr = 1.0 / yw * (xw * (yg - yb) - yw * (xg - xb) + xg * yb - xb * yg);
        let Cg = 1.0 / yw * (xw * (yb - yr) - yw * (xb - xr) - xr * yb + xb * yr);
        let Cb = 1.0 / yw * (xw * (yr - yg) - yw * (xr - xg) + xr * yg - xg * yr);
        let red = (x * ((yg - yb - xb * yg + yb * xg) / Cr)) + (y * ((xb - xg - xb * yg + xg * yb) / Cr)) + (z * ((xg * yb - xb * yg) / Cr));
        let green = (x * ((yb - yr - yb * xr + yr * xb) / Cg)) + (y * ((xr - xb - xr * yb + xb * yr) / Cg)) + (x * ((xb * yr - xr * yb) / Cg));
        let blue = (x * ((yr - yg - yr * xg + yg * xr) / Cb)) + (y * ((xg - xr - xg * yr + xr * yg) / Cb)) + (z * ((xr * yg - xg * yr) / Cb));
        if ((red >= 0.0) && (green >= 0.0) && (blue >= 0.0)) {
            return normalizeRGBColor(red, green, blue);
        } else {
            let normalizedColor = normalizeXYZColor (x, y, z);
            return XYZtoRGB(normalizedColor[0], normalizedColor[1], normalizedColor[2]);
        }
    };
    // compute the XYZ color by convolving the sensor response curves with the
    // (normalized) blackbody curve and then convert that to an RGB color
    let getColorOfCurve = function (curve) {
        let x = 0.0, y = 0.0, z = 0.0;
        for(let i = 0; i < TEN_NM_STEPS; ++i) {
            let value = curve[i];
            x += CIE_x[i] * value; y += CIE_y[i] * value; z += CIE_z[i] * value;
        }
        return XYZtoRGB(x, y, z);
    };
    let curveMax = function(curve) {
        let max = 0.0;
        for (let i = 0; i < TEN_NM_STEPS; ++i) {
            max = Math.max (max, curve[i]);
        }
        return max;
    };
    let scaleCurve = function (curve, multiplier) {
        let result = [];
        for(let i = 0; i < 41; ++i) {
            result.push (curve[i] * multiplier);
        }
        return result;
    };
    let normalizeCurve = function (curve) {
        return scaleCurve (curve, 1.0 / curveMax (curve));
    };
    _.colorAtTemperature = function (temperature) {
        let curve = computeBlackbody (temperature);
        curve = normalizeCurve (curve);
        return getColorOfCurve(curve);
    };
    _.makeBand = function (elementId, steps) {
        let innerHTML = '<div style="width:100%;height:100%;">';
        let min = 2000, max = 20000, delta = max - min, step = delta / steps;
        let width = (99 / steps);
        for (let i = 0; i < steps; ++i) {
            let temperature = min + (i * step);
            let c = _.colorAtTemperature(temperature);
            innerHTML += '<div style="display:inline-block;width:' + width + '%;height:100%;background-color:rgb(' + Math.floor (c[0] * 255) + ',' + Math.floor (c[1] * 255) + ',' + Math.floor (c[2] * 255) + ');">';
            innerHTML += '<span style="display:inline-block;transform:rotate(270deg);color:black;font-size:7px;margin-top:15px;margin-left:auto;margin-right:auto;"><span>' + Math.floor (temperature) + '°K</span></span>';
            innerHTML += '</div>';
        }
        document.getElementById(elementId).innerHTML = innerHTML + "</div>";
    };
    return _;
} ();
// reference for future adaptations:
// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
// http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html
let Stars = function () {
    let _ = Object.create (null);
    _.make = function (name, includeMinV, includeMaxV) {
        return Shape.new ({
            buffers: function () {
                // the min and max V values, so we can interpolate the sizes
                let minV = -1.5, maxV = 8;
                let deltaV = maxV - minV;
                // a basic star triangle list
                let starFaceIndices = [];
                let starPoints = [];
                let makeStar = function (count) {
                    let theta = 2.0 * Math.PI / count;
                    //let cTh = Math.cos (theta);
                    //let sTh = Math.sin (theta);
                    for (let i = 0; i < count; ++i) {
                        let angle = theta * i;
                        starPoints.push([ Math.cos (angle), Math.sin (angle), 0.0, 1.0]);
                    }
                    starPoints.push([ 0.0, 0.0, 0.0, 1.0]);
                    for (let i = 0; i < count; ++i) {
                        starFaceIndices.push(count, (i + 1) % count, i);
                    }
                };
                // 7 points on a star is a nice compromise between too symmetrical and nice and round
                makeStar(7);
                // the full point buffer
                let positionBuffer = [];
                let colorBuffer = [];
                let indexBuffer = [];
                // walk over the stars
                let count = 0;
                let addStar = function (star) {
                    if ((star.V >= includeMinV) && (star.V < includeMaxV)) {
                        count++;
                        // get the right ascension and declination of the star, accounting for
                        // our reversed and rotated coordinate frames
                        let ra = (Math.PI / -2.0) + angleToRadians (angleFromString (star.RA));
                        let dec = -angleToRadians (angleFromString (star.Dec));
                        // compute the size of this star, the dimmest will be 0.0005, the
                        // brightest 0.005
                        let interpolant = ((star.V - minV) / deltaV);
                        let size = (0.005 * (1.0 - interpolant)) + (0.0005 * interpolant);
                        // build a transformation for the star points
                        let transform = Float4x4.chain (
                            Float4x4.scale (size),
                            Float4x4.translate ([0.0, 0.0, 1.0]),
                            Float4x4.rotateX (dec),
                            Float4x4.rotateY (ra)
                        );
                        // transform the star points
                        let pointsBase = positionBuffer.length;
                        for (let point of starPoints) {
                            point = Float3.copy (Float4x4.preMultiply (point, transform));
                            positionBuffer.push (point);
                        }
                        // compute the color for the star, and push the colors into the final
                        // star color buffer
                        let alpha = 0.25 + (0.75 * (1.0 - interpolant));
                        let color = ("K" in star) ? Blackbody.colorAtTemperature (star.K) : [1.0, 0.5, 0.5];
                        for (let i = 1; i < starPoints.length; ++i) {
                            colorBuffer.push ([color[0], color[1], color[2], 0.1]);
                        }
                        //colorBuffer.push ([1.0, 1.0, 1.0, alpha]);
                        color = Float3.scale (Float3.add ([2.0, 2.0, 2.0], color), 0.3333);
                        colorBuffer.push ([color[0], color[1], color[2], alpha]);
                        // push the indices into the final star points buffer
                        for (let index of starFaceIndices) {
                            indexBuffer.push (index + pointsBase);
                        }
                    }
                }
                // create the database of stars from the loaded files
                let stars = JSON.parse (TextFile.get ("bsc5-short").text);
                for (let star of stars) addStar (star);
                // technically the M objects could be much larger, but for now we'll just treat them as stars
                let messiers = JSON.parse (TextFile.get ("messier").text);
                for (let messier of messiers) addStar (messier);
                LogLevel.info ("Star count (" + name + "): " + count);
                // flatten the buffer as the return result
                return {
                    position: Utility.flatten (positionBuffer),
                    color: Utility.flatten (colorBuffer),
                    index: indexBuffer
                };
            }
        }, name);
    };
    return _;
} ();
let MessierObjects = function () {
    let _ = Object.create (null);
    _.make = function (name, includeMinV, includeMaxV) {
        return Shape.new ({
            buffers: function () {
                // create the database of stars from the loaded file
                let stars = JSON.parse (TextFile.get ("Stars").text);
                // the min and max V values, so we can interpolate the sizes
                let minV = -1.5, maxV = 8;
                let deltaV = maxV - minV;
                // a basic star triangle list
                let starFaceIndices = [];
                let starPoints = [];
                let makeStar = function (count) {
                    let theta = 2.0 * Math.PI / count;
                    //let cTh = Math.cos (theta);
                    //let sTh = Math.sin (theta);
                    for (let i = 0; i < count; ++i) {
                        let angle = theta * i;
                        starPoints.push([ Math.cos (angle), Math.sin (angle), 0.0, 1.0]);
                    }
                    starPoints.push([ 0.0, 0.0, 0.0, 1.0]);
                    for (let i = 0; i < count; ++i) {
                        starFaceIndices.push(count, (i + 1) % count, i);
                    }
                };
                // 7 points on a star is a nice compromise between too symmetrical and nice and round
                makeStar(7);
                // the full point buffer
                let positionBuffer = [];
                let colorBuffer = [];
                let indexBuffer = [];
                // walk over the stars
                let count = 0;
                for (let star of stars) {
                    if ((star.V >= includeMinV) && (star.V < includeMaxV)) {
                        count++;
                        // get the right ascension and declination of the star, accounting for
                        // our reversed and rotated coordinate frames
                        let ra = (Math.PI / -2.0) + angleToRadians (angleFromString (star.RA));
                        let dec = -angleToRadians (angleFromString (star.Dec));
                        // compute the size of this star, the dimmest will be 0.0005, the
                        // brightest 0.005
                        let interpolant = ((star.V - minV) / deltaV);
                        let size = (0.005 * (1.0 - interpolant)) + (0.0005 * interpolant);
                        // build a transformation for the star points
                        let transform = Float4x4.chain (
                            Float4x4.scale (size),
                            Float4x4.translate ([0.0, 0.0, 1.0]),
                            Float4x4.rotateX (dec),
                            Float4x4.rotateY (ra)
                        );
                        // transform the star points
                        let pointsBase = positionBuffer.length;
                        for (let point of starPoints) {
                            point = Float3.copy (Float4x4.preMultiply (point, transform));
                            positionBuffer.push (point);
                        }
                        // compute the color for the star, and push the colors into the final
                        // star color buffer
                        let alpha = 0.25 + (0.75 * (1.0 - interpolant));
                        let color = ("K" in star) ? Blackbody.colorAtTemperature (star.K) : [0.5, 0.5, 0.5];
                        for (let i = 1; i < starPoints.length; ++i) {
                            colorBuffer.push ([color[0], color[1], color[2], 0.1]);
                        }
                        //colorBuffer.push ([1.0, 1.0, 1.0, alpha]);
                        color = Float3.scale (Float3.add ([2.0, 2.0, 2.0], color), 0.3333);
                        colorBuffer.push ([color[0], color[1], color[2], alpha]);
                        // push the indices into the final star points buffer
                        for (let index of starFaceIndices) {
                            indexBuffer.push (index + pointsBase);
                        }
                    }
                }
                LogLevel.info ("Star count (" + name + "): " + count);
                // flatten the buffer as the return result
                return {
                    position: Utility.flatten (positionBuffer),
                    color: Utility.flatten (colorBuffer),
                    index: indexBuffer
                };
            }
        }, name);
    };
    return _;
} ();
let makeWgs84 = function (name, steps) {
    // flattening, f = (a - b) / a
    // from WGS84 (http://earth-info.nga.mil/GandG/publications/tr8350.2/wgs84fin.pdf)
    // 1 / f = 298.257223563
    // a = 6378137.0 (meters)
    // b = (-f * a) + a
    // we want to compute the ovoid using b/f for the y components of the outline
    // XXX TODO
    LogLevel.say (LogLevel.INFO, "Make WGS84...");
    // generate an outline, and then revolve it
    let outline = [];
    let normal = [];
    let stepAngle = Math.PI / steps;
    for (let i = 0; i <= steps; ++i) {
        let angle = stepAngle * i;
        // using an angle setup so that 0 is (0, 1), and Pi is (0, -1) means switching (x, y) so we
        // get an outline that can be revolved around the x=0 axis
        let value = Float2.fixNum([Math.sin (angle), Math.cos (angle)]);
        outline.push (value);
        normal.push (value);
    }
    // revolve the surface, the outline is a half circle, so the revolved surface needs to be twice
    // as many steps to go all the way around
    return makeRevolve(name, outline, normal, steps * 2, function (uvY) { return uvY; });
};
let Tle = function () {
    let _ = Object.create (ClassBase);
    // "static" function to read TLEs from a text block (as returned from celestrak, for instance)
    // and turn them into a rudimentary JSON array we can use for tracking
    _.readTle = function (tleText) {
        let lines = tleText.split(/\r?\n/);
        let elements = [];
        for (let i = 0; i < lines.length; i += 3) {
            let name = lines[i].trim();
            if (name.length > 0) elements.push({name: name, line1: lines[i + 1], line2: lines[i + 2]});
        }
        return elements;
    };
    const a = 6378.137;
    const b = 6356.7523142;
    const f = (a - b) / a;
    const e2 = 2 * f - f * f;
    let eciToGeodetic = function (eci, gmst) {
        // http://www.celestrak.com/columns/v02n03/
        // compute the latitude and iterate to polish
        let R = Math.sqrt(eci.x * eci.x + eci.y * eci.y);
        let latitude = Math.atan2(eci.z, R);
        let C;
        for (let k = 0; k < 20; ++k) {
            let sinLat = Math.sin(latitude);
            C = 1 / Math.sqrt(1 - e2 * (sinLat * sinLat));
            latitude = Math.atan2(eci.z + a * C * e2 * sinLat, R);
        }
        return { longitude: Math.atan2(eci.y, eci.x) - gmst, latitude: latitude, height: R / Math.cos(latitude) - a * C, gmst: gmst };
    };
    // time helpers
    const msPerSecond = 1.0e3;
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerDay = 24;
    const daysLookAhead = 0.5;
    // time steps
    const timeStep = msPerSecond * secondsPerMinute * 5;
    const timeStepCount = (msPerSecond * secondsPerMinute * minutesPerHour * hoursPerDay * daysLookAhead) / timeStep;
    const twoPi = Math.PI * 2;
    // utility functions
    let randomAngle = function () {return (Math.random () - 0.5) * Math.PI};
    let interpolate = function (a, b, t) { return a + (t * (b - a)); };
    let interpolateAngle = function (a, b, t) {
        let d = b - a;
        while (d > Math.PI) d -= twoPi;
        while (d < -Math.PI) d += twoPi;
        return a + (t * d);
    };
    _.construct = function (parameters) {
        let elements = this.elements = parameters.elements;
        this.currentElementIndex = 0;
        // do initialization and reverse indexing
        let nowTime = Date.now ();
        let elementIndex = this.elementIndex = {};
        const satelliteScale = Float4x4.scale (40 / earthRadius);
        for (let i = 0, end = elements.length; i < end; ++i) {
            let element = elements[i];
            element.index = i;
            element.transform =Float4x4.chain (Float4x4.rotateX (randomAngle ()), Float4x4.rotateY (randomAngle ()), Float4x4.rotateZ (randomAngle ()), satelliteScale);
            elementIndex[element.name] = i;
            // precompute a 24-hour trajectory that we'll just linearly interpolate during normal display
            element.startTime = nowTime;
            element.positions = [];
            element.satrec = satellite.twoline2satrec(element.line1, element.line2);
            for (let j = 0; j < timeStepCount; ++j) {
                let propTime = new Date (nowTime + (j * timeStep));
                let positionAndVelocity = satellite.propagate(element.satrec, propTime);
                if ((typeof (positionAndVelocity) !== "undefined") && ("position" in positionAndVelocity) && (positionAndVelocity.position !== false)) {
                    element.positions.push(eciToGeodetic(positionAndVelocity.position, satellite.gstime(propTime)));
                } else {
                    element.positions.push({latitude: 0, longitude: 0, height: 0, gmst: 0});
                }
            }
        }
    };
    const updateClusterCount = 200;
    _.updateElements = function (nowTime, matrices, timeBudgetMs = 24) {
        let computeTransform = function (element, position) {
            //LogLevel.info("name: " + element.name + ", lat: " + Utility.radiansToDegrees(position.latitude).toFixed (3) + ", lon: " + Utility.radiansToDegrees(position.longitude).toFixed (3) + ", alt: " + position.height);
            Float4x4.copy(Float4x4.chain(
                element.transform,
                Float4x4.translate([(position.height + earthRadius) / earthRadius, 0, 0]),
                Float4x4.rotateZ(position.latitude),
                // our earth globe is defined with the seam 180 degrees around
                // XXX should fix this...
                // XXX the parent node is failing to transmit the gmst rotation around the y-axis
                // XXX should fix this too...
                Float4x4.rotateY(Math.PI + position.longitude + position.gmst),
                //Float4x4.rotateY (position.longitude)
            ), matrices[element.index]);
        };
        let computePosition = function (element) {
            let deltaTime = Math.max(0, nowTime.getTime() - element.startTime);
            let index = deltaTime / timeStep;
            let lowIndex = Math.floor (index);
            let maxIndex = element.positions.length - 1;
            let a = element.positions[Math.min (lowIndex, maxIndex)];
            let b = element.positions[Math.min (lowIndex + 1, maxIndex)];
            let interpolant = index - lowIndex;
            return {
                latitude: interpolate (a.latitude, b.latitude, interpolant),
                longitude: interpolateAngle (a.longitude, b.longitude, interpolant),
                height: interpolate (a.height, b.height, interpolant),
                gmst: interpolateAngle (a.gmst, b.gmst, interpolant)
            };
        };
        // loop over as many elements as we can in our time budget to update them
        let elements = this.elements;
        let elementIndex = this.currentElementIndex;
        let startTime = performance.now ();
        let stop = false;
        do {
            // do it in clusters...
            for (let i = 0; i < updateClusterCount; ++i) {
                // get the element and compute its transform
                let element = elements[elementIndex];
                let position = computePosition (element);
                computeTransform (element, position);
                // advance to the next element and check if we should stop
                elementIndex = (elementIndex + 1) % this.elements.length;
                stop = stop || (elementIndex === this.currentElementIndex);
            }
        } while (((performance.now () - startTime) < timeBudgetMs) && (! stop));
        this.currentElementIndex = elementIndex;
    };
    return _;
} ();
let tle;
$.addTle = function (filterCriteria) {
    tle = null;
    let worldNode = Node.get ("world");
    worldNode.removeChild("tle");
    // get the tles...
    let elementsText = TextFile.get ("elements").text;
    let elementsTextFirstChar = elementsText.charAt(0);
    if (elementsTextFirstChar === "{") {
        elementsText = JSON.parse (elementsText).response.content;
    }
    // read the elements from the TLE file
    let elements = Tle.readTle (elementsText);
    // if filterCriteria is not empty
    if (filterCriteria) {
        // we expect filterCriteria to be a string (which we will match kinda loosely), or an
        // array of strings, which we will match tightly.
        if (typeof (filterCriteria) === "string") {
            elements = elements.filter(element => element.name.includes(filterCriteria));
        } else if (Array.isArray (filterCriteria)) {
            elements = elements.filter(element => filterCriteria.includes(element.name) || filterCriteria.includes(element.line1.substring(2, 7)));
        } else {
            LogLevel.warn ("Invalid filter criteria: " + filterCriteria);
        }
    }
    // if we have some elements...
    if (elements.length > 0) {
        // add the render node
        let tleNode = Node.new ({
            replace: true,
            instance: elements.length,
            state: function (standardUniforms) {
                Program.get ("shadowed").use ().setSunPosition (solarSystem.sunPosition);
                //Program.get ("basic").use ();
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
                standardUniforms.MODEL_COLOR = [1.00, 0.70, 0.40];
                standardUniforms.AMBIENT_CONTRIBUTION = 0.25;
                standardUniforms.DIFFUSE_CONTRIBUTION = 0.90;
            },
            shape: "ball-tiny",
            children: false
        }, "tle");
        worldNode.addChild (tleNode);
        // XXX add a manager to update the tle node - needs more thought
        Thing.new ({
            replace: true,
            node: "tle",
            update: function (time) {
                // time is a J2000 time in seconds... the tle update class needs a Date object
                // update the satellites - nowTime is a javascript Date
                //if (tle) {
                //    tle.updateElements (nowTime, Node.get ("tle").instanceTransforms.matrices);
                //}
            }
        }, "tle");
        // let the full list of TLEs update
        tle = Tle.new ({ elements: elements });
        tle.updateElements (new Date (), tleNode.instanceTransforms.matrices, Number.POSITIVE_INFINITY);
    }
};
    let mainCanvasDiv;
    let fpsDiv;
    let render;
    const msPerSecond = 1000;
    const sixtyHzMs = msPerSecond / 60;
    let fpsRefreshCap = 0;
    let deltaTimestampHistory = RollingStats.new ({ count: 60, fill: sixtyHzMs });
    let traversalMsHistory = RollingStats.new ({ count: 60, fill: sixtyHzMs });
    let deltaNowHistory = RollingStats.new ({ count: 60, fill: 0 });
    let starsScene;
    let solarSystemScene;
    let standardUniforms = Object.create (null);
    let cameras = [
        { name: "sweep", type: "fixed", from: "flyer", at: "earth", fov: 40.0, wheel: { field: "fov", inc: -0.5, limitUp: 15, limitDown: 80 } },
        { name: "manual", type: "orbit", at: "earth", zoom: 0.25, fov: 45.0, wheel: { field: "zoom", inc: 0.005, limitUp: 1.5, limitDown: 0.1 }, default: [0.30, 0.20] },
        { name: "iss", type: "skewer", from: "ISS (ZARYA)", at: "earth", fov: 45, distance: 4.0, wheel: { field: "distance", inc: -0.05, limitUp: 0.35, limitDown: 7.5 } },
        { name: "moon at earth", type: "ots", from: "moon", at: "earth", zoom: 0.15, fov: 1.0, default: [-0.70, 0.40] },
        { name: "earth at moon", type: "ots", from: "earth", at: "moon", zoom: 0.5, fov: 2.0, default: [-0.70, 0.40] },
    ];
    let currentCameraIndex;
    let cameraSettings = Object.create (null);
    const ORIGIN = [0, 0, 0, 1];
    let getNodeOrigin = function (nodeName) {
        let node = Node.get (nodeName);
        if (node) {
            return Float4x4.preMultiply (ORIGIN, node.getTransform ());
        } else if (tle && (nodeName in tle.elementIndex)) {
            let node = Node.get ("tle");
            if (node) {
                let matrix = node.instanceTransforms.matrices[tle.elementIndex[nodeName]];
                let transform = Float4x4.multiply (node.getTransform (), matrix);
                return Float4x4.preMultiply (ORIGIN, transform);
            }
        }
        return ORIGIN;
    };
    let visibilityState = document.visibilityState;
    document.addEventListener ("visibilitychange", function (event) {
        //console.log ("Visbility State changed to '" + document.visibilityState + "'");
        visibilityState = document.visibilityState;
        updateRunFocus ();
    });
    let windowFocusState = "focus";
    window.addEventListener ("focus", function (event) {
        windowFocusState = "focus";
        //console.log ("Window Focus");
        updateRunFocus ();
    });
    window.addEventListener ("blur", function (event) {
        windowFocusState = "blur";
        //console.log ("Window Blur");
        updateRunFocus ();
    });
    let runFocus = true;
    let updateRunFocus = function () {
        if ((visibilityState === "visible") && (windowFocusState === "focus")) {
            runFocus = true;
            mainCanvasDiv.focus ();
            window.requestAnimationFrame (drawFrame);
        } else {
            runFocus = false;
            deltaTimestampHistory.reset ();
            traversalMsHistory.reset ();
            lastFrameTimeMs = 0;
        }
    };
    const ORIGIN_BOUND = [1, 0, 0, 1];
    let getNodeBound = function (nodeName) {
        let nodeTransform = Node.get (nodeName).getTransform ();
        let origin = Float4x4.preMultiply (ORIGIN, nodeTransform);
        let originBound = Float4x4.preMultiply (ORIGIN_BOUND, nodeTransform);
        let deltaVector = Float3.subtract (originBound, origin);
        return Float3.norm (deltaVector);
    };
    let monitorRefresh = { hz: 0, ms: 0 };
    let measureMonitorRefreshRate = function (onReady) {
        // assuming the animation frames fall on screen refresh boundaries, measure the actual refresh rate
        // which is either divisible by 5 or 12. It is unlikely to be less than 60.
        const sampleCount = 30;
        let sampleCounter = 0;
        let startTime = 0;
        let perfDeltaSum = 0;
        let lastTime = 0;
        let mmfrWorker = function (timestamp) {
            // ensure performance counter is the same one we get in the timestamp
            let now = performance.now ();
            // skip if it's a repeat
            if (timestamp === lastTime) {
                LogLevel.warn ("Repeated frame time");
                window.requestAnimationFrame (mmfrWorker);
                return;
            }
            lastTime = timestamp;
            // capture the first call as the current time
            if (startTime === 0) {
                startTime = timestamp;
                window.requestAnimationFrame (mmfrWorker);
                return;
            }
            // gather the deltas
            perfDeltaSum += (now - timestamp);
            // gather the samples
            if (++sampleCounter < sampleCount) {
                window.requestAnimationFrame (mmfrWorker);
            } else {
                let perfDeltaAvg = perfDeltaSum / sampleCount;
                if (perfDeltaAvg > 1) {
                    LogLevel.error ("performance counter is not aligned with frame timestamp (avg delta: " + perfDeltaAvg.toFixed (2) + " ms)");
                }
                let rawHz = msPerSecond / ((timestamp - startTime) / sampleCount);
                let hz = Math.round (rawHz);
                // check for divisibility, fallback to 60 if it's wonky
                if ((hz % 5 !== 0) && (hz % 12 !== 0)) {
                    hz = 60;
                    LogLevel.warn ("Monitor Refresh Rate is strange");
                }
                LogLevel.info ("Monitor Refresh Rate = " + hz + " Hz (" + rawHz.toFixed (3) + " Hz)");
                monitorRefresh = { hz: hz, ms: msPerSecond / hz };
                onReady ();
            }
        };
        window.requestAnimationFrame (mmfrWorker);
    };
    let originTime = performance.now ();
    let originTimeOffset = Date.now () - originTime;
    let timeFactor = 1;
    let currentTime;
    let lastFrameTimeMs = 0;
    let lastTimestamp = 0;
    let drawFrame = function (timestamp) {
        if (runFocus === true) {
            // grab the timer so we can evaluate our performance
            let now = performance.now ();
            let deltaNow = now - timestamp;
            deltaNow = deltaNowHistory.update (deltaNow).avg;
            // draw again as fast as possible
            window.requestAnimationFrame (drawFrame);
            // capture the delta, and save the timestamp for the next go around
            let deltaTimestamp = timestamp - lastTimestamp;
            lastTimestamp = timestamp;
            // set the clock to "now" in J2000 time
            //let nowTime = new Date (timestamp + performanceNowDateNowDelta);
            let offsetTime = originTime + originTimeOffset + (timeFactor * (now - originTime));
            let nowTime = new Date (offsetTime);
            currentTime = computeJ2000 (nowTime);
            updateSolarSystem (currentTime);
            Thing.updateAll (currentTime);
            // update the satellites - nowTime is a javascript Date
            if (tle) {
                tle.updateElements (nowTime, Node.get ("tle").instanceTransforms.matrices);
            }
            // set up the view parameters
            let currentPosition = cameraSettings[camera.name].currentPosition;
            let viewMatrix;
            switch (camera.type) {
                case "fixed": {
                    // get the points from the requested nodes
                    let lookFromPoint = getNodeOrigin (camera.from);
                    let lookAtPoint = getNodeOrigin (camera.at);
                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, lookAtPoint, [0, 1, 0]);
                    break;
                }
                case "skewer": {
                    // get the points from the requested nodes and set the camera at some distance
                    let lookFromPoint = getNodeOrigin (camera.from);
                    let lookAtPoint = getNodeOrigin (camera.at);
                    let deltaVec = Float3.subtract (lookFromPoint, lookAtPoint);
                    let deltaLength = Float3.norm (deltaVec);
                    lookFromPoint = Float3.add (lookAtPoint, Float3.scale (deltaVec, (deltaLength + camera.distance) / deltaLength));
                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, lookAtPoint, [0, 1, 0]);
                    break;
                }
                case "portrait":
                case "orbit": {
                    // get the look at point from the requested node
                    let lookAtPoint = getNodeOrigin (camera.at);
                    // compute a few image composition values based off ensuring a sphere is fully in view
                    let boundRadius = getNodeBound (camera.at);
                    let goalOpposite = boundRadius / ((camera.zoom * 0.9) + 0.1);
                    let sinTheta = Utility.sin (camera.fov / 2.0);
                    let distance = goalOpposite / sinTheta;
                    //console.log ("distance = " + distance);
                    // get the look from point as an orbit transformation around the look at point
                    let lookFromPoint = Float4x4.preMultiply ([0, 0, 0, 1], Float4x4.chain (
                        Float4x4.translate ([distance, 0, 0]),
                        Float4x4.rotateZ (currentPosition[1] * Math.PI * 0.5),
                        Float4x4.rotateY (currentPosition[0] * Math.PI * -1),
                        Float4x4.translate (lookAtPoint)
                    ));
                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, lookAtPoint, [0, 1, 0]);
                    break;
                }
                case "gimbal": {
                    // get the points from the requested nodes
                    let lookFromPoint = getNodeOrigin (camera.from);
                    let lookAtPoint = getNodeOrigin (camera.at);
                    let lookUpPoint = getNodeOrigin (camera.up);
                    let lookUpVector = Float3.normalize (Float3.subtract (lookUpPoint, lookFromPoint));
                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, lookAtPoint, lookUpVector);
                    break;
                }
                case "target": {
                    // compute a central point for all the targets
                    let targets = camera.targets;
                    let centralPoint = [0, 0, 0];
                    let points = [];
                    for (let target of targets) {
                        let targetPoint = getNodeOrigin (target);
                        points.push (targetPoint);
                        centralPoint = Float3.add (centralPoint, targetPoint);
                    }
                    centralPoint = Float3.scale (centralPoint, 1.0 / targets.length);
                    // compute a bound on the system of targets
                    let hBound = 0;
                    for (let point of points) {
                        let deltaVector = Float3.subtract (centralPoint, point);
                        deltaVector[1] = 0;
                        hBound = Math.max (Float3.norm (deltaVector), hBound);
                    }
                    // compute a few image composition values based off ensuring a group is fully in view
                    let goalOpposite = hBound / ((camera.zoom * 1.8) + 0.2);
                    let tanTheta = Utility.tan (camera.fov / 2.0);
                    let distance = goalOpposite / tanTheta;
                    //console.log ("distance = " + distance);
                    //distance = 150;
                    // get the look from point as an orbit transformation around the look at point
                    let lookFromPoint = Float4x4.preMultiply (ORIGIN, Float4x4.chain (
                        Float4x4.translate ([distance, 0, 0]),
                        Float4x4.rotateZ (currentPosition[1] * Math.PI * 0.5),
                        Float4x4.rotateY (currentPosition[0] * Math.PI * -1),
                        Float4x4.translate (centralPoint)
                    ));
                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, centralPoint, [0, 1, 0]);
                    break;
                }
                case "ots": {
                    // get the points and bounds for the view
                    let from = getNodeOrigin (camera.from);
                    let fromBound = getNodeBound (camera.from);
                    let at = getNodeOrigin (camera.at);
                    let atBound = getNodeBound (camera.at);
                    // compute the delta vector and its length
                    let deltaVector = Float3.subtract (at, from);
                    let deltaVectorNorm = Float3.norm (deltaVector);
                    deltaVector = Float3.scale (deltaVector, 1.0 / deltaVectorNorm);
                    // compute a few image composition values based off ensuring the pair is fully in view
                    let goalOpposite = fromBound / ((camera.zoom * 0.9) + 0.1);
                    let tanTheta = Utility.tan (camera.fov / 2.0);
                    let distance = goalOpposite / tanTheta;
                    let oneMinusTanThetaSq = 1.0 - (tanTheta * tanTheta);
                    // compute the bounds in unit space, and use that to compute a central point
                    let rFromBound = fromBound / deltaVectorNorm;
                    let rAtBound = atBound / deltaVectorNorm;
                    // angle cap is the maximum left/right rotation allowed, based on the angle necessary to
                    // look right between the two objects, at a minimum
                    let left = rFromBound / rAtBound;
                    let sinPhi = left / (1 + left);
                    let phi = (Math.asin (rFromBound / sinPhi) * 2.0) / oneMinusTanThetaSq;
                    // t gets a bit of scale to account for the FOV
                    let t = Math.max (0.4 * oneMinusTanThetaSq, rFromBound);
                    // compute the actual look at point, and the distance we need to be from it to satisfy
                    // all the conditions thus far
                    let centralPoint = Float3.add (Float3.scale (from, 1.0 - t), Float3.scale (at, t));
                    distance += (t * deltaVectorNorm) + fromBound + 0.1; // the 0.1 is the clipping plane
                    // compute the allowable yOffset using t
                    let yOffset = distance * Math.sin (phi / 2.0) * 1.5;
                    // get the look from point as an orbit transformation around the look at point
                    let lookFromPoint = Float4x4.preMultiply (ORIGIN, Float4x4.chain (
                        //Float4x4.translate ([distance, 0, 0]),
                        Float4x4.translate (Float3.scale (deltaVector, -1 * distance)),
                        Float4x4.translate (Float3.scale ([0, 1, 0], currentPosition[1] * yOffset)),
                        Float4x4.rotateY (currentPosition[0] * phi * -1),
                        Float4x4.translate (centralPoint)
                    ));
                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, centralPoint, [0, 1, 0]);
                    break;
                }
            }
            // ordinarily, webGl will automatically present and clear when we return control to the
            // event loop from the draw function, but we overrode that to have explicit control.
            // webGl still presents the buffer automatically, but the back buffer is not cleared
            // until we do it...
            let context = wgl.getContext();
            context.clear (context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
            // draw the stars scene
            let starsFov = 60;
            let starsViewMatrix = Float4x4.copy (viewMatrix);
            starsViewMatrix[12] = starsViewMatrix[13] = starsViewMatrix[14] = 0.0;
            standardUniforms.CAMERA_POSITION = [0, 0, 0];
            standardUniforms.PROJECTION_MATRIX_PARAMETER = Float4x4.perspective (starsFov, context.viewportWidth / context.viewportHeight, 1000, starSphereRadius * 1.1);
            standardUniforms.VIEW_MATRIX_PARAMETER = starsViewMatrix;
            standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.IDENTITY;
            starsScene.traverse (standardUniforms);
            // set up to draw the solar system
            standardUniforms.VIEW_MATRIX_PARAMETER = viewMatrix;
            standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.IDENTITY;
            // compute the camera position and set it in the standard uniforms
            let vmi = Float4x4.inverse (viewMatrix);
            standardUniforms.CAMERA_POSITION = [vmi[12], vmi[13], vmi[14]];
            //console.log ("CAMERA AT: " + Float3.str (standardUniforms.CAMERA_POSITION));
            // look at where the camera is and set the near and far planes accordingly
            // set up the projection matrix
            let cameraPositionDistance = Float3.norm (standardUniforms.CAMERA_POSITION);
            let moonR = solarSystem.moonR * 1.1;
            let nearPlane = Math.max (1.0e-1, cameraPositionDistance - moonR);
            let farPlane = cameraPositionDistance + moonR;
            standardUniforms.PROJECTION_MATRIX_PARAMETER = Float4x4.perspective (camera.fov, context.viewportWidth / context.viewportHeight, nearPlane, farPlane);
            solarSystemScene.traverse (standardUniforms);
            context.flush ();
            // capture and display the fps
            if (deltaTimestamp < (msPerSecond / 4)) {
                // capture our traversal time
                let traversalMs = performance.now () - now;
                let traversalMsStats = traversalMsHistory.update (traversalMs);
                let deltaTimestampStats = deltaTimestampHistory.update (deltaTimestamp);
                fpsDiv.innerHTML = (msPerSecond / deltaTimestampStats.avg).toFixed (1) + " / " + Utility.padNum ((monitorRefresh.hz / (fpsRefreshCap + 1)).toFixed (1), 3) + " fps" +
                    "<br>" + Utility.padNum (deltaNow.toFixed (1), 5, "&nbsp") + " / " + Utility.padNum (traversalMsStats.avg.toFixed (1), 5, "&nbsp") + " / " + Utility.padNum (deltaTimestampStats.avg.toFixed (1), 5, "&nbsp") + " ms" +
                    "<br>" + context.viewportWidth + " x " + context.viewportHeight
                ;
            }
            // busy wait until we get to the capped fps
            while ((fpsRefreshCap > 0) && ((performance.now () - now) < (monitorRefresh.ms * (fpsRefreshCap + 0.75)))) {
            }
        }
    };
    let buildScene = function () {
        makeBall ("ball", 72);
        makeBall ("ball-med", 36);
        makeBall ("ball-small", 8);
        makeBall ("ball-tiny", 5);
        Stars.make ("Bright Stars", -2, 6);
        Stars.make ("Dim Stars", 6, 8);
        let context = wgl.getContext();
        // a few common context details, clear color, backface culling, and blend modes
        context.clearColor (0.0, 0.0, 0.0, 1.0);
        context.enable (context.CULL_FACE);
        context.cullFace (context.BACK);
        context.blendFunc (context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
        context.enable (context.BLEND);
        // a bit of setup for lighting
        standardUniforms.AMBIENT_LIGHT_COLOR = [1.0, 1.0, 1.0];
        standardUniforms.LIGHT_COLOR = [1.0, 1.0, 1.0];
        starsScene = Node.new ({
            //enabled: false,
            state: function (standardUniforms) {
                context.disable (context.DEPTH_TEST);
                context.depthMask (false);
            }
        });
        // stars are in their own scene so they can be drawn to track the camera
        // rotate by 180 degrees on the x-axis to account for our coordinate system, then Y by 180
        // degrees to orient correctly. then flip it inside out and scale it up
        let starsTransform = Float4x4.chain (
            Float4x4.rotateX (Math.PI),
            Float4x4.rotateY (Math.PI),
            Float4x4.scale (-starSphereRadius)
        );
        let starsAlpha = 0.66;
        starsScene.addChild (Node.new ({
            //enabled: false,
            transform: Float4x4.scale (starSphereRadius),
            state: function (standardUniforms) {
                Program.get ("vertex-color").use ();
                standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
                standardUniforms.OUTPUT_ALPHA_PARAMETER = starsAlpha;
            },
            shape: "Dim Stars"
        }, "Dim Stars"));
        starsScene.addChild (Node.new ({
            //enabled: false,
            transform: Float4x4.scale (starSphereRadius),
            state: function (standardUniforms) {
                Program.get ("vertex-color").use ();
                standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
                standardUniforms.OUTPUT_ALPHA_PARAMETER = starsAlpha;
            },
            shape: "Bright Stars"
        }, "Bright Stars"));
        starsScene.addChild (Node.new ({
            //enabled: false,
            transform: starsTransform,
            state: function (standardUniforms) {
                Program.get ("texture").use ();
                standardUniforms.OUTPUT_ALPHA_PARAMETER = starsAlpha * 0.5; //starAlpha;
                standardUniforms.TEXTURE_SAMPLER = "starfield";
            },
            shape: "ball",
            children: false
        }, "starfield"));
        let sunColor = Blackbody.colorAtTemperature (5800);
        let sunNode = Node.new ({
            transform: Float4x4.IDENTITY,
            state: function (standardUniforms) {
                Program.get ("color").use ();
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
                standardUniforms.MODEL_COLOR = sunColor;
            },
            shape: "ball-med",
            children: false
        }, "sun");
        starsScene.addChild (sunNode);
        Thing.new ({
            node: "sun",
            update: function (time) {
                // get the node
                let node = Node.get (this.node);
                let R = sunDistance * solarSystem.sunR;
                let sunPosition = Float3.scale (solarSystem.sunDirection, R);
                // compute the relative scale of the sun to reflect the changing distance in our orbit
                let sunScale = (sunRadius / earthRadius) * (sunDistance / R);
                // compute the position of the sun, and update the lighting direction
                node.transform = Float4x4.multiply (Float4x4.scale (sunScale), Float4x4.translate (sunPosition));
                standardUniforms.LIGHT_DIRECTION = solarSystem.sunDirection;
            }
        }, "sun");
        // now the solar system
        solarSystemScene = Node.new ({
            state: function (standardUniforms) {
                context.enable (context.DEPTH_TEST);
                context.depthMask (true);
            }
        });
        let moonNode = Node.new ({
            transform: Float4x4.IDENTITY,
            state: function (standardUniforms) {
                Program.get ("shadowed-texture").use ()
                    .setSunPosition (solarSystem.sunPosition);
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
                standardUniforms.TEXTURE_SAMPLER = "moon";
                standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
                standardUniforms.AMBIENT_CONTRIBUTION = 0.1;
                standardUniforms.DIFFUSE_CONTRIBUTION = 0.95;
                standardUniforms.SPECULAR_CONTRIBUTION = 0.05;
                standardUniforms.SPECULAR_EXPONENT = 8.0;
            },
            shape: "ball-med",
            children: false
        }, "moon");
        solarSystemScene.addChild (moonNode);
        Thing.new ({
            node: "moon",
            update: function (time) {
                // get the node
                let node = Node.get (this.node);
                // set the moon position and orientation in transform
                node.transform = Float4x4.chain (
                    Float4x4.scale (moonScale),
                    Float4x4.rotateY (solarSystem.moonTheta),
                    //Float4x4.rotateXAxisTo (solarSystem.moonDirection),
                    Float4x4.translate (Float3.scale (solarSystem.moonDirection, solarSystem.moonR))
                );
            }
        }, "moon");
        let worldNode = Node.new ({
            transform: Float4x4.IDENTITY
        }, "world");
        solarSystemScene.addChild (worldNode);
        // add a tracking thing spinning around the earth fairly fast to pin a camera to
        worldNode.addChild (Node.new ({
            transform: Float4x4.IDENTITY,
            children: false
        }, "flyer"));
        Thing.new ({
            node: "flyer",
            update: function (time) {
                // get the node
                let node = Node.get (this.node);
                node.transform = Float4x4.chain (
                    Float4x4.scale (0.01),
                    Float4x4.translate ([50000.0 / earthRadius, 0, 0]),
                    Float4x4.rotateY (time * 4e3 * (1 / timeFactor)),
                    Float4x4.rotateZ (Utility.degreesToRadians (18))
                );
            }
        }, "flyer");
        // add a baltimore node
        /*
        worldNode.addChild (Node.new ({
            state: function (standardUniforms) {
                Program.get ("shadowed").use ().setSunPosition (solarSystem.sunPosition);
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
                standardUniforms.MODEL_COLOR = [1.00, 0.40, 0.20];
                standardUniforms.AMBIENT_CONTRIBUTION = 0.50;
                standardUniforms.DIFFUSE_CONTRIBUTION = 0.90;
            },
            transform: Float4x4.chain (
                Float4x4.scale (10),
                Float4x4.translate ([20, 0, 0]),
                Float4x4.rotateZ (Utility.degreesToRadians(39.2904)),
                Float4x4.rotateY (Math.PI + Utility.degreesToRadians(-76.6122))
            ),
            shape: "ball-small",
            children: false
        }, "baltimore"));
        */
        let earthRenderNode = Node.new ({}, "earth-parent");
        worldNode.addChild (earthRenderNode);
        earthRenderNode.addChild (Node.new ({
            state: function (standardUniforms) {
                Program.get ("earth").use ()
                    .setDayTxSampler ("earth-day")
                    .setNightTxSampler ("earth-night")
                    .setSpecularMapTxSampler ("earth-specular-map")
                    .setSunPosition (solarSystem.sunPosition)
                    .setMoonPosition (solarSystem.moonPosition)
                ;
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
            },
            shape: "ball",
            children: false
        }, "earth"));
        // clouds at 40km is a bit on the high side..., but it shows well
        let cloudHeight = (40 + earthRadius) / earthRadius;
        earthRenderNode.addChild (Node.new ({
            //enabled: false,
            transform: Float4x4.scale (cloudHeight),
            state: function (standardUniforms) {
                Program.get ("clouds").use ()
                    .setSunPosition (solarSystem.sunPosition)
                    .setMoonPosition (solarSystem.moonPosition)
                ;
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 0.90;
                standardUniforms.TEXTURE_SAMPLER = "clouds";
            },
            shape: "ball",
            children: false
        }, "clouds"));
        // atmosphere at 160km is actually in about the right place
        let atmosphereDepth = (160 + earthRadius) / earthRadius;
        earthRenderNode.addChild (Node.new ({
            transform: Float4x4.scale (atmosphereDepth),
            state: function (standardUniforms) {
                Program.get ("atmosphere").use ()
                    .setAtmosphereDepth (atmosphereDepth - 1.0)
                    .setSunPosition (solarSystem.sunPosition)
                    .setMoonPosition (solarSystem.moonPosition)
                ;
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 0.5;
            },
            shape: "ball",
            children: false
        }, "atmosphere"));
        Thing.new ({
            node: "world",
            update: function (time) {
                // get the node
                let gmst = computeGmstFromJ2000 (time);
                Node.get (this.node).transform = Float4x4.rotateY (Utility.degreesToRadians (gmst));
            }
        }, "world");
    };
    let handleMouseDeltaPosition = function (deltaPosition) {
        let settings = cameraSettings[camera.name];
        if ((deltaPosition[2] !== 0) && ("wheel" in camera)) {
            let minmax = (camera.wheel.inc > 0) ? { min: "min", max: "max" } : { min: "max", max: "min" };
            if (deltaPosition[2] > 0) {
                camera[camera.wheel.field] = Math[minmax.min] (camera[camera.wheel.field] + camera.wheel.inc, camera.wheel.limitUp);
            } else {
                camera[camera.wheel.field] = Math[minmax.max] (camera[camera.wheel.field] - camera.wheel.inc, camera.wheel.limitDown);
            }
        }
        // prepare to scale the y control to match the x control velocity based on the screen aspect ratio
        let aspect = 1;//mainCanvasDiv.clientWidth / mainCanvasDiv.clientHeight;
        switch (camera.type) {
            case "target":
            case "portrait":
            case "orbit": {
                // update the current controller position and clamp or wrap accordingly
                let currentPosition = Float2.add (settings.currentPosition, [deltaPosition[0], -aspect * deltaPosition[1]]);
                currentPosition[0] = Utility.unwind (currentPosition[0], 2);
                currentPosition[1] = Math.max (Math.min (currentPosition[1], 0.9), -0.9);
                settings.currentPosition = currentPosition;
                break;
            }
            case "ots": {
                // update the current controller position and clamp or wrap accordingly
                let currentPosition = Float2.add (settings.currentPosition, [deltaPosition[0] * 3.0, -aspect * deltaPosition[1] * 0.75]);
                currentPosition[0] = Math.max (Math.min (currentPosition[0], 1.0), -1.0);
                currentPosition[1] = Math.max (Math.min (currentPosition[1], 1.0), -1.0);
                settings.currentPosition = currentPosition;
                break;
            }
        }
    };
    let camera;
    let cameraDiv;
    let setCamera = function (cameraIndex) {
        // increment the current camera
        currentCameraIndex = cameraIndex;
        camera = cameras[currentCameraIndex];
        cameraDiv.innerHTML = camera.name;
        // make sure there is a value for the current position (once per "at")
        if (!(camera.name in cameraSettings)) {
            cameraSettings[camera.name] = { currentPosition: ("default" in camera) ? camera.default : [0, 0] };
        }
    }
    let handleCameraClick = function (event) {
        // increment the current camera index and set it
        setCamera ((currentCameraIndex + 1) % cameras.length);
    }
    let handleFpsClick = function (event) {
        // increment the current camera index and set it
        fpsRefreshCap = (fpsRefreshCap + 1) % 6;
    }
    let countdownTimeout;
    let startRendering = function () {
        clearTimeout(countdownTimeout);
        // start drawing frames
        setCamera (0);
        window.requestAnimationFrame (drawFrame);
        setTimeout (() => {
            document.getElementById (loadingDivId).style.opacity = 0;
        }, 50);
    };
    let randomNames = [
        "Andromeda", "Antlia", "Apus", "Aquarius", "Aquila", "Ara", "Aries", "Auriga", "Bootes",
        "Caelum", "Camelopardalis", "Cancer", "Canes Venatici", "Canis Major", "Canis Minor",
        "Capricornus", "Carina", "Cassiopeia", "Centaurus", "Cepheus", "Cetus", "Chamaeleon",
        "Circinus", "Columba", "Coma Berenices", "Corona Australis", "Corona Borealis",
        "Corvus", "Crater", "Crux", "Cygnus", "Delphinus", "Dorado", "Draco", "Equuleus",
        "Eridanus", "Fornax", "Gemini", "Grus", "Hercules", "Horologium", "Hydra", "Hydrus",
        "Indus", "Lacerta", "Leo", "Leo Minor", "Lepus", "Libra", "Lupus", "Lynx", "Lyra",
        "Mensa", "Microscopium", "Monoceros", "Musca", "Norma", "Octans", "Ophiuchus", "Orion",
        "Pavo", "Pegasus", "Perseus", "Phoenix", "Pictor", "Pisces", "Piscis Austrinus",
        "Puppis", "Pyxis", "Reticulum", "Sagitta", "Sagittarius", "Scorpius", "Sculptor",
        "Scutum", "Serpens", "Sextans", "Taurus", "Telescopium", "Triangulum",
        "Triangulum Australe", "Tucana", "Ursa Major", "Ursa Minor", "Vela", "Virgo", "Volans",
        "Vulpecula"
    ];
    let countdown = function (timeout) {
        countdownTimeout = setTimeout(function () {
            countdown (300);
            let randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
            document.getElementById (loadingDivId).innerHTML = "<span style=\"margin-top: 25%;text-align: center;\">" + randomName + "</span>";
        }, timeout);
    };
    countdown (2000);
    // do this when the window load finishes...
    mainCanvasDiv = document.getElementById (mainCanvasDivId);
    PointerTracker.new ({ elementId: mainCanvasDivId, onReady: OnReady.new (null, handleMouseDeltaPosition), stepSize: 0.0025 });
    // extract the divs we want to concern ourselves with
    fpsDiv = document.getElementById (fpsDivId);
    fpsDiv.addEventListener ("click", handleFpsClick);
    cameraDiv = document.getElementById (cameraDivId);
    cameraDiv.addEventListener ("click", handleCameraClick);
    // create the render context
    render = Render.new ({
        canvasDivId: mainCanvasDivId,
        loaders: [
            LoaderShader.new ("https://astro.irdev.us/shaders/@.glsl")
                .addFragmentShaders (["earth", "clouds", "atmosphere", "shadowed", "shadowed-texture", "hardlight"]),
            LoaderPath.new ({ type: Texture, path: "https://astro.irdev.us/textures/@.png" })
                .addItems (["clouds", "earth-day", "earth-night", "earth-specular-map", "moon", "satellite"], { generateMipMap: true }),
            LoaderPath.new ({ type: Texture, path: "https://astro.irdev.us/textures/@.jpg" })
                .addItems ("starfield"),
            LoaderPath.new ({ type: TextFile, path: "https://astro.irdev.us/data/@.json" })
                .addItems (["bsc5-short", "messier"]),
            Loader.new ()
                // proxy to get around the CORS problem
                //.addItem (TextFile, "elements", { url: "https://bedrock.brettonw.com/api?event=fetch&url=https://www.celestrak.com/NORAD/elements/gp.php%3FGROUP%3Dactive%26FORMAT%3Dtle" })
                .addItem (TextFile, "elements", { url: "data/gp.tle" })
        ],
        onReady: OnReady.new (null, function (x) {
            Program.new ({ vertexShader: "basic" }, "earth");
            Program.new ({ vertexShader: "basic" }, "clouds");
            Program.new ({ vertexShader: "basic" }, "atmosphere");
            Program.new ({ vertexShader: "basic" }, "shadowed");
            Program.new ({ vertexShader: "basic" }, "shadowed-texture");
            Program.new ({ vertexShader: "basic" }, "hardlight");
            // set up the scene and go
            buildScene ();
            onReadyCallback ($);
            measureMonitorRefreshRate (startRendering);
        })
    });
    $.updateVis = function (idsToShow, timeToShow) {
        LogLevel.info ("Update Vis called with " + idsToShow.length + " elements, at " + timeToShow.toString());
        this.addTle (idsToShow);
        // XXX set the time separately...
    };
    return $;
};
