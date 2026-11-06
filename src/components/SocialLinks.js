"use client";

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaSoundcloud,
  FaTiktok,
  FaSpotify,
  FaApple,
  FaBandcamp,
  FaDiscord,
  FaXTwitter
} from "react-icons/fa6";

// Byt ut "#" mot länkarna till dina profiler.
const links = [
  { name: "Instagram", href: "https://www.instagram.com/fexell/", Icon: FaInstagram },
  { name: "TikTok", href: "https://www.tiktok.com/@fexellofficial", Icon: FaTiktok },
  { name: "YouTube", href: "https://www.youtube.com/@Fexell", Icon: FaYoutube },
  { name: "SoundCloud", href: "https://soundcloud.com/fexell", Icon: FaSoundcloud },
  { name: "Facebook", href: "https://www.facebook.com/FexellOfficial", Icon: FaFacebook },
  { name: "Spotify", href: "https://open.spotify.com/artist/2TfpgqVfDnAJ3vlDAikXQ7", Icon: FaSpotify },
  { name: "Apple Music", href: "https://music.apple.com/us/artist/fexell/584942513", Icon: FaApple },
  { name: "Bandcamp", href: "https://fexell.bandcamp.com/", Icon: FaBandcamp },
  { name: "Discord", href: "https://discord.com/users/98468219878125568", Icon: FaDiscord },
  { name: "X (Twitter)", href: "https://x.com/FexellOfficial", Icon: FaXTwitter }
];

export default function SocialLinks() {
  return (
    <nav aria-label="Sociala medier">
      <ul className="flex items-center justify-center gap-6">
        {links.map(({ name, href, Icon }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Fexell på ${name}`}
              title={name}
              className="block text-white/50 transition hover:text-white hover:scale-110"
            >
              <Icon size={26} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
