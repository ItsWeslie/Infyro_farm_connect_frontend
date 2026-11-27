import { motion, useReducedMotion } from "motion/react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import chevronDown from "react-useanimations/lib/chevronDown";
import { Sprout, ArrowRight, CirclePlay, ShieldCheck, ChevronDown } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

import { useEffect, useLayoutEffect, useRef } from "react";

const LANDSCAPE_INTENSITY = .8;
const LANDSCAPE_SPEED = .4;
const GOLD_INTENSITY = .45;
const WOOD_INTENSITY = .3;
const CONTOUR_COUNT = 17;
const HIGHLIGHT_LINES = [0, 3, 6, 9, 12, 15];

function contourPath(i, time = null) {
  const d = time === null ? 0 : Math.sin(time * .65 + .8 + i * .036) * 13;
  const e = time === null ? 0 : Math.sin(time * .65 + .72 + i * .05) * 10;
  return `M-160 ${434 + i * 14 + d} C120 ${352 + i * 15 + e} 275 ${377 + i * 14 - d} 468 ${466 + i * 14 + d} S785 ${548 + i * 14 + e} 1000 ${421 + i * 14 - d} S1310 ${310 + i * 14 + e} 1600 ${393 + i * 14 + d}`;
}

function hillPath(near, time = null) {
  const d = time === null ? 0 : Math.sin(time * .65 + (near ? 1.9 : .5)) * 15;
  const e = time === null ? 0 : Math.sin(time * .65 + (near ? .8 : 2)) * 12;
  return near
    ? `M-100 ${585 + e} C140 ${487 + d} 280 ${505 - e} 462 ${553 + d} S788 ${587 + d} 1002 ${466 + e} S1300 ${390 - e} 1540 ${448 + d} V650 H-100 Z`
    : `M-100 ${525 + d} C145 ${385 + e} 285 ${430 - d} 460 ${482 + d} S770 ${517 + d} 970 ${406 - e} S1280 ${295 + e} 1540 ${384 - d} V650 H-100 Z`;
}

