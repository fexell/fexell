"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaPlay,
  FaPause,
  FaBackwardStep,
  FaForwardStep,
  FaVolumeHigh,
  FaVolumeLow,
  FaVolumeXmark,
} from "react-icons/fa6";
import Waveform from "./Waveform";
import { formatTime } from "./formatTime";

// Storlek på omslagsbilden i pixlar – ändra här eller skicka artworkSize som prop.
const ARTWORK_SIZE = 96;
const VOLUME_KEY = "fexell-player-volume";

export default function MusicPlayer({ tracks, artworkSize = ARTWORK_SIZE, initialVolume = 0.4 }) {
  const audioRef = useRef(null);
  const autoplayRef = useRef(false); // spela direkt när nästa låt har laddats

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0]?.duration ?? 0);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);

  const track = tracks[index];
  const hasPlaylist = tracks.length > 1;

  // ---- Volym (sparas i webbläsaren mellan besök) ----
  useEffect(() => {
    try {
      const saved = parseFloat(localStorage.getItem(VOLUME_KEY));
      if (saved >= 0 && saved <= 1) setVolume(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    audio.muted = muted;
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {}
  }, [volume, muted]);

  // ---- Låtbyte ----
  useEffect(() => {
    setTime(0);
    setDuration(track.duration ?? 0);
    setError(false);
    if (autoplayRef.current) {
      autoplayRef.current = false;
      audioRef.current.play().catch(() => {});
    }
  }, [index, track.duration]);

  // ---- Mjuk progress medan låten spelas (timeupdate kommer bara ~4 ggr/s) ----
  useEffect(() => {
    if (!playing) return;
    let frame;
    const tick = () => {
      setTime(audioRef.current.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  // ---- Kontroller ----
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio.paused) audio.play().catch(() => setError(true));
    else audio.pause();
  }, []);

  const playTrack = useCallback(
    (i) => {
      if (i === index) return togglePlay();
      autoplayRef.current = true;
      setIndex(i);
    },
    [index, togglePlay]
  );

  const next = useCallback(() => {
    playTrack((index + 1) % tracks.length);
  }, [index, tracks.length, playTrack]);

  const previous = useCallback(() => {
    // Som i de flesta spelare: första trycket börjar om låten.
    if (audioRef.current.currentTime > 3 || !hasPlaylist) {
      audioRef.current.currentTime = 0;
      setTime(0);
      return;
    }
    playTrack((index - 1 + tracks.length) % tracks.length);
  }, [index, tracks.length, hasPlaylist, playTrack]);

  const seek = useCallback((seconds) => {
    audioRef.current.currentTime = seconds;
    setTime(seconds);
  }, []);

  const handleEnded = () => {
    if (index < tracks.length - 1) {
      autoplayRef.current = true;
      setIndex(index + 1);
    } else {
      seek(0);
    }
  };

  // ---- Media Session: titel, omslag och knappar på låsskärm/tangentbord ----
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const artworkUrl = new URL(encodeURI(track.artwork), location.href).href;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      artwork: [{ src: artworkUrl }],
    });
    const handlers = {
      play: () => audioRef.current.play(),
      pause: () => audioRef.current.pause(),
      previoustrack: previous,
      nexttrack: hasPlaylist ? next : null,
      seekto: (e) => seek(e.seekTime),
    };
    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {}
    }
  }, [track, previous, next, seek, hasPlaylist]);

  const progress = duration ? Math.min(1, time / duration) : 0;
  const effectiveVolume = muted ? 0 : volume;
  const VolumeIcon = effectiveVolume === 0 ? FaVolumeXmark : effectiveVolume < 0.5 ? FaVolumeLow : FaVolumeHigh;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-white backdrop-blur-sm sm:p-5">
      <audio
        ref={audioRef}
        src={encodeURI(track.src)}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => !playing && setTime(e.currentTarget.currentTime)}
        onEnded={handleEnded}
        onError={() => {
          setError(true);
          setPlaying(false);
        }}
      />

      <div className="flex items-center gap-4">
        <img
          src={encodeURI(track.artwork)}
          alt={`${track.title} – cover art`}
          width={artworkSize}
          height={artworkSize}
          className="shrink-0 rounded-lg object-cover shadow-lg shadow-black/40"
          style={{ width: artworkSize, height: artworkSize }}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold leading-tight">{track.title}</p>
          <p className="truncate text-sm text-white/60">
            {track.artist}
            {track.bpm && <span className="text-white/40"> · {track.bpm} BPM</span>}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {hasPlaylist && (
              <IconButton label="Previous track" onClick={previous}>
                <FaBackwardStep />
              </IconButton>
            )}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {playing ? <FaPause /> : <FaPlay className="translate-x-px" />}
              {buffering && playing && (
                <span className="absolute inset-0 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
              )}
            </button>
            {hasPlaylist && (
              <IconButton label="Next track" onClick={next}>
                <FaForwardStep />
              </IconButton>
            )}
          </div>
        </div>

        {/* Volym – dold på mobil, där telefonens egna knappar används (iOS ignorerar ändå volym från webben). */}
        <div className="hidden items-center gap-2 self-end text-white/60 sm:flex">
          <IconButton label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((m) => !m)}>
            <VolumeIcon />
          </IconButton>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={effectiveVolume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setMuted(false);
            }}
            aria-label="Volume"
            className="h-1 w-24 cursor-pointer accent-white"
          />
        </div>
      </div>

      <div className="mt-5">
        <Waveform
          peaks={track.peaks}
          progress={progress}
          duration={duration}
          onSeek={seek}
          label={`Seek in ${track.title}`}
        />
        <div className="mt-1.5 flex justify-between text-xs tabular-nums text-white/50">
          <span>{formatTime(time)}</span>
          {error ? <span className="text-red-300">Could not play the track</span> : <span>{formatTime(duration)}</span>}
        </div>
      </div>

      {hasPlaylist && (
        <ol className="mt-4 border-t border-white/10 pt-2">
          {tracks.map((t, i) => {
            const active = i === index;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => playTrack(i)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-white/5 ${
                    active ? "text-white" : "text-white/70"
                  }`}
                >
                  <span className="w-5 text-center tabular-nums text-white/40">
                    {active && playing ? <FaVolumeHigh className="inline text-white" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className="flex-1 truncate">{t.title}</span>
                  {t.duration && <span className="tabular-nums text-white/40">{formatTime(t.duration)}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
    >
      {children}
    </button>
  );
}
