/* eslint-disable */
// p5.js 1.0 dependency
console.log("Metta v4.1 © 2023 Matto");
console.log(`TOKEN ID: ${artwork.tokenID}`);
console.log(`TOKEN ENTROPY: ${artwork.seed}`);
console.log("");
let tokenId = artwork.tokenID;
let tokenEntropy = artwork.seed;
let tokenEntropyPairs = createPairs(tokenEntropy);
let p = [];
let matte = 16;
let hue,
  u,
  nodes,
  freeze,
  reach,
  connections,
  thickness,
  fade,
  cellDesign,
  cellColorMode,
  gradientShift,
  seekerNodeMod; // burst, attraction
let paused = true;
let count = 0;
let R = (a = 1) => Math.floor(random() * a);

function setup() {
  let width, height;
  if (window.innerWidth > window.innerHeight) {
    width = window.innerWidth;
    height = width * 0.5625;
    if (height > window.innerHeight) {
      height = window.innerHeight;
      width = height / 0.5625;
    }
  } else {
    height = window.innerHeight;
    width = height * 0.5625;
    if (width > window.innerWidth) {
      width = window.innerWidth;
      height = width / 0.5625;
    }
  }

  ///////////////////////////////////////////////////////////////// Canvas setup
  const canvas = createCanvas(width, height);
  // canvas.parent("canvas-container"); 
  colorMode(HSL, 360, 100, 100);
  let seed =
    getValue(0, 255) * getValue(0, 255) * getValue(0, 255) * getValue(0, 255);
  randomSeed(seed);
  hue = getValue(1, 18) * 20;

  // Intrinsic Artwork string handling
  nodes =
    artwork.traits.nodes == "minimum"
      ? 5
      : artwork.traits.nodes == "low"
      ? 20
      : artwork.traits.nodes == "medium"
      ? 60
      : 125;
  connections =
    artwork.traits.connections == "low"
      ? 2
      : artwork.traits.connections == "medium"
      ? 4
      : 10;
  thickness =
    artwork.traits.thickness == "micron003"
      ? 0
      : artwork.traits.thickness == "micron01"
      ? 1
      : 2;
  fade = artwork.traits.fade == "yes" ? true : false;
  cellDesign =
    artwork.traits.cellDesign == "linesAndWalls"
      ? 0
      : artwork.traits.cellDesign == "startrail"
      ? 1
      : artwork.traits.cellDesign == "popcorn"
      ? 2
      : artwork.traits.cellDesign == "shards"
      ? 3
      : 4;
  cellColorMode =
    artwork.traits.cellColorMode == "triX"
      ? 0
      : artwork.traits.cellColorMode == "synchronized"
      ? 1
      : artwork.traits.cellColorMode == "agreeToDisagree"
      ? 2
      : 3;
  ringColorMode =
    artwork.traits.ringColorMode == "invisible"
      ? 2
      : artwork.traits.ringColorMode == "triX"
      ? 0
      : 1;
  reach = artwork.traits.reach == "low" ? 0 : artwork.traits.reach == "medium" ? 1 : 2;

  
  gradientShift = getValue(0, 360);
  freeze = 95;
  frameRate(freeze);
  seekerNodeMod = nodes == 5 ? 3 : Math.floor(nodes / 2);
  u = ((thickness + 1) * (window.innerHeight + window.innerWidth)) / 4000;

  if (fade) {
    background(10);
  } else {
    background(0);
  }

  for (let i = 0; i < nodes; i++) {
    p.push({
      x: R(width * 1.5) - width / 4,
      y: R(height * 1.5) - height / 4,
      r: 0,
      c: [R(70) + 20, R(90) + 10],
    });
    if (i == 0) {
      if (cellColorMode == 0) {
        console.log("(Palette: B/W)");
      } else if (cellColorMode == 3) {
        console.log("(Palette: Gradient)");
      } else {
        console.log("(Primary Hue: " + hue + ")");
        if (cellColorMode == 2) {
          console.log("(Secondary Hue: " + ((hue + 180) % 360) + ")");
        }
      }
    }
  }
}

