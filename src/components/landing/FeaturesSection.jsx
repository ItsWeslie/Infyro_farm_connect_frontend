import { motion, useReducedMotion } from "motion/react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import { Tractor, ArrowRight, Sprout, Wheat, Wallet, ClipboardList, CalendarDays, Droplets, Leaf, ScanLine } from "lucide-react";

const features = [
  { id: "farms", icon: Tractor, label: "FARM & FIELD MANAGEMENT", title: "Every farm. Every field.", description: "Organize your farms, manage growing spaces and keep track of available land — all within a single connected workspace." },
  { id: "crops", icon: Sprout, label: "CROP MANAGEMENT", title: "Grow with confidence.", description: "Follow every stage of your crops, monitor planting progress and stay informed from seed to harvest." },
  { id: "calendar", icon: CalendarDays, label: "FARM CALENDAR", title: "Stay ahead of the season.", description: "Keep important planting dates, expected harvests and upcoming milestones in one organized calendar." },
  { id: "activities", icon: ClipboardList, label: "DAILY ACTIVITIES", title: "Every effort, accounted for.", description: "Capture everyday farm activities and maintain a meaningful history of the work behind each growing season." },
  { id: "expenses", icon: Wallet, label: "EXPENSE MANAGEMENT", title: "Know where every rupee goes.", description: "Record agricultural expenses, understand spending patterns and gain a clearer picture of your farming costs." },
  { id: "harvest", icon: Wheat, label: "HARVEST RECORDS", title: "Every harvest tells a story.", description: "Record harvest quantities and build an organized history of your farm's production over time." },
];

function Count({ value, prefix = "", suffix = "" }) {
  return <span className="ifc-feature-count" style={{ "--ifc-target": value }} data-prefix={prefix} data-suffix={suffix}><span>{prefix}{value}{suffix}</span></span>;
}

function FarmPreview() {
  return (
    <div className="ifc-preview-farms">
      <div className="ifc-preview-breadcrumb">Farm workspace / Farms</div>
      <div className="ifc-preview-heading"><strong>Farm directory</strong><span className="ifc-preview-add">+ Add farm</span></div>
      <div className="ifc-preview-farm-grid">
        {[["Green Valley Farm", "12 acres · 4 fields"], ["Sunrise Farm", "8 acres · 2 fields"]].map(([name, detail], index) => (
          <div className="ifc-preview-farm ifc-preview-row-motion" key={name} style={{ "--row": index }}>
            <svg className={"ifc-preview-farm-art farm-art-" + index} viewBox="0 0 52 58" aria-hidden="true">
              <rect width="52" height="58" rx="7" fill="var(--farm-art-sky)" />
              <circle cx="37" cy="15" r="8" fill="#e5c487" />
              <path d="M0 37 Q19 17 52 35 V58 H0Z" fill="var(--farm-art-far)" />
              <path d="M0 46 Q29 25 52 44 V58 H0Z" fill="var(--farm-art-near)" />
              <path d="M9 58 Q19 47 36 40 M24 58 Q34 50 46 45" stroke="#e1e8bb" opacity=".7" fill="none" />
            </svg>
            <div><strong>{name}</strong><small>{detail}</small><span className="ifc-preview-link">View farm <ArrowRight size={10} /></span></div>
          </div>
        ))}
      </div>
      <strong className="ifc-preview-subheading">Fields in this farm</strong>
      <table className="ifc-preview-table">
        <thead><tr><th>Field name</th><th>Total area</th><th>Available area</th></tr></thead>
        <tbody><tr className="ifc-preview-row-motion" style={{ "--row": 2 }}><td>North Field</td><td>4 acres</td><td>2.5 acres</td></tr></tbody>
      </table>
    </div>
  );
}