// Animate only SVG artwork, not React state or hero content.
function useLivingLandscape(heroRef, landscapeRef, reduced) {
  useEffect(() => {
    const hero = heroRef.current;
    const svg = landscapeRef.current;
    if (!hero || !svg || reduced) return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const far = svg.querySelector("[data-hill=far]");
    const near = svg.querySelector("[data-hill=near]");
    const lines = [...svg.querySelectorAll("[data-contour]")];
    const highlights = [...svg.querySelectorAll("[data-contour-highlight]")];
    const gradients = [...svg.querySelectorAll("[data-highlight-gradient]")];
    const hillGroup = svg.querySelector("[data-hill-group]");
    const contourGroup = svg.querySelector("[data-contour-group]");
    const glow = hero.querySelector(".landing-hero-glow");
    if (!far || !near || !hillGroup || !contourGroup || !glow || lines.length !== CONTOUR_COUNT) return undefined;
    let raf = 0, previous = 0, lastDraw = 0, time = 0;
    let visible = false, disposed = false, px = 0, py = 0, tx = 0, ty = 0;
    let mobile = hero.clientWidth < 600;
    const updateSize = () => { mobile = hero.clientWidth < 600; };
    const motionAllowed = () => !disposed && !media.matches && !document.hidden && visible;
    const stop = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0; previous = 0;
    };
    function reset() {
      delete hero.dataset.landscapeLive;
      far.setAttribute("d", hillPath(false));
      near.setAttribute("d", hillPath(true));
      lines.forEach((line, i) => line.setAttribute("d", contourPath(i)));
      highlights.forEach((line, i) => line.setAttribute("d", contourPath(HIGHLIGHT_LINES[i])));
      hillGroup.removeAttribute("transform");
      contourGroup.removeAttribute("transform");
      glow.style.removeProperty("--hero-sun-x");
      glow.style.removeProperty("--hero-sun-y");
      glow.style.removeProperty("--hero-earth-x");
      glow.style.removeProperty("--hero-earth-opacity");
      glow.style.removeProperty("--hero-sun-opacity");
      px = py = tx = ty = 0;
    }
    function draw() {
      if (hero.dataset.landscapeLive !== "true") hero.dataset.landscapeLive = "true";
      const depth = mobile ? 0 : 1;
      const x = px * 17.28 * depth, y = py * 8.06 * depth;
      far.setAttribute("d", hillPath(false, time));
      near.setAttribute("d", hillPath(true, time));
      hillGroup.setAttribute("transform", `translate(${x * .5} ${y * .5})`);
      contourGroup.setAttribute("transform", `translate(${x} ${y})`);
      lines.forEach((line, i) => line.setAttribute("d", contourPath(i, time)));
      highlights.forEach((line, j) => {
        const i = HIGHLIGHT_LINES[j];
        line.setAttribute("d", contourPath(i, time));
        // Move the gradient's coordinates, never its fixed [0, 1] stops.
        const center = (((time * .075 + i * .119) % 1.4) - .2) * 1440;
        gradients[j]?.setAttribute("x1", String(center - 201.6));
        gradients[j]?.setAttribute("x2", String(center + 201.6));
      });
      glow.style.setProperty("--hero-sun-x", `${79 + 13 * Math.sin(time * .48) + px * depth * 1.2}%`);
      glow.style.setProperty("--hero-sun-y", `${18 + 12 * Math.cos(time * .37) + py * depth * 1.3}%`);
      glow.style.setProperty("--hero-earth-x", `${60 + 12 * Math.sin(time * .43)}%`);
      glow.style.setProperty("--hero-sun-opacity", String(LANDSCAPE_INTENSITY * GOLD_INTENSITY * (mobile ? .75 : 1)));
      glow.style.setProperty("--hero-earth-opacity", String(LANDSCAPE_INTENSITY * WOOD_INTENSITY * (mobile ? .75 : 1)));
    }
    function frame(now) {
      raf = 0;
      if (!motionAllowed()) { previous = 0; return; }
      const elapsed = previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now;
      // Keep the last painted landscape during the cinematic transition.
      // Repainting 25 SVG paths and several gradients would compete with it.
      if (hero.dataset.cinematicEnter || hero.dataset.cinematicActive) {
        raf = window.requestAnimationFrame(frame);
        return;
      }
      time = (time + elapsed * LANDSCAPE_SPEED) % (Math.PI * 20000);
      px += (tx - px) * .06;
      py += (ty - py) * .06;
      if (now - lastDraw >= (mobile ? 50 : 40)) {
        draw();
        lastDraw = now;
      }
      raf = window.requestAnimationFrame(frame);
    }
    function start() {
      if (motionAllowed() && !raf) {
        previous = 0;
        draw();
        raf = window.requestAnimationFrame(frame);
      }
    }
    function sync() {
      if (media.matches) { stop(); reset(); }
      else if (motionAllowed()) start();
      else stop();
    }
    function pointerMove(event) {
      if (event.pointerType === "touch" || !motionAllowed() || mobile || hero.dataset.cinematicEnter || hero.dataset.cinematicActive) return;
      const rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      tx = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      ty = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    }
    function pointerLeave() { tx = ty = 0; }
    const observer = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) pointerLeave(); sync(); })
      : null;
    function measureVisibility() {
      const rect = hero.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
      sync();
    }
    if (observer) observer.observe(hero);
    else window.addEventListener("scroll", measureVisibility, { passive: true });
    window.addEventListener("resize", updateSize, { passive: true });
    hero.addEventListener("pointermove", pointerMove, { passive: true });
    hero.addEventListener("pointerleave", pointerLeave);
    hero.addEventListener("pointercancel", pointerLeave);
    document.addEventListener("visibilitychange", sync);
    media.addEventListener?.("change", sync);
    measureVisibility();
    return () => {
      disposed = true;
      stop();
      observer?.disconnect();
      if (!observer) window.removeEventListener("scroll", measureVisibility);
      window.removeEventListener("resize", updateSize);
      hero.removeEventListener("pointermove", pointerMove);
      hero.removeEventListener("pointerleave", pointerLeave);
      hero.removeEventListener("pointercancel", pointerLeave);
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener?.("change", sync);
      reset();
    };
  }, [heroRef, landscapeRef, reduced]);
}

// Keep layout measurements stable and let CSS own the entrance timeline.
const clampUnit = value => Math.max(0, Math.min(1, value));
const smoothStep = value => {
  const x = clampUnit(value);
  return x * x * (3 - 2 * x);
};

