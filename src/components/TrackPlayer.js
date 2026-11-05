"use client";

import { useEffect, useRef, useState } from "react";
import "@arraypress/waveform-player/styles.css";

export default function TrackPlayer({ url, title, artist, artwork, bpm, volume: initialVolume = 0.4 }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let player;
    let cancelled = false;

    // Biblioteket använder window/document, så det får bara laddas i webbläsaren.
    import("@arraypress/waveform-player/no-autoinit").then(({ default: WaveformPlayer }) => {
      if (cancelled || !containerRef.current) return;
      player = new WaveformPlayer(containerRef.current, {
        url,
        title,
        artist,
        artwork,
        artworkAlt: `${title} – omslag`,
        showBPM: true,
        bpm: bpm ?? null, // null = räkna ut automatiskt
        colorPreset: "dark",
        waveformStyle: "bars",
        barWidth: 2,
        barSpacing: 3,
        waveformColor: "rgba(255, 255, 255, 0.35)",
        progressColor: "#ffffff",
        height: 80,
      });
      playerRef.current = player;
      player.setVolume(volume);
    });

    return () => {
      cancelled = true;
      player?.destroy();
      playerRef.current = null;
    };
    // Spelaren ska bara skapas om när låten byts, inte när volymen ändras.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, title, artist, artwork, bpm]);

  // Skicka volym/mute till spelaren när reglaget ändras.
  useEffect(() => {
    playerRef.current?.setVolume(muted ? 0 : volume);
  }, [volume, muted]);

  const effective = muted ? 0 : volume;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left sm:p-5">
      <div ref={containerRef} className="w-full" />

      <div className="mt-3 flex items-center justify-end gap-3 text-white/60">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Slå på ljud" : "Stäng av ljud"}
          className="hover:text-white transition-colors"
        >
          <VolumeIcon level={effective} />
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={effective}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            setMuted(false);
          }}
          aria-label="Volym"
          className="w-28 h-1 cursor-pointer accent-white"
        />
      </div>
    </div>
  );
}

function VolumeIcon({ level }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
      {level === 0 ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          {level > 0.5 && <path d="M19 5a10 10 0 0 1 0 14" />}
        </>
      )}
    </svg>
  );
}
