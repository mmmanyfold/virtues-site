import { SetStateAction } from "react";
import { useAtom } from "jotai";
import { Seekbar as Seek } from "react-seekbar";
import {
  seekingPositionAtom,
  durationAtom,
  timeInSecondsUpdateAtom,
  showcaseItemIndexAtom,
  windowWidthAtom
} from "../store.ts";
import { handleSetCurrentShowcaseItem } from "../handlers.ts";

function SeekChapter() {
  const [position] = useAtom(timeInSecondsUpdateAtom);
  const [, setSeekPosition] = useAtom(seekingPositionAtom);
  const [duration] = useAtom(durationAtom);

  const handleSeek = (position: SetStateAction<number>) => {
    setSeekPosition(position);
  };

  return (
    <div className="seekbar-wrapper">
      <Seek
        position={position}
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
  activeIndex,
  position,
  showcaseDuration,
  windowWidth,
  handleSeek,
}: {
  item: any;
  index: number;
  activeIndex: number;
  position: number;
  duration: number;
  showcaseDuration: number;
  windowWidth: number;
  handleSeek: (position: SetStateAction<number>) => void;
}) {
  const width = windowWidth / showcaseDuration * item.duration;
  const seekProps = {
    duration: item.duration,
    radius: 0,
    height: 15,
    outerColor: "#a9a9a9",
    innerColor: "#6c6c6c",
    hoverColor: "#6c6c6c",
    width,
  }

  if (index === activeIndex) {
    return (
      <Seek
        position={position}
        onSeek={handleSeek}
        {...seekProps}
      />
    );
  }
  
  return (
    <Seek
      position={index > activeIndex ? 0 : item.duration}
      onSeek={(pos) => {
        handleSetCurrentShowcaseItem(index, pos);
      }}
      {...seekProps}
    />
  );
}

function SeekShowcase({ items }: { items: any[] }) {
  const [windowWidth] = useAtom(windowWidthAtom);
  const [position] = useAtom(timeInSecondsUpdateAtom);
  const [, setSeekPosition] = useAtom(seekingPositionAtom);
  const [duration] = useAtom(durationAtom);
  const [showcaseItemIndex] = useAtom(showcaseItemIndexAtom);

  const showcaseDuration = items.reduce((acc, item) => acc + item.duration, 0);

  const handleSeek = (position: SetStateAction<number>) => {
    setSeekPosition(position);
  };

  return (
    <div className="seekbar-wrapper flex">
      {items.map((item, index) => (
        <ShowcaseSeekItem
          key={item.uri}
          item={item}
          index={index}
          activeIndex={showcaseItemIndex}
          position={position}
          duration={duration}
          showcaseDuration={showcaseDuration}
          windowWidth={windowWidth}
          handleSeek={handleSeek}
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
