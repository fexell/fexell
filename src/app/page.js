import MusicPlayer from "@/components/player/MusicPlayer";
import { tracks } from "@/data/tracks";
import SocialLinks from "@/components/SocialLinks";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden flex flex-col flex-1 items-center justify-center font-sans bg-black">
      {/* Dekorativ bakgrund: stor gradientcirkel nere till höger + svag glöd uppe till vänster */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -bottom-[25vmax] -right-[45vmax] md:-bottom-[35vmax] md:-right-[30vmax] h-[80vmax] w-[80vmax] rounded-full bg-[radial-gradient(circle_at_35%_35%,#6fc3d6_0%,#2a6f97_30%,#0d2a45_58%,transparent_72%)] opacity-70 blur-3xl" />
        <div className="absolute -top-[25vmax] -left-[25vmax] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,#1d4e6b_0%,transparent_70%)] opacity-40 blur-3xl" />
      </div>
      <div className="top flex flex-1 flex-col w-full items-center justify-end pb-8">
        <img src="/logo/fexell-vit.svg" alt="Fexell Logo" className="w-[85%] max-w-[43rem] h-auto" />
        <p className="mt-6 px-4 text-center text-sm sm:text-base uppercase tracking-[0.3em] text-white/70">
          Driving electronic music straight from the studio.
        </p>
      </div>
      <div className="bottom flex flex-1 flex-col w-full items-center justify-start px-4 pt-8 text-white">
        <div className="w-full max-w-2xl">
          <MusicPlayer tracks={tracks} />
        </div>
        <div className="mt-10">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
