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

    // XXX this stuff should be computed based on the time scale?

    // time helpers
    const msPerSecond = 1.0e3;
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerDay = 24;
    const daysLookAhead = 0.5;
    const minutesPerTimeStep = 1;//5;

    // time steps
    const timeStep = msPerSecond * secondsPerMinute * minutesPerTimeStep;
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
        let nowTime = parameters.nowTime;
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
            let deltaTime = Math.max(0, nowTime - element.startTime);
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
        let nowTime = getOffsetTime (performance.now());
        tle = Tle.new ({ elements: elements, nowTime: nowTime });
        tle.updateElements (nowTime, tleNode.instanceTransforms.matrices, Number.POSITIVE_INFINITY);
    }
};
