import { ArrowRight, Bell, CalendarDays, ClipboardList, Clock3, Coins, Flower2, HelpCircle, LayoutDashboard, MapPin, MapPinned, PackageCheck, PanelLeft, Search, Sprout, Sun, Moon, Tractor, Wallet, Wheat } from "lucide-react";

const colors = {
  canvas: "var(--dp-canvas)", card: "var(--dp-card)", line: "var(--dp-line)",
  ink: "var(--dp-ink)", muted: "var(--dp-muted)", green: "var(--dp-green)",
  pale: "var(--dp-pale)", banner: "var(--dp-banner)", button: "var(--dp-button)", onButton: "var(--dp-on-button)",
};
const nav = [
  ["Overview", LayoutDashboard], ["Farms", Tractor], ["Fields", MapPinned],
  ["Crop management", Sprout], ["Activities", ClipboardList], ["Calendar", CalendarDays],
  ["Expenses", Wallet], ["Harvest records", PackageCheck], ["Notifications", Bell],
];
const stats = [
  ["Fields", "6", "2 farms in your portfolio", MapPinned],
  ["Active plantings", "8", "12 total plantings across your farms", Sprout],
  ["Total expenses", "₹24,500", "₹8,200 this month", Coins],
  ["Harvest records", "12", "3 recorded this month", Wheat],
];
const crops = [
  { name: "Tomato", field: "North Field", area: "0.5 ac", date: "18 Dec", progress: 65 },
  { name: "Rice", field: "Paddy Field", area: "1.2 ac", date: "28 Nov", progress: 82 },
];
const expenses = [
  { label: "Fertilizer", amount: "₹3,690", share: 45, offset: 0, color: "#79a76f" },
  { label: "Seeds", amount: "₹2,460", share: 30, offset: 45, color: "#d9b477" },
  { label: "Labour", amount: "₹2,050", share: 25, offset: 75, color: "#8ca9bf" },
];

function Label({ x, y, size = 11, weight = 500, tone = "muted", children, ...props }) {
  return <text x={x} y={y} fontSize={size} fontWeight={weight} fill={colors[tone]} {...props}>{children}</text>;
}

function Icon({ glyph: Glyph, x, y, size = 15, tone = "green" }) {
  return <g transform={"translate(" + x + " " + y + ")"}><Glyph size={size} color={colors[tone]} strokeWidth={1.7} /></g>;
}

function Panel({ x, y, w, h, kicker, title, subtitle, glyph, action }) {
  return <g>
    <rect x={x} y={y} width={w} height={h} rx="10" fill={colors.card} stroke={colors.line} />
    <Label x={x + 14} y={y + 18} size={8.5} weight={700} letterSpacing=".8" tone="green">{kicker}</Label>
    {glyph && <Icon glyph={glyph} x={x + 14} y={y + 24} size={15} />}
    <Label x={x + (glyph ? 34 : 14)} y={y + 37} size={15} weight={750} tone="ink">{title}</Label>
    <Label x={x + 14} y={y + 51} size={9.5}>{subtitle}</Label>
    {action && <Label x={x + w - 14} y={y + 35} size={9} tone="green" textAnchor="end">{action} →</Label>}
  </g>;
}

function Chip({ x, y, w, children, tone = "green" }) {
  return <g><rect x={x} y={y} width={w} height="16" rx="5" fill={colors.pale} /><Label x={x + w / 2} y={y + 11} size={8} textAnchor="middle" tone={tone}>{children}</Label></g>;
}