function CropPreview() {
  return (
    <>
      <strong className="ifc-preview-title">Crop progress</strong>
      {[["Tomato", "North Field", 65], ["Rice", "Paddy Field", 82]].map(([name, field, progress], index) => (
        <div className="ifc-preview-crop ifc-preview-row-motion" style={{ "--row": index }} key={name}>
          <span className="ifc-preview-symbol"><Sprout size={16} /></span>
          <div className="ifc-preview-crop-copy">
            <strong>{name}</strong><small>Green Valley Farm · {field}</small>
            <div className="ifc-preview-progress-row"><div className="ifc-preview-progress"><span style={{ width: progress + "%" }} /></div><Count value={progress} suffix="%" /></div>
          </div>
        </div>
      ))}
    </>
  );
}

function CalendarPreview() {
  return (
    <div className="ifc-preview-calendar">
      <div>
        <strong className="ifc-preview-title">November 2026</strong>
        <div className="ifc-preview-calendar-grid">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span className="ifc-preview-weekday" key={index}>{day}</span>)}
          {Array.from({ length: 6 }, (_, index) => <span key={"empty-" + index} />)}
          {Array.from({ length: 30 }, (_, index) => index + 1).map(day => <span key={day} className={day === 19 || day === 28 ? "ifc-preview-date-mark" : undefined} style={{ "--row": day === 28 ? 1 : 0 }}>{day}</span>)}
        </div>
      </div>
      <div className="ifc-preview-milestones">
        <strong className="ifc-preview-title">Upcoming milestones</strong>
        {[["Rice harvest", "28 Nov · Paddy Field"], ["Tomato harvest", "18 Dec · North Field"]].map(([name, date], index) => <div className="ifc-preview-milestone ifc-preview-row-motion" key={name} style={{ "--row": index }}><strong>{name}</strong><small>{date}</small></div>)}
      </div>
    </div>
  );
}

function ActivityPreview() {
  const activities = [
    { icon: Droplets, title: "Watering", crop: "Tomato", date: "Today" },
    { icon: Leaf, title: "Fertilizing", crop: "Rice", date: "Yesterday" },
    { icon: ScanLine, title: "Field inspection", crop: "Tomato", date: "24 Nov" },
  ];
  return (
    <>
      <strong className="ifc-preview-title">Recent activity</strong>
      {activities.map(({ icon: Icon, title, crop, date }, index) => (
        <div className="ifc-preview-activity ifc-preview-row-motion" key={title} style={{ "--row": index }}>
          <span className="ifc-preview-symbol"><Icon size={13} /></span>
          <span className="ifc-preview-activity-copy"><strong>{title}</strong><small>{crop}</small></span>
          <span className="ifc-preview-date">{date}</span>
          <svg className="ifc-preview-check" viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7" pathLength="1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      ))}
    </>
  );
}

const expenses = [
  { label: "Fertilizer", value: 45, offset: 0, color: "#83ad73" },
  { label: "Seeds", value: 30, offset: 45, color: "#d7b478" },
  { label: "Labour", value: 25, offset: 75, color: "#8ca9bf" },
];

function ExpensePreview() {
  return (
    <>
      <strong className="ifc-preview-title">Monthly expenses</strong>
      <div className="ifc-preview-expenses">
        <div className="ifc-preview-donut">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="39" fill="none" stroke="var(--fp-pale)" strokeWidth="11" />
            {expenses.map(({ label, value, offset, color }) => <circle key={label} className="ifc-preview-segment" cx="50" cy="50" r="39" pathLength="100" fill="none" stroke={color} strokeWidth="11" strokeDasharray={value + " " + (100 - value)} strokeDashoffset={-offset} transform="rotate(-90 50 50)" style={{ "--arc": value + " " + (100 - value) }} />)}
          </svg>
          <div className="ifc-preview-donut-value"><small>TOTAL</small><strong><Count value={8200} prefix="₹" /></strong></div>
        </div>
        <div className="ifc-preview-legend">
          {expenses.map(({ label, value, color }, index) => <div key={label} className="ifc-preview-row-motion" style={{ "--row": index }}><i style={{ background: color }} /><span>{label}</span><strong>{value}%</strong></div>)}
        </div>
      </div>
    </>
  );
}

