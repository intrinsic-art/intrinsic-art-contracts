/* eslint-disable */
console.log("Metta v5.2.0 © 2023 Matto");
console.log(`TOKEN ID: ${artwork.tokenID}. TOKEN ENTROPY: ${artwork.seed}. TRAITS:`);
console.log(artwork.traits);
// p5.disableFriendlyErrors = true; // disables FES if nonminified p5 is loaded
let tokenEntropy = artwork.seed;
let tokenEntropyPairs = createPairs(tokenEntropy);
let seed =
  getValue(0, 255) * getValue(0, 255) * getValue(0, 255) * getValue(0, 255);

let R = (upperBound = 1) => Math.floor(mRando() * upperBound);

function mRando(max = 1) {
  // let aR = 1664525;
  // let cR = 1013904223;
  // let mR = 4294967296; // Math.pow(2, 32);
  // seed = (aR * seed + cR) % mR;
  // return (seed / mR) * max;
  seed = (1664525 * seed + 1013904223) % 4294967296;
  return (seed / 4294967296) * max;
}

let attributes = []; // won't need for intrinsic
let p = [];
let matte = 16;
let hue,
  width,
  height,
  canvas,
  u,
  rando,
  nodes,
  mode,
  chaos,
  freeze,
  veiled,
  cellDynamic,
  connections,
  thickness,
  fade,
  cellDesign,
  colorMode,
  gradientShift,
  seekerNodeMod;
const urlParams = new URLSearchParams(window.location.search);
const portrait = urlParams.get("portrait");
let paused = true;
let count = 0;
let lastTime = 0;
setup();
requestAnimationFrame(draw);

function setup() {
  if (portrait == "true") {
    height = window.innerHeight;
    width = height * 0.5625;
    if (width > window.innerWidth) {
      width = window.innerWidth;
      height = width / 0.5625;
    }
  } else {
    width = window.innerWidth;
    height = width * 0.5625;
    if (height > window.innerHeight) {
      height = window.innerHeight;
      width = height / 0.5625;
    }
  }

  
  // if (window.innerWidth > window.innerHeight) {
  //   width = window.innerWidth;
  //   height = width * 0.5625;
  //   if (height > window.innerHeight) {
  //     height = window.innerHeight;
  //     width = height / 0.5625;
  //   }
  // } else {
  //   height = window.innerHeight;
  //   width = height * 0.5625;
  //   if (width > window.innerWidth) {
  //     width = window.innerWidth;
  //     height = width / 0.5625;
  //   }
  // }

  canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  // document.getElementById("canvas-container").appendChild(canvas);
  document.querySelector("body").appendChild(canvas);
  ctx = canvas.getContext("2d");
  // const ratio = window.devicePixelRatio;
  // canvas.width = canvas.offsetWidth * ratio;
  // canvas.height = canvas.offsetHeight * ratio;
  // ctx.scale(ratio, ratio);
  hue = getValue(1, 18) * 20;
  rando = getValue(0, 255) * getValue(0, 255); // used for gradient, in place of tokenID, ranges from 0 to 65,025
  nodes = parseInt(artwork.traits.nodes, 10);
  connections = parseInt(artwork.traits.connections, 10);
  if (connections > nodes) {
    connections = nodes - 1;
  }
  thickness = parseInt(artwork.traits.thickness, 10);
  mode = parseInt(artwork.traits.mode, 10);
  fade = mode % 3 == 0 ? true : false;
  chaos = mode > 2 ? true : false;
  veiled = mode == 2 ? true : false;
  cellDesign = parseInt(artwork.traits.cellDesign, 10);
  colorMode = parseInt(artwork.traits.colorMode, 10);
  cellDynamic = parseInt(artwork.traits.cellDynamic, 10);

  readOutAttributes(); // won't need for intrinsic

  gradientShift = getValue(0, 360);
  freeze = 95;
  seekerNodeMod = chaos == true ? 1 :
    nodes == 5 ? 3 : 
    Math.floor(nodes / 2);
  u = ((thickness + 1) * (window.innerHeight + window.innerWidth)) / 2000; ////////////////////////////

  if (fade) {
    ctx.fillStyle = `hsl(0, 0%, 10%)`; // background(10);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (let i = 0; i < nodes; i++) {
    p.push({
      x: R(width * 1.5) - width / 4,
      y: R(height * 1.5) - height / 4,
      r: 0,
      c: [R(70) + 20, R(90) + 10],
    });
    if (i == 0) {
      if (colorMode == 0) {
        // console.log("(Palette: B/W)");
      } else if (colorMode == 3) {
        // console.log("(Palette: Gradient)");
      } else {
        console.log("(Primary Hue: " + hue + ")");
        if (colorMode == 2) {
          console.log("(Secondary Hue: " + ((hue + 180) % 360) + ")");
        }
      }
    }
  }
}

