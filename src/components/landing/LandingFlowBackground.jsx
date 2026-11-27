import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const INTENSITY = .65;
const SPEED = .35;
const rgba = (rgb, alpha) => "rgba(" + rgb.join(",") + "," + alpha + ")";

// Warm colors belong to the decorative canvas only, never component accents.
const GOLD_INTENSITY = .45;
const WOOD_INTENSITY = .30;

function paint(ctx, width, height, offset, time, dark) {
  ctx.clearRect(0, 0, width, height);
  const palette = {
    green: dark ? [166, 202, 137] : [103, 153, 45],
    gold: [242, 184, 49],
    earth: dark ? [198, 173, 128] : [135, 80, 31],
    cream: dark ? [150, 169, 139] : [250, 249, 242],
  };
  const weight = { green: 1, gold: GOLD_INTENSITY, earth: WOOD_INTENSITY, cream: 1 };
  const scale = Math.max(480, width);
  const alpha = INTENSITY * (width < 600 ? .8 : 1);
  const tone = (key, opacity) => rgba(palette[key], alpha * weight[key] * opacity);
  const wave = (y, k) => {
    const v = (y + offset) / scale;
    return Math.sin(v * 1.7 + time * .58 + k * .36) * width * .14
      + Math.sin(v * .67 - time * .28 + k * .18) * width * .09;
  };

  // Soft cream, sage, gold and woody brown aurora, in continuous page coordinates.
  const spacing = Math.max(330, width * .4);
  const radius = Math.max(300, width * .68);
  const first = Math.floor((offset - radius) / spacing);
  const last = Math.ceil((offset + height + radius) / spacing);
  const glowKeys = ["cream", "green", "gold", "earth"];
  for (let i = first; i <= last; i += 1) {
    const cy = i * spacing - offset + 130;
    const cx = width * (.5 + .36 * Math.sin(i * 1.74 + time * .22));
    const key = glowKeys[((i % 4) + 4) % 4];
    const x = Math.max(0, cx - radius);
    const y = Math.max(0, cy - radius);
    const right = Math.min(width, cx + radius);
    const bottom = Math.min(height, cy + radius);
    if (right <= x || bottom <= y) continue;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    glow.addColorStop(0, tone(key, dark ? .14 : .32));
    glow.addColorStop(.5, tone(key, dark ? .045 : .13));
    glow.addColorStop(1, tone(key, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, right - x, bottom - y);
  }

  // Silk ribbons follow the approved preview's asymmetric color order.
  const step = width < 600 ? 12 : 8;
  const end = Math.ceil((height + step) / step) * step;
  for (const side of [0, 1]) {
    const keys = side === 0 ? ["earth", "cream", "gold", "green"] : ["green", "cream", "gold", "earth"];
    for (let k = 0; k < 4; k += 1) {
      const key = keys[k];
      const direction = side === 0 ? 1 : -1;
      const base = width * (side === 0 ? .06 : .94);
      const ribbonWidth = width * (.065 + k * .014);
      const center = y => base + wave(y, k + side * 7)
        + direction * (k * 12 + Math.sin((y + offset) / scale * 2.1 + time * .3 + k) * width * .035);
      const bend = y => .55 + .45 * (.5 + .5 * Math.sin((y + offset) / scale * 2.1 + time * .45 + k));
      const point = (y, fraction) => center(y) + direction * ribbonWidth * bend(y) * fraction;
      ctx.beginPath();
      for (let y = -step; y <= end; y += step) {
        if (y === -step) ctx.moveTo(point(y, 0), y);
        else ctx.lineTo(point(y, 0), y);
      }
      for (let y = end; y >= -step; y -= step) ctx.lineTo(point(y, 1), y);
      ctx.closePath();
      const silk = ctx.createLinearGradient(0, 0, width, 0);
      silk.addColorStop(0, tone(key, dark ? .23 : .30));
      silk.addColorStop(.5, tone(key, dark ? .07 : .11));
      silk.addColorStop(1, tone(key, dark ? .25 : .35));
      ctx.fillStyle = silk;
      ctx.fill();
      const fibers = width < 600 ? 3 : 5;
      for (let j = 1; j <= fibers; j += 1) {
        ctx.beginPath();
        for (let y = -step; y <= end; y += step) {
          const x = point(y, j / (fibers + 1));
          if (y === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = tone(key, dark ? .09 : .14);
        ctx.lineWidth = .7;
        ctx.stroke();
      }
    }
  }

  // Thin brown and green contours with occasional gold threads.
  const contourStep = 10;
  for (const side of [0, 1]) {
    const count = width < 600 ? 16 : 22;
    const direction = side === 0 ? 1 : -1;
    const base = width * (side === 0 ? -.12 : 1.12);
    for (let i = 0; i < count; i += 1) {
      const key = side === 0 ? (i % 4 === 0 ? "gold" : "earth") : (i % 6 === 0 ? "gold" : "green");
      ctx.beginPath();
      for (let y = -contourStep; y <= height + contourStep; y += contourStep) {
        const v = (y + offset) / scale;
        const x = base + direction * i * width * .013 + wave(y, side * 7 + 1)
          + Math.sin(v * 3.1 + time * .32 + i * .027) * width * .025;
        if (y === -contourStep) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = tone(key, (dark ? .23 : .36) * (i % 5 === 0 ? 1 : .65));
      ctx.lineWidth = i % 5 === 0 ? 1.25 : .8;
      ctx.stroke();
    }
  }

  // Feather the start without changing the existing hero.
  if (offset < 100) {
    const fade = ctx.createLinearGradient(0, -offset, 0, 100 - offset);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,1)");
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }
}

export function LandingFlowBackground({ theme }) {
  const layerRef = useRef(null);
  const canvasRef = useRef(null);
  const themeRef = useRef(theme);
  const redrawRef = useRef(null);

  useEffect(() => {
    themeRef.current = theme;
    redrawRef.current?.();
  }, [theme]);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const root = layer?.closest(".landing-page");
    const start = root?.querySelector(".ifc-landscape-commitment");
    const footer = root?.querySelector(".ifc-landscape-footer");
    if (!layer || !canvas || !root || !start || !footer) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, previous = 0, lastPaint = 0, time = 0, dirty = true;
    let startY = 0, extent = 0, width = 0, height = 0, pixelRatio = 1;
    let offset = 0, disposed = false;

    function schedule() {
      if (!disposed && !document.hidden && !raf) raf = window.requestAnimationFrame(frame);
    }
    function invalidate() {
      dirty = true;
      schedule();
    }
    function measure() {
      const rootRect = root.getBoundingClientRect();
      const startRect = start.getBoundingClientRect();
      const endRect = footer.getBoundingClientRect();
      startY = startRect.top + window.scrollY;
      extent = Math.max(0, endRect.bottom - startRect.top);
      layer.style.top = (startRect.top - rootRect.top) + "px";
      layer.style.height = extent + "px";
      width = root.clientWidth;
      height = Math.min(extent, window.innerHeight);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5,
        Math.sqrt(1800000 / Math.max(1, width * height)));
      const pw = Math.max(1, Math.round(width * pixelRatio));
      const ph = Math.max(1, Math.round(height * pixelRatio));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      canvas.style.height = height + "px";
      canvas.style.width = width + "px";
      ctx.setTransform(pw / Math.max(1, width), 0, 0, ph / Math.max(1, height), 0, 0);
      invalidate();
    }
    function frame(now) {
      raf = 0;
      if (disposed || document.hidden) return;
      const top = window.scrollY - startY;
      const visible = top < extent && top + window.innerHeight > 0;
      if (!visible || !width || !height) { previous = 0; return; }
      const nextOffset = Math.max(0, Math.min(top, extent - height));
      const moved = nextOffset !== offset;
      if (moved) {
        offset = nextOffset;
        canvas.style.transform = "translate3d(0," + offset + "px,0)";
      }
      const elapsed = previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now;
      if (!motion.matches) time = (time + elapsed * SPEED * .6) % (TAU * 10000);
      if (dirty || moved || (!motion.matches && now - lastPaint >= 32)) {
        paint(ctx, width, height, offset, time, themeRef.current === "dark");
        dirty = false;
        lastPaint = now;
      }
      if (!motion.matches) schedule();
    }
    function visibilityChanged() {
      previous = 0;
      if (document.hidden) {
        if (raf) window.cancelAnimationFrame(raf);
        raf = 0;
      } else invalidate();
    }
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(root);
    observer?.observe(start);
    observer?.observe(footer);
    const hero = root.querySelector(".landing-hero");
    if (hero) observer?.observe(hero);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    motion.addEventListener?.("change", invalidate);
    document.addEventListener("visibilitychange", visibilityChanged);
    redrawRef.current = invalidate;
    measure();

    return () => {
      disposed = true;
      if (raf) window.cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", measure);
      motion.removeEventListener?.("change", invalidate);
      document.removeEventListener("visibilitychange", visibilityChanged);
      redrawRef.current = null;
    };
  }, []);

  return <div className="ifc-landing-flow" ref={layerRef} aria-hidden="true">
    <canvas ref={canvasRef} />
  </div>;
}
