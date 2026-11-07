"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatTime } from "./formatTime";

const BAR_WIDTH = 2;
const BAR_GAP = 2;
// Högre värde = mer kontrast mellan tysta och starka partier (1 = ingen förstärkning).
// Behövs eftersom masterad elektronisk musik ligger nära max nästan hela tiden.
const CONTRAST = 2.2;

// Skalar om de sparade peaks-värdena till så många staplar som får plats.
function resample(peaks, count) {
  if (count <= 0) return [];
  // Saknas peaks (kör `npm run peaks`) visas jämna, låga staplar.
  if (!peaks?.length) return new Array(count).fill(0.2);

  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    const start = Math.floor((i * peaks.length) / count);
    const end = Math.max(start + 1, Math.floor(((i + 1) * peaks.length) / count));
    let max = 0;
    for (let j = start; j < end && j < peaks.length; j++) max = Math.max(max, peaks[j]);
    out[i] = max;
  }
  return out;
}

export default function Waveform({ peaks, progress, duration, onSeek, height = 64, label }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState(null); // 0–1 där musen/fingret är
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = Math.floor((width + BAR_GAP) / (BAR_WIDTH + BAR_GAP));
  const bars = useMemo(() => resample(peaks, count), [peaks, count]);

  const fractionAt = (clientX) => {
    const rect = ref.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setHover(fractionAt(e.clientX));
  };

  const handlePointerMove = (e) => {
    if (dragging || e.pointerType === "mouse") setHover(fractionAt(e.clientX));
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    onSeek(fractionAt(e.clientX) * duration);
    if (e.pointerType !== "mouse") setHover(null);
  };

  const handleKeyDown = (e) => {
    if (!duration) return;
    const current = progress * duration;
    const steps = {
      ArrowRight: current + 5,
      ArrowUp: current + 5,
      ArrowLeft: current - 5,
      ArrowDown: current - 5,
      PageUp: current + 30,
      PageDown: current - 30,
      Home: 0,
      End: duration - 1,
    };
    if (!(e.key in steps)) return;
    e.preventDefault();
    onSeek(Math.min(duration, Math.max(0, steps[e.key])));
  };

  // Under dragning visas positionen man drar till, annars den riktiga.
  const shown = dragging && hover !== null ? hover : progress;

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration || 0)}
      aria-valuenow={Math.round(progress * (duration || 0))}
      aria-valuetext={`${formatTime(progress * duration)} of ${formatTime(duration)}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        setDragging(false);
        setHover(null);
      }}
      onPointerLeave={() => !dragging && setHover(null)}
      onKeyDown={handleKeyDown}
      className="group relative w-full cursor-pointer touch-pan-y select-none rounded outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
      style={{ height }}
    >
      <svg width={width} height={height} aria-hidden="true" className="block">
        {bars.map((value, i) => {
          const h = Math.max(2, Math.pow(value, CONTRAST) * height);
          const position = (i + 0.5) / count;
          const played = position <= shown;
          const hovered = !played && hover !== null && position <= hover;
          return (
            <rect
              key={i}
              x={i * (BAR_WIDTH + BAR_GAP)}
              y={(height - h) / 2}
              width={BAR_WIDTH}
              height={h}
              rx={1}
              className={played ? "fill-white" : hovered ? "fill-white/55" : "fill-white/25"}
            />
          );
        })}
      </svg>

      {hover !== null && duration > 0 && (
        <span
          className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] tabular-nums text-white"
          style={{ left: hover * width }}
        >
          {formatTime(hover * duration)}
        </span>
      )}
    </div>
  );
}