function useCinematicHero(heroRef) {
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, launchFrame = 0, launchNext = 0, disposed = false;
    let top = 0, height = 1, viewport = 1, strength = 1, lastExit = -1;
    let phase = "idle";

    function measure() {
      top = 0;
      for (let node = hero; node; node = node.offsetParent) top += node.offsetTop;
      height = Math.max(1, hero.offsetHeight);
      viewport = Math.max(1, window.innerHeight);
      strength = hero.clientWidth <= 900 ? .55 : 1;
    }
    function clearScroll() {
      hero.style.removeProperty("opacity");
      hero.style.removeProperty("transform");
      delete hero.dataset.cinematicActive;
      lastExit = -1;
    }
    function cancelEntrance() {
      if (launchFrame) window.cancelAnimationFrame(launchFrame);
      if (launchNext) window.cancelAnimationFrame(launchNext);
      launchFrame = launchNext = 0;
      phase = "idle";
      delete hero.dataset.cinematicEnter;
    }
    function update() {
      if (disposed || document.hidden) return;
      if (media.matches) { cancelEntrance(); clearScroll(); return; }
      const scroll = Math.max(0, window.scrollY - top);
      const begin = Math.max(height * .1, height - viewport * .88);
      const end = Math.max(begin + 1, height * .95);
      if (phase !== "idle") {
        if (scroll <= begin) return;
        cancelEntrance();
      }
      const exit = smoothStep((scroll - begin) / (end - begin));
      if (exit === 0) {
        if (lastExit !== 0) { clearScroll(); lastExit = 0; }
        return;
      }
      if (exit === lastExit) return;
      lastExit = exit;
      if (hero.dataset.cinematicActive !== "true") hero.dataset.cinematicActive = "true";
      // Only two compositable properties are updated on scroll. No mask,
      // inherited CSS variables, layout reads or per-frame React updates.
      hero.style.opacity = String(1 - exit);
      hero.style.transform = `translate3d(0,${-24 * exit * strength}px,0) scale(${1 - .05 * strength * exit})`;
    }
    function schedule() {
      if (!disposed && !document.hidden && !raf) {
        raf = window.requestAnimationFrame(() => { raf = 0; update(); });
      }
    }
    function resize() { measure(); lastExit = -1; schedule(); }
    function entranceFinished(event) {
      if (event.target !== hero || event.animationName !== "ifc-hero-cinematic-enter") return;
      cancelEntrance();
      update();
    }
    function beginEntrance() {
      phase = "pending";
      hero.dataset.cinematicEnter = "pending";
      // Paint the initial card pose before launching the CSS animation.
      // Unlike a wall-clock JS loop, mounting/loading work cannot consume it.
      launchFrame = window.requestAnimationFrame(() => {
        launchFrame = 0;
        launchNext = window.requestAnimationFrame(() => {
          launchNext = 0;
          if (disposed || phase !== "pending" || media.matches) return;
          phase = "running";
          hero.dataset.cinematicEnter = "running";
        });
      });
    }
    function motionChanged() {
      cancelEntrance(); clearScroll(); schedule();
    }
    function visibilityChanged() {
      if (document.hidden) {
        if (raf) window.cancelAnimationFrame(raf);
        raf = 0;
        cancelEntrance();
      } else { measure(); lastExit = -1; schedule(); }
    }
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(hero);
    hero.addEventListener("animationend", entranceFinished);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    media.addEventListener?.("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    measure();
    // A #home fragment is a valid hero entry, not a deep link.
    const hash = window.location.hash;
    const atHome = !hash || hash === "#home" || hash === "#";
    if (!media.matches && !document.hidden && atHome && Math.abs(window.scrollY - top) < 32) beginEntrance();
    else update();
    return () => {
      disposed = true;
      cancelEntrance();
      if (raf) window.cancelAnimationFrame(raf);
      observer?.disconnect();
      hero.removeEventListener("animationend", entranceFinished);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      media.removeEventListener?.("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      clearScroll();
    };
  }, [heroRef]);
}

