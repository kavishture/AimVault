/*
  AimVault logical-pixel Valorant crosshair renderer.
  The parser is deliberately tolerant: unknown keys are ignored.
  Geometry is rasterized once to a logical canvas, then the same raster is
  enlarged with imageSmoothingEnabled=false for magnified mode.
*/
(function () {
  const COLORS = {
    0: "#ffffff", 1: "#00ff00", 2: "#00b8ff", 3: "#00d9ff",
    4: "#ff4655", 5: "#00ffff", 6: "#7a5cff", 7: "#ffffff"
  };

  const DEFAULTS = {
    color: 0, outline: false, outlineOpacity: 1, outlineThickness: 1,
    centerDot: false, centerDotOpacity: 1, centerDotThickness: 1,
    inner: { enabled: true, thickness: 1, lengthH: 4, lengthV: 4, opacity: 1, gap: 2, fade: false, movement: false },
    outer: { enabled: false, thickness: 1, lengthH: 2, lengthV: 2, opacity: 1, gap: 3, fade: false, movement: false },
    movementError: false, firingError: false, profile: "P"
  };

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  function num(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function parseValorantCode(code) {
    if (typeof code !== "string" || !code.trim()) throw new Error("Invalid Valorant crosshair code");
    const tokens = code.trim().split(";").map(v => v.trim()).filter(Boolean);
    const settings = cloneDefaults();
    let recognized = 0;

    if (tokens[0] !== "0") {
      // Codes may occasionally be pasted with a prefix. We still scan the pairs.
      if (!tokens.some(t => t === "P" || t === "A" || t === "c")) throw new Error("Invalid Valorant crosshair code");
    }

    for (let i = 0; i < tokens.length; i += 2) {
      const key = tokens[i];
      const value = tokens[i + 1];
      if (value === undefined) continue;
      const n = num(value, null);

      switch (key) {
        case "P": settings.profile = value; recognized++; break;
        case "A": recognized++; break;
        case "c": if (n !== null) { settings.color = n; recognized++; } break;
        case "o": settings.outline = n > 0; recognized++; break;
        case "h": settings.outlineOpacity = Math.max(0, Math.min(1, n ?? 1)); recognized++; break;
        case "t": settings.outlineThickness = Math.max(0, Math.round(n ?? 1)); recognized++; break;
        case "d": settings.centerDot = n > 0; recognized++; break;
        case "z": settings.centerDotThickness = Math.max(1, Math.round(n ?? 1)); recognized++; break;
        case "a": settings.centerDotOpacity = Math.max(0, Math.min(1, n ?? 1)); recognized++; break;
        case "0t": settings.inner.thickness = Math.max(1, Math.round(n ?? 1)); recognized++; break;
        case "0l": settings.inner.lengthH = Math.max(0, Math.round(n ?? 0)); recognized++; break;
        case "0v": settings.inner.lengthV = Math.max(0, Math.round(n ?? settings.inner.lengthH)); recognized++; break;
        case "0a": settings.inner.opacity = Math.max(0, Math.min(1, n ?? 1)); recognized++; break;
        case "0g": settings.inner.gap = Math.max(0, Math.round(n ?? 0)); recognized++; break;
        case "0f": settings.inner.fade = n > 0; recognized++; break;
        case "0b": settings.inner.movement = n > 0; recognized++; break;
        case "1t": settings.outer.thickness = Math.max(1, Math.round(n ?? 1)); recognized++; break;
        case "1l": settings.outer.lengthH = Math.max(0, Math.round(n ?? 0)); recognized++; break;
        case "1v": settings.outer.lengthV = Math.max(0, Math.round(n ?? settings.outer.lengthH)); recognized++; break;
        case "1a": settings.outer.opacity = Math.max(0, Math.min(1, n ?? 1)); recognized++; break;
        case "1g": settings.outer.gap = Math.max(0, Math.round(n ?? 0)); recognized++; break;
        case "1f": settings.outer.fade = n > 0; recognized++; break;
        case "1b": settings.outer.movement = n > 0; recognized++; break;
        case "f": settings.firingError = n > 0; recognized++; break;
        case "m": settings.movementError = n > 0; recognized++; break;
        default: break;
      }
    }

    if (!recognized) throw new Error("Invalid Valorant crosshair code");
    return settings;
  }

  function rgba(hex, opacity) {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, opacity))})`;
  }

  function drawRect(ctx, x, y, w, h, color) {
    if (w <= 0 || h <= 0) return;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function renderCrosshair(settings) {
    const inner = settings.inner;
    const outer = settings.outer;
    const maxH = Math.max(inner.lengthH, outer.gap + outer.lengthH, settings.centerDotThickness);
    const maxV = Math.max(inner.lengthV, outer.gap + outer.lengthV, settings.centerDotThickness);
    const outlinePad = settings.outline ? settings.outlineThickness : 0;
    const halfW = Math.max(1, maxH + inner.gap + outer.gap + outlinePad + 2);
    const halfH = Math.max(1, maxV + inner.gap + outer.gap + outlinePad + 2);
    const width = halfW * 2 + 1, height = halfH * 2 + 1;
    const cx = halfW, cy = halfH;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: true });
    ctx.clearRect(0, 0, width, height);

    const color = COLORS[settings.color] || COLORS[0];

    function linePair(group, opacity, isOuter) {
      if (!group.enabled) return;
      const gap = group.gap;
      const t = group.thickness;
      const lh = group.lengthH;
      const lv = group.lengthV;
      const offsetH = gap + lh / 2;
      const offsetV = gap + lv / 2;

      // Horizontal bars extend left/right, with independent horizontal length.
      const hY = cy - t / 2;
      const vX = cx - t / 2;
      const leftX = cx - gap - lh;
      const rightX = cx + gap;
      const topY = cy - gap - lv;
      const bottomY = cy + gap;

      if (settings.outline) {
        const ot = settings.outlineThickness;
        const oc = rgba("#000000", settings.outlineOpacity);
        drawRect(ctx, leftX - ot, hY - ot, lh + ot, t + ot * 2, oc);
        drawRect(ctx, rightX, hY - ot, lh + ot, t + ot * 2, oc);
        drawRect(ctx, vX - ot, topY - ot, t + ot * 2, lv + ot, oc);
        drawRect(ctx, vX - ot, bottomY, t + ot * 2, lv + ot, oc);
      }

      const fill = rgba(color, opacity);
      drawRect(ctx, leftX, hY, lh, t, fill);
      drawRect(ctx, rightX, hY, lh, t, fill);
      drawRect(ctx, vX, topY, t, lv, fill);
      drawRect(ctx, vX, bottomY, t, lv, fill);
    }

    linePair(inner, inner.opacity, false);
    linePair(outer, outer.opacity, true);

    if (settings.centerDot) {
      const d = Math.max(1, settings.centerDotThickness);
      if (settings.outline) {
        const ot = settings.outlineThickness;
        drawRect(ctx, cx - d / 2 - ot, cy - d / 2 - ot, d + ot * 2, d + ot * 2, rgba("#000000", settings.outlineOpacity));
      }
      drawRect(ctx, cx - d / 2, cy - d / 2, d, d, rgba(color, settings.centerDotOpacity));
    }

    return canvas;
  }

  window.AimVaultRenderer = { parseValorantCode, renderCrosshair };
})();
