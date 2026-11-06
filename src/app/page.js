import TrackPlayer from "@/components/TrackPlayer";
import SocialLinks from "@/components/SocialLinks";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans bg-black">
      <div className="top flex flex-1 flex-col w-full items-center justify-end pb-8">
        <img src="/logo/Fexell - Logo White.svg" alt="Fexell Logo" className="w-[85%] max-w-[43rem] h-auto" />
      </div>
      <div className="bottom flex flex-1 flex-col w-full items-center justify-start px-4 pt-8 text-white">
        <div className="w-full max-w-2xl">
          <TrackPlayer
            url={encodeURI("/tracks/Fexell - Heaven.mp3")}
            title="Heaven"
            artist="Fexell"
            artwork="/tracks/Cover-512.jpg"
          />
        </div>
        <div className="mt-10">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
