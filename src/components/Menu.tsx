import "react";
import { useAtom } from "jotai";
import {
  playlistsAtom,
  currentVideoIndexAtom,
  isAboutOpenAtom,
} from "../store.ts";
import { handleOpenAbout, handleSetCurrentPlaylist } from "../handlers.ts";
import { PlaylistVideo } from "../types.ts";

function MenuItem({ title, isCurrentView, onClick }: any) {
  return (
    <div
      role="button"
      className={`pb-0.5 border-b border-b-[3px] hover:border-b-[#000] ${
        isCurrentView ? "border-b-[#000]" : "border-b-[#fcf3e9]"
      }`}
      onClick={onClick}
    >
      {title}
    </div>
  );
}

export default function Menu() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentVideoIndex] = useAtom(currentVideoIndexAtom);
  const [isAboutOpen] = useAtom(isAboutOpenAtom);
  const orderedPlaylists = playlists.sort(
    (a: PlaylistVideo, b: PlaylistVideo) => a.order - b.order
  );

  return (
    <div className="absolute z-30 w-[100%] h-[100dvh] bg-[#fcf3e9] flex flex-col items-center justify-center text-2xl tracking-wide">
      <div className="w-full h-100 overflow-scroll py-20">
        <div className="w-full flex flex-col items-center justify-center gap-y-6 text-center">
          {orderedPlaylists.map(
            (
              { uuid, videoTitle }: PlaylistVideo,
              index: number
            ) => {
              const isCurrentVideo = index === currentVideoIndex;
              return (
                <MenuItem
                  key={uuid}
                  title={videoTitle}
                  isCurrentView={!isAboutOpen && isCurrentVideo}
                  onClick={() => handleSetCurrentPlaylist(index)}
                />
              );
            }
          )}
          <MenuItem
            title="About"
            isCurrentView={isAboutOpen}
            onClick={handleOpenAbout}
          />
        </div>
      </div>
    </div>
  );
}
