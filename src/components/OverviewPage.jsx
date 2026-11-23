import { SkeletonCards } from "./ui/Skeleton";
import OverviewCropProgress from "./OverviewCropProgress";
import OverviewExpenseBreakdown from "./OverviewExpenseBreakdown";
import OverviewRecentActivity from "./OverviewRecentActivity";
import OverviewUpcomingMilestones from "./OverviewUpcomingMilestones";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Coins,
  Flower2,
  MapPinned,
  Plus,
  Sprout,
  Sun,
  Wheat,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { overviewApi } from "../api/client";

function currencyLabel(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function numberLabel(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: digits });
}

function OverviewPage({ onNavigate, onAdd }) {
  const { user } = useAuth();
  const userName = user?.name?.trim()?.split(/\s+/)[0] || user?.username?.split("@")[0] || "there";
  const [portfolioCards, setPortfolioCards] = useState(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState("");
  const [cardsRetryKey, setCardsRetryKey] = useState(0);

  // Portfolio totals are not tied to the farm selected for management pages.
  useEffect(() => {
    let current = true;
    setCardsLoading(true);
    setCardsError("");

    overviewApi.getCards()
      .then((response) => {
        if (current) setPortfolioCards(response);
      })
      .catch((requestError) => {
        if (current) setCardsError(requestError.message || "Portfolio totals could not be loaded.");
      })
      .finally(() => {
        if (current) setCardsLoading(false);
      });

    return () => {
      current = false;
    };
  }, [cardsRetryKey]);

  return (
    <section className="ifc-overview">
      <section className="welcome-row ifc-overview-welcome">
        <div>
          <div className="page-eyebrow">
            <span className="eyebrow-pip" />
            TODAY · YOUR FARM PORTFOLIO
          </div>
          <h1>
            Good day, {userName} <span className="wave">✳</span>
          </h1>
          <p>
            Here’s what’s happening across your farms today.
          </p>
        </div>
        <div className="ifc-overview-actions">
          <button type="button" className="button-primary" onClick={onAdd}>
            <Plus size={15} /> Add new crop
          </button>
        </div>
      </section>

      <section className="hero-banner ifc-overview-hero">
        <div className="hero-copy">
          <div className="hero-tag">
            <Flower2 size={14} /> YOUR FARM, IN RHYTHM
          </div>
          <h2>
            Every season is a<br />
            <em>fresh beginning.</em>
          </h2>
          <p>
            Healthy soil. Thoughtful care. A little patience.
            <br />
            You’re growing something wonderful.
          </p>
          <button
            type="button"
            className="hero-button"
            onClick={() => onNavigate("Crop management")}
          >
            Explore your crops <ArrowRight size={15} />
          </button>
          <div className="hero-note">
            <span><Sun size={14} /></span>
            A beautiful day to grow something good
          </div>
        </div>
        <div className="hero-art" aria-label="Illustration of a warm sun over growing fields">
          <svg
            className="hero-art-vector"
            viewBox="0 0 520 230"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label="Sun shining over rolling green fields and young crops"
          >
            <defs>
              <linearGradient id="overviewSunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="overviewHillBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dbe8ca" />
                <stop offset="100%" stopColor="#c2d8a5" />
              </linearGradient>
              <linearGradient id="overviewHillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9ec08d" />
                <stop offset="100%" stopColor="#7ba569" />
              </linearGradient>
            </defs>

            <circle cx="370" cy="56" r="44" fill="url(#overviewSunGlow)" />
            <circle cx="370" cy="56" r="54" fill="#fef3c7" opacity="0.35" />

            <g opacity="0.8" fill="#ffffff">
              <path d="M210 50 a12 12 0 0 1 20 -4 a16 16 0 0 1 28 2 a10 10 0 0 1 12 10 l-60 0 a8 8 0 0 1 0 -8 z" />
              <path d="M430 78 a9 9 0 0 1 15 -3 a12 12 0 0 1 21 2 a8 8 0 0 1 9 8 l-45 0 a6 6 0 0 1 0 -7 z" opacity="0.65" />
            </g>

            <path d="M120 230 C200 130 340 105 520 160 L520 230 Z" fill="url(#overviewHillBackGrad)" />
            <path d="M170 230 C290 145 420 155 520 185 L520 230 Z" fill="url(#overviewHillFrontGrad)" />

            <g transform="translate(265, 125)">
              <path d="M12 90 Q10 40 4 0" stroke="#3d6339" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M6 55 C-8 45 -12 25 2 20 C10 32 8 48 6 55 Z" fill="#58854d" />
              <path d="M8 35 C20 26 25 8 12 5 C4 18 6 30 8 35 Z" fill="#6c9b5f" />
              <path d="M4 12 C-4 2 -2 -10 6 -8 C10 -2 7 8 4 12 Z" fill="#7eae6f" />
            </g>
            <g transform="translate(325, 140)">
              <path d="M10 80 Q14 35 18 0" stroke="#365832" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <path d="M13 50 C28 42 32 24 20 18 C12 28 12 44 13 50 Z" fill="#507c46" />
              <path d="M11 32 C-2 25 -6 9 6 6 C13 16 12 28 11 32 Z" fill="#66945a" />
              <path d="M17 12 C28 2 28 -12 18 -10 C12 -2 15 8 17 12 Z" fill="#79a86b" />
            </g>
            <g transform="translate(385, 155)">
              <path d="M8 70 Q5 35 0 5" stroke="#3d6339" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M5 45 C-6 38 -9 22 2 18 C8 26 6 39 5 45 Z" fill="#58854d" />
              <path d="M4 25 C14 18 17 4 7 2 C1 11 3 20 4 25 Z" fill="#6ca061" />
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
          <span className="art-caption">
            GROW WITH CARE <Flower2 size={12} />
          </span>
        </div>
      </section>

      {cardsError && (
        <div className="ifc-overview-warning" role="status">
          <CircleAlert size={15} />
          <span>{cardsError}</span>
          <button type="button" className="button-secondary" onClick={() => setCardsRetryKey((value) => value + 1)}>Retry</button>
        </div>
      )}

      {cardsLoading && !portfolioCards ? (
        <div className="surface-card" role="status" aria-label="Loading portfolio summary">
          <SkeletonCards count={4} />
        </div>
      ) : (
        <div className="ifc-overview-stats">
          <article className="ifc-overview-stat surface-card">
            <div><span>Fields</span><i><MapPinned size={17} /></i></div>
            <strong>{numberLabel(portfolioCards?.totalFields, 0)}</strong>
            <small>{numberLabel(portfolioCards?.totalFarms, 0)} farms in your portfolio</small>
          </article>
          <article className="ifc-overview-stat surface-card">
            <div><span>Active plantings</span><i><Sprout size={17} /></i></div>
            <strong>{numberLabel(portfolioCards?.totalActivePlantings, 0)}</strong>
            <small>{numberLabel(portfolioCards?.totalPlantings, 0)} total plantings across your farms</small>
          </article>
          <article className="ifc-overview-stat surface-card">
            <div><span>Total expenses</span><i><Coins size={17} /></i></div>
            <strong>{currencyLabel(portfolioCards?.totalExpenses)}</strong>
            <small>{currencyLabel(portfolioCards?.totalExpensesCurrentMonth)} this month</small>
          </article>
          <article className="ifc-overview-stat surface-card">
            <div><span>Harvest records</span><i><Wheat size={17} /></i></div>
            <strong>{numberLabel(portfolioCards?.totalHarvestRecords, 0)}</strong>
            <small>{numberLabel(portfolioCards?.totalHarvestCurrentMonth, 0)} recorded this month</small>
          </article>
        </div>
      )}

      {portfolioCards?.totalFarms === 0 && !cardsLoading && (
        <div className="ifc-overview-empty surface-card">
          <span className="ifc-overview-empty-icon"><Sprout size={25} /></span>
          <h2>Start with your first farm</h2>
          <p>Add your first farm to start tracking fields, crops, expenses, and harvests.</p>
          <button type="button" className="button-primary" onClick={() => onNavigate("Farms")}>
            <Plus size={15} /> Add a farm
          </button>
        </div>
      )}
      <div className="ifc-overview-main-grid">
        <OverviewCropProgress onNavigate={onNavigate} onAdd={onAdd} />
        <OverviewUpcomingMilestones onNavigate={onNavigate} />
      </div>

      <div className="ifc-overview-bottom-grid">
        <OverviewRecentActivity onNavigate={onNavigate} />
        <OverviewExpenseBreakdown onNavigate={onNavigate} />
      </div>

      <div className="ifc-overview-footnote">
        <CheckCircle2 size={14} />
        <span>Overview values are read from your farm records. Income and profit are not shown because the backend does not yet provide sales or revenue records.</span>
      </div>
    </section>
  );
}

export default OverviewPage;