function HarvestPreview() {
  return (
    <>
      <strong className="ifc-preview-title">Harvest records</strong>
      <div className="ifc-preview-harvest-total"><strong><Count value={12} /></strong><small>total records</small></div>
      <table className="ifc-preview-table">
        <thead><tr><th>Crop</th><th>Quantity</th></tr></thead>
        <tbody>{[["Rice", "850 kg"], ["Tomato", "320 kg"], ["Maize", "240 kg"]].map(([crop, amount], index) => <tr className="ifc-preview-row-motion" style={{ "--row": index }} key={crop}><td>{crop}</td><td>{amount}</td></tr>)}</tbody>
      </table>
    </>
  );
}

const previews = { farms: FarmPreview, crops: CropPreview, calendar: CalendarPreview, activities: ActivityPreview, expenses: ExpensePreview, harvest: HarvestPreview };

export function FeaturesSection() {
  const reduced = useReducedMotion();
  const animateOnScroll = !reduced && typeof IntersectionObserver !== "undefined";
  const viewport = { once: true, amount: .12, margin: "0px 0px -35px 0px" };
  const enter = delay => ({ initial: animateOnScroll ? { opacity: 0, y: 12, filter: "blur(3px)" } : false, whileInView: animateOnScroll ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined, viewport, transition: { duration: .65, delay, ease: [.2,.7,.2,1] } });

  return (
    <section className="landing-section landing-features ifc-product-features" id="features">
      <div className="landing-section-heading ifc-feature-heading">
        <motion.span className="landing-section-kicker" {...enter(0)}>ONE PLATFORM. EVERY SEASON.</motion.span>
        <h2><motion.span {...enter(.1)}>Everything your farm needs.</motion.span><motion.em {...enter(.22)}>One unified workspace.</motion.em></h2>
        <motion.p {...enter(.36)}>From managing your fields to recording your harvests, bring every aspect of your farming operations together in one dedicated platform.</motion.p>
      </div>
      <div className="ifc-feature-grid">
        {features.map(({ id, icon: Icon, label, title, description }, index) => {
          const Preview = previews[id];
          return (
            <motion.article className={"ifc-feature-card ifc-feature-" + id} key={id} style={{ "--feature-delay": Math.min(index * 100, 300) + "ms" }} initial={animateOnScroll ? { opacity: 0, y: 20, scale: .99 } : false} whileInView={animateOnScroll ? { opacity: 1, y: 0, scale: 1 } : undefined} viewport={viewport} whileHover={animateOnScroll ? { y: -5, transition: { type: "spring", stiffness: 320, damping: 26, delay: 0 } } : undefined} transition={{ duration: .65, delay: Math.min(index * .1, .3), ease: [.2,.7,.2,1] }}>
              <div className="ifc-feature-copy">
                <div className="ifc-feature-card-head">
                  <span className="ifc-feature-icon" aria-hidden="true"><Icon size={23} strokeWidth={1.7} /></span>
                  <span className="ifc-feature-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <span className="ifc-feature-label">{label}</span>
                <h3>{id === "farms" ? <>Every farm.<br />Every field.</> : title}</h3>
                <p>{description}</p>
                {id === "farms" && <a className="ifc-feature-workflow" href="#how-it-works">Explore workflow <span aria-hidden="true">{reduced ? <ArrowRight size={17} /> : <UseAnimations animation={arrowRight} size={21} strokeColor="currentColor" interaction="hover" />}</span></a>}
              </div>
              <div className="ifc-feature-preview-wrap" aria-hidden="true">
                <div className="ifc-feature-preview"><Preview /></div>
              </div>
            </motion.article>
          );
        })}
      </div>
      <p className="ifc-feature-caption">Illustrative product previews · Sample data</p>
    </section>
  );
}