export function LandingHero({ openAuth }) {
  const reduced = useReducedMotion();
  const heroRef = useRef(null);
  const landscapeRef = useRef(null);
  useLivingLandscape(heroRef, landscapeRef, reduced);
  useCinematicHero(heroRef);
  const enter = delay => ({ initial: reduced ? false : { opacity: .72, y: 8 }, animate: { opacity: 1, y: 0 }, transition: reduced ? { duration: 0 } : { duration: .65, delay: delay * .7, ease: [.16,1,.3,1] } });
  return (
    <section className="landing-hero ifc-hero-cinematic" ref={heroRef}>
      <motion.svg
        ref={landscapeRef}
        initial={false} animate={{ opacity: 1 }}
        className="landing-hero-landscape"
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="ifc-landscape-far" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--hero-hill-far)" stopOpacity=".08" />
            <stop offset="1" stopColor="var(--hero-hill-far)" stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="ifc-landscape-near" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--hero-hill-near)" stopOpacity=".24" />
            <stop offset="1" stopColor="var(--hero-hill-near)" stopOpacity=".58" />
          </linearGradient>
          <linearGradient id="ifc-landscape-contour" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="var(--hero-contour)" stopOpacity=".18" />
            <stop offset=".45" stopColor="var(--hero-contour)" stopOpacity=".6" />
            <stop offset="1" stopColor="var(--hero-contour)" stopOpacity=".85" />
          </linearGradient>
          <linearGradient id="ifc-landscape-wood" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="var(--hero-wood)" stopOpacity={.18 * WOOD_INTENSITY} />
            <stop offset=".45" stopColor="var(--hero-wood)" stopOpacity={.6 * WOOD_INTENSITY} />
            <stop offset="1" stopColor="var(--hero-wood)" stopOpacity={.85 * WOOD_INTENSITY} />
          </linearGradient>
          {HIGHLIGHT_LINES.map(i => (
            <linearGradient key={i} id={`ifc-hero-highlight-${i}`} data-highlight-gradient={i}
              gradientUnits="userSpaceOnUse" x1="-490" y1="0" x2="-86" y2="0">
              <stop offset="0" stopColor="#F2B831" stopOpacity="0" />
              <stop offset=".5" stopColor="#F2B831" stopOpacity={.95 * GOLD_INTENSITY * LANDSCAPE_INTENSITY} />
              <stop offset="1" stopColor="#F2B831" stopOpacity="0" />
            </linearGradient>
          ))}
          <clipPath id="ifc-landscape-clip">
            <rect width="1440" height="620" />
          </clipPath>
        </defs>
        <g clipPath="url(#ifc-landscape-clip)">
          <g data-hill-group="">
            <path data-hill="far" d={hillPath(false)} fill="url(#ifc-landscape-far)" />
            <path data-hill="near" d={hillPath(true)} fill="url(#ifc-landscape-near)" />
          </g>
          <g data-contour-group="">
            <g className="landing-hero-field-lines" stroke="url(#ifc-landscape-contour)">
              {Array.from({ length: CONTOUR_COUNT }, (_, i) => (
                <path key={i} data-contour={i} d={contourPath(i)} className={i % 6 === 0 ? "ifc-hero-wood-line" : undefined} />
              ))}
            </g>
            <g className="ifc-hero-contour-highlights" fill="none">
              {HIGHLIGHT_LINES.map(i => (
                <path key={i} data-contour-highlight={i} d={contourPath(i)} stroke={`url(#ifc-hero-highlight-${i})`} />
              ))}
            </g>
          </g>
        </g>
      </motion.svg>
      <div className="landing-hero-glow" aria-hidden="true" />
      <div className="landing-hero-shade" aria-hidden="true" />
      <div className="landing-hero-inner">
        <div className="landing-hero-copy">
          <motion.div className="landing-eyebrow" {...enter(0.1)}>
            <span className="landing-eyebrow-mark"><Sprout size={14} aria-hidden="true" /></span>
            A product by Infyro Inc.
          </motion.div>
          <motion.h1 {...enter(0.22)}>
            Grow smarter.
            <br />
            <em>Manage better.</em>
          </motion.h1>
          <motion.p className="landing-hero-description" {...enter(0.36)}>
            A connected farm management platform built by Infyro Inc. Manage fields,
            track crops, record expenses and plan your harvests — all in one place.
          </motion.p>
          <motion.div className="landing-hero-actions" {...enter(0.5)}>
            <button type="button" className="landing-button landing-hero-primary" onClick={() => openAuth("signup")}>
              Get started for free
              <span className="landing-hero-button-icon" aria-hidden="true">
                {reduced ? <ArrowRight size={19} /> : <UseAnimations animation={arrowRight} size={23} strokeColor="currentColor" interaction="hover" />}
              </span>
            </button>
            <a className="landing-secondary-action" href="#features">
              <span aria-hidden="true"><CirclePlay size={18} /></span>
              Explore platform
            </a>
          </motion.div>
          <motion.div className="landing-trust-note" {...enter(0.62)}>
            <ShieldCheck size={15} aria-hidden="true" /> Your farm workspace, made for you.
          </motion.div>
        </div>
        <DashboardPreview />
      </div>
      <a className="landing-scroll-cue" href="#features" aria-label="Explore more features">
        <span>Explore more</span>
        <span className="landing-scroll-cue-icon" aria-hidden="true">
          {reduced ? <ChevronDown size={18} /> : <UseAnimations animation={chevronDown} size={23} strokeColor="currentColor" interaction="hover" />}
        </span>
      </a>
    </section>
  );
}
