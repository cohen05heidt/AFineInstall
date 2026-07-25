/* The journey world. Pure drawing, no React and no browser globals at module
   scope, so it is safe to import from a server rendered route.

   The world is one tall vertical strip five viewports deep. The visitor's
   scroll moves a single camera value down it, which is why position and
   velocity stay continuous across every seam and why reverse scroll is just
   the same function run backwards.

     band 0  ORBIT      stars, the earth limb, the satellite, the beam starts
     band 1  LOCK       the beam narrows through altitude ticks and locks
     band 2  ROOFTOP    a roofline arrives, the dish takes the beam
     band 3  INSIDE     the house opens up and rooms light in sequence
     band 4  TERRITORY  the camera pulls back until the house is one dot
*/

export const BANDS = 5;
export const TRAVEL = BANDS - 1;
export const STILL_CAM = 2.42;

const INK = "#071410";
const HAIR = "#25443a";
const BONE = "#ede7da";
const BONE_DIM = "#9fb0a6";
const SIGNAL = "#d23b2c";

export type Star = { x: number; y: number; r: number; plane: number; tw: number };

/* Deterministic field so a reload does not reshuffle the sky. */
export function makeStars(count: number): Star[] {
  let seed = 20260725;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const out: Star[] = [];
  for (let i = 0; i < count; i += 1) {
    const plane = i % 3;
    out.push({
      x: rnd(),
      y: rnd() * 2.35,
      r: 0.35 + rnd() * (plane === 2 ? 1.5 : 0.85),
      plane,
      tw: rnd() * Math.PI * 2,
    });
  }
  return out;
}

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const ramp = (v: number, a: number, b: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export type Frame = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  cam: number;
  t: number;
  stars: Star[];
  compact: boolean;
  still: boolean;
};

export function drawWorld({ ctx, w, h, cam, t, stars, compact, still }: Frame) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);

  const pull = ramp(cam, 3.05, 4);
  const worldScale = 1 - pull * 0.82;
  const cx = w / 2;
  const anchorY = h * 0.52;
  const sy = (worldY: number, plane = 1) =>
    anchorY + (worldY - cam * plane) * h * worldScale;

  drawStars(ctx, w, h, cam, t, stars, still, worldScale);
  drawOrbit(ctx, w, h, cam, sy, cx, worldScale);
  drawEarth(ctx, w, h, cam, worldScale, cx);

  ctx.save();
  ctx.translate(cx, 0);
  ctx.scale(worldScale, 1);
  ctx.translate(-cx, 0);
  drawBeam(ctx, w, h, cam, t, sy, cx, still, worldScale);
  drawTicks(ctx, w, cam, sy, cx, compact);
  drawRoof(ctx, w, h, cam, sy, cx);
  drawHouse(ctx, w, h, cam, t, sy, cx, still);
  ctx.restore();

  drawTerritory(ctx, w, h, cam, t, cx, anchorY, still);
}

