/* ============================================================
   data.js — THE ONLY FILE YOU NEED TO EDIT TO ADD/CHANGE
   CROSSHAIRS ON THIS SITE (AimVault — Valorant)
   ============================================================
   FIELDS:
   - name          (required) player/creator name, e.g. "TenZ"
   - type          (required) "Pro", "Streamer", or "Community"
                    — controls the Show: filter tabs
   - team          (optional) e.g. "Sentinels"
   - role          (optional) e.g. "Duelist"
   - avatar        (required) image URL for the player/creator
   - banner        (optional) wide cover image for the detail page
   - code          (required) the copyable crosshair code
   - sensitivity / dpi / edpi   (optional stats)
   - description   (optional)
   - source        (optional) link to where the code was verified

   PREVIEW FIELDS — control the rendered crosshair image (all
   optional, defaults are used if skipped):
   - previewColor, dot, dotSize, lineLength, lineThickness, gap, outline
   ============================================================ */

const crosshairs = [
  {
    name: "Tarik",
    type: "Professional",
    team: "",
    role: "",
    avatar: "https://cdn.phototourl.com/free/2026-08-12-0ff50141-ad03-4127-a70f-f4fa06582942.png",
    code: "0;P;o;1;d;1;0b;0;1b;0",
    sensitivity: "0.348",
    dpi: "",
    edpi: "",
    description: "A clean wihite cross with a small dot center, favored for its visibility across most Valorant maps.",
    previewColor: "#4FD8E8",
    dot: true, dotSize: 2, lineLength: 8, lineThickness: 2, gap: 3, outline: true
  },
  {
    name: "ScreaM",
    type: "Pro",
    team: "Karmine Corp",
    role: "Duelist",
    avatar: "https://placehold.co/192x192/1D212B/FF4655?text=SC",
    code: "0;s;1;P;c;5;h;0;f;0;0t;1;0l;3;0o;1;0a;1;0f;0;1t;1;1l;3;1o;1;1a;1;1m;0;1f;0",
    sensitivity: "0.4",
    dpi: "400",
    edpi: "160",
    previewColor: "#FFB84D",
    dot: true, dotSize: 2, lineLength: 9, lineThickness: 3, gap: 4, outline: true
  },
  {
    name: "Aspas",
    type: "Pro",
    team: "LOUD",
    role: "Duelist",
    avatar: "https://placehold.co/192x192/1D212B/FF4655?text=AS",
    code: "0;P;h;0;f;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0",
    sensitivity: "0.35",
    dpi: "800",
    edpi: "280",
    previewColor: "#F5F3EE",
    dot: true, dotSize: 1.5, lineLength: 7, lineThickness: 2, gap: 2, outline: true
  },
  {
    name: "Shroud",
    type: "Streamer",
    role: "Flex",
    avatar: "https://placehold.co/192x192/1D212B/FF4655?text=SH",
    code: "0;P;c;5;h;0;f;0;0t;1;0l;4;0o;1;0a;1;0f;0",
    sensitivity: "0.5",
    dpi: "400",
    edpi: "200",
    previewColor: "#5DD6B3",
    dot: false, lineLength: 10, lineThickness: 2, gap: 3, outline: true
  }
];

/* ============================================================
   Below this line is helper code — no need to edit it.
   ============================================================ */
function slugify(str){
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

crosshairs.forEach((c, i) => {
  c.id = slugify(c.name) || ("crosshair-" + i);
});

function getCrosshairById(id){
  return crosshairs.find(c => c.id === id);
}

function renderCrosshairSVG(c, size){
  size = size || 120;
  const color = c.previewColor || "#5DD6B3";
  const dot = c.dot !== false;
  const dotSize = c.dotSize || 3;
  const lineLength = c.lineLength || 10;
  const thickness = c.lineThickness || 2;
  const gap = c.gap != null ? c.gap : 3;
  const outline = !!c.outline;
  const cx = size / 2, cy = size / 2;
  const outlineColor = "#000000";

  function seg(x1, y1, x2, y2){
    let s = "";
    if(outline){
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${outlineColor}" stroke-width="${thickness + 2}" stroke-linecap="square"/>`;
    }
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${thickness}" stroke-linecap="square"/>`;
    return s;
  }

  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svg += seg(cx, cy - gap - lineLength, cx, cy - gap);
  svg += seg(cx, cy + gap, cx, cy + gap + lineLength);
  svg += seg(cx - gap - lineLength, cy, cx - gap, cy);
  svg += seg(cx + gap, cy, cx + gap + lineLength, cy);
  if(dot){
    if(outline) svg += `<circle cx="${cx}" cy="${cy}" r="${dotSize + 1}" fill="${outlineColor}"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${dotSize}" fill="${color}"/>`;
  }
  svg += `</svg>`;
  return svg;
}
