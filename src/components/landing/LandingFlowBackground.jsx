import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const INTENSITY = .65;
const SPEED = .35;
const rgba = (rgb, alpha) => "rgba(" + rgb.join(",") + "," + alpha + ")";

function paint(ctx, width, height, offset, time, dark) {
  ctx.clearRect(0, 0, width, height);
  const green = dark ? [166, 202, 137] : [103, 153, 45];
  const sage = dark ? [145, 174, 142] : [138, 167, 115];
  const mint = dark ? [172, 211, 155] : [177, 205, 142];
  const forest = dark ? [86, 128, 70] : [34, 72, 35];
  const scale = Math.max(480, width);
  const alpha = INTENSITY * (width < 600 ? .75 : 1);
  const wave = (y, k) => {
    const v = (y + offset) / scale;
    return Math.sin(v * 1.7 + time * .58 + k * .36) * width * .14
      + Math.sin(v * .67 - time * .28 + k * .18) * width * .09;
  };

  // Soft, overlapping aurora glows use world coordinates, not section boundaries.
  const spacing = Math.max(380, width * .44);
  const radius = Math.max(300, width * .66);
  const first = Math.floor((offset - radius) / spacing);
  const last = Math.ceil((offset + height + radius) / spacing);
  for (let i = first; i <= last; i += 1) {
    const cy = i * spacing - offset + 140;
    const cx = width * (.5 + .36 * Math.sin(i * 1.74 + time * .22));
    const color = [green, sage, mint][((i % 3) + 3) % 3];
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    glow.addColorStop(0, rgba(color, alpha * (dark ? .075 : .13)));
    glow.addColorStop(.5, rgba(color, alpha * .055));
    glow.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(Math.max(0, cx - radius), Math.max(0, cy - radius),
      Math.min(width, cx + radius) - Math.max(0, cx - radius),
      Math.max(0, Math.min(height, cy + radius) - Math.max(0, cy - radius)));
  }

  // Translucent silk ribbons, with fine fibers that follow the same curves.
  const step = width < 600 ? 12 : 10;
  const end = Math.ceil((height + step) / step) * step;
  for (const side of [0, 1]) {
    for (let k = 0; k < 4; k += 1) {
      const color = [forest, green, mint, sage][k];
      const direction = side === 0 ? 1 : -1;
      const base = width * (side === 0 ? .075 : .925);
      const ribbonWidth = width * (.055 + k * .011);
      const center = y => base + wave(y, k + side * 7)
        + direction * (k * 11 + Math.sin((y + offset) / scale * 2.1 + time * .3 + k) * width * .045);
      const bend = y => .45 + .55 * (.5 + .5 * Math.sin((y + offset) / scale * 2.1 + time * .45 + k));
      const point = (y, fraction) => center(y) + direction * ribbonWidth * bend(y) * fraction;
      ctx.beginPath();
      for (let y = -step; y <= end; y += step) {
        if (y === -step) ctx.moveTo(point(y, 0), y);
        else ctx.lineTo(point(y, 0), y);
      }
      for (let y = end; y >= -step; y -= step) ctx.lineTo(point(y, 1), y);
      ctx.closePath();
      // Horizontal gradients stay consistent as the viewport moves down the page.
      const silk = ctx.createLinearGradient(0, 0, width, 0);
      silk.addColorStop(0, rgba(color, alpha * (dark ? .09 : .17)));
      silk.addColorStop(.5, rgba(color, alpha * (dark ? .04 : .07)));
      silk.addColorStop(1, rgba(color, alpha * (dark ? .13 : .26)));
      ctx.fillStyle = silk;
      ctx.fill();
      const fibers = width < 600 ? 3 : 6;
      for (let j = 1; j <= fibers; j += 1) {
        ctx.beginPath();
        for (let y = -step; y <= end; y += step) {
          const x = point(y, j / (fibers + 1));
          if (y === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(color, alpha * (dark ? .035 : .07));
        ctx.lineWidth = .7;
        ctx.stroke();
      }
    }
  }

  // Agricultural topographic lines share the same continuous coordinate system.
  for (const side of [0, 1]) {
    const count = width < 600 ? 12 : 18;
    const direction = side === 0 ? 1 : -1;
    const base = width * (side === 0 ? -.14 : 1.14);
    for (let i = 0; i < count; i += 1) {
      ctx.beginPath();
      for (let y = -step; y <= end; y += step) {
        const v = (y + offset) / scale;
        const x = base + direction * i * width * .013 + wave(y, side * 7 + 1)
          + Math.sin(v * 3.1 + time * .32 + i * .027) * width * .025;
        if (y === -step) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(side === 0 ? sage : green, alpha * (dark ? .10 : .19) * (i % 5 === 0 ? 1 : .6));
      ctx.lineWidth = i % 5 === 0 ? 1.2 : .75;
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