function drawStars(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number,
  t: number, stars: Star[], still: boolean, worldScale: number,
) {
  const fade = 1 - ramp(cam, 2.1, 3.4) * 0.72;
  if (fade <= 0.02) return;
  const planeRate = [0.16, 0.3, 0.46];
  for (const s of stars) {
    const y = ((s.y - cam * planeRate[s.plane]) % 2.35 + 2.35) % 2.35;
    const py = (y - 0.5) * h;
    if (py < -30 || py > h + 30) continue;
    const twinkle = still ? 0.8 : 0.62 + 0.38 * Math.sin(t * 0.0011 + s.tw);
    ctx.globalAlpha = fade * twinkle * (0.42 + s.plane * 0.3);
    ctx.fillStyle = s.plane === 2 ? BONE : BONE_DIM;
    ctx.beginPath();
    ctx.arc(s.x * w, py, s.r * worldScale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawEarth(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number,
  worldScale: number, cx: number,
) {
  const a = (1 - ramp(cam, 0.9, 2.2)) * 0.95;
  if (a <= 0.02) return;
  const r = Math.max(w, h) * 2.1 * worldScale;
  const top = h * 0.6 + cam * h * 0.42;
  ctx.save();
  ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(0, top - 2, 0, top + h * 0.7);
  g.addColorStop(0, "rgba(37,68,58,0.95)");
  g.addColorStop(0.45, "rgba(12,30,25,0.9)");
  g.addColorStop(1, "rgba(7,20,16,0)");
  ctx.beginPath();
  ctx.arc(cx, top + r, r, Math.PI * 1.06, Math.PI * 1.94);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(237,231,218,0.5)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(cx, top + r, r, Math.PI * 1.06, Math.PI * 1.94);
  ctx.stroke();
  ctx.restore();
}

/* --- the signal: one unbroken red line from orbit to the wall ---------- */
function drawBeam(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number, t: number,
  sy: (y: number, p?: number) => number, cx: number, still: boolean,
  worldScale: number,
) {
  const satY = sy(-0.13, 1);
  const dishY = sy(2.62, 1);
  const satX = cx + w * 0.19;
  const dishX = cx + w * 0.03;

  const satA = 1 - ramp(cam, 1.9, 2.9) * 0.85;
  if (satA > 0.02 && satY > -140 && satY < h + 140) {
    ctx.save();
    ctx.globalAlpha = satA;
    const glow = ctx.createRadialGradient(satX, satY, 0, satX, satY, 96 * worldScale);
    glow.addColorStop(0, "rgba(210,59,44,0.5)");
    glow.addColorStop(1, "rgba(210,59,44,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(satX, satY, 96 * worldScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = BONE;
    ctx.lineWidth = 1.6;
    const s = 26 * worldScale;
    ctx.beginPath();
    ctx.rect(satX - s * 0.36, satY - s * 0.24, s * 0.72, s * 0.48);
    ctx.moveTo(satX - s * 1.5, satY - s * 0.13);
    ctx.lineTo(satX - s * 0.36, satY - s * 0.13);
    ctx.moveTo(satX + s * 0.36, satY - s * 0.13);
    ctx.lineTo(satX + s * 1.5, satY - s * 0.13);
    ctx.stroke();
    ctx.fillStyle = SIGNAL;
    ctx.beginPath();
    ctx.arc(satX, satY, 3.4 * worldScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const lock = ramp(cam, 0.55, 2.35);
  const spread = (1 - lock) * w * 0.3 + w * 0.012;
  if (dishY > -60 && satY < h + 60) {
    ctx.save();
    const cg = ctx.createLinearGradient(0, satY, 0, dishY);
    cg.addColorStop(0, "rgba(210,59,44,0.3)");
    cg.addColorStop(1, "rgba(210,59,44,0.06)");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(satX, satY);
    ctx.lineTo(dishX + spread, dishY);
    ctx.lineTo(dishX - spread, dishY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(232,84,63,0.95)";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(satX, satY);
    ctx.lineTo(dishX, dishY);
    ctx.stroke();
    const pulses = 5;
    for (let i = 0; i < pulses; i += 1) {
      const phase = still ? (i / pulses + 0.3) % 1 : (t * 0.00042 + i / pulses) % 1;
      const px = satX + (dishX - satX) * phase;
      const py = satY + (dishY - satY) * phase;
      if (py < -20 || py > h + 20) continue;
      ctx.globalAlpha = Math.sin(phase * Math.PI);
      ctx.fillStyle = BONE;
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/* altitude ticks: the instrument register, band 1 only */
function drawTicks(
  ctx: CanvasRenderingContext2D, w: number, cam: number,
  sy: (y: number, p?: number) => number, cx: number, compact: boolean,
) {
  if (compact) return;
  const a = ramp(cam, 0.62, 1.1) * (1 - ramp(cam, 1.85, 2.5));
  if (a <= 0.02) return;
  const rows: Array<[number, string]> = [
    [1.02, "550 KM UP"],
    [1.3, "NO TREES IN THE WAY"],
    [1.58, "29 MS BACK"],
    [1.86, "AIMED AND SEALED"],
  ];
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = "500 11px 'Geist Mono', ui-monospace, monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const x = cx - w * 0.34;
  for (const [y, label] of rows) {
    const py = sy(y, 1);
    ctx.strokeStyle = HAIR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + 34, py);
    ctx.stroke();
    ctx.fillStyle = BONE_DIM;
    ctx.fillText(label, x + 44, py);
  }
  ctx.restore();
}

/* --- band 2: the roofline the dish actually lands on ------------------- */
function drawRoof(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number,
  sy: (y: number, p?: number) => number, cx: number,
) {
  const a = ramp(cam, 1.45, 2.2) * (1 - ramp(cam, 3.15, 3.9));
  if (a <= 0.02) return;
  const base = sy(2.86, 1);
  const span = w * 0.62;
  const ridgeX = cx + w * 0.03;
  const ridgeY = base - h * 0.15;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = BONE;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(ridgeX - span * 0.52, base);
  ctx.lineTo(ridgeX, ridgeY);
  ctx.lineTo(ridgeX + span * 0.52, base);
  ctx.stroke();
  ctx.strokeStyle = HAIR;
  ctx.lineWidth = 1;
  for (let i = 1; i < 9; i += 1) {
    const f = i / 9;
    ctx.beginPath();
    ctx.moveTo(ridgeX - span * 0.52 * (1 - f), base - (base - ridgeY) * f);
    ctx.lineTo(ridgeX - span * 0.52 * (1 - f) + span * 0.1, base);
    ctx.stroke();
  }
  const dishY = sy(2.62, 1);
  ctx.strokeStyle = BONE;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(ridgeX, dishY, 30, 9, -0.42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ridgeX, dishY + 6);
  ctx.lineTo(ridgeX + 6, ridgeY);
  ctx.stroke();
  ctx.strokeStyle = SIGNAL;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(ridgeX + 6, ridgeY);
  ctx.lineTo(ridgeX + span * 0.34, base - 6);
  ctx.lineTo(ridgeX + span * 0.34, sy(3.3, 1));
  ctx.stroke();
  ctx.restore();
}

/* --- band 3: inside, room by room ------------------------------------- */
function drawHouse(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number, t: number,
  sy: (y: number, p?: number) => number, cx: number, still: boolean,
) {
  const a = ramp(cam, 2.5, 3.15) * (1 - ramp(cam, 3.55, 4));
  if (a <= 0.02) return;
  const top = sy(3.36, 1);
  const wide = Math.min(w * 0.72, 760);
  const tall = Math.min(h * 0.42, 340);
  const x0 = cx - wide / 2;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = HAIR;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x0, top, wide, tall);
  ctx.beginPath();
  ctx.moveTo(x0, top + tall * 0.52);
  ctx.lineTo(x0 + wide, top + tall * 0.52);
  for (const f of [0.26, 0.52, 0.76]) {
    ctx.moveTo(x0 + wide * f, top);
    ctx.lineTo(x0 + wide * f, top + tall * 0.52);
  }
  ctx.moveTo(x0 + wide * 0.44, top + tall * 0.52);
  ctx.lineTo(x0 + wide * 0.44, top + tall);
  ctx.stroke();

  const nodes: Array<[number, number, string]> = [
    [0.13, 0.26, "WIFI"],
    [0.39, 0.26, "SOUND"],
    [0.64, 0.26, "TV"],
    [0.88, 0.26, "CAMERAS"],
    [0.22, 0.76, "ALARM"],
    [0.72, 0.76, "PREWIRE"],
  ];
  ctx.font = "500 9.5px 'Geist Mono', ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  nodes.forEach(([fx, fy, label], i) => {
    const nx = x0 + wide * fx;
    const ny = top + tall * fy;
    const seq = clamp((ramp(cam, 2.62, 3.34) - i * 0.1) * 3.2);
    if (seq <= 0.01) return;
    const pulse = still ? 0.85 : 0.7 + 0.3 * Math.sin(t * 0.0016 + i);
    ctx.globalAlpha = a * seq;
    const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 30);
    g.addColorStop(0, `rgba(210,59,44,${0.42 * pulse})`);
    g.addColorStop(1, "rgba(210,59,44,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(nx, ny, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = SIGNAL;
    ctx.beginPath();
    ctx.arc(nx, ny, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BONE_DIM;
    ctx.fillText(label, nx, ny + 21);
  });
  ctx.restore();
}

/* --- band 4: the territory the truck can reach ------------------------- */
function drawTerritory(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number, t: number,
  cx: number, anchorY: number, still: boolean,
) {
  const a = ramp(cam, 3.5, 4);
  if (a <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = a;
  const maxR = Math.min(w, h) * 0.44;
  const rings: Array<[number, string]> = [
    [0.3, "45 MIN"],
    [0.6, "90 MIN"],
    [1, "150 MIN"],
  ];
  ctx.font = "500 10px 'Geist Mono', ui-monospace, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (const [f, label] of rings) {
    const r = maxR * f;
    ctx.strokeStyle = f === 1 ? "rgba(210,59,44,0.7)" : HAIR;
    ctx.lineWidth = f === 1 ? 1.5 : 1;
    ctx.setLineDash(f === 1 ? [] : [3, 6]);
    ctx.beginPath();
    ctx.arc(cx, anchorY, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = f === 1 ? "rgba(232,84,63,0.9)" : BONE_DIM;
    ctx.fillText(label, cx + r * 0.7, anchorY - r * 0.7);
  }
  const ang = still ? -0.6 : t * 0.00035;
  const sweep = ctx.createLinearGradient(
    cx, anchorY, cx + Math.cos(ang) * maxR, anchorY + Math.sin(ang) * maxR,
  );
  sweep.addColorStop(0, "rgba(210,59,44,0.55)");
  sweep.addColorStop(1, "rgba(210,59,44,0)");
  ctx.strokeStyle = sweep;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, anchorY);
  ctx.lineTo(cx + Math.cos(ang) * maxR, anchorY + Math.sin(ang) * maxR);
  ctx.stroke();
  ctx.fillStyle = SIGNAL;
  ctx.beginPath();
  ctx.arc(cx, anchorY, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = BONE;
  ctx.fillText("GAINESVILLE", cx + 12, anchorY + 1);
  ctx.restore();
}

/* the orbital track the satellite sits on. Present only in the first two
   bands, and drawn as a hairline so it reads as structure rather than
   decoration. */
function drawOrbit(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number,
  sy: (y: number, p?: number) => number, cx: number, worldScale: number,
) {
  const a = (1 - ramp(cam, 0.55, 1.7)) * 0.85;
  if (a <= 0.02) return;
  const y = sy(-0.13, 1);
  const rx = w * 0.86 * worldScale;
  const ry = Math.max(h * 0.2, 120) * worldScale;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = "rgba(60,100,85,0.85)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 9]);
  ctx.beginPath();
  ctx.ellipse(cx - w * 0.1, y + ry * 0.72, rx, ry, -0.13, Math.PI * 1.04, Math.PI * 1.96);
  ctx.stroke();
  ctx.setLineDash([]);

  /* two more of the constellation, further along the same track */
  ctx.fillStyle = "rgba(159,176,166,0.85)";
  for (const f of [-0.52, 0.44]) {
    const px = cx - w * 0.1 + Math.cos(Math.PI * (1.5 + f * 0.46)) * rx;
    const py = y + ry * 0.72 + Math.sin(Math.PI * (1.5 + f * 0.46)) * ry;
    ctx.beginPath();
    ctx.arc(px, py, 2 * worldScale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
