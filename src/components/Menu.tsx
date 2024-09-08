import "react";
import { useAtom } from "jotai";
import { ArrowUpRight } from "@phosphor-icons/react";
import {
  playlistsAtom,
  currentPlaylistIndexAtom,
  isAboutOpenAtom,
  externalLinksPageAtom,
} from "../store.ts";
import { handleOpenAbout, handleSetCurrentPlaylist, handleToggleMenu } from "../handlers.ts";
import { PlaylistVideo } from "../types.ts";

function MenuItem({ title, isCurrentView, onClick, isSecondary }: {
  title: string,
  isCurrentView: boolean,
  onClick: () => void,
  isSecondary?: boolean
}) {
  return (
    <div
      role="button"
      className={`pb-0.5 border-b border-b-[3px] hover:border-b-[#000] hover:text-[#000] ${
        isCurrentView
          ? "border-b-[#000] text-[#000]"
          : `border-b-[#fcf3e9] ${isSecondary ? "light-gray" : ""}`
      }`}
      onClick={isCurrentView ? handleToggleMenu : onClick}
    >
      {title}
    </div>
  );
}

function ExternalLink({ link, text }: {
  link: string,
  text: string
}) {
  return (
    <a
      className="flex gap-x-1.5 items-center pb-0.5 border-b border-b-[3px] border-b-[#fcf3e9] hover:border-b-[#000] font-normal"
      href={link}
      target="_blank"
      rel="noreferrer"
    >
      {text}
      <ArrowUpRight size={24} weight="bold" />
    </a>
  );
}

export default function Menu() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentPlaylistIndex] = useAtom(currentPlaylistIndexAtom);
  const [isAboutOpen] = useAtom(isAboutOpenAtom);
  const orderedPlaylists = playlists.sort(
    (a: PlaylistVideo, b: PlaylistVideo) => a.order - b.order,
  );
  const [externalLinks] = useAtom(externalLinksPageAtom);

  return (
    <div className="absolute z-30 w-[100%] h-[100dvh] bg-cream flex flex-col items-center justify-center text-2xl tracking-wide">
      <div className="w-full h-100 overflow-auto py-20">
        <div className="w-full flex flex-col items-center justify-center gap-y-6 text-center">
          {orderedPlaylists.map(
            ({ uuid, videoTitle }: PlaylistVideo, index: number) => {
              const isCurrentVideo = index === currentPlaylistIndex;
              return (
                <MenuItem
                  key={uuid}
                  title={videoTitle}
                  isCurrentView={!isAboutOpen && isCurrentVideo}
                  onClick={() => handleSetCurrentPlaylist(index)}
                />
              );
            },
          )}
          {externalLinks?.rows.length > 0 &&
            externalLinks?.rows.map((link: { link: string, text: string }, index: number) => {
              return (
                <ExternalLink
                  key={"elink-" + index}
                  link={link.link}
                  text={link.text}
                />
              );
            })}
          <MenuItem
            title="About"
            isSecondary={true}
            isCurrentView={isAboutOpen}
            onClick={handleOpenAbout}
          />
        </div>
      </div>
    </div>
  );
}
