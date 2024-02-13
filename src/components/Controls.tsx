import { useAtom } from "jotai";
import {
  Info,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
  Shuffle,
  Rewind,
  Play,
  FastForward,
  Pause,
  ArrowCounterClockwise,
  ArrowsDownUp,
  ArrowsOut,
  ArrowsIn,
} from "@phosphor-icons/react";
import {
  isMediaSmallAtom,
  isPlayingAtom,
  isMutedAtom,
  isFullscreenAtom,
  isInfoPanelOpenAtom,
  showcaseItemIndexAtom,
} from "../store.ts";
import {
  handleFullscreen,
  handleMute,
  handlePlay,
  handlePlaylistJump,
  handleToggleInfoPanel,
  handleSetCurrentShowcaseItem,
  handleRestartPlayback,
  handleNextChapter,
  handlePreviousChapter,
  handleRandomChapter,
} from "../handlers.ts";

function ControlButton({
  ariaLabel,
  onClick,
  children,
}: {
  ariaLabel: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button aria-label={ariaLabel} className="relative" onClick={onClick}>
      {children}
    </button>
  );
}

function ControlInfoPanel({ iconClass }: { iconClass: string }) {
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);
  return (
    <ControlButton
      ariaLabel={isInfoPanelOpen ? "Close tracklist" : "Open tracklist"}
      onClick={handleToggleInfoPanel}
    >
      <Info className={iconClass} weight="light" />
    </ControlButton>
  );
}

function ControlMute({ iconClass }: { iconClass: string }) {
  const [isMuted] = useAtom(isMutedAtom);
  return (
    <ControlButton ariaLabel={isMuted ? "Unmute" : "Mute"} onClick={handleMute}>
      {isMuted ? (
        <SpeakerSimpleSlash className={iconClass} weight="fill" />
      ) : (
        <SpeakerSimpleHigh className={iconClass} weight="fill" />
      )}
    </ControlButton>
  );
}

function ControlRandom({
  iconClass,
  onClick,
}: {
  iconClass: string;
  onClick: () => void;
}) {
  return (
    <ControlButton ariaLabel="Random track" onClick={onClick}>
      <Shuffle className={iconClass} weight="bold" />
    </ControlButton>
  );
}

function ControlPrevious({
  iconClass,
  onClick,
}: {
  iconClass: string;
  onClick: () => void;
}) {
  return (
    <ControlButton ariaLabel="Previous track" onClick={onClick}>
      <Rewind className={iconClass} weight="fill" />
    </ControlButton>
  );
}

function ControlPlayPause({ iconClass }: { iconClass: string }) {
  const [isPlaying] = useAtom(isPlayingAtom);
  return (
    <ControlButton
      ariaLabel={isPlaying ? "Pause" : "Play"}
      onClick={handlePlay}
    >
      {isPlaying ? (
        <Pause className={iconClass} weight="fill" />
      ) : (
        <Play className={iconClass} weight="fill" />
      )}
    </ControlButton>
  );
}

function ControlNext({
  iconClass,
  onClick,
}: {
  iconClass: string;
  onClick: () => void;
}) {
  return (
    <ControlButton ariaLabel="Next track" onClick={onClick}>
      <FastForward className={iconClass} weight="fill" />
    </ControlButton>
  );
}

function ControlRestart({
  iconClass,
  onClick,
}: {
  iconClass: string;
  onClick: () => void;
}) {
  return (
    <ControlButton ariaLabel="Restart track" onClick={onClick}>
      <ArrowCounterClockwise className={iconClass} weight="fill" />
    </ControlButton>
  );
}

function ControlJump({ iconClass }: { iconClass: string }) {
  return (
    <ControlButton ariaLabel="Jump to playlist" onClick={handlePlaylistJump}>
      <ArrowsDownUp className={iconClass} weight="bold" />
    </ControlButton>
  );
}

function ControlFullScreen({ iconClass }: { iconClass: string }) {
  const [isFullscreen] = useAtom(isFullscreenAtom);
  return (
    <ControlButton ariaLabel="Fullscreen" onClick={handleFullscreen}>
      {isFullscreen ? (
        <ArrowsIn className={iconClass} />
      ) : (
        <ArrowsOut className={iconClass} />
      )}
    </ControlButton>
  );
}

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};

function ShowcaseControls({ playlist }: { playlist: any }) {
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [showcaseItemIndex] = useAtom(showcaseItemIndexAtom);

  const iconClass = isMediaSmall ? "text-[20px]" : "text-[30px]";
  const showcaseTotal = playlist.videoShowCasePayload.total;

  const handleNext = () => {
    const i =
      showcaseItemIndex === showcaseTotal - 1
        ? showcaseItemIndex
        : showcaseItemIndex + 1;
    handleSetCurrentShowcaseItem(i);
  };

  const handlePrevious = () => {
    const i = showcaseItemIndex > 0 ? showcaseItemIndex - 1 : showcaseItemIndex;
    handleSetCurrentShowcaseItem(i);
  };

  const handleRandom = () => {
    let i = getRandomInt(showcaseTotal);
    while (i === showcaseItemIndex) {
      i = getRandomInt(showcaseTotal);
    }
    handleSetCurrentShowcaseItem(i);
  };

  const handleRestart = () => {
    handleSetCurrentShowcaseItem(0);
  };

  return (
    <div className="flex items-center justify-around bg-[#fdfcfa] py-3">
      <ControlInfoPanel iconClass={iconClass} />
      <ControlMute iconClass={iconClass} />
      <ControlRandom iconClass={iconClass} onClick={handleRandom} />
      <ControlPrevious iconClass={iconClass} onClick={handlePrevious} />
      <ControlPlayPause iconClass={iconClass} />
      <ControlNext iconClass={iconClass} onClick={handleNext} />
      <ControlRestart iconClass={iconClass} onClick={handleRestart} />
      <ControlJump iconClass={iconClass} />
      <ControlFullScreen iconClass={iconClass} />
    </div>
  );
}

function ChapterControls() {
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const iconClass = isMediaSmall ? "text-[20px]" : "text-[30px]";

  return (
    <div className="flex items-center justify-around bg-[#fdfcfa] py-3">
      <ControlInfoPanel iconClass={iconClass} />
      <ControlMute iconClass={iconClass} />
      <ControlRandom iconClass={iconClass} onClick={handleRandomChapter} />
      <ControlPrevious iconClass={iconClass} onClick={handlePreviousChapter} />
      <ControlPlayPause iconClass={iconClass} />
      <ControlNext iconClass={iconClass} onClick={handleNextChapter} />
      <ControlRestart iconClass={iconClass} onClick={handleRestartPlayback} />
      <ControlJump iconClass={iconClass} />
      <ControlFullScreen iconClass={iconClass} />
    </div>
  );
}

function Controls({ playlist }: { playlist: any }) {
  if (playlist.videoShowCasePayload?.data) {
    return <ShowcaseControls playlist={playlist} />;
  }
  return <ChapterControls />;
}

export default Controls;
