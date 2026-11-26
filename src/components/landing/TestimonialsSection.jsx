import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import { ArrowLeft, ArrowRight, CheckSquare, Pause, Play, Sprout, Users } from "lucide-react";
import "./TestimonialsSection.css";

// Design-preview content only. Replace with consented, verified customer feedback before launch.
const stories = [
  { initials: "RK", name: "Ramesh K.", role: "Farm owner", quote: "Keeping track of fields, activities and expenses in one place makes the everyday work much easier to organize." },
  { initials: "AV", name: "Anita V.", role: "Crop grower", quote: "The crop life cycle and daily activity records help me keep a clearer picture of the entire growing season." },
  { initials: "PN", name: "Praveen N.", role: "Farm manager", quote: "From planning to harvest records, having a dedicated workspace helps bring all our farm information together." },
  { initials: "SK", name: "Suresh K.", role: "Farm owner", quote: "A simple way to record farm expenses and review what happens throughout each season." },
  { initials: "MR", name: "Meena R.", role: "Grower", quote: "I like the idea of keeping field details and crop records together instead of searching through separate notebooks." },
];
const count = stories.length;
const wrap = value => ((value % count) + count) % count;

function TestimonialCard({ story, duplicate }) {
  return (
    <article className="ifc-tm-card" aria-hidden={duplicate || undefined}>
      <span className="ifc-tm-quote-mark" aria-hidden="true">“</span>
      <blockquote>{story.quote}</blockquote>
      <div className="ifc-tm-person">
        <span className="ifc-tm-avatar" aria-hidden="true">{story.initials}</span>
        <div>
          <strong>{story.name}</strong>
          <small>{story.role} · Sample profile</small>
          <span className="ifc-tm-stars" aria-label="Illustrative rating, not a customer rating">★★★★★</span>
        </div>
      </div>
      <svg className="ifc-tm-card-hills" viewBox="0 0 320 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 39Q120 45 320 4V40H0Z" fill="currentColor" />
        <path d="M0 40Q160 0 320 23V40H0Z" fill="currentColor" opacity=".55" />
      </svg>
    </article>
  );
}

function NavigationArrow({ previous, reduced }) {
  if (reduced) return previous ? <ArrowLeft size={19} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />;
  return <span className={"ifc-tm-control-icon" + (previous ? " is-back" : "")} aria-hidden="true"><UseAnimations animation={arrowRight} size={25} interaction="hover" strokeColor="currentColor" /></span>;
}

