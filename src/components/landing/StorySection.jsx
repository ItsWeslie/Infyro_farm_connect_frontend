import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import { ArrowRight, CalendarDays, Check, ChevronRight, CirclePlay, Layers, Sprout, Wallet, Wheat } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import "./StorySection.css";

const farmerImage = import.meta.env.BASE_URL + "images/our-approach-farmer.webp";
const activities = ["Land Preparation", "Planting", "Fertilizing", "Irrigation"];
const steps = [
  { icon: Sprout, title: "Start with your farm", description: "Organize your farms and fields, add crop details and keep the essentials in one workspace." },
  { icon: CalendarDays, title: "Keep track of everyday work", description: "Record planting, irrigation, fertilizing and other activities as they happen throughout the season." },
  { icon: Wallet, title: "Understand your costs", description: "Capture farm expenses and review your spending alongside your daily records." },
  { icon: Wheat, title: "Learn from every harvest", description: "Record harvest quantities and review your seasonal history before planning the next crop." },
];

function Count({ value, prefix = "", suffix = "", active }) {
  const number = useMotionValue(0);
  const formatted = useTransform(number, latest => prefix + Math.round(latest).toLocaleString("en-IN") + suffix);
  useEffect(() => {
    if (!active) return undefined;
    const controls = animate(number, value, { duration: 1.1, ease: "easeOut", delay: .45 });
    return () => controls.stop();
  }, [active, number, value]);
  return <span className="ifc-story-value" aria-label={prefix + value.toLocaleString("en-IN") + suffix}>{active ? <motion.span aria-hidden="true">{formatted}</motion.span> : prefix + value.toLocaleString("en-IN") + suffix}</span>;
}

function CardHead({ icon: Icon, title }) {
  return <div className="ifc-story-card-head"><span className="ifc-story-symbol"><Icon size={19} strokeWidth={1.9} aria-hidden="true" /></span><strong>{title}</strong></div>;
}

function CropActivityCard({ active }) {
  return <article className="ifc-story-card"><CardHead icon={CalendarDays} title="Crop Activity" />
    <ul className="ifc-story-activity-list">{activities.map((name, index) => <li key={name}><span className={"ifc-story-check" + (index < 2 ? " is-done" : "")} aria-label={index < 2 ? "Complete" : "Pending"}>{index < 2 && <motion.span initial={false} animate={active ? { scale: [0, 1.15, 1] } : { scale: 1 }} transition={{ duration: .4, delay: active ? .55 + index * .18 : 0 }}><Check size={12} strokeWidth={2.5} aria-hidden="true" /></motion.span>}</span>{name}</li>)}</ul>
  </article>;
}

function ExpensesCard({ active }) {
  return <article className="ifc-story-card"><CardHead icon={Wallet} title="Expenses" /><Count value={12450} prefix="₹" active={active} /><span className="ifc-story-trend">↑ Within plan</span></article>;
}

function DigitalRecordsCard() {
  return <article className="ifc-story-card"><div className="ifc-story-card-head"><span className="ifc-story-symbol"><Layers size={20} strokeWidth={1.9} aria-hidden="true" /></span><div className="ifc-story-record-text"><strong>Digital Records</strong><small>Fields · Inputs · Activities</small></div><ChevronRight className="ifc-story-record-arrow" size={17} aria-hidden="true" /></div></article>;
}

function HarvestSummaryCard({ active }) {
  return <article className="ifc-story-card"><CardHead icon={Wheat} title="Harvest Summary" /><div className="ifc-story-harvest-body"><div><Count value={4320} suffix=" kg" active={active} /><span className="ifc-story-trend">↑ +18% vs. last season</span></div><div className="ifc-story-chart" aria-hidden="true">{[28,44,65,94].map((height, index) => <motion.span key={height} style={{ height: height + "%", opacity: .42 + index * .17 }} initial={false} animate={{ scaleY: active ? [0, 1] : 1 }} transition={{ duration: .65, delay: active ? .65 + index * .13 : 0 }} />)}</div></div></article>;
}

