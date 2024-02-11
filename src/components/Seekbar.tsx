import { SetStateAction } from "react";
import { useAtom } from "jotai";
import { Seekbar as Seek } from "react-seekbar";
import {
  seekingPositionAtom,
  durationAtom,
  timeInSecondsUpdateAtom,
  showcaseItemIndexAtom,
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
  handleSeek,
}: {
  item: any;
  index: number;
  activeIndex: number;
  position: number;
  duration: number;
  handleSeek: (position: SetStateAction<number>) => void;
}) {
  if (index === activeIndex) {
    return (
      <Seek
        position={position}
        duration={item.duration}
        onSeek={handleSeek}
        radius={0}
        height={15}
        outerColor="#a9a9a9"
        innerColor="#6c6c6c"
        hoverColor="#6c6c6c"
        // outerColor="#ff0000"
        // innerColor="#00ff00"
        // hoverColor="#00ff00"
        // fullWidth
      />
    );
  }
  
  return (
    <Seek
      position={index > activeIndex ? 0 : item.duration}
      duration={item.duration}
      onSeek={(pos) => {
        console.log("Seeking to", index);
        console.log("position", pos);
        handleSetCurrentShowcaseItem(index, pos);
      }}
      radius={0}
      height={15}
      outerColor="#a9a9a9"
      innerColor="#6c6c6c"
      hoverColor="#6c6c6c"
    //   fullWidth
    />
  );
}

function SeekShowcase({ items }: { items: any[] }) {
  const [position] = useAtom(timeInSecondsUpdateAtom);
  const [, setSeekPosition] = useAtom(seekingPositionAtom);
  const [duration] = useAtom(durationAtom);

  const handleSeek = (position: SetStateAction<number>) => {
    setSeekPosition(position);
  };

  const [showcaseItemIndex] = useAtom(showcaseItemIndexAtom);

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