export function DashboardPreview() {
  function resetTilt(event) {
    event.currentTarget.style.removeProperty("--dp-tilt-x");
    event.currentTarget.style.removeProperty("--dp-tilt-y");
  }

  function handlePointerMove(event) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
    event.currentTarget.style.setProperty("--dp-tilt-x", (1 - y * 5) + "deg");
    event.currentTarget.style.setProperty("--dp-tilt-y", (-4 + x * 9) + "deg");
  }

  return (
    <figure
      className="landing-dashboard-svg-preview landing-hero-dashboard-reveal"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
    >
      <svg className="landing-dashboard-svg" viewBox="0 0 1000 690" role="img" aria-labelledby="landing-preview-title landing-preview-description" xmlns="http://www.w3.org/2000/svg">
        <title id="landing-preview-title">Infyro Farm overview dashboard</title>
        <desc id="landing-preview-description">Illustrative farm workspace with the actual navigation, portfolio overview, crop progress, milestones, recent activity and monthly expenses. All displayed values are sample data.</desc>
        <defs>
          <clipPath id="landing-preview-frame"><rect width="1000" height="690" rx="18" /></clipPath>
          <clipPath id="landing-preview-logo"><circle cx="27" cy="30" r="17" /></clipPath>
          <clipPath id="landing-preview-banner"><rect x="204" y="116" width="776" height="151" rx="11" /></clipPath>
        </defs>
        <g clipPath="url(#landing-preview-frame)" fontFamily="DM Sans, sans-serif">
          <rect width="1000" height="690" fill={colors.canvas} />
          <rect width="184" height="690" fill={colors.card} />
          <path d="M184 0V690" stroke={colors.line} />
          <circle cx="27" cy="30" r="17" fill="#f3f0d9" />
          <image href="/infyro-farm-logo.png" x="-13" y="3" width="141" height="141" preserveAspectRatio="xMinYMin meet" clipPath="url(#landing-preview-logo)" />
          <circle cx="27" cy="30" r="17" fill="none" stroke="#65982e" />
          <Label x="50" y="29" size={15} weight={800} tone="ink">Infyro <tspan fill={colors.green}>Farm</tspan></Label>
          <Label x="50" y="40" size={5.7} weight={700} letterSpacing=".12">FARM SMARTER. GROW BETTER.</Label>
          <Icon glyph={PanelLeft} x={161} y={23} size={13} tone="muted" />
          <path d="M10 58H174" stroke={colors.line} />
          <Label x="16" y="80" size={8} weight={700} letterSpacing="1">WORKSPACE</Label>
          {nav.map(([label, glyph], i) => {
            const y = i < 6 ? 90 + i * 36 : 338 + (i - 6) * 36;
            return <g key={label}>
              {i === 0 && <rect x="10" y={y} width="164" height="32" rx="7" fill={colors.pale} />}
              <Icon glyph={glyph} x={19} y={y + 8} size={16} tone={i === 0 ? "green" : "muted"} />
              <Label x="44" y={y + 20} size={12} weight={i === 0 ? 700 : 500} tone={i === 0 ? "green" : "muted"}>{label}</Label>
              {i === 8 && <Chip x={148} y={y + 8} w={20}>2</Chip>}
            </g>;
          })}
          <Label x="16" y="327" size={8} weight={700} letterSpacing="1">INSIGHTS</Label>
          <Icon glyph={HelpCircle} x={19} y={605} tone="muted" />
          <Label x="44" y="617" size={11}>Help &amp; support</Label>
          <path d="M10 634H174" stroke={colors.line} />
          <circle cx="30" cy="659" r="15" fill="#ead9c4" />
          <text x="30" y="663" fontSize="10" fontWeight="700" fill="#8b6649" textAnchor="middle">IF</text>
          <Label x="52" y="656" size={11} weight={700} tone="ink">Demo farmer</Label>
          <Label x="52" y="668" size={9}>My workspace</Label>
          <rect x="185" width="815" height="47" fill={colors.card} />
          <path d="M185 47H1000" stroke={colors.line} />
          <Label x="204" y="28" size={11}>Farm workspace / <tspan fill={colors.ink} fontWeight="700">Overview</tspan></Label>
          <rect x="721" y="11" width="144" height="25" rx="6" fill={colors.canvas} stroke={colors.line} />
          <Icon glyph={Search} x={730} y={17} size={13} tone="muted" />
          <Label x="749" y="27" size={9}>Search workspace</Label>
          <rect x="879" y="16" width="39" height="16" rx="8" fill={colors.pale} stroke={colors.line} />
          <Icon glyph={Sun} x={882} y={19} size={10} />
          <Icon glyph={Moon} x={905} y={19} size={10} />
          <circle className="landing-dashboard-theme-thumb" cx="889" cy="24" r="6" fill={colors.button} />
          <Icon glyph={Bell} x={931} y={15} size={18} tone="muted" /><circle cx="947" cy="16" r="3" fill="#d8784f" />
          <circle cx="974" cy="24" r="13" fill="#ead9c4" /><text x="974" y="28" fill="#8b6649" fontSize="9" textAnchor="middle">IF</text>

          <circle cx="208" cy="65" r="3" fill={colors.green} />
          <Label x="218" y="68" size={9} weight={700} letterSpacing=".7">TODAY · YOUR FARM PORTFOLIO</Label>
          <Label x="204" y="91" size={24} weight={800} tone="ink" letterSpacing="-.65">Good day, Farmer <tspan fill="#d6ab5b">✳</tspan></Label>
          <Label x="204" y="105" size={11}>Here’s what’s happening across your farms today.</Label>
          <rect x="882" y="72" width="98" height="28" rx="7" fill={colors.button} />
          <Label x="896" y="90" size={11} tone="onButton" weight={700}>View farms</Label>
          <Icon glyph={ArrowRight} x={961} y={80} size={12} tone="onButton" />

          <g clipPath="url(#landing-preview-banner)">
            <rect x="204" y="116" width="776" height="151" rx="11" fill={colors.banner} />
            <svg x="570" y="116" width="410" height="151" viewBox="0 0 520 230" preserveAspectRatio="xMidYMid slice" fill="none">
            <defs>
              <linearGradient id="landingPreviewSunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
              </linearGradient>
              <radialGradient id="landingPreviewSunHalo">
                <stop offset="0%" stopColor="#fbd77d" stopOpacity="0.45" />
                <stop offset="55%" stopColor="#fbd77d" stopOpacity="0.38" />
                <stop offset="78%" stopColor="#fce5a8" stopOpacity="0.17" />
                <stop offset="92%" stopColor="#fce5a8" stopOpacity="0" />
                <stop offset="100%" stopColor="#fce5a8" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="landingPreviewHillBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dbe8ca" />
                <stop offset="100%" stopColor="#c2d8a5" />
              </linearGradient>
              <linearGradient id="landingPreviewHillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9ec08d" />
                <stop offset="100%" stopColor="#7ba569" />
              </linearGradient>
            </defs>

            <circle className="ifc-overview-hero-sun-halo" cx="370" cy="72" r="60" fill="url(#landingPreviewSunHalo)" opacity="0.8" />
            <circle cx="370" cy="72" r="44" fill="url(#landingPreviewSunGlow)" />

            <g opacity="0.8" fill="#ffffff">
              <path className="ifc-overview-hero-cloud ifc-overview-hero-cloud--first" d="M230 50 a12 12 0 0 1 20 -4 a16 16 0 0 1 28 2 a10 10 0 0 1 12 10 l-60 0 a8 8 0 0 1 0 -8 z" />
              <path className="ifc-overview-hero-cloud ifc-overview-hero-cloud--second" d="M430 78 a9 9 0 0 1 15 -3 a12 12 0 0 1 21 2 a8 8 0 0 1 9 8 l-45 0 a6 6 0 0 1 0 -7 z" opacity="0.65" />
            </g>

            <path d="M120 230 C200 130 340 105 520 160 L520 230 Z" fill="url(#landingPreviewHillBackGrad)" />
            <path d="M170 230 C290 145 420 155 520 185 L520 230 Z" fill="url(#landingPreviewHillFrontGrad)" />

            <g transform="translate(265, 125)">
              <path d="M12 90 Q10 40 4 0" stroke="#3d6339" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M10.77 66 C-4 63 -15 48 -10 35 C4 38 14 51 10.77 66 Z" fill="#58854d" />
              <path d="M8.59 38 C23 36 30 22 26 9 C13 11 5 24 8.59 38 Z" fill="#6c9b5f" />
              <path d="M5.42 10 C-5 7 -11 -3 -7 -14 C5 -13 9 -1 5.42 10 Z" fill="#7eae6f" />
            </g>
            <g transform="translate(325, 140)">
              <path d="M10 80 Q14 35 18 0" stroke="#365832" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <path d="M11.82 60 C26 57 34 43 29 30 C15 32 8 46 11.82 60 Z" fill="#507c46" />
              <path d="M14.35 34 C0 32 -8 18 -3 7 C10 9 18 21 14.35 34 Z" fill="#66945a" />
              <path d="M17.1 8 C28 5 33 -6 29 -16 C19 -14 13 -3 17.1 8 Z" fill="#79a86b" />
            </g>
            <g transform="translate(385, 155)">
              <path d="M8 70 Q5 35 0 5" stroke="#3d6339" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M6.7 56 C-6 53 -14 40 -10 29 C3 31 10 43 6.7 56 Z" fill="#58854d" />
              <path d="M4.22 34 C16 32 23 21 19 10 C7 12 1 23 4.22 34 Z" fill="#6ca061" />
              <path d="M1.13 12 C-9 10 -14 0 -10 -9 C0 -8 4 2 1.13 12 Z" fill="#7eae6f" />
            </g>
            <g transform="translate(445, 142)">
              <path d="M6 75 Q4 45 6 18" stroke="#4b7042" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="6" cy="14" r="5" fill="#f59e0b" />
              <circle cx="6" cy="6" r="4.5" fill="#fef3c7" />
              <circle cx="14" cy="14" r="4.5" fill="#fef3c7" />
              <circle cx="6" cy="22" r="4.5" fill="#fef3c7" />
              <circle cx="-2" cy="14" r="4.5" fill="#fef3c7" />
            </g>
          </svg>
            <Icon glyph={Flower2} x={220} y={128} size={13} />
            <Label x="240" y="138" size={9} weight={700} tone="green" letterSpacing=".6">YOUR FARM, IN RHYTHM</Label>
            <Label x="220" y="164" size={23} weight={800} tone="ink">Every season is a</Label>
            <Label x="220" y="187" size={23} weight={800} tone="green">fresh beginning.</Label>
            <Label x="220" y="204" size={10}>Healthy soil. Thoughtful care. A little patience.</Label>
            <Label x="220" y="217" size={10}>You’re growing something wonderful.</Label>
            <rect x="220" y="225" width="144" height="22" rx="5" fill={colors.button} />
            <Label x="229" y="239" size={9.5} tone="onButton" weight={700}>Explore your crops</Label>
            <Icon glyph={ArrowRight} x={346} y={230} size={12} tone="onButton" />
            <Label x="220" y="259" size={8.5}>A beautiful day to grow something good</Label>
            <Label x="965" y="257" size={8} weight={700} tone="green" textAnchor="end">GROW WITH CARE</Label>
          </g>

          {stats.map(([label, value, detail, glyph], i) => {
            const x = 204 + i * 196;
            return <g key={label}>
              <rect x={x} y="280" width="188" height="76" rx="9" fill={colors.card} stroke={colors.line} />
              <Label x={x + 12} y="299" size={11}>{label}</Label>
              <rect x={x + 151} y="288" width="26" height="26" rx="7" fill={colors.pale} />
              <Icon glyph={glyph} x={x + 156} y={293} size={16} />
              <Label x={x + 12} y="326" size={24} weight={800} tone="ink">{value}</Label>
              <Label x={x + 12} y="343" size={8.5}>{detail}</Label>
            </g>;
          })}
          <Panel x={204} y={369} w={455} h={160} kicker="GROWING NOW" title="Crop progress" subtitle="Latest crop plantings across all your farms." glyph={Sprout} action="Manage crops" />
          {crops.map((crop, i) => {
            const y = 429 + i * 46;
            return <g key={crop.name}>
              <rect x="218" y={y} width="31" height="31" rx="7" fill={colors.pale} />
              <Label x="233.5" y={y + 20} size={13} weight={750} tone="green" textAnchor="middle">{crop.name[0]}</Label>
              <Label x="257" y={y + 10} size={11} weight={700} tone="ink">{crop.name}</Label>
              <Chip x={590} y={y - 1} w={55}>Growing</Chip>
              <Chip x={257} y={y + 14} w={113}>Green Valley Farm</Chip>
              <Chip x={374} y={y + 14} w={83}>{crop.field}</Chip>
              <Label x="464" y={y + 25} size={8.5}>{crop.area}</Label>
              <Chip x={588} y={y + 14} w={57}>{crop.date}</Chip>
              <Label x="257" y={y + 40} size={8}>Estimated progress</Label>
              <rect x="354" y={y + 34} width="258" height="5" rx="2.5" fill={colors.pale} />
              <rect x="354" y={y + 34} width={258 * crop.progress / 100} height="5" rx="2.5" fill="#79a76f" />
              <Label x="645" y={y + 40} size={9} tone="green" textAnchor="end">{crop.progress}%</Label>
            </g>;
          })}
          <Panel x={671} y={369} w={309} h={160} kicker="NEXT 30 DAYS" title="Upcoming milestones" subtitle="Nearest planting and expected-harvest dates." />
          <Icon glyph={CalendarDays} x={949} y={385} size={17} />
          {[["Rice · Expected harvest", "Paddy Field", "28 Nov"], ["Tomato · Expected harvest", "North Field", "18 Dec"]].map(([title, field, date], i) => {
            const y = 430 + i * 40;
            return <g key={title}>
              <rect x="685" y={y} width="30" height="30" rx="6" fill={colors.pale} />
              <Icon glyph={Wheat} x={692} y={y + 7} size={16} />
              <Label x="722" y={y + 10} size={10.5} weight={700} tone="ink">{title}</Label>
              <Label x="722" y={y + 23} size={8.5}>Green Valley Farm · {field}</Label>
              <Chip x={925} y={y + 2} w={44}>{date}</Chip>
            </g>;
          })}
          <Label x="825" y="521" size={9} tone="green" textAnchor="middle">View calendar →</Label>
          <Panel x={204} y={541} w={455} h={135} kicker="LATEST RECORDS" title="Recent activity" subtitle="Latest crop updates across all your farms." glyph={Clock3} action="Go to activities" />
          {[["Tomato", "Growing", "North Field", "Today"], ["Rice", "Growing", "Paddy Field", "Yesterday"]].map(([name, stage, field, date], i) => {
            const y = 600 + i * 34;
            return <g key={name}>
              <rect x="218" y={y} width="27" height="27" rx="6" fill={colors.pale} />
              <Label x="231.5" y={y + 18} size={12} weight={750} tone="green" textAnchor="middle">{name[0]}</Label>
              <Label x="253" y={y + 10} size={11} weight={700} tone="ink">{name}</Label>
              <Chip x={589} y={y} w={56}>{stage}</Chip>
              <Icon glyph={MapPin} x={253} y={y + 14} size={10} tone="muted" />
              <Label x="267" y={y + 23} size={9}>{field}</Label>
              <Label x="645" y={y + 26} size={8.5} textAnchor="end">{date}</Label>
            </g>;
          })}
          <Panel x={671} y={541} w={309} h={135} kicker="COST CONTROL" title="Expense breakdown" subtitle="This month · Across all your farms" />
          <Icon glyph={Coins} x={949} y={557} size={17} />
          <circle cx="722" cy="630" r="29" fill="none" stroke={colors.pale} strokeWidth="10" />
          {expenses.map(({ label, share, offset, color }) => <circle key={label} cx="722" cy="630" r="29" pathLength="100" fill="none" stroke={color} strokeWidth="10" strokeDasharray={share + " " + (100 - share)} strokeDashoffset={-offset} transform="rotate(-90 722 630)" />)}
          <Label x="722" y="624" size={6.5} textAnchor="middle">TOTAL SPENT</Label>
          <Label x="722" y="635" size={11} weight={800} tone="ink" textAnchor="middle">₹8.2k</Label>
          {expenses.map(({ label, amount, share, color }, i) => <g key={label}>
            <circle cx="771" cy={605 + i * 19} r="4" fill={color} />
            <Label x="781" y={609 + i * 19} size={9} tone="ink">{label}</Label>
            <Label x="925" y={609 + i * 19} size={9} textAnchor="end">{amount}</Label>
            <Label x="967" y={609 + i * 19} size={9} textAnchor="end">{share}%</Label>
          </g>)}
          <Label x="826" y="669" size={8.5} tone="green" textAnchor="middle">View all expenses →</Label>
        </g>
        <rect x=".5" y=".5" width="999" height="689" rx="18" fill="none" stroke={colors.line} />
      </svg>
      <figcaption>Illustrative dashboard preview · sample data</figcaption>
    </figure>
  );
}
