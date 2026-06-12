// video-scenes.js — the tutorial timeline. Each "site" scene draws into the
// browser content rect; intro/outro are full-bleed. Uses helpers from
// video-engine.js and the preloaded IMG map (artwork id → HTMLImageElement).

const X0 = CONTENT.x, Y0 = CONTENT.y, CWD = CONTENT.w, CHT = CONTENT.h;
const MIDX = X0 + CWD / 2;

// subtle framed artwork (contain) with shadow + hairline
function artContain(ctx, img, bx, by, bw, bh, ringAlpha = 0.0) {
  if (!img) return;
  const r = drawFitRect(img, bx, by, bw, bh);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 46; ctx.shadowOffsetY = 26;
  ctx.fillStyle = "#000"; ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.restore();
  ctx.drawImage(img, r.x, r.y, r.w, r.h);
  ctx.strokeStyle = `rgba(236,231,220,${0.10 + ringAlpha})`; ctx.lineWidth = 1.5;
  ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
  return r;
}
function drawFitRect(img, x, y, w, h) {
  const ir = img.naturalWidth / img.naturalHeight, br = w / h;
  let dw, dh; if (ir > br) { dw = w; dh = w / ir; } else { dh = h; dw = h * ir; }
  return { x: x + (w - dw) / 2, y: y + (h - dh) / 2, w: dw, h: dh };
}

// tap helper → {press, ripple}
function tapState(lt, tt) {
  return { press: lt >= tt && lt < tt + 0.15, ripple: seg(lt, tt, tt + 0.7), done: lt >= tt + 0.12 };
}

// eyebrow + page chrome inside content
function contentEyebrow(ctx, mono, alpha = 1) {
  ctx.globalAlpha = alpha;
  fillTextC(ctx, mono, X0 + 44, Y0 + 70, `400 20px ${FMONO}`, C.moon, 4, "left");
  ctx.globalAlpha = 1;
}

