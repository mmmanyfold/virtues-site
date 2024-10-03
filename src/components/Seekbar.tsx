import { useAtom } from "jotai";
import { useEffect } from "react";
import { Seekbar as Seek } from "react-seekbar";
import {
  seekingPositionAtom,
  durationAtom,
  showcaseItemIndexAtom,
  isSeekLoadingAtom,
} from "../store.ts";
import { handleSetCurrentShowcaseItem, handleSeek } from "../handlers.ts";
import { Playlist, ShowcaseVideo } from "../types.ts";

const seekbarProps = {
  radius: 0,
  height: 15,
  outerColor: "#a9a9a9",
  innerColor: "#6c6c6c",
  hoverColor: "#6c6c6c",
  fullWidth: true,
};

function SeekChapter() {
  const [seekPosition] = useAtom(seekingPositionAtom);
  const [duration] = useAtom(durationAtom);

  return (
    <div className="seekbar-wrapper">
      <Seek
        position={seekPosition}
        duration={duration}
        onSeek={handleSeek}
        {...seekbarProps}
      />
    </div>
  );
}

function showcaseVideoIndexFromPosition(
  position: number,
  startTimes: number[]
) {
  let index = 0;
  for (let i = 0; i < startTimes.length; i++) {
    if (position > startTimes[i]) {
      index = i;
    }
  }
  return index;
}

function handleShowcaseSeek(
  pos: number,
  currentIndex: number,
  startTimes: number[]
) {
  const videoIndex = showcaseVideoIndexFromPosition(pos, startTimes);
  const videoPosition = pos - startTimes[videoIndex];

  if (videoIndex === currentIndex) {
    handleSeek(videoPosition);
    return;
  }
  handleSetCurrentShowcaseItem(videoIndex, videoPosition);
}

function SeekShowcase({ items }: { items: ShowcaseVideo[] }) {
  const [currentVideoIndex] = useAtom(showcaseItemIndexAtom);
  const [currentVideoSeekPosition] = useAtom(seekingPositionAtom);

  useEffect(() => {
    if (currentVideoSeekPosition === items[currentVideoIndex].duration - 1) {
      const isLast = currentVideoIndex === items.length - 1;
      handleSetCurrentShowcaseItem(isLast ? 0 : currentVideoIndex + 1, 1);
    }
  }, [currentVideoSeekPosition, currentVideoIndex]);

  const videoStartTimes = items.map((_, index) => {
    return items.slice(0, index).reduce((acc, item) => {
      const sum = acc + item.duration;
      return index === 0 ? 0 : sum + 1;
    }, 0);
  });

  const currentVideoStartTime = videoStartTimes[currentVideoIndex];
  const showcasePosition = currentVideoStartTime + currentVideoSeekPosition;
  const showcaseDuration = items.reduce(
    (acc, item) => acc + item.duration + 1,
    0
  );

  const onSeek = (pos: number) => {
    handleShowcaseSeek(pos, currentVideoIndex, videoStartTimes);
  };

  return (
    <div className="seekbar-wrapper">
      <Seek
        position={showcasePosition}
        duration={showcaseDuration}
        onSeek={onSeek}
        {...seekbarProps}
      />
    </div>
  );
}

function Seekbar({ playlist }: { playlist: Playlist }) {
  const [isSeekLoading] = useAtom(isSeekLoadingAtom);

  if (isSeekLoading || !playlist) {
    return (
      <div className="relative">
        <div className="absolute w-full">
          <div className="flex items-center h-[25px]">
            <div className="seekbar-loading !bg-[#242424]"></div>
          </div>
        </div>
        <div className="seekbar-wrapper">
          <div className="flex items-center h-[25px]">
            <div className="seekbar-loading animate-pulse duration-75"></div>
          </div>
        </div>
      </div>
    );
  }

  const showcaseItems = playlist.videoShowCasePayload.data;
  if (showcaseItems) {
    return <SeekShowcase items={showcaseItems} />;
  }

  return <SeekChapter />;
}

export default Seekbar;
