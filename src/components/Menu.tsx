import "react";
import { useAtom } from "jotai";
import { playlistsAtom, currentVideoIndexAtom } from "../store.ts";
import { handleSetCurrentVideo } from "../handlers.ts";
import { PlaylistVideo } from "../types.ts";

export default function Menu() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentVideoIndex] = useAtom(currentVideoIndexAtom);
  const orderedPlaylists = playlists?.rows.sort(
    (a: PlaylistVideo, b: PlaylistVideo) => a.order - b.order
  );

  return (
    <div className="absolute z-20 w-[100vw] h-[100vh] bg-[#fcf3e9] flex flex-col items-center justify-center text-2xl tracking-wide">
      <div className="max-w-[500px] flex flex-col items-center justify-center gap-y-6 text-center">
        {orderedPlaylists.map(
          ({ uuid, videoTitle, vimeoPlayerURL }: PlaylistVideo, index: number) => {
            const isCurrentVideo = index === currentVideoIndex;
            return (
              <div
                key={uuid}
                role="button"
                className={`pb-0.5 border-b border-b-[2.5px] hover:border-b-[#000] ${
                  isCurrentVideo ? "border-b-[#000]" : "border-b-[#fcf3e9]"
                }`}
                onClick={() => handleSetCurrentVideo(vimeoPlayerURL)}
              >
                {videoTitle}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