// mini top nav inside the content (for statement / language scenes)
function miniNav(ctx, items, activeIdx, langOn) {
  const ny = Y0 + 46;
  // brand
  fillTextC(ctx, "吳享龍 Dragom", X0 + 40, ny + 8, `400 24px ${FZH}`, C.bone1, 1, "left");
  // links right-aligned
  ctx.font = `400 22px ${FZH}`;
  let rx = X0 + CWD - 40;
  // lang toggle pill
  const ltw = 92, lth = 40;
  rr(ctx, rx - ltw, ny - 12, ltw, lth, 20); ctx.strokeStyle = C.rule; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.font = `400 18px ${FMONO}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = langOn ? C.bone4 : C.bone1; ctx.fillText("中", rx - ltw + 26, ny + 8);
  ctx.fillStyle = C.bone5; ctx.fillText("/", rx - ltw + 46, ny + 8);
  ctx.fillStyle = langOn ? C.bone1 : C.bone4; ctx.fillText("EN", rx - ltw + 68, ny + 8);
  ctx.textBaseline = "alphabetic";
  rx -= ltw + 34;
  for (let i = items.length - 1; i >= 0; i--) {
    const txt = items[i];
    ctx.font = `400 22px ${FZH}`; const w = ctx.measureText(txt).width;
    const active = i === activeIdx;
    fillTextC(ctx, txt, rx, ny + 8, `400 22px ${FZH}`, active ? C.bone1 : C.bone3, 1, "right");
    if (active) { ctx.strokeStyle = C.moon; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(rx - w, ny + 20); ctx.lineTo(rx, ny + 20); ctx.stroke(); }
    rx -= w + 30;
  }
  // hairline under nav
  ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0 + 40, Y0 + 96); ctx.lineTo(X0 + CWD - 40, Y0 + 96); ctx.stroke();
  return Y0 + 96;
}

// ── S0 · Home / museum wall (LandingSpotlight) ───────────────────────────────
// Recreates the site's landing: framed works hung in a centred "mountain" row
// (largest in the middle, bottoms on a common baseline) with floor reflections,
// the eyebrow up top, corner captions, and the 進入畫廊 invitation block.
const HOME_IDS = ["09", "11", "48", "06", "24"]; // mountain order (peak centre)
const HOME_CM = { "09": 27.3, "11": 40.8, "48": 58.0, "06": 43.9, "24": 36.5 };
const HOME_BASE = Y0 + 690;                       // floor line frames sit on
const HOME_BTN = { cx: MIDX, w: 280, h: 78, cy: Y0 + CHT - 168 };

function sceneHome(ctx, lt) {
  const enter = E.outCubic(seg(lt, 0, 0.7));

  // wall: subtle top-lit vertical wash
  const g = ctx.createLinearGradient(0, Y0, 0, Y0 + CHT);
  g.addColorStop(0, "#101119"); g.addColorStop(0.55, C.ink1); g.addColorStop(1, "#070709");
  ctx.fillStyle = g; ctx.fillRect(X0, Y0, CWD, CHT);

  // soft spotlight glow centred on the peak frame
  const rg = ctx.createRadialGradient(MIDX, HOME_BASE - 230, 60, MIDX, HOME_BASE - 230, 560);
  rg.addColorStop(0, "rgba(236,231,220,0.10)"); rg.addColorStop(1, "rgba(236,231,220,0)");
  ctx.globalAlpha = enter; ctx.fillStyle = rg; ctx.fillRect(X0, Y0, CWD, CHT); ctx.globalAlpha = 1;

  // eyebrow (top-left)
  ctx.globalAlpha = E.outCubic(seg(lt, 0.1, 0.8));
  fillTextC(ctx, "個人作品集 ｜ 二〇二一 – 二〇二六", X0 + 46, Y0 + 72, `400 19px ${FMONO}`, C.moon, 3, "left");
  ctx.globalAlpha = 1;

  // ── layout the hang row ──
  const gapNat = 40, K = 9;
  const frames = HOME_IDS.map((id) => {
    const im = IMG[id];
    const ar = im ? im.naturalWidth / im.naturalHeight : 1;
    const h = HOME_CM[id] * K;
    return { id, h, w: h * ar };
  });
  const natW = frames.reduce((s, f) => s + f.w, 0) + gapNat * (frames.length - 1);
  const maxNatH = Math.max(...frames.map((f) => f.h));
  const scale = Math.min((CWD - 130) / natW, 470 / maxNatH);
  const rowW = natW * scale, gap = gapNat * scale;
  let fx = MIDX - rowW / 2;
  const centreIdx = 2;

  // reflections first (so frames sit on top)
  frames.forEach((f, i) => {
    const fw = f.w * scale, fh = f.h * scale;
    const a = E.outCubic(clamp(enter * 1.5 - Math.abs(i - centreIdx) * 0.12, 0, 1));
    const fy = HOME_BASE - fh;
    if (a > 0 && IMG[f.id]) {
      ctx.save();
      ctx.translate(0, 2 * HOME_BASE); ctx.scale(1, -1);
      ctx.globalAlpha = a * 0.18;
      ctx.drawImage(IMG[f.id], fx, fy, fw, fh);
      ctx.restore();
    }
    fx += fw + gap;
  });
  // fade the reflections downward into the floor
  const fg = ctx.createLinearGradient(0, HOME_BASE, 0, HOME_BASE + 220);
  fg.addColorStop(0, "rgba(7,7,9,0)"); fg.addColorStop(0.75, "#070709"); fg.addColorStop(1, "#070709");
  ctx.fillStyle = fg; ctx.fillRect(X0, HOME_BASE, CWD, 240);
  // floor hairline
  ctx.globalAlpha = enter * 0.5;
  ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(X0 + 40, HOME_BASE + 1); ctx.lineTo(X0 + CWD - 40, HOME_BASE + 1); ctx.stroke();
  ctx.globalAlpha = 1;

  // frames
  fx = MIDX - rowW / 2;
  frames.forEach((f, i) => {
    const fw = f.w * scale, fh = f.h * scale;
    const a = E.outCubic(clamp(enter * 1.5 - Math.abs(i - centreIdx) * 0.12, 0, 1));
    const fy = HOME_BASE - fh;
    if (a > 0 && IMG[f.id]) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(0, (1 - a) * 22);
      ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 24;
      ctx.fillStyle = "#000"; ctx.fillRect(fx, fy, fw, fh);
      ctx.shadowColor = "transparent";
      ctx.drawImage(IMG[f.id], fx, fy, fw, fh);
      ctx.strokeStyle = "rgba(236,231,220,0.16)"; ctx.lineWidth = 1.5;
      ctx.strokeRect(fx + 0.5, fy + 0.5, fw - 1, fh - 1);
      ctx.restore();
    }
    fx += fw + gap;
  });

  // ── invitation block (bottom centre) ──
  const invA = E.outCubic(seg(lt, 0.6, 1.4));
  ctx.save(); ctx.globalAlpha = invA; ctx.translate(0, (1 - invA) * 14);
  ctx.strokeStyle = C.bone5; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(MIDX - 40, Y0 + CHT - 372); ctx.lineTo(MIDX + 40, Y0 + CHT - 372); ctx.stroke();
  fillTextC(ctx, "在空無一人的世界，", MIDX, Y0 + CHT - 300, `300 50px ${FZH}`, C.bone1, 2, "center");
  fillTextC(ctx, "來一場與自我的對話。", MIDX, Y0 + CHT - 234, `300 50px ${FZH}`, C.bone1, 2, "center");
  ctx.restore();

  // enter button
  const btnA = E.outCubic(seg(lt, 0.9, 1.6));
  const tapAt = 3.5;
  const pressed = lt >= tapAt && lt < tapAt + 0.3;
  ctx.globalAlpha = btnA;
  const bx = HOME_BTN.cx - HOME_BTN.w / 2, by = HOME_BTN.cy - HOME_BTN.h / 2;
  rr(ctx, bx, by, HOME_BTN.w, HOME_BTN.h, HOME_BTN.h / 2);
  ctx.fillStyle = pressed ? "rgba(185,167,224,0.20)" : "rgba(255,255,255,0.04)"; ctx.fill();
  ctx.strokeStyle = pressed ? C.moon : "rgba(236,231,220,0.30)"; ctx.lineWidth = 1.6; ctx.stroke();
  fillTextC(ctx, "進入畫廊", HOME_BTN.cx - 18, HOME_BTN.cy + 9, `400 27px ${FZH}`, C.bone1, 2, "center");
  fillTextC(ctx, "→", HOME_BTN.cx + 86, HOME_BTN.cy + 10, `400 30px ${FSER}`, C.bone1, 0, "center");
  ctx.globalAlpha = 1;

  // corner captions
  ctx.globalAlpha = E.outCubic(seg(lt, 1.0, 1.7));
  fillTextC(ctx, "吳享龍", X0 + 46, Y0 + CHT - 78, `400 20px ${FMONO}`, C.bone3, 2, "left");
  fillTextC(ctx, "繪畫工作者", X0 + 46, Y0 + CHT - 50, `400 16px ${FMONO}`, C.bone4, 2, "left");
  fillTextC(ctx, `${(window.ARTWORKS_COUNT || 59)} works`, X0 + CWD - 46, Y0 + CHT - 78, `400 20px ${FMONO}`, C.bone3, 2, "right");
  fillTextC(ctx, "2021 — 2026", X0 + CWD - 46, Y0 + CHT - 50, `400 16px ${FMONO}`, C.bone4, 2, "right");
  ctx.globalAlpha = 1;
}
sceneHome.url = "dragom.art";
sceneHome.cap = { zh: "首頁・美術館式陳列", en: "Home · the museum wall" };
sceneHome.cursor = (lt) => {
  const t = tapState(lt, 3.5);
  const x = lerp(MIDX, HOME_BTN.cx, E.inOut(seg(lt, 1.6, 3.3)));
  const y = lerp(Y0 + 360, HOME_BTN.cy, E.inOut(seg(lt, 1.6, 3.3)));
  return { x, y, press: t.press, ripple: t.ripple };
};

// ── S1 · Browse ──────────────────────────────────────────────────────────────
const BROWSE = ["48", "06", "11", "24", "09"];
function sceneBrowse(ctx, lt) {
  contentEyebrow(ctx, "畫廊 ／ GALLERY");
  const swapAt = 2.4;
  const k = lt < swapAt ? 0 : 1;            // spotlight index
  const fade = lt < swapAt ? 0 : E.outCubic(seg(lt, swapAt, swapAt + 0.5));
  // spotlight area
  const spY = Y0 + 120, spH = 690;
  const enter = E.outCubic(seg(lt, 0, 0.6));
  ctx.save(); ctx.globalAlpha = enter;
  // current + next crossfade
  ctx.globalAlpha = enter * (1 - fade);
  artContain(ctx, IMG[BROWSE[k]], X0 + 90, spY, CWD - 180, spH);
  if (fade > 0) { ctx.globalAlpha = enter * fade; artContain(ctx, IMG[BROWSE[k + 1]], X0 + 90, spY, CWD - 180, spH); }
  ctx.restore();
  // caption under spotlight: title + meta
  const w = window.WORKS[BROWSE[k + (fade > 0.5 ? 1 : 0)]];
  ctx.globalAlpha = enter;
  fillTextC(ctx, w.title, MIDX, spY + spH + 64, `400 38px ${FZH}`, C.bone1, 1, "center");
  fillTextC(ctx, `W—${w.id} ／ ${w.year} ／ ${w.medium}`, MIDX, spY + spH + 108, `400 20px ${FMONO}`, C.bone4, 2, "center");
  ctx.globalAlpha = 1;
  // thumbnail row
  const thY = Y0 + CHT - 196, thH = 132, n = BROWSE.length, gap = 22;
  const thW = (CWD - 160 - gap * (n - 1)) / n;
  for (let i = 0; i < n; i++) {
    const tx = X0 + 80 + i * (thW + gap);
    const sel = i === (fade > 0.5 ? k + 1 : k);
    ctx.globalAlpha = enter;
    const r = drawFitRect(IMG[BROWSE[i]], tx, thY, thW, thH);
    ctx.drawImage(IMG[BROWSE[i]], r.x, r.y, r.w, r.h);
    ctx.strokeStyle = sel ? C.moon : C.rule; ctx.lineWidth = sel ? 2.5 : 1;
    ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    ctx.globalAlpha = 1;
  }
  // right nav arrow
  const ax = X0 + CWD - 70, ay = spY + spH / 2;
  ctx.globalAlpha = enter; ctx.strokeStyle = C.bone2; ctx.lineWidth = 3; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(ax - 10, ay - 16); ctx.lineTo(ax + 8, ay); ctx.lineTo(ax - 10, ay + 16); ctx.stroke();
  const al = X0 + 70;
  ctx.strokeStyle = C.bone4; ctx.beginPath(); ctx.moveTo(al + 10, ay - 16); ctx.lineTo(al - 8, ay); ctx.lineTo(al + 10, ay + 16); ctx.stroke();
  ctx.globalAlpha = 1;
}
sceneBrowse.url = "dragom.art";
sceneBrowse.cap = { zh: "左右瀏覽作品", en: "Browse through the works" };
sceneBrowse.cursor = (lt) => {
  const ax = X0 + CWD - 70, ay = Y0 + 120 + 345;
  const t = tapState(lt, 1.9);
  const x = lerp(MIDX, ax, E.inOut(seg(lt, 0.3, 1.8)));
  const y = lerp(Y0 + 700, ay, E.inOut(seg(lt, 0.3, 1.8)));
  return { x, y, press: t.press, ripple: t.ripple };
};

// ── S2 · Open full-screen ────────────────────────────────────────────────────
function sceneOpen(ctx, lt) {
  const id = "48", w = window.WORKS[id];
  const openP = E.outQuint(seg(lt, 1.1, 2.0));   // thumb → full
  // start rect (a thumbnail-ish) → full content
  const sx = X0 + 300, sy = Y0 + 250, sw = 340, sh = 470;
  const fx = X0 + 60, fy = Y0 + 70, fw = CWD - 120, fh = CHT - 320;
  const bx = lerp(sx, fx, openP), by = lerp(sy, fy, openP), bw = lerp(sw, fw, openP), bh = lerp(sh, fh, openP);
  // dim backdrop as it opens
  ctx.globalAlpha = openP * 0.9; ctx.fillStyle = C.ink0; ctx.fillRect(X0, Y0, CWD, CHT); ctx.globalAlpha = 1;
  artContain(ctx, IMG[id], bx, by, bw, bh);
  // metadata appears once opened
  const metaA = E.outCubic(seg(lt, 2.0, 2.6));
  if (metaA > 0) {
    ctx.globalAlpha = metaA;
    const my = Y0 + CHT - 196;
    fillTextC(ctx, w.title, MIDX, my, `400 46px ${FZH}`, C.bone1, 1, "center");
    fillTextC(ctx, w.titleEn, MIDX, my + 44, `italic 400 28px ${FSER}`, C.bone3, 0, "center");
    fillTextC(ctx, `${w.medium}　·　${w.size}　·　${w.year}`, MIDX, my + 96, `400 20px ${FMONO}`, C.bone4, 2, "center");
    ctx.globalAlpha = 1;
  }
}
sceneOpen.url = "dragom.art";
sceneOpen.cap = { zh: "點開作品看大圖", en: "Open a piece full-screen" };
sceneOpen.cursor = (lt) => {
  if (lt > 2.2) return null;
  const t = tapState(lt, 1.0);
  const x = lerp(X0 + 760, X0 + 470, E.inOut(seg(lt, 0.2, 0.95)));
  const y = lerp(Y0 + 760, Y0 + 470, E.inOut(seg(lt, 0.2, 0.95)));
  return { x, y, press: t.press, ripple: t.ripple };
};

// ── S3 · Magnify detail ──────────────────────────────────────────────────────
function sceneZoom(ctx, lt) {
  const id = "48";
  const bx = X0 + 60, by = Y0 + 70, bw = CWD - 120, bh = CHT - 250;
  // zoom from 1 → 1.9, focal travels
  const z = lerp(1, 1.95, E.inOut(seg(lt, 0.4, 2.6)));
  const fx = lerp(0.5, 0.62, E.inOut(seg(lt, 0.4, 2.0)));
  const fy = lerp(0.42, 0.30, E.inOut(seg(lt, 0.4, 2.0)));
  const r = drawFitRect(IMG[id], bx, by, bw, bh);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 22;
  ctx.fillStyle = "#000"; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.restore();
  ctx.save(); rr(ctx, r.x, r.y, r.w, r.h, 2); ctx.clip();
  drawCoverZoom(ctx, IMG[id], r.x, r.y, r.w, r.h, fx, fy, z);
  ctx.restore();
  ctx.strokeStyle = C.rule; ctx.lineWidth = 1.5; ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
  // loupe chip
  const chipA = E.outCubic(seg(lt, 0.5, 1.1));
  ctx.globalAlpha = chipA;
  const chW = 150, chH = 50, chx = MIDX - chW / 2, chy = Y0 + CHT - 150;
  rr(ctx, chx, chy, chW, chH, 25); ctx.fillStyle = "rgba(12,13,18,0.8)"; ctx.fill();
  ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = C.bone1; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(chx + 38, chy + 25, 11, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(chx + 46, chy + 33); ctx.lineTo(chx + 54, chy + 41); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(chx + 34, chy + 25); ctx.lineTo(chx + 42, chy + 25); ctx.moveTo(chx + 38, chy + 21); ctx.lineTo(chx + 38, chy + 29); ctx.stroke();
  fillTextC(ctx, `×${z.toFixed(1)}`, chx + 104, chy + 33, `400 24px ${FMONO}`, C.bone1, 1, "center");
  ctx.globalAlpha = 1;
}
sceneZoom.url = "dragom.art";
sceneZoom.cap = { zh: "局部放大・細看筆觸", en: "Magnify to inspect the strokes" };
sceneZoom.cursor = (lt) => {
  const bx = X0 + 60, by = Y0 + 70, bw = CWD - 120, bh = CHT - 250;
  const x = lerp(MIDX - 60, MIDX + 120, E.inOut(seg(lt, 0.4, 2.4)));
  const y = lerp(by + bh * 0.5, by + bh * 0.32, E.inOut(seg(lt, 0.4, 2.4)));
  return { x, y, press: false, ripple: 0 };
};

// ── S4 · Filter by series ────────────────────────────────────────────────────
const DRAGON = ["12", "15", "16", "17", "19", "22"];
function sceneFilter(ctx, lt) {
  contentEyebrow(ctx, "依系列篩選 ／ FILTER");
  // pills
  const pills = [["I", "Dragon By Dragom"], ["II", "寫生"], ["III", "魔幻時刻"]];
  const tapAt = 1.1;
  const py = Y0 + 120, ph = 56; let px = X0 + 44;
  ctx.font = `400 22px ${FZH}`;
  for (let i = 0; i < pills.length; i++) {
    const [no, name] = pills[i];
    const label = `${no} · ${name}`;
    const pw = ctx.measureText(label).width + 52;
    const active = i === 0 && lt >= tapAt;
    rr(ctx, px, py, pw, ph, 28);
    ctx.fillStyle = active ? "rgba(185,167,224,0.16)" : "rgba(255,255,255,0.03)"; ctx.fill();
    ctx.strokeStyle = active ? C.moon : C.rule; ctx.lineWidth = active ? 1.8 : 1; ctx.stroke();
    fillTextC(ctx, label, px + pw / 2, py + 37, `400 22px ${FZH}`, active ? C.bone1 : C.bone3, 0.5, "center");
    px += pw + 20;
  }
  // grid of dragon works fades/reflows in after tap
  const gridA = E.outCubic(seg(lt, tapAt + 0.15, tapAt + 0.9));
  if (gridA <= 0) {
    // before tap: show an "all" looser grid hint (greyed)
  }
  const cols = 2, gy = Y0 + 230, gGap = 26;
  const cw = (CWD - 88 - gGap) / cols, chh = 290;
  for (let i = 0; i < DRAGON.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const cx = X0 + 44 + col * (cw + gGap);
    const cy = gy + row * (chh + gGap);
    const a = E.outCubic(clamp(gridA * 1.4 - i * 0.12, 0, 1));
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(0, (1 - a) * 24);
    const r = drawFitRect(IMG[DRAGON[i]], cx, cy, cw, chh);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 16;
    ctx.fillStyle = "#000"; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.restore();
    ctx.drawImage(IMG[DRAGON[i]], r.x, r.y, r.w, r.h);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    ctx.restore();
  }
}
sceneFilter.url = "dragom.art";
sceneFilter.cap = { zh: "依系列篩選", en: "Filter by series" };
sceneFilter.cursor = (lt) => {
  if (lt > 2.6) return null;
  const t = tapState(lt, 1.0);
  const x = lerp(MIDX, X0 + 150, E.inOut(seg(lt, 0.2, 0.95)));
  const y = lerp(Y0 + 360, Y0 + 148, E.inOut(seg(lt, 0.2, 0.95)));
  return { x, y, press: t.press, ripple: t.ripple };
};

// ── S5 · Statement / About ───────────────────────────────────────────────────
function sceneStatement(ctx, lt) {
  const navY = miniNav(ctx, ["首頁", "畫廊", "創作自述", "關於"], 2, false);
  const a = E.outCubic(seg(lt, 0.2, 0.9));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 16);
  fillTextC(ctx, "創作自述 ／ STATEMENT", X0 + 44, navY + 76, `400 20px ${FMONO}`, C.moon, 4, "left");
  fillTextC(ctx, "創作自述", X0 + 44, navY + 144, `300 54px ${FZH}`, C.bone1, 2, "left");
  // body — the real artist statement (sentence per line, wrapped to width)
  const STMT = [
    "我畫出一個空無一人的世界。",
    "在這片空曠而寧靜的場域裡，展開與自我的對話。",
    "當喧囂褪去，拋開人類的框架，你會看見什麼？",
    "這樣的提問，始終貫穿於我的創作之中。",
  ];
  ctx.font = `400 28px ${FZH}`;
  let ly = navY + 226;
  for (const sentence of STMT) {
    const lines = wrapCJK(ctx, sentence, CWD - 130);
    for (const ln of lines) { fillTextC(ctx, ln, X0 + 44, ly, `400 28px ${FZH}`, C.bone2, 1.5, "left"); ly += 50; }
    ly += 12; // small gap between sentences
  }
  // signature
  fillTextC(ctx, "吳享龍　Dragom · 2026", X0 + 44, ly + 36, `400 20px ${FMONO}`, C.bone4, 2, "left");
  ctx.restore();
}
sceneStatement.url = "dragom.art";
sceneStatement.cap = { zh: "創作自述・關於藝術家", en: "Statement · About the artist" };
sceneStatement.cursor = (lt) => {
  if (lt > 2.4) return null;
  const t = tapState(lt, 1.0);
  // tap the "創作自述" nav item (right side)
  const tx = X0 + CWD - 250, ty = Y0 + 54;
  const x = lerp(MIDX, tx, E.inOut(seg(lt, 0.2, 0.95)));
  const y = lerp(Y0 + 360, ty, E.inOut(seg(lt, 0.2, 0.95)));
  return { x, y, press: t.press, ripple: t.ripple };
};

// ── S6 · Language switch ─────────────────────────────────────────────────────
function sceneLang(ctx, lt) {
  const tapAt = 1.0;
  const on = lt >= tapAt;
  miniNav(ctx, ["首頁", "畫廊", "創作自述", "關於"], -1, on);
  const swap = E.inOut(seg(lt, tapAt, tapAt + 0.5));
  // headline crossfade zh → en
  const cy = Y0 + 430;
  ctx.save();
  ctx.globalAlpha = 1 - swap;
  fillTextC(ctx, "在空無一人的世界，", MIDX, cy, `300 50px ${FZH}`, C.bone1, 2, "center");
  fillTextC(ctx, "來一場與自我的對話。", MIDX, cy + 76, `300 50px ${FZH}`, C.bone1, 2, "center");
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = swap;
  fillTextC(ctx, "In a world with no one in it,", MIDX, cy, `italic 400 44px ${FSER}`, C.bone1, 0, "center");
  fillTextC(ctx, "a conversation with the self.", MIDX, cy + 70, `italic 400 44px ${FSER}`, C.bone1, 0, "center");
  ctx.restore();
  // little hint under
  fillTextC(ctx, on ? "EN" : "中文", MIDX, cy + 200, `400 22px ${FMONO}`, C.moon, 3, "center");
}
sceneLang.url = "dragom.art";
sceneLang.cap = { zh: "中／英文切換", en: "Switch language" };
sceneLang.cursor = (lt) => {
  if (lt > 2.2) return null;
  const t = tapState(lt, 1.0);
  const tx = X0 + CWD - 78, ty = Y0 + 52;
  const x = lerp(MIDX, tx, E.inOut(seg(lt, 0.2, 0.95)));
  const y = lerp(Y0 + 360, ty, E.inOut(seg(lt, 0.2, 0.95)));
  return { x, y, press: t.press, ripple: t.ripple };
};

// ── Intro / Outro (full-bleed) ───────────────────────────────────────────────
function drawIntro(ctx, lt, dur) {
  ctx.fillStyle = C.ink1; ctx.fillRect(0, 0, VW, VH);
  const exit = lt > dur - 0.6 ? E.inCubic(seg(lt, dur - 0.6, dur)) : 0;
  const ln = (d) => E.outCubic(seg(lt, d, d + 0.8));
  ctx.save(); ctx.globalAlpha = 1 - exit;
  ctx.translate(0, -exit * 14);
  fillTextC(ctx, "吳享龍 DRAGOM ／ 作品集", VW / 2, 720, `400 24px ${FMONO}`, C.moon, 6, "center");
  ctx.globalAlpha = (1 - exit) * ln(0.15);
  fillTextC(ctx, "使用指南", VW / 2, 980, `300 130px ${FZH}`, C.bone1, 8, "center");
  ctx.globalAlpha = (1 - exit) * ln(0.5);
  ctx.strokeStyle = C.bone5; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(VW / 2 - 40, 1080); ctx.lineTo(VW / 2 + 40, 1080); ctx.stroke();
  ctx.globalAlpha = (1 - exit) * ln(0.7);
  fillTextC(ctx, "A quick guide to the portfolio", VW / 2, 1170, `italic 400 40px ${FSER}`, C.bone3, 0, "center");
  ctx.restore();
}

function drawOutro(ctx, lt, dur) {
  ctx.fillStyle = C.ink1; ctx.fillRect(0, 0, VW, VH);
  const rv = (d) => E.outCubic(seg(lt, d, d + 0.85));
  // three small thumbnails along the top
  const ids = ["12", "48", "30"]; const tw = 220, th = 220, gap = 40;
  const totalW = ids.length * tw + (ids.length - 1) * gap; let tx = VW / 2 - totalW / 2;
  ctx.globalAlpha = rv(0.05);
  for (let i = 0; i < ids.length; i++) {
    const r = drawFitRect(IMG[ids[i]], tx, 560, tw, th);
    ctx.drawImage(IMG[ids[i]], r.x, r.y, r.w, r.h);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    tx += tw + gap;
  }
  ctx.globalAlpha = rv(0.3);
  fillTextC(ctx, "歡迎來逛逛", VW / 2, 980, `300 110px ${FZH}`, C.bone1, 8, "center");
  ctx.globalAlpha = rv(0.5);
  fillTextC(ctx, "Come and take a look.", VW / 2, 1062, `italic 400 38px ${FSER}`, C.bone3, 0, "center");
  ctx.globalAlpha = rv(0.85);
  ctx.strokeStyle = C.bone5; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(VW / 2 - 44, 1150); ctx.lineTo(VW / 2 + 44, 1150); ctx.stroke();
  fillTextC(ctx, "吳享龍　Dragom", VW / 2, 1240, `400 50px ${FZH}`, C.bone1, 6, "center");
  ctx.globalAlpha = rv(1.05);
  // ig pill
  const lbl = "@chishathatplanett"; ctx.font = `400 30px ${FMONO}`;
  const pw = ctx.measureText(lbl).width + 110, ph = 72, pxx = VW / 2 - pw / 2, pyy = 1330;
  rr(ctx, pxx, pyy, pw, ph, 36); ctx.strokeStyle = "rgba(236,231,220,0.18)"; ctx.lineWidth = 1.5; ctx.stroke();
  // ig glyph
  ctx.strokeStyle = C.bone1; ctx.lineWidth = 2;
  rr(ctx, pxx + 34, pyy + 22, 28, 28, 8); ctx.stroke();
  ctx.beginPath(); ctx.arc(pxx + 48, pyy + 36, 7, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.arc(pxx + 56, pyy + 29, 1.6, 0, 7); ctx.fillStyle = C.bone1; ctx.fill();
  fillTextC(ctx, lbl, pxx + 84, pyy + 46, `400 30px ${FMONO}`, C.bone1, 1, "left");
  ctx.globalAlpha = 1;
}

// ── Timeline assembly ────────────────────────────────────────────────────────
const SITE_SCENES = [sceneHome, sceneBrowse, sceneOpen, sceneZoom, sceneFilter, sceneStatement, sceneLang];
// number captions 01..N
SITE_SCENES.forEach((s, i) => { s.idx = i + 1; });
const TOTAL_STEPS = SITE_SCENES.length;

const INTRO_DUR = 3.4, OUTRO_DUR = 4.6;
const SCENE_DUR = [5.0, 4.6, 4.4, 4.4, 4.8, 4.8, 3.8]; // per site scene (home first)
const FADE = 0.45;

// build absolute schedule
// Open on the homepage as the establishing shot, then the title card, then
// the rest of the guided walkthrough.
const SCHEDULE = [];
let cursorT = 0;
SCHEDULE.push({ kind: "site", scene: SITE_SCENES[0], start: cursorT, dur: SCENE_DUR[0] });
cursorT += SCENE_DUR[0];
SCHEDULE.push({ kind: "intro", start: cursorT, dur: INTRO_DUR });
cursorT += INTRO_DUR;
for (let i = 1; i < SITE_SCENES.length; i++) {
  SCHEDULE.push({ kind: "site", scene: SITE_SCENES[i], start: cursorT, dur: SCENE_DUR[i] });
  cursorT += SCENE_DUR[i];
}
SCHEDULE.push({ kind: "outro", start: cursorT, dur: OUTRO_DUR });
const VIDEO_DUR = cursorT + OUTRO_DUR;

Object.assign(window, {
  SCHEDULE, VIDEO_DUR, TOTAL_STEPS, FADE,
  drawIntro, drawOutro, SITE_SCENES,
});
