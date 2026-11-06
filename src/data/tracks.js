import peaks from "./peaks.json";

// Låtarna i spelaren. Den första visas först.
//
// Ny låt:
//   1. Lägg ljudfilen och omslaget i public/tracks/
//   2. Lägg till ett objekt nedan
//   3. Kör `npm run peaks` så räknas vågformen och längden ut
//
// `file` är filnamnet i public/tracks/. `bpm` är valfritt.
const list = [
  {
    id: "heaven",
    title: "Heaven",
    artist: "Fexell",
    file: "Fexell - Heaven.mp3",
    artwork: "/tracks/HEAVEN - Cover.jpg",
    bpm: 125,
  },
];

export const tracks = list.map((track) => ({
  ...track,
  src: `/tracks/${track.file}`,
  duration: peaks[track.file]?.duration ?? null,
  peaks: peaks[track.file]?.peaks ?? null,
}));