function FarmerVisual({ reduced }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: .2 });
  const canAnimate = !reduced && typeof IntersectionObserver !== "undefined";
  const active = canAnimate && inView;
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const cards = [
    ["activity", CropActivityCard], ["expense", ExpensesCard],
    ["records", DigitalRecordsCard], ["harvest", HarvestSummaryCard],
  ];
  return <div className={"ifc-story-visual" + (active ? " is-in-view" : "")} ref={ref}>
    <motion.div className="ifc-story-image-frame" initial={canAnimate ? { opacity: 0 } : false} animate={{ opacity: !canAnimate || inView ? 1 : 0 }} transition={{ duration: reduced ? 0 : .75 }}>
      {!imageUnavailable ? <motion.img src={farmerImage} alt="A farmer wearing a straw hat and beige shirt among sunlit green crops" loading="lazy" decoding="async" width={1500} height={844} onError={() => setImageUnavailable(true)} initial={false} animate={{ scale: active ? [1.035, 1] : 1 }} transition={{ duration: 1.25, ease: "easeOut" }} /> : <div className="ifc-story-image-unavailable" aria-hidden="true"><Sprout size={100} strokeWidth={.7} /></div>}
    </motion.div>
    <div className="ifc-story-card-grid">
      {cards.map(([id, Card], index) => <motion.div key={id} className={"ifc-story-float ifc-story-float-" + id} initial={canAnimate ? { opacity: 0, y: 15 } : false} animate={!canAnimate || inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }} transition={{ duration: reduced ? 0 : .6, delay: active ? .2 + index * .12 : 0, ease: [.2,.7,.2,1] }}><Card active={active} /></motion.div>)}
    </div>
    <span className="ifc-story-sample">Illustrative product data</span>
  </div>;
}

function StoryWalkthrough({ reduced }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  return <Dialog onOpenChange={open => { if (open) setStep(0); }}>
    <DialogTrigger asChild><button type="button" className="ifc-story-secondary"><CirclePlay size={19} aria-hidden="true" />See the Story</button></DialogTrigger>
    <DialogContent className="ifc-story-dialog">
      <DialogTitle>Your farm, every season</DialogTitle>
      <DialogDescription>Discover how Infyro Farm brings the everyday work of farming together.</DialogDescription>
      <motion.div key={step} className="ifc-story-step" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .25 }}>
        <span className="ifc-story-symbol"><Icon size={21} aria-hidden="true" /></span><h3>{current.title}</h3><p>{current.description}</p>
      </motion.div>
      <div className="ifc-story-step-controls">
        <button type="button" className="ifc-story-secondary" disabled={step === 0} onClick={() => setStep(previous => previous - 1)}>Previous</button>
        <span className="ifc-story-step-count" aria-live="polite">Step {step + 1} of {steps.length}</span>
        {step === steps.length - 1 ? <DialogClose asChild><button type="button" className="ifc-story-primary">Done <Check size={17} /></button></DialogClose> : <button type="button" className="ifc-story-primary" onClick={() => setStep(previous => previous + 1)}>Next <ArrowRight size={17} /></button>}
      </div>
    </DialogContent>
  </Dialog>;
}

export function StorySection({ openAuth }) {
  const reduced = useReducedMotion();
  const canAnimate = !reduced && typeof IntersectionObserver !== "undefined";
  const enter = delay => ({
    initial: canAnimate ? { opacity: 0, y: 16 } : false,
    whileInView: canAnimate ? { opacity: 1, y: 0 } : undefined,
    viewport: { once: true, amount: .18 },
    transition: { duration: reduced ? 0 : .65, delay: canAnimate ? delay : 0, ease: [.2,.7,.2,1] },
  });
  return <section id="why-infyro" className="ifc-people-story" aria-labelledby="ifc-story-title">
    <div className="ifc-story-shapes" aria-hidden="true"><span /></div>
    <div className="ifc-story-copy">
      <motion.span className="ifc-story-kicker" {...enter(0)}>OUR APPROACH</motion.span>
      <motion.h2 id="ifc-story-title" {...enter(.1)}>People-first technology for modern farming</motion.h2>
      <motion.p {...enter(.2)}>Farming is a story of people — their dedication, decisions, and daily effort to grow more, sustain their land, and support their families. Infyro Farm brings simple, powerful technology to that journey, turning everyday farm activities into clear records, smarter insights, and greater confidence.</motion.p>
      <motion.div className="ifc-story-actions" {...enter(.3)}>
        <button type="button" className="ifc-story-primary" onClick={() => openAuth("signup")}>Start Your Farm Journey <span aria-hidden="true">{reduced ? <ArrowRight size={19} /> : <UseAnimations animation={arrowRight} size={22} interaction="hover" strokeColor="currentColor" />}</span></button>
        <StoryWalkthrough reduced={reduced} />
      </motion.div>
    </div>
    <FarmerVisual reduced={reduced} />
  </section>;
}
