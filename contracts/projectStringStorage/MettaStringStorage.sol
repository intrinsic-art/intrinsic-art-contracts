// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IStringStorage} from "../interfaces/IStringStorage.sol";

contract MettaStringStorage is IStringStorage {
  // strings stored in separate variables instead of array
  // since solidity doesn't support constant string array variables
  string constant private _stringSlot0 = "{    \"name\": \"Metta\",    \"description\": \"DESCRIPTION:\\n\\\"Metta\\\" is an exploration of the interconnected world, illustrated by Voronoi tessellations created with signed distance functions.\\nThe patterns created in this project reflect life\'s intricate web, showing how individual entities, distinct yet interconnected, form a cohesive whole. The artwork\'s animation, driven by interaction between the entities, brings these connections to life, illustrating the dynamic nature of relationships.\\nIn addition to the aesthetic display, the project is a metaphorical expression of the Metta philosophy. It invites viewers to contemplate the unseen connections in our lives and recognize the profound interconnectedness of all beings. \\\"Metta\\\" seeks to awaken a sense of unity and empathy in its mindful viewers, gently guiding them to appreciate the intricate web of relationships that form the fabric of our collective experience.\\nCoded in vanilla JS with love, by Matto.\\n\\nINTERACTIVITY:\\nBy default, \\\"Metta\\\" will draw itself in, slow down, and pause. This initial paused state creates the canonical image for the token. The paused state can be toggled by double-clicking on the canvas or by pressing the spacebar. \\nHotkeys to interact with the script:\\n- \\\" \\\" toggles pause\\n- \\\"S\\\" saves a frame\\n- \\\"<\\\" and \\\">\\\" change the background\'s brightness\\nURL parameters to customize the experience:\\n- portrait=true will run the script in a vertical aspect ratio (9x16)\\n- continuous=true will bypass the initial automatic pausing mechanism\\n- delay=<0-1000> will set the delay in milliseconds between draw cycles (default is 25)\",    \"artistName\": \"Matto\",    \"website\": \"https://matto.xyz/\",    \"license\": \"CC BY-NC 4.0\",    \"scriptLibrary\": \"na\",    \"aspectRatio\": \"16:9\"}";

  string constant private _stringSlot1 = "const project = \"Metta\";console.log(`${project} v5.5 \u00A9 2023 Matto`);console.log(`TOKEN ID: ${artwork.tokenID}. TOKEN ENTROPY: ${artwork.seed}. TRAITS:`);console.log(artwork.traits);let tokenEntropy = artwork.seed;let tokenEntropyPairs = createPairs(tokenEntropy);let seed =  getValue(0, 255) * getValue(0, 255) * getValue(0, 255) * getValue(0, 255);let R = (upperBound = 1) => Math.floor(mRando() * upperBound);function mRando() {  seed = (1664525 * seed + 1013904223) % 4294967296;  return seed / 4294967296;}const urlParams = new URLSearchParams(window.location.search);const portrait = urlParams.get(\"portrait\");const delaySetting = urlParams.get(\"delay\");const contSetting = urlParams.get(\"continuous\");let attributes = [];let p = [];let matte = 16;let hue,  width,  height,  canvas,  delayMS,  u,  rando,  nodes,  mode,  chaos,  freeze,  veiled,  cellDynamic,  connections,  thickness,  fade,  cellDesign,  colorMode,  gradientShift,  seekerNodeMod;let continuous = false;let paused = true;let count = 0;let lastTime = 0;setup();requestAnimationFrame(draw);function setup() {  if (portrait == \"true\") {    height = window.innerHeight;    width = height * 0.5625;    if (width > window.innerWidth) {      width = window.innerWidth;      height = width / 0.5625;    }  } else {    width = window.innerWidth;    height = width * 0.5625;    if (height > window.innerHeight) {      height = window.innerHeight;      width = height / 0.5625;    }  }  if (delaySetting && Number.isInteger(parseInt(delaySetting))) {    delayMS = parseInt(delaySetting);    delayMS = delayMS < 0 ? 0 : delayMS > 1000 ? 1000 : delayMS;    console.log(`Delay between cycles set to ${delayMS}ms.`);  } else {    delayMS = 25;    console.log(\"URL parameter for delay is not recognized, defaulting to 25ms.\");  }  if (contSetting == \"true\") {    continuous = true;    paused = false;  }   canvas = document.createElement(\"canvas\");  canvas.width = width;  canvas.height = height;  document.querySelector(\"body\").appendChild(canvas);  ctx = canvas.getContext(\"2d\");  hue = getValue(1, 18) * 20;  rando = getValue(0, 255) * getValue(0, 255);  nodes = parseInt(artwork.traits.nodes, 10);  connections = getValue(0, 255) % 3;  connections = connections == 0 ? 2 :     connections == 1 ? 4 :    10;  if (connections > nodes) {    connections = nodes - 1;  }  thickness = getValue(0, 255) % 3;  mode = parseInt(artwork.traits.mode, 10);  fade = mode % 3 == 0 ? true : false;  chaos = mode > 2 ? true : false;  veiled = mode == 2 ? true : false;  cellDesign = parseInt(artwork.traits.cellDesign, 10);  colorMode = parseInt(artwork.traits.colorMode, 10);  cellDynamic = parseInt(artwork.traits.cellDynamic, 10);  gradientShift = getValue(0, 360);  freeze = 95;  seekerNodeMod = chaos == true ? 1 :    nodes == 5 ? 3 :     Math.floor(nodes / 2);  u = ((thickness + 1) * (window.innerHeight + window.innerWidth)) / 2000;  ctx.fillStyle = `hsl(0, 0%, 10%)`;   ctx.fillRect(0, 0, canvas.width, canvas.height);  for (let i = 0; i < nodes; i++) {    p.push({      x: R(width * 1.5) - width / 4,      y: R(height * 1.5) - height / 4,      r: 0,      c: [R(70) + 20, R(90) + 10],    });    if (i == 0) {      if (colorMode == 1 || colorMode == 2) {        console.log(\"(Primary Hue: \" + hue + \")\");        if (colorMode == 2) {          console.log(\"(Secondary Hue: \" + ((hue + 180) % 360) + \")\");        }      }    }  }}function draw(timestamp) {  let elapsedTime = timestamp - lastTime;  let targetDelay = continuous ? delayMS :     count < freeze ? 1000 / (freeze - count + 3) :     delayMS;  if (elapsedTime > targetDelay) {    lastTime = timestamp;    if (!paused || count < freeze) {      count++;      if (fade) {        ctx.fillStyle = `hsla(0, 0%, 0%, 2%)`;        ctx.fillRect(0, 0, canvas.width, canvas.height);      }      for (let i = 0; i < 1000; i++) {        let x = R(width);        let y = R(height);        let d = width * height;        let c;        let t;        for (let j = 0; j < p.length; j++) {          t = Math.sqrt((x - p[j].x) ** 2 + (y - p[j].y) ** 2);          if (t < d) {            d = t;            c = j;          }        }        ctx.lineWidth = 0.5 * u;        let drawHue = hue;        let drawSat = p[c].c[0];        if (colorMode == 0) {          drawSat = 0;        } else if (colorMode == 2) {          if (c % 2 == 0) {            drawHue = (hue + 180) % 360;          }        } else if (colorMode == 3) {          if (rando % 2 == 0) {            drawHue = (p[c].x / width) * 360 + gradientShift;          } else {            drawHue = (p[c].y / height) * 360 + gradientShift;          }        }        ctx.strokeStyle = `hsl(${drawHue}, ${drawSat}%, ${p[c].c[1]}%)`;        ctx.fillStyle = `hsl(${drawHue}, ${drawSat}%, ${p[c].c[1]}%)`;        let dx = p[c].x - x;        let dy = p[c].y - y;        let mag = Math.sqrt(dx * dx + dy * dy) * 20;        let midX = p[c].x + 0.75 * (x - p[c].x);        let midY = p[c].y + 0.75 * (y - p[c].y);        let extX = p[c].x + 1.1 * (x - p[c].x);        let extY = p[c].y + 1.1 * (y - p[c].y);        let offset =          cellDesign == 1            ? mag / 20            : cellDesign == 0            ? mag / 30            : mag / 40;        let triX1 = x + (-dy / mag) * offset;        let triY1 = y + (dx / mag) * offset;        let triX2 = x + (dy / mag) * offset;        let triY2 = y + (-dx / mag) * offset;        if (cellDesign == 0) {          ctx.beginPath();          ctx.moveTo(p[c].x, p[c].y);          if (cellDynamic == 0) {            ctx.lineTo(midX, midY);          } else if (cellDynamic == 1) {            ctx.lineTo(x, y);          } else {            ctx.lineTo(extX, extY);          }          ctx.stroke();          ctx.beginPath();          ctx.moveTo(triX1, triY1);          ctx.lineTo(triX2, triY2);          ctx.stroke();        } else if (cellDesign == 1) {          let arcD;          if (cellDynamic == 0) {            arcD = 0.75 * d;          } else if (cellDynamic == 1) {            arcD = d;          } else {            arcD = 1.25 * d;          }          let startAngle = Math.atan2(triY1 - p[c].y, triX1 - p[c].x);          let endAngle = Math.atan2(triY2 - p[c].y, triX2 - p[c].x);          ctx.beginPath();          ctx.arc(p[c].x, p[c].y, arcD, startAngle, endAngle);          ctx.stroke();        } else if (cellDesign == 2) {          ctx.fillStyle = `hsl(${drawHue}, ${drawSat}%, ${p[c].c[1]}%)`;          if (cellDynamic == 0) {            C(midX, midY, 1.5 * u);          } else if (cellDynamic == 1) {            C(x, y, 1.5 * u);          } else {            C(extX, extY, 1.5 * u);          }        } else if (cellDesign == 3) {          let reduction = cellDynamic == 0 ? 0.7 : 0.9;          if (cellDynamic < 2) {            triX1 = p[c].x + reduction * (triX1 - p[c].x);            triY1 = p[c].y + reduction * (triY1 - p[c].y);            triX2 = p[c].x + reduction * (triX2 - p[c].x);            triY2 = p[c].y + reduction * (triY2 - p[c].y);          }          ctx.beginPath();          if (cellDynamic == 0) {            ctx.moveTo(p[c].x, p[c].y);            ctx.lineTo(triX1, triY1);            ctx.lineTo(midX, midY);            ctx.lineTo(triX2, triY2);          } else if (cellDynamic == 1) {            ctx.moveTo(p[c].x, p[c].y);            ctx.lineTo(triX1, triY1);            ctx.lineTo(x, y);            ctx.lineTo(triX2, triY2);          } else {            ctx.moveTo(midX, midY);            ctx.lineTo(triX1, triY1);            ctx.lineTo(extX, extY);            ctx.lineTo(triX2, triY2);          }          ctx.closePath();          ctx.stroke();        }        if (d > p[c].r) {          p[c].r = d;          ctx.lineWidth = (50 / p[c].r) * 3 * u;          if (colorMode < 2) {            if (colorMode == 0) {              ctx.strokeStyle = `hsl(0, 0%, ${p[c].c[1]}%)`;            } else {              drawHue = hue;              ctx.strokeStyle = `hsl(${hue}, ${p[c].c[0]}%, ${p[c].c[1]}%)`;            }            C(p[c].x, p[c].y, p[c].r, 0);          } else if (cellDesign == 4 && mode == 2) {             C(p[c].x, p[c].y, p[c].r, 0);          }        }      }      moveTowardNClosest(connections);    }  }  requestAnimationFrame(draw);}function moveTowardNClosest(n) {  for (let i = 0; i < p.length; i++) {    let distances = [];    for (let j = 0; j < p.length; j++) {      if (i !== j) {        let d = Math.sqrt((p[i].x - p[j].x) ** 2 + (p[i].y - p[j].y) ** 2);        distances.push({ dist: d, point: p[j] });      }    }    distances.sort((a, b) => a.dist - b.dist);    let closestDist = distances[0].dist;    if (!veiled) {      ctx.lineWidth = .5 * u;      C(p[i].x, p[i].y, 2 * u);    }    for (let k = 0; k < n && k < distances.length; k++) {      let fraction = u / (3 * Math.pow(1.5, k));      if (!veiled) {        ctx.beginPath();        ctx.moveTo(p[i].x, p[i].y);        ctx.lineTo(distances[k].point.x, distances[k].point.y);        ctx.stroke();        ctx.lineWidth = fraction * u;      }      let moveFraction = 1 / (500 * Math.pow(2, k));      if (i != 0 && i % seekerNodeMod == 0) {        moveFraction = moveFraction * 10;      }      p[i].x += (distances[k].point.x - p[i].x) * moveFraction;      p[i].y += (distances[k].point.y - p[i].y) * moveFraction;    }    if (closestDist <= 5) {      p[i].x = R(width * 1.5) - width / 4;      p[i].y = R(height * 1.5) - height / 4;      p[i].r = 0;      if (i == 0) {        let newHue = rando % 2 == 0 ? hue - 10 : hue + 10;        if (newHue < 0) {          newHue = 360 + newHue;        } else if (newHue > 360) {          newHue = newHue - 360;        }        hue = newHue;        console.log(\"(New hue: \" + hue + \")\");      }      p[i].c = [R(70) + 20, R(90) + 10];    }  }}function C(centerX, centerY, radius, mode) {  const sides = mode == 0 ? 100 : 60;  ctx.beginPath();  for (let i = 0; i < sides; i++) {    const x = centerX + radius * Math.cos((2 * Math.PI * i) / sides);    const y = centerY + radius * Math.sin((2 * Math.PI * i) / sides);    if (i === 0) {      ctx.moveTo(x, y);    } else {      ctx.lineTo(x, y);    }  }  ctx.closePath();  if (mode == 0) {    ctx.stroke();  } else {    ctx.fill();  }}function createPairs(input) {  let h = [];  for (let i = 0; i < (input.length - 2) / 2; i++) {    h.push(parseInt(input.slice(2 + i * 2, 4 + i * 2), 16));  }  return h;}function getValue(min, max) {  if (tokenEntropyPairs.length === 0) {    throw new Error(\"No entropy values left in tokenEntropyPairs.\");  }  let scaleFactor = (max - min + 1) / 256;  let x = Math.floor(tokenEntropyPairs[0] * scaleFactor + min);  tokenEntropyPairs.shift();  return x;}function updateMatte() {  document.body.style.backgroundColor = `rgb(${matte * 16},${matte * 16},${    matte * 16  })`;}canvas.addEventListener(\"dblclick\", function (event) {  console.log(\"Canvas double-clicked:\", event);  paused = !paused;});document.addEventListener(\"keydown\", function (event) {  if (event.key === \" \") {    paused = !paused;  } else if (event.key === \"s\" || event.key === \"S\") {    let link = document.createElement(\"a\");    link.download = `Metta-${artwork.tokenID}.png`;    link.href = canvas.toDataURL();    link.click();  } else if (event.key === \"<\") {    if (matte != 0) {      matte--;    } else {      matte = 16;    }    updateMatte();  } else if (event.key === \">\") {    if (matte != 16) {      matte++;    } else {      matte = 0;    }    updateMatte();  }});";

  /** @inheritdoc IStringStorage*/
  function stringAtSlot(uint8 _slot) external pure returns (string memory) {
    if (_slot == 0) return _stringSlot0;
    if (_slot == 1) return _stringSlot1;
    revert EmptySlot();
  }
}