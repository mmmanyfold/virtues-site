import { useAtom } from "jotai";
import { Seekbar as Seek } from "react-seekbar";
import {
  seekingPositionAtom,
  durationAtom,
  showcaseItemIndexAtom,
  windowWidthAtom,
  isSeekLoadingAtom,
} from "../store.ts";
import { handleSetCurrentShowcaseItem, handleSeek } from "../handlers.ts";

function SeekChapter() {
  const [seekPosition] = useAtom(seekingPositionAtom);
  const [duration] = useAtom(durationAtom);

  return (
    <div className="seekbar-wrapper">
      <Seek
        position={seekPosition}
        duration={duration}
        onSeek={handleSeek}
        radius={0}
        height={15}
        outerColor="#a9a9a9"
        innerColor="#6c6c6c"
        hoverColor="#6c6c6c"
        fullWidth
      />
    </div>
  );
}

function ShowcaseSeekItem({
  item,
  index,
  seekPosition,
  showcaseDuration,
  windowWidth,
  setLoading,
}: {
  item: any;
  index: number;
  seekPosition: number;
  duration: number;
  showcaseDuration: number;
  windowWidth: number;
  setLoading: () => void;
}) {
  const [showcaseItemIndex] = useAtom(showcaseItemIndexAtom);
  const width = (windowWidth / showcaseDuration) * item.duration;
  const seekProps = {
    duration: item.duration,
    radius: 0,
    height: 15,
    outerColor: "#a9a9a9",
    innerColor: "#6c6c6c",
    hoverColor: "#6c6c6c",
    width,
  };

  const isActive = index === showcaseItemIndex;
  let position = seekPosition;

  if (!isActive) {
    position = index > showcaseItemIndex ? 0 : item.duration
  }

  const onSeek = (pos: number) => {
    if (isActive) {
      handleSeek(pos);
    } else {
      setLoading();
      // setShowcaseItemIndex(index);
      handleSetCurrentShowcaseItem(index, pos);
    }
  }

  return (
    <Seek
      position={position}
      onSeek={onSeek}
      {...seekProps}
    />
  );
}

function SeekShowcase({ items }: { items: any[] }) {
  const [windowWidth] = useAtom(windowWidthAtom);
  const [seekPosition] = useAtom(seekingPositionAtom);
  const [duration] = useAtom(durationAtom);
  const [isSeekLoading, setIsSeekLoading] = useAtom(isSeekLoadingAtom);

  const showcaseDuration = items.reduce((acc, item) => acc + item.duration, 0);

  if (isSeekLoading) {
    return (
      <div className="seekbar-wrapper">
        <div className="flex items-center relative h-[25px]">
          <div className="seekbar-loading animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="seekbar-wrapper flex">
      {items.map((item, index) => (
        <ShowcaseSeekItem
          key={item.uri}
          item={item}
          index={index}
          seekPosition={seekPosition}
          duration={duration}
          showcaseDuration={showcaseDuration}
          windowWidth={windowWidth}
          setLoading={() => setIsSeekLoading(true)}
        />
      ))}
    </div>
  );
}

function Seekbar({ playlist }: { playlist: any }) {
  if (playlist.videoShowCasePayload.data) {
    return <SeekShowcase items={playlist.videoShowCasePayload.data} />;
  }
  return <SeekChapter />;
}

export default Seekbar;