function draw() {
  if (!paused || count < freeze) {
    count++;
    count < freeze ? frameRate(freeze - count + 3) : frameRate(30);
    if (fade) {
      fill(0, 100, 0, 1 / 50);
      noStroke();
      rect(0, 0, width, height);
    }
    noFill();
    for (let i = 0; i < 1000; i++) {
      let x = R(width);
      let y = R(height);
      let d = width ** 3;
      let c;
      let t;
      for (let j = 0; j < p.length; j++) {
        t = dist(x, y, p[j].x, p[j].y);
        if (t < d) {
          d = t;
          c = j;
        }
      }
      strokeWeight(0.5 * u);
      let drawHue, drawSat;
      if (cellColorMode == 0) {
        // B/W Mono
        drawHue = hue;
        drawSat = 0;
      } else if (cellColorMode == 1) {
        // Hue Mono
        drawHue = hue;
        drawSat = p[c].c[0];
      } else if (cellColorMode == 2) {
        // Dual Hue
        if (c % 2 == 0) {
          drawHue = hue;
          drawSat = p[c].c[0];
        } else {
          drawHue = (hue + 180) % 360;
          drawSat = p[c].c[0];
        }
      } else if (cellColorMode == 3) {
        // Gradient
        if (tokenId % 3 == 0) {
          drawHue = (p[c].x / width) * 360 + gradientShift;
          drawSat = p[c].c[0];
        } else if (tokenId % 3 == 1) {
          drawHue = (p[c].y / height) * 360 + gradientShift;
          drawSat = p[c].c[0];
        } else {
          drawHue =
            ((p[c].x + p[c].y) / (width + height)) * 360 + gradientShift; // Matto fix this
          drawSat = p[c].c[0];
        }
      }

      stroke(drawHue, drawSat, p[c].c[1]);

      let dx = p[c].x - x;
      let dy = p[c].y - y;
      let mag = Math.sqrt(dx * dx + dy * dy) * 20;

      let midX = p[c].x + 0.75 * (x - p[c].x);
      let midY = p[c].y + 0.75 * (y - p[c].y);
      let extX = p[c].x + 1.1 * (x - p[c].x);
      let extY = p[c].y + 1.1 * (y - p[c].y);
      let unitX = dx / mag;
      let unitY = dy / mag;
      let perpX1 = -unitY;
      let perpY1 = unitX;
      let perpX2 = unitY;
      let perpY2 = -unitX;

      let offset =
        cellDesign == 1
          ? mag / 20 // Arcs
          : cellDesign == 0
          ? mag / 30 // tangents
          : mag / 40; // shards

      // Use the perpendicular vectors to find the two triangle points
      let triX1 = x + perpX1 * offset;
      let triY1 = y + perpY1 * offset;

      let triX2 = x + perpX2 * offset;
      let triY2 = y + perpY2 * offset;

      if (cellDesign == 0) {
        // lines and walls
        if (reach == 0) {
          line(p[c].x, p[c].y, midX, midY);
        } else if (reach == 1) {
          line(p[c].x, p[c].y, x, y);
        } else {
          line(p[c].x, p[c].y, extX, extY);
        }
        // adds tangent
        line(triX1, triY1, triX2, triY2);
      } else if (cellDesign == 1) {
        // arcs
        let arcD;
        if (reach == 0) {
          arcD = 0.75 * d;
        } else if (reach == 1) {
          arcD = d;
        } else {
          arcD = 1.25 * d;
        }
        let startAngle = Math.atan2(triY1 - p[c].y, triX1 - p[c].x);
        let endAngle = Math.atan2(triY2 - p[c].y, triX2 - p[c].x);
        arc(p[c].x, p[c].y, 2 * arcD, 2 * arcD, startAngle, endAngle);
      } else if (cellDesign == 2) {
        // circles
        fill(drawHue, drawSat, p[c].c[1]);
        if (reach == 0) {
          circle(midX, midY, 1.5 * u);
        } else if (reach == 1) {
          circle(x, y, 1.5 * u);
        } else {
          circle(extX, extY, 1.5 * u);
        }
        noFill();
      } else if (cellDesign == 3) {
        // shards
        let reduction = reach == 0 ? 0.7 : 0.9;
        if (reach < 2) {
          triX1 = p[c].x + reduction * (triX1 - p[c].x);
          triY1 = p[c].y + reduction * (triY1 - p[c].y);
          triX2 = p[c].x + reduction * (triX2 - p[c].x);
          triY2 = p[c].y + reduction * (triY2 - p[c].y);
        }
        if (reach == 0) {
          quad(p[c].x, p[c].y, triX1, triY1, midX, midY, triX2, triY2);
        } else if (reach == 1) {
          quad(p[c].x, p[c].y, triX1, triY1, x, y, triX2, triY2);
        } else {
          quad(midX, midY, triX1, triY1, extX, extY, triX2, triY2);
        }
      }
      if (d > p[c].r) {
        p[c].r = d;
        strokeWeight((50 / p[c].r) * u);
        if (ringColorMode < 2) {
          // Nothing drawn if ringColorMode == 2
          if (ringColorMode == 0) {
            // B/W
            stroke(0, 0, p[c].c[1]);
          } else if (ringColorMode == 1) {
            // Single hue
            stroke(hue, p[c].c[0], p[c].c[1]);
          }
          circle(p[c].x, p[c].y, 2 * p[c].r);
        }
      }
    }
    moveTowardNClosest(connections);
  }
}

