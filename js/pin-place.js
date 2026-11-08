/* Pure helpers for the pinned muscle tag: no DOM access, so they are unit tested. */
const GAP = 8;

/* Convert a point from viewBox units to figure pixels. */
function toPx(pt, viewBox, box) {
  return { x: pt.x * box.w / viewBox.w, y: pt.y * box.h / viewBox.h };
}

/* Smallest box that holds every box in the list, or null for an empty list. */
function unionBox(boxes) {
  if (!boxes || !boxes.length) return null;
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  boxes.forEach((b) => {
    x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
    x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
  });
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const hits = (r, a) => r.x < a.x + a.w && r.x + r.w > a.x && r.y < a.y + a.h && r.y + r.h > a.y;

/* Place a tag of size `tag` inside `box`, directly beside the muscle (`avoid`) at the anchor height.
   It prefers the side of the body the muscle is on, then the other side, then above or below. */
function place({ anchor, box, tag, avoid }) {
  const minX = GAP, maxX = box.w - tag.w - GAP;
  const minY = GAP, maxY = Math.max(GAP, box.h - tag.h - GAP);
  const pref = anchor.x < box.w / 2 ? 'left' : 'right';
  const y = clamp(anchor.y - tag.h / 2, minY, maxY);
  const sides = [pref, pref === 'left' ? 'right' : 'left'];
  for (const side of sides) {
    const x = side === 'left' ? avoid.x - GAP - tag.w : avoid.x + avoid.w + GAP;
    if (x >= minX && x <= maxX && !hits({ x, y, w: tag.w, h: tag.h }, avoid)) return { x, y, side };
  }
  const x = clamp(anchor.x - tag.w / 2, minX, maxX);
  for (const yy of [avoid.y - tag.h - GAP, avoid.y + avoid.h + GAP]) {
    if (yy >= minY && yy <= maxY && !hits({ x, y: yy, w: tag.w, h: tag.h }, avoid)) return { x, y: yy, side: pref };
  }
  return { x: pref === 'left' ? minX : maxX, y, side: pref };
}

export const TFPin = { toPx, unionBox, place };
