"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type SnapPoint = "peek" | "half" | "full";

const SNAP_RATIOS: Record<SnapPoint, number> = {
  peek: 0.15,
  half: 0.5,
  full: 0.92,
};

/* Velocity threshold (px/ms) — a fast flick should snap in the flick direction */
const FLICK_VELOCITY = 0.4;
/* Minimum drag distance to consider it intentional */
const MIN_DRAG_PX = 10;

interface BottomSheetProps {
  children: ReactNode;
  defaultSnap?: SnapPoint;
  peekContent?: ReactNode;
  navLinks?: ReactNode;
  onSnapChange?: (snap: SnapPoint) => void;
}

export default function BottomSheet({
  children,
  defaultSnap = "half",
  peekContent,
  navLinks,
  onSnapChange,
}: BottomSheetProps) {
  const [snap, setSnap] = useState<SnapPoint>(defaultSnap);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* Drag state kept in refs to avoid re-renders on every touch move */
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const dragStartTime = useRef(0);
  const lastY = useRef(0);

  /* Available height = viewport minus tab bar (56px). Safe-area is handled by CSS bottom offset. */
  const TAB_BAR_HEIGHT = 56;

  const availableHeight = useCallback(() => {
    return typeof window !== "undefined" ? window.innerHeight - TAB_BAR_HEIGHT : 0;
  }, []);

  const heightForSnap = useCallback(
    (s: SnapPoint) => availableHeight() * SNAP_RATIOS[s],
    [availableHeight]
  );

  const snapTo = useCallback(
    (s: SnapPoint) => {
      setSnap(s);
      onSnapChange?.(s);
      /* Animate via CSS transition — just set the height */
      const el = sheetRef.current;
      if (el) {
        el.style.transition =
          "height 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.height = `${heightForSnap(s)}px`;
      }
    },
    [heightForSnap, onSnapChange]
  );

  /* ── Closest snap based on final position + velocity ── */
  const resolveSnap = useCallback(
    (finalRatio: number, velocity: number): SnapPoint => {
      const ordered: SnapPoint[] = ["peek", "half", "full"];

      /* Fast flick → snap in that direction regardless of position */
      if (Math.abs(velocity) > FLICK_VELOCITY) {
        const idx = ordered.indexOf(snap);
        if (velocity > 0 && idx > 0) return ordered[idx - 1]; // dragging down → smaller
        if (velocity < 0 && idx < 2) return ordered[idx + 1]; // dragging up → bigger
      }

      /* Otherwise → closest snap point */
      let closest: SnapPoint = "peek";
      let minDist = Infinity;
      for (const pt of ordered) {
        const dist = Math.abs(finalRatio - SNAP_RATIOS[pt]);
        if (dist < minDist) {
          minDist = dist;
          closest = pt;
        }
      }
      return closest;
    },
    [snap]
  );

  /* ── Handle-only drag (touch) ── */
  const onHandleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;
      dragStartY.current = e.touches[0].clientY;
      lastY.current = e.touches[0].clientY;
      dragStartHeight.current = heightForSnap(snap);
      dragStartTime.current = Date.now();
      const el = sheetRef.current;
      if (el) el.style.transition = "none";
    },
    [snap, heightForSnap]
  );

  const onHandleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const y = e.touches[0].clientY;
    lastY.current = y;
    const delta = dragStartY.current - y; // positive = dragging up
    const newHeight = dragStartHeight.current + delta;
    const el = sheetRef.current;
    if (el) {
      const clamped = Math.max(
        availableHeight() * SNAP_RATIOS.peek,
        Math.min(newHeight, availableHeight() * SNAP_RATIOS.full)
      );
      el.style.height = `${clamped}px`;
    }
  }, [availableHeight]);

  const onHandleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const elapsed = Date.now() - dragStartTime.current;
    const totalDelta = dragStartY.current - lastY.current;
    const velocity = elapsed > 0 ? totalDelta / elapsed : 0; // positive = up, negative = down

    /* If barely moved, treat as tap on peek → expand to half */
    if (Math.abs(totalDelta) < MIN_DRAG_PX) {
      if (snap === "peek") snapTo("half");
      return;
    }

    const currentHeight = dragStartHeight.current + totalDelta;
    const ratio = currentHeight / availableHeight();
    const target = resolveSnap(ratio, -velocity); // negate because velocity sign is inverted vs ratio
    snapTo(target);
  }, [snap, availableHeight, resolveSnap, snapTo]);

  /* ── Handle mouse drag (for desktop testing) ── */
  const onHandleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      dragStartY.current = e.clientY;
      lastY.current = e.clientY;
      dragStartHeight.current = heightForSnap(snap);
      dragStartTime.current = Date.now();
      const el = sheetRef.current;
      if (el) el.style.transition = "none";
    },
    [snap, heightForSnap]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      lastY.current = e.clientY;
      const delta = dragStartY.current - e.clientY;
      const newHeight = dragStartHeight.current + delta;
      const el = sheetRef.current;
      if (el) {
        const clamped = Math.max(
          availableHeight() * SNAP_RATIOS.peek,
          Math.min(newHeight, availableHeight() * SNAP_RATIOS.full)
        );
        el.style.height = `${clamped}px`;
      }
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      const elapsed = Date.now() - dragStartTime.current;
      const totalDelta = dragStartY.current - lastY.current;
      const velocity = elapsed > 0 ? totalDelta / elapsed : 0;

      if (Math.abs(totalDelta) < MIN_DRAG_PX) {
        if (snap === "peek") snapTo("half");
        return;
      }

      const currentHeight = dragStartHeight.current + totalDelta;
      const ratio = currentHeight / availableHeight();
      const target = resolveSnap(ratio, -velocity);
      snapTo(target);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [snap, availableHeight, resolveSnap, snapTo]);

  /* ── Content scroll-to-dismiss: pulling down when scrolled to top ── */
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    let touchStart = 0;
    let wasAtTop = false;
    let pulling = false;

    const onTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY;
      wasAtTop = content.scrollTop <= 0;
      pulling = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      /* Only intercept if started at scroll top and pulling down */
      if (wasAtTop && y > touchStart + 8 && content.scrollTop <= 0) {
        if (!pulling) {
          pulling = true;
          isDragging.current = true;
          dragStartY.current = touchStart;
          lastY.current = touchStart;
          dragStartHeight.current = heightForSnap(snap);
          dragStartTime.current = Date.now();
          const el = sheetRef.current;
          if (el) el.style.transition = "none";
        }
        e.preventDefault();
        lastY.current = y;
        const delta = dragStartY.current - y;
        const newHeight = dragStartHeight.current + delta;
        const el = sheetRef.current;
        if (el) {
          el.style.height = `${Math.max(availableHeight() * SNAP_RATIOS.peek, newHeight)}px`;
        }
      }
    };

    const onTouchEnd = () => {
      if (!pulling) return;
      pulling = false;
      isDragging.current = false;

      const elapsed = Date.now() - dragStartTime.current;
      const totalDelta = dragStartY.current - lastY.current;
      const velocity = elapsed > 0 ? totalDelta / elapsed : 0;
      const currentHeight = dragStartHeight.current + totalDelta;
      const ratio = currentHeight / availableHeight();
      const target = resolveSnap(ratio, -velocity);
      snapTo(target);
    };

    content.addEventListener("touchstart", onTouchStart, { passive: true });
    content.addEventListener("touchmove", onTouchMove, { passive: false });
    content.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      content.removeEventListener("touchstart", onTouchStart);
      content.removeEventListener("touchmove", onTouchMove);
      content.removeEventListener("touchend", onTouchEnd);
    };
  }, [snap, availableHeight, heightForSnap, resolveSnap, snapTo]);

  /* ── Set initial height after mount ── */
  useEffect(() => {
    const el = sheetRef.current;
    if (el) {
      el.style.transition = "height 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.height = `${heightForSnap(defaultSnap)}px`;
    }
  }, [defaultSnap, heightForSnap]);

  return (
    <>
      {/* ===== MOBILE: Bottom sheet ===== */}
      <aside
        ref={sheetRef}
        role="region"
        aria-label="Station list"
        className="md:hidden fixed left-0 right-0 z-40 flex flex-col bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 56px)",
          height: 0,
          willChange: "height",
        }}
      >
        {/* Drag handle */}
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Drag to resize"
          tabIndex={0}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-inset rounded-t-2xl"
          onTouchStart={onHandleTouchStart}
          onTouchMove={onHandleTouchMove}
          onTouchEnd={onHandleTouchEnd}
          onMouseDown={onHandleMouseDown}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              snapTo(snap === "peek" ? "half" : "full");
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              snapTo(snap === "full" ? "half" : "peek");
            }
          }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-9 h-1 rounded-full bg-gray-300" />
          </div>
          {peekContent && (
            <div className="px-4 pb-3">
              {peekContent}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 pt-1"
          style={{
            WebkitOverflowScrolling: "touch",
            paddingBottom: 16,
          }}
        >
          {children}
        </div>
      </aside>

      {/* ===== DESKTOP: Side panel ===== */}
      <aside
        role="region"
        aria-label="Station list"
        className="hidden md:flex fixed top-0 left-0 bottom-0 z-40 w-[420px] lg:w-[480px] flex-col bg-white border-r border-gray-200 shadow-lg"
      >
        {/* Panel header */}
        {peekContent && (
          <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">
            {peekContent}
          </div>
        )}

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Panel footer — nav links */}
        {navLinks && (
          <div className="flex-shrink-0 border-t border-gray-100 px-5 py-3">
            {navLinks}
          </div>
        )}
      </aside>
    </>
  );
}
