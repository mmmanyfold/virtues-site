import "react";
import { useAtom } from "jotai";
import {
  playlistsAtom,
  currentVideoIndexAtom,
  isAboutOpenAtom,
} from "../store.ts";
import { handleSetCurrentVideo, handleOpenAbout } from "../handlers.ts";
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
    <div className="absolute z-30 w-[100%] h-[100dvh] overflow-scroll bg-[#fcf3e9] flex flex-col items-center justify-center text-2xl tracking-wide">
      <div className="max-w-[500px] flex flex-col items-center justify-center gap-y-6 text-center">
        {orderedPlaylists.map(
          (
            { uuid, videoTitle, vimeoPlayerURL }: PlaylistVideo,
            index: number
          ) => {
            const isCurrentVideo = index === currentVideoIndex;
            return (
              <MenuItem
                key={uuid}
                title={videoTitle}
                isCurrentView={!isAboutOpen && isCurrentVideo}
                onClick={() => handleSetCurrentVideo(vimeoPlayerURL)}
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
  );
}