function draw(timestamp) {
  // Calculate the elapsed time since the last frame
  let elapsedTime = timestamp - lastTime;

  // Determine the desired delay for the target framerate
  let targetDelay = count < freeze ? 1000 / (freeze - count + 3) : 1000 / 30;

  // If the elapsed time is greater than the target delay, update the frame
  if (elapsedTime > targetDelay) {
    lastTime = timestamp;

    if (!paused || count < freeze) {
      count++;
      if (fade) {
        ctx.fillStyle = `hsla(0, 0%, 0%, 2%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // fill(0, 100, 0, 0.02); // 1/50
        // noStroke();
        // rect(0, 0, width, height);
      }
      // noFill();
      for (let i = 0; i < 1000; i++) {
        let x = R(width);
        let y = R(height);
        let d = width * height;
        let c;
        let t;
        for (let j = 0; j < p.length; j++) {
          t = Math.sqrt((x - p[j].x) ** 2 + (y - p[j].y) ** 2);
          // t = dist(x, y, p[j].x, p[j].y);
          if (t < d) {
            d = t;
            c = j;
          }
        }
        // strokeWeight(0.5 * u);
        ctx.lineWidth = 0.5 * u;

        // defaults, Hue Mono when colorMode == 1
        let drawHue = hue;
        let drawSat = p[c].c[0];

        if (colorMode == 0) {
          // B/W Mono
          drawSat = 0;
        } else if (colorMode == 2) {
          // Dual Hue
          if (c % 2 == 0) {
            drawHue = (hue + 180) % 360;
          }
        } else if (colorMode == 3) {
          // Gradient
          if (rando % 2 == 0) {
            drawHue = (p[c].x / width) * 360 + gradientShift;
          } else {
            drawHue = (p[c].y / height) * 360 + gradientShift;
          }
        }

        ctx.strokeStyle = `hsl(${drawHue}, ${drawSat}%, ${p[c].c[1]}%)`;
        ctx.fillStyle = `hsl(${drawHue}, ${drawSat}%, ${p[c].c[1]}%)`;
        // stroke(drawHue, drawSat, p[c].c[1]);

        let dx = p[c].x - x;
        let dy = p[c].y - y;
        let mag = Math.sqrt(dx * dx + dy * dy) * 20;

        let midX = p[c].x + 0.75 * (x - p[c].x);
        let midY = p[c].y + 0.75 * (y - p[c].y);
        let extX = p[c].x + 1.1 * (x - p[c].x);
        let extY = p[c].y + 1.1 * (y - p[c].y);
        // let unitX = dx / mag;
        // let unitY = dy / mag;
        // let perpX1 = -dy / mag;
        // let perpY1 = dx / mag;
        // let perpX2 = dy / mag;
        // let perpY2 = -dx / mag;

        let offset =
          cellDesign == 1
            ? mag / 20 // Arcs
            : cellDesign == 0
            ? mag / 30 // tangents
            : mag / 40; // shards

        // Use the perpendicular vectors to find the two triangle points
        let triX1 = x + (-dy / mag) * offset;
        let triY1 = y + (dx / mag) * offset;

        let triX2 = x + (dy / mag) * offset;
        let triY2 = y + (-dx / mag) * offset;

        // cellDesign=0; // testing override

        if (cellDesign == 0) {
          // lines and walls

          // Setting stroke style based on your p5 stroke settings
          // ctx.strokeStyle = `hsl(${drawHue}, ${drawSat}%, ${p[c].c[1]}%)`;
          // ctx.lineWidth = 0.5 * u;

          // Drawing the main line
          ctx.beginPath();
          ctx.moveTo(p[c].x, p[c].y);
          if (cellDynamic == 0) {
            ctx.lineTo(midX, midY);
          } else if (cellDynamic == 1) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(extX, extY);
          }
          ctx.stroke();

          // Drawing the tangent line
          ctx.beginPath();
          ctx.moveTo(triX1, triY1);
          ctx.lineTo(triX2, triY2);
          ctx.stroke();
        } else if (cellDesign == 1) {
          // arcs
          let arcD;
          if (cellDynamic == 0) {
            arcD = 0.75 * d;
          } else if (cellDynamic == 1) {
            arcD = d;
          } else {
            arcD = 1.25 * d;
          }
          let startAngle = Math.atan2(triY1 - p[c].y, triX1 - p[c].x);
          let endAngle = Math.atan2(triY2 - p[c].y, triX2 - p[c].x);
          // draw an arc with standard js canvas functions

          ctx.beginPath();
          ctx.arc(p[c].x, p[c].y, arcD, startAngle, endAngle);
          ctx.stroke();

          // arc(p[c].x, p[c].y, 2 * arcD, 2 * arcD, startAngle, endAngle);
        } else if (cellDesign == 2) {
          // circles
          ctx.fillStyle = `hsl(${drawHue}, ${drawSat}%, ${p[c].c[1]}%)`;
          // fill(drawHue, drawSat, p[c].c[1]);

          // ctx.beginPath();
          if (cellDynamic == 0) {
            // ctx.beginPath();
            C(midX, midY, 1.5 * u);
            // ctx.arc(midX, midY, 1.5 * u, 0, 2 * Math.PI);
            // ctx.fill;
            // circle(midX, midY, 1.5 * u);
          } else if (cellDynamic == 1) {
            // ctx.beginPath();
            C(x, y, 1.5 * u);
            // ctx.arc(x, y, 1.5 * u, 0, 2 * Math.PI);
            // ctx.fill;
            // circle(x, y, 1.5 * u);
            // circle(x, y, 1.5 * u);
          } else {
            // ctx.beginPath();
            C(extX, extY, 1.5 * u);
            // ctx.arc(extX, extY, 1.5 * u, 0, 2 * Math.PI);
            // ctx.fill;
            // circle(extX, extY, 1.5 * u);
          }
          // ctx.fill;
          // noFill();
        } else if (cellDesign == 3) {
          // shards
          let reduction = cellDynamic == 0 ? 0.7 : 0.9;
          if (cellDynamic < 2) {
            triX1 = p[c].x + reduction * (triX1 - p[c].x);
            triY1 = p[c].y + reduction * (triY1 - p[c].y);
            triX2 = p[c].x + reduction * (triX2 - p[c].x);
            triY2 = p[c].y + reduction * (triY2 - p[c].y);
          }

          ctx.beginPath();
          if (cellDynamic == 0) {
            // ctx.beginPath();
            ctx.moveTo(p[c].x, p[c].y);
            ctx.lineTo(triX1, triY1);
            ctx.lineTo(midX, midY);
            ctx.lineTo(triX2, triY2);
            // ctx.closePath();
            // ctx.stroke();

            // quad(p[c].x, p[c].y, triX1, triY1, midX, midY, triX2, triY2);
          } else if (cellDynamic == 1) {
            // ctx.beginPath();
            ctx.moveTo(p[c].x, p[c].y);
            ctx.lineTo(triX1, triY1);
            ctx.lineTo(x, y);
            ctx.lineTo(triX2, triY2);
            // ctx.closePath();
            // ctx.stroke();

            // quad(p[c].x, p[c].y, triX1, triY1, x, y, triX2, triY2);
          } else {
            // ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(triX1, triY1);
            ctx.lineTo(extX, extY);
            ctx.lineTo(triX2, triY2);
            // ctx.closePath();
            // ctx.stroke();

            // quad(midX, midY, triX1, triY1, extX, extY, triX2, triY2);
          }
          ctx.closePath();
          ctx.stroke();
        }
        // Rings
        if (d > p[c].r) {
          p[c].r = d;
          ctx.lineWidth = (50 / p[c].r) * 3 * u; //////////////////////////////////////
          // strokeWeight((50 / p[c].r) * u);
          if (colorMode < 2) {
            // Nothing drawn if colorMode == 2
            if (colorMode == 0) {
              // B/W
              ctx.strokeStyle = `hsl(0, 0%, ${p[c].c[1]}%)`;
              // stroke(0, 0, p[c].c[1]);
            } else {
              drawHue = hue;
              // if (colorMode == 2 && c % 2 == 0) {
              //   drawHue = (hue + 180) % 360;
              // }
              ctx.strokeStyle = `hsl(${hue}, ${p[c].c[0]}%, ${p[c].c[1]}%)`;
            }
            C(p[c].x, p[c].y, p[c].r, 0);
            // ctx.beginPath();
            // ctx.arc(p[c].x, p[c].y, p[c].r, 0, 2 * Math.PI);
            // ctx.stroke();

            // circle(p[c].x, p[c].y, 2 * p[c].r);
          }
        }
      }
      moveTowardNClosest(connections);
    }
  }

  requestAnimationFrame(draw);
}

function moveTowardNClosest(n) {
  for (let i = 0; i < p.length; i++) {
    let distances = [];

    // Calculate all distances
    for (let j = 0; j < p.length; j++) {
      if (i !== j) {
        // Don't compare a point with itself
        // use standerd js for dist
        let d = Math.sqrt((p[i].x - p[j].x) ** 2 + (p[i].y - p[j].y) ** 2);
        // let d = dist(p[i].x, p[i].y, p[j].x, p[j].y);
        distances.push({ dist: d, point: p[j] });
      }
    }

    // Sort the distances
    distances.sort((a, b) => a.dist - b.dist);
    let closestDist = distances[0].dist;
    if (!veiled) {
      ctx.lineWidth = .5 * u; //////////////////////////////////////
      // strokeWeight(2 * u);
  
      C(p[i].x, p[i].y, 2 * u); // or should this be 1.5 to match prior? /////////////////////////
      // ctx.beginPath();
      // ctx.arc(p[i].x, p[i].y, 1.5 * u, 0, 2 * Math.PI);
      // ctx.stroke();
      // ctx.fill();
  
      // circle(p[i].x, p[i].y, 3 * u);
    }

    for (let k = 0; k < n && k < distances.length; k++) {
      let fraction = u / (3 * Math.pow(1.5, k)); // Reduce the influence and stroke weight for each successive point ///////////////////////
      if (!veiled) {
        ctx.beginPath();
        ctx.moveTo(p[i].x, p[i].y);
        ctx.lineTo(distances[k].point.x, distances[k].point.y);
        ctx.stroke();
  
        // line(p[i].x, p[i].y, distances[k].point.x, distances[k].point.y);
        ctx.lineWidth = fraction * u;
      }


      // strokeWeight(fraction * u);
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
        let newHue = rando % 2 == 0 ? hue - 10 : hue + 10;
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

function C(centerX, centerY, radius, mode) {
  const sides = mode == 0 ? 100 : 60;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = centerX + radius * Math.cos((2 * Math.PI * i) / sides);
    const y = centerY + radius * Math.sin((2 * Math.PI * i) / sides);
    if (i === 0) {
      ctx.moveTo(x, y); // Start from the first point
    } else {
      ctx.lineTo(x, y); // Draw to the next point
    }
  }
  ctx.closePath();
  if (mode == 0) {
    ctx.stroke();
  } else {
    ctx.fill();
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

function updateMatte() {
  document.body.style.backgroundColor = `rgb(${matte * 16},${matte * 16},${
    matte * 16
  })`;
}

canvas.addEventListener("dblclick", function (event) {
  console.log("Canvas double-clicked:", event);
  paused = !paused;
});

document.addEventListener("keydown", function (event) {
  if (event.key === " ") {
    paused = !paused;
  } else if (event.key === "s" || event.key === "S") {
    let link = document.createElement("a");
    link.download = `Metta-${artwork.tokenID}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } else if (event.key === "<") {
    if (matte != 0) {
      matte--;
    } else {
      matte = 16;
    }
    updateMatte();
  } else if (event.key === ">") {
    if (matte != 16) {
      matte++;
    } else {
      matte = 0;
    }
    updateMatte();
  }
});


// Testing use only? Or keep in for on-chain traits?
function readOutAttributes() {
  addAttribute(
    "Color Mode",
    colorMode == 0
      ? "Tri-X"
      : colorMode == 1
      ? "Synchonized"
      : colorMode == 2
      ? "Agree to Disaggree"
      : "Gradient"
  ); // == 3

  addAttribute(
    "Cell Design",
    cellDesign == 0
      ? "Lines & walls"
      : cellDesign == 1
      ? "Startrail"
      : cellDesign == 2
      ? "Popcorn"
      : cellDesign == 3
      ? "Shards"
      : "Invisible"
  ); // == 4

  addAttribute(
    "Connections",
    connections == 2 ? "Minimal" : connections == 4 ? "Intermediate" : "Abundant"
  ); // == 10

  // addAttribute("Fade", fade ? "Yes" : "No");
  addAttribute("Mode", 
    mode == 0 ? "Ephemeral" :
    mode == 1 ? "Enduring" :
    mode == 2 ? "Veiled" :
    mode == 3 ? "Ephemeral Frenzy" :
    "Enduring Frenzy"
  );

  addAttribute(
    "View",
    nodes == 5
      ? "Macro"
      : nodes == 20
      ? "Medium"
      : nodes == 60
      ? "Full"
      : "Wide"
  ); // == 125

  addAttribute("cellDynamic", cellDynamic == 0 ? "Discreet" : cellDynamic == 1 ? "Adjacent" : "Interwoven"); // == 2

  addAttribute(
    "Stroke",
    thickness == 0 ? "Light" : thickness == 1 ? "Regular" : "Bold"
  ); // == 2

  console.log("");
  console.log("#######################");
  console.log("ATTRIBUTES:");
  for (i = 0; i < attributes.length; i++) {
    console.log(attributes[i].trait_type + ": " + attributes[i].value);
  }
  console.log("#######################");
  console.log("");
  sessionStorage.setItem("attributes", JSON.stringify(attributes));
  function addAttribute(trait_type, value) {
    if (typeof value == "boolean") {
      value = value.toString();
    }
    attributes.push({ trait_type, value });
  }
}