function moveTowardNClosest(n) {
  for (let i = 0; i < p.length; i++) {
    let distances = [];

    // Calculate all distances
    for (let j = 0; j < p.length; j++) {
      if (i !== j) {
        // Don't compare a point with itself
        let d = dist(p[i].x, p[i].y, p[j].x, p[j].y);
        distances.push({ dist: d, point: p[j] });
      }
    }

    // Sort the distances
    distances.sort((a, b) => a.dist - b.dist);
    let closestDist = distances[0].dist;
    strokeWeight(2 * u);
    circle(p[i].x, p[i].y, 3 * u);
    for (let k = 0; k < n && k < distances.length; k++) {
      let fraction = u / Math.pow(1.5, k); // Reduce the influence and stroke weight for each successive point
      line(p[i].x, p[i].y, distances[k].point.x, distances[k].point.y);
      strokeWeight(fraction * u);
      let moveFraction = 1 / (500 * Math.pow(2, k)); // Reduce the move fraction for farther points
      if (i != 0 && i % seekerNodeMod == 0) {
        moveFraction = moveFraction * 10;
      }
      p[i].x += (distances[k].point.x - p[i].x) * moveFraction;
      p[i].y += (distances[k].point.y - p[i].y) * moveFraction;
    }

    // Check if the point is very close to its nearest neighbor
    if (closestDist <= 5) {
      p[i].x = R(width * 1.5) - width / 4;
      p[i].y = R(height * 1.5) - height / 4;
      p[i].r = 0;
      if (i == 0) {
        let newHue = tokenId % 2 == 0 ? hue - 10 : hue + 10;
        if (newHue < 0) {
          newHue = 360 + newHue;
        } else if (newHue > 360) {
          newHue = newHue - 360;
        }
        hue = newHue;
        console.log("(New hue: " + hue + ")");
      }
      p[i].c = [R(70) + 20, R(90) + 10];
    }
  }
}

// Entropy //
function createPairs(input) {
  let h = [];
  for (let i = 0; i < (input.length - 2) / 2; i++) {
    h.push(parseInt(input.slice(2 + i * 2, 4 + i * 2), 16));
  }
  return h;
}

function getValue(min, max) {
  if (tokenEntropyPairs.length === 0) {
    throw new Error("No entropy values left in tokenEntropyPairs.");
  }

  // Adjust the scaling factor to be 0-255:
  let scaleFactor = (max - min + 1) / 256;
  let x = Math.floor(tokenEntropyPairs[0] * scaleFactor + min);
  tokenEntropyPairs.shift();
  return x;
}

function doubleClicked() {
  paused = !paused;
}

function keyPressed() {
  if (key === "p" || key === "P") {
    paused = !paused;
  } else if (key === "s" || key === "S") {
    saveCanvas(`Community-${tokenId}_${tokenEntropy}`, "png");
  } else if (key === "<") {
    if (matte != 0) {
      matte--;
    } else {
      matte = 16;
    }
    updateMatte();
  } else if (key === ">") {
    if (matte != 16) {
      matte++;
    } else {
      matte = 0;
    }
    updateMatte();
  }
  return false;
}

function updateMatte() {
  document.body.style.backgroundColor = `rgb(${matte * 16},${matte * 16},${
    matte * 16
  })`;
}