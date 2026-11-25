import { cloneElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Shared dashboard tooltip layer. Explicit data-tooltip labels take priority
// over accessible names on icon-only controls; ordinary text buttons are ignored.
const ICON_TARGETS = [
  ".app-shell button.icon-button[aria-label]",
  ".app-shell button.ff-icon-button[aria-label]",
  ".app-shell button.crop3-action-select[aria-label]",
  ".app-shell button.ff-action-button[aria-label^=\"View details\"]",
  ".app-shell button.ifc-notification-close[aria-label]",
  ".app-shell button.ifc-inbox-read-button[aria-label]",
  ".app-shell button.top-profile[aria-label]",
  ".app-shell button.theme-toggle-button[aria-label]",
  ".app-shell button.profile-button[aria-label]",
  ".app-shell button.sidebar-help[aria-label]",
  '.app-shell button[aria-label="Clear search"]',
  '.app-shell button[data-slot="pagination-link"][aria-label^="Go to"]',
  ".app-shell .rdp-button_previous[aria-label]",
  ".app-shell .rdp-button_next[aria-label]",
  ".ifc-toast-dismiss[aria-label]",
].join(",");
const SELECTOR = "[data-tooltip],.app-shell .sidebar button.nav-item," + ICON_TARGETS;
const ID = "ifc-dashboard-tooltip";

function resolveTarget(node) {
  if (!(node instanceof Element)) return null;
  const target = node.closest(".ifc-tooltip-disabled-target") || node.closest(SELECTOR);
  if (!target || target.closest("[inert]")) return null;
  if (target.matches(".nav-item") && (!target.closest(".sidebar-collapsed") || !window.matchMedia("(min-width: 901px)").matches)) return null;
  if (target.matches(":disabled") || target.getAttribute("aria-expanded") === "true" && !target.matches(".ifc-sidebar-toggle")) return null;
  const text = (target.getAttribute("data-tooltip") || target.getAttribute("aria-label") || "").trim();
  if (!text) return null;
  const side = target.getAttribute("data-tooltip-side") || (target.closest(".sidebar") ? "right" : target.closest(".topbar") ? "bottom" : "top");
  return { target, text, side };
}

// Disabled native buttons cannot reliably receive pointer or keyboard events.
// Wrap only while disabled so enabled button sizing, animation and refs stay intact.
export function TooltipTarget({ children, disabledReason, text, side = "top" }) {
  if (children.props.disabled) {
    return (
      <span className="ifc-tooltip-disabled-target" tabIndex={0} aria-disabled="true"
        aria-label={children.props["aria-label"] || text} data-tooltip={disabledReason || text || children.props["aria-label"]} data-tooltip-side={side}>
        {children}
      </span>
    );
  }
  return cloneElement(children, { "data-tooltip": text || children.props["aria-label"], "data-tooltip-side": side });
}

export function TooltipProvider({ children, delayDuration = 300 }) {
  const [active, setActive] = useState(null);
  const [position, setPosition] = useState(null);
  const tooltipRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    let timer;
    let keyboard = true;

    function hide() {
      window.clearTimeout(timer);
      targetRef.current = null;
      setActive(null);
      setPosition(null);
    }

    function show(target, immediate = false) {
      if (!target) { hide(); return; }
      if (targetRef.current === target.target) return;
      hide();
      targetRef.current = target.target;
      timer = window.setTimeout(() => {
        if (target.target.isConnected && targetRef.current === target.target) setActive(target);
      }, immediate ? 0 : delayDuration);
    }

    const over = (event) => {
      if (event.pointerType === "touch") return;
      show(resolveTarget(event.target));
    };
    const out = (event) => {
      if (targetRef.current && event.target instanceof Node && targetRef.current.contains(event.target)
        && !(event.relatedTarget instanceof Node && targetRef.current.contains(event.relatedTarget))) hide();
    };
    const focus = (event) => {
      if (keyboard) show(resolveTarget(event.target), true);
    };
    const blur = (event) => {
      if (targetRef.current && event.target instanceof Node && targetRef.current.contains(event.target)) hide();
    };
    const down = () => { keyboard = false; hide(); };
    const key = (event) => { keyboard = true; if (event.key === "Escape") hide(); };

    document.addEventListener("pointerover", over, true);
    document.addEventListener("pointerout", out, true);
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("focusin", focus);
    document.addEventListener("focusout", blur);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    window.addEventListener("blur", hide);

    return () => {
      window.clearTimeout(timer);
      targetRef.current = null;
      document.removeEventListener("pointerover", over, true);
      document.removeEventListener("pointerout", out, true);
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("focusout", blur);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("blur", hide);
    };
  }, [delayDuration]);

  useLayoutEffect(() => {
    if (!active || !tooltipRef.current || !active.target.isConnected) return;
    const anchor = active.target.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const gap = 7, inset = 8;
    let side = active.side;
    if (side === "top" && anchor.top < tip.height + gap + inset) side = "bottom";
    else if (side === "bottom" && height - anchor.bottom < tip.height + gap + inset) side = "top";
    else if (side === "right" && width - anchor.right < tip.width + gap + inset) side = "left";
    else if (side === "left" && anchor.left < tip.width + gap + inset) side = "right";

    const horizontal = side === "top" || side === "bottom";
    const centerX = anchor.left + anchor.width / 2;
    const centerY = anchor.top + anchor.height / 2;
    let left = horizontal ? centerX - tip.width / 2 : side === "right" ? anchor.right + gap : anchor.left - tip.width - gap;
    let top = horizontal ? side === "top" ? anchor.top - tip.height - gap : anchor.bottom + gap : centerY - tip.height / 2;
    left = Math.max(inset, Math.min(left, width - tip.width - inset));
    top = Math.max(inset, Math.min(top, height - tip.height - inset));
    const arrow = horizontal ? Math.max(8, Math.min(centerX - left, tip.width - 8)) : Math.max(8, Math.min(centerY - top, tip.height - 8));
    setPosition({ left, top, side, arrow });

    const target = active.target;
    const descriptions = (target.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    if (!descriptions.includes(ID)) target.setAttribute("aria-describedby", [...descriptions, ID].join(" "));
    const observer = new MutationObserver(() => {
      if (!target.isConnected || target.matches(":disabled")) {
        targetRef.current = null;
        setActive(null);
        setPosition(null);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    observer.observe(target, { attributes: true, attributeFilter: ["disabled"] });
    return () => {
      observer.disconnect();
      const ids = (target.getAttribute("aria-describedby") || "").split(/\s+/).filter(id => id && id !== ID);
      if (ids.length) target.setAttribute("aria-describedby", ids.join(" "));
      else target.removeAttribute("aria-describedby");
    };
  }, [active]);

  return (
    <>
      {children}
      {active && createPortal(
        <div ref={tooltipRef} id={ID} role="tooltip" className="ifc-dashboard-tooltip"
          data-side={position?.side || active.side} data-positioned={Boolean(position)}
          style={{ left: position?.left ?? 0, top: position?.top ?? 0, "--ifc-tooltip-arrow": (position?.arrow ?? 10) + "px" }}>
          {active.text}<span className="ifc-tooltip-arrow" aria-hidden="true" />
        </div>, document.body
      )}
    </>
  );
}
