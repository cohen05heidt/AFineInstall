/* The journey world. Pure drawing, no React and no browser globals at module
   scope, so it is safe to import from a server rendered route.

   The world is one tall vertical strip four viewports deep. The visitor's
   scroll moves a single camera value down it, which is why position and
   velocity stay continuous across every seam and why reverse scroll is just
   the same function run backwards.

     band 0  ORBIT    stars, the earth limb, the orbital track, the satellite
     band 1  LOCK     the beam narrows through altitude ticks and locks
     band 2  ROOFTOP  a roofline arrives, the dish takes the beam
     band 3  INSIDE   the house opens up and rooms light in sequence

   The drive radius used to be a fifth band drawn here as a radar. It is now
   told properly by the projected map in the coverage section, so the journey
   ends inside the house and hands off instead of repeating itself.
*/

export const BANDS = 4;
export const TRAVEL = BANDS - 1;
/* the reduced motion still: dish on the ridge, beam landed */
export const STILL_CAM = 2.05;

/* where things sit in world space, measured in viewport heights */
const SAT_Y = -0.13;
const DISH_Y = 2.1;
const ROOF_Y = 2.34;
const CABLE_END_Y = 2.78;
const HOUSE_Y = 2.74;

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
const compactHouse = (w: number) => w < 900;

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

  const cx = w / 2;
  const anchorY = h * 0.52;
  const sy = (worldY: number) => anchorY + (worldY - cam) * h;

  drawStars(ctx, w, h, cam, t, stars, still);
  drawOrbit(ctx, w, h, cam, sy, cx);
  drawEarth(ctx, w, h, cam, cx);
  drawBeam(ctx, w, h, cam, t, sy, cx, still);
  drawTicks(ctx, w, cam, sy, cx, compact);
  drawRoof(ctx, w, h, cam, sy, cx);
  drawHouse(ctx, w, h, cam, t, sy, cx, still);
}

function drawStars(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number,
  t: number, stars: Star[], still: boolean,
) {
  const fade = 1 - ramp(cam, 1.8, 2.9) * 0.72;
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
    ctx.arc(s.x * w, py, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* the orbital track the satellite rides, first band only */
function drawOrbit(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number,
  sy: (y: number) => number, cx: number,
) {
  const a = (1 - ramp(cam, 0.45, 1.4)) * 0.85;
  if (a <= 0.02) return;
  const y = sy(SAT_Y);
  const rx = w * 0.86;
  const ry = Math.max(h * 0.2, 120);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = "rgba(60,100,85,0.85)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 9]);
  ctx.beginPath();
  ctx.ellipse(cx - w * 0.1, y + ry * 0.72, rx, ry, -0.13, Math.PI * 1.04, Math.PI * 1.96);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(159,176,166,0.85)";
  for (const f of [-0.52, 0.44]) {
    const px = cx - w * 0.1 + Math.cos(Math.PI * (1.5 + f * 0.46)) * rx;
    const py = y + ry * 0.72 + Math.sin(Math.PI * (1.5 + f * 0.46)) * ry;
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawEarth(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number, cx: number,
) {
  const a = (1 - ramp(cam, 0.75, 1.8)) * 0.95;
  if (a <= 0.02) return;
  const r = Math.max(w, h) * 2.1;
  const top = h * 0.6 + cam * h * 0.5;
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
  sy: (y: number) => number, cx: number, still: boolean,
) {
  const satY = sy(SAT_Y);
  const dishY = sy(DISH_Y);
  const satX = cx + w * 0.19;
  const dishX = cx + w * 0.03;

  const satA = 1 - ramp(cam, 1.5, 2.4) * 0.85;
  if (satA > 0.02 && satY > -140 && satY < h + 140) {
    ctx.save();
    ctx.globalAlpha = satA;
    const glow = ctx.createRadialGradient(satX, satY, 0, satX, satY, 96);
    glow.addColorStop(0, "rgba(210,59,44,0.5)");
    glow.addColorStop(1, "rgba(210,59,44,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(satX, satY, 96, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = BONE;
    ctx.lineWidth = 1.6;
    const s = 26;
    ctx.beginPath();
    ctx.rect(satX - s * 0.36, satY - s * 0.24, s * 0.72, s * 0.48);
    ctx.moveTo(satX - s * 1.5, satY - s * 0.13);
    ctx.lineTo(satX - s * 0.36, satY - s * 0.13);
    ctx.moveTo(satX + s * 0.36, satY - s * 0.13);
    ctx.lineTo(satX + s * 1.5, satY - s * 0.13);
    ctx.stroke();
    ctx.fillStyle = SIGNAL;
    ctx.beginPath();
    ctx.arc(satX, satY, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const lock = ramp(cam, 0.45, 1.85);
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

/* altitude ticks: the instrument register, second band only */
function drawTicks(
  ctx: CanvasRenderingContext2D, w: number, cam: number,
  sy: (y: number) => number, cx: number, compact: boolean,
) {
  if (compact) return;
  const a = ramp(cam, 0.5, 0.95) * (1 - ramp(cam, 1.45, 2));
  if (a <= 0.02) return;
  const rows: Array<[number, string]> = [
    [0.85, "550 KM UP"],
    [1.05, "NO TREES IN THE WAY"],
    [1.25, "29 MS BACK"],
    [1.45, "AIMED AND SEALED"],
  ];
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = "500 11px 'Geist Mono', ui-monospace, monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const x = cx - w * 0.34;
  for (const [y, label] of rows) {
    const py = sy(y);
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
  sy: (y: number) => number, cx: number,
) {
  const a = ramp(cam, 1.2, 1.85) * (1 - ramp(cam, 2.5, 2.95));
  if (a <= 0.02) return;
  const base = sy(ROOF_Y);
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
  const dishY = sy(DISH_Y);
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
  ctx.lineTo(ridgeX + span * 0.34, sy(CABLE_END_Y));
  ctx.stroke();
  ctx.restore();
}

/* --- band 3: inside, room by room, where the journey ends -------------- */
function drawHouse(
  ctx: CanvasRenderingContext2D, w: number, h: number, cam: number, t: number,
  sy: (y: number) => number, cx: number, still: boolean,
) {
  const a = ramp(cam, 2.15, 2.75);
  if (a <= 0.02) return;
  const top = sy(HOUSE_Y);
  const wide = Math.min(w * (compactHouse(w) ? 0.88 : 0.72), 760);
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
    [0.14, 0.26, "WIFI"],
    [0.39, 0.26, "SOUND"],
    [0.64, 0.26, "TV"],
    [0.86, 0.26, "CAMERAS"],
    [0.22, 0.76, "ALARM"],
    [0.72, 0.76, "PREWIRE"],
  ];
  ctx.font = `500 ${compactHouse(w) ? 8 : 9.5}px 'Geist Mono', ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  nodes.forEach(([fx, fy, label], i) => {
    const nx = x0 + wide * fx;
    const ny = top + tall * fy;
    const seq = clamp((ramp(cam, 2.2, 2.9) - i * 0.075) * 3.6);
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
