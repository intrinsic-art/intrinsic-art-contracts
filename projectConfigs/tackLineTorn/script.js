/* eslint-disable */
let seed, imageDimension, referenceRatio, referenceDimension = 1e3;

function setup() {
    seed = parseInt(artwork.seed.slice(0, 16), 16), referenceRatio = (imageDimension = Math.min(windowWidth, windowHeight)) / referenceDimension, createCanvas(imageDimension, imageDimension), getArt()
}

function getArt() {
    let e, n, a, r, i, $, _, g, o;
    switch (artwork.traits.complexity) {
        case "minimal":
            g = range(1, 4);
            break;
        case "balanced":
            g = range(16, 24);
            break;
        case "complex":
            g = range(40, 48)
    }
    switch (colorMode(HSB, 360, 100, 100, 100), push(), artwork.traits.palette) {
        case "warm":
            o = range(270, 450) % 360;
            break;
        case "cool":
            o = range(91, 269);
            break;
        case "mixed":
            o = range(0, 360)
    }
    background(o, rangeFloor(60, 100), rangeFloor(80, 100)), a = range(-1, 1), r = range(-.5, .5), i = range(-1, 1), $ = range(-1, 1), n = range(.05, .8) * imageDimension, _ = 0;
    for (let t = 0; t < g; t++) {
        switch (push(), artwork.traits.palette) {
            case "warm":
                o = range(270, 450) % 360;
                break;
            case "cool":
                o = range(91, 269);
                break;
            case "mixed":
                o = (o + range(140, 220)) % 360
        }
        switch (stroke(e = color(o, 100, 100, 15)), strokeWeight(.001 * imageDimension), angleMode(DEGREES), artwork.traits.organization) {
            case "chaotic":
                a = range(-1, 1), r = range(-.5, .5), i = range(-1, 1), $ = range(-1, 1), n = range(.05, .8) * imageDimension, _ = range(0, .01);
                break;
            case "ordered":
                break;
            case "emergent":
                a = range(-1, 1), r = range(-.5, .5), i = range(-1, 1), $ = range(-1, 1), n = range(.05, .8) * imageDimension
        }
        translate(range(0, imageDimension), range(0, imageDimension));
        for (let c = 0; c < 2 * referenceDimension; c++) push(), rotate(c * a * range(1 - 2 * _, 1 + 2 * _)), line(0, 0, 0, n * range(1 - _, 1 + _)), pop(), rotate(r), translate(i * referenceRatio * range(1 - _, 1 + _), $ * referenceRatio * range(1 - _, 1 + _));
        pop()
    }
    return canvas.toDataURL()
}

function rnd() {
    return seed ^= seed << 13, seed ^= seed >> 17, ((seed ^= seed << 5) < 0 ? 1 + ~seed : seed) % 1e3 / 1e3
}

function range(e, n) {
    return void 0 === n && (n = e, e = 0), rnd() * (n - e) + e
}

function rangeFloor(e, n) {
    return void 0 === n && (n = e, e = 0), Math.floor(range(e, n))
}