export function TestimonialsSection() {
  const sectionRef = useRef(null);
  const windowRef = useRef(null);
  const trackRef = useRef(null);
  const position = useRef(0);
  const metrics = useRef({ stride: 0, peek: 0 });
  const activeRef = useRef(0);
  const manualAnimation = useRef(null);
  const gesture = useRef(null);
  const [active, setActive] = useState(0);
  const [preference, setPreference] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const canObserve = typeof IntersectionObserver !== "undefined";
  const inView = useInView(sectionRef, { amount: "some" });
  const playing = preference ?? !reduced;

  // Store the offset in card units so resizing does not change the selected story.
  const paint = useCallback(next => {
    position.current = next;
    const { stride, peek } = metrics.current;
    if (!stride || !trackRef.current) return;
    const offset = wrap(next);
    trackRef.current.style.transform = "translate3d(" + (peek - (count + offset) * stride) + "px,0,0)";
    const index = Math.round(offset) % count;
    if (index !== activeRef.current) {
      activeRef.current = index;
      setActive(index);
    }
  }, []);

  useEffect(() => {
    const viewport = windowRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return undefined;
    const measure = () => {
      if (track.children.length < 2) return;
      const stride = track.children[1].offsetLeft - track.children[0].offsetLeft;
      if (stride <= 0) return;
      metrics.current = { stride, peek: Math.min(72, viewport.clientWidth * .055) };
      paint(position.current);
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(viewport);
    observer?.observe(track.children[0]);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      manualAnimation.current?.stop();
    };
  }, [paint]);

  useEffect(() => {
    if (!playing || hovered || focused || (canObserve && !inView)) return undefined;
    let frame = 0;
    let last = null;
    const tick = time => {
      const delta = last === null ? 0 : Math.min(time - last, 40);
      last = time;
      if (!document.hidden && metrics.current.stride > 0) {
        // 22 pixels/second regardless of screen size or refresh rate.
        paint(wrap(position.current + delta * .022 / metrics.current.stride));
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing, hovered, focused, inView, canObserve, paint]);

  function goTo(target) {
    setPreference(false);
    manualAnimation.current?.stop();
    if (reduced || !metrics.current.stride) {
      paint(wrap(target));
      return;
    }
    manualAnimation.current = animate(position.current, target, {
      duration: .38,
      ease: [.2,.7,.2,1],
      onUpdate: paint,
      onComplete: () => paint(wrap(target)),
    });
  }

  function move(direction) {
    goTo(Math.round(position.current) + direction);
  }

  function select(index) {
    const current = Math.round(position.current);
    let distance = index - wrap(current);
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
    goTo(current + distance);
  }

  function togglePlayback() {
    manualAnimation.current?.stop();
    setPreference(!playing);
    if (!playing) setFocused(false);
  }

  function onPointerDown(event) {
    if (event.pointerType === "mouse") return;
    gesture.current = { x: event.clientX, y: event.clientY };
    setHovered(true);
  }

  function finishSwipe(event) {
    const start = gesture.current;
    gesture.current = null;
    if (!start) return;
    setHovered(false);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
  }

  function onKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  }

  const reveal = !reduced && canObserve;
  const entrance = delay => ({
    initial: reveal ? { opacity: 0, y: 14 } : false,
    whileInView: reveal ? { opacity: 1, y: 0 } : undefined,
    viewport: { once: true, amount: .15 },
    transition: { duration: reduced ? 0 : .6, delay, ease: [.2,.7,.2,1] },
  });

  return (
    <section
      id="stories"
      className="ifc-testimonials"
      ref={sectionRef}
      aria-labelledby="ifc-tm-title"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <motion.div className="ifc-tm-heading" {...entrance(0)}>
        <span className="ifc-tm-kicker">TESTIMONIALS</span>
        <h2 id="ifc-tm-title">Designed for farmers <em>like you.</em></h2>
        <p>Discover how a connected farm workspace can simplify everyday farming, from the first field to the next harvest.</p>
        <small className="ifc-tm-disclosure">Illustrative stories, profiles and ratings for design preview only — not verified customer reviews.</small>
      </motion.div>
      <motion.div
        className="ifc-tm-window"
        id="ifc-tm-window"
        ref={windowRef}
        tabIndex={0}
        role="region"
        aria-label="Illustrative testimonial carousel. Use left and right arrow keys to navigate."
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={onPointerDown}
        onPointerUp={finishSwipe}
        onPointerCancel={() => { gesture.current = null; setHovered(false); }}
        onKeyDown={onKeyDown}
        {...entrance(.08)}
      >
        <div className="ifc-tm-track" ref={trackRef}>
          {[0,1,2].map(copy => stories.map(story => <TestimonialCard key={copy + "-" + story.initials} story={story} duplicate={copy !== 1} />))}
        </div>
      </motion.div>
      <motion.div className="ifc-tm-controls" aria-label="Testimonial navigation" {...entrance(.14)}>
        <button type="button" className="ifc-tm-control" aria-label="Previous testimonial" aria-controls="ifc-tm-window" title="Previous testimonial" onClick={() => move(-1)}><NavigationArrow previous reduced={reduced} /></button>
        <button type="button" className="ifc-tm-control" aria-label={playing ? "Pause automatic scrolling" : "Play automatic scrolling"} title={playing ? "Pause" : "Play"} onClick={togglePlayback}>{playing ? <Pause size={18} fill="currentColor" aria-hidden="true" /> : <Play size={18} fill="currentColor" aria-hidden="true" />}</button>
        <div className="ifc-tm-dots" role="group" aria-label="Choose a testimonial">
          {stories.map((story,index) => <button type="button" key={story.initials} className="ifc-tm-dot" aria-label={"Show sample story " + (index + 1)} aria-pressed={index === active} onClick={() => select(index)}><span /></button>)}
        </div>
        <button type="button" className="ifc-tm-control" aria-label="Next testimonial" aria-controls="ifc-tm-window" title="Next testimonial" onClick={() => move(1)}><NavigationArrow reduced={reduced} /></button>
      </motion.div>
      <motion.div className="ifc-tm-principles" {...entrance(.2)}>
        <span><Sprout size={21} strokeWidth={1.7} aria-hidden="true" />Rooted in farming</span>
        <span><CheckSquare size={19} strokeWidth={1.7} aria-hidden="true" />Designed for everyday work</span>
        <span><Users size={21} strokeWidth={1.7} aria-hidden="true" />Growing together</span>
      </motion.div>
      <svg className="ifc-tm-contact-transition" viewBox="0 0 1200 70" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 30C300 -20 570 78 1200 14V70H0Z" className="ifc-tm-transition-layer" />
        <path d="M0 45C400 4 670 79 1200 30V70H0Z" className="ifc-tm-transition-surface" />
      </svg>
    </section>
  );
}
