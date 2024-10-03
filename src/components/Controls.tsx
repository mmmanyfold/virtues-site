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
  CircleNotch,
} from "@phosphor-icons/react";
import {
  isMediaSmallAtom,
  isPlayingAtom,
  isSeekLoadingAtom,
  isVideoLoadingAtom,
  isMutedAtom,
  isInfoPanelOpenAtom,
  showcaseItemIndexAtom,
} from "../store.ts";
import {
  handleFullscreen,
  handleMute,
  handlePlay,
  handlePause,
  handlePlaylistJump,
  handleToggleInfoPanel,
  handleSetCurrentShowcaseItem,
  handleRestartPlayback,
  handleNextChapter,
  handlePreviousChapter,
  handleRandomChapter,
  getRandomIndex,
} from "../handlers.ts";
import { Playlist } from "../types.ts";

function ControlButton({
  ariaLabel,
  onClick,
  disabled = false,
  children,
}: {
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="relative"
      onClick={onClick}
      disabled={disabled}
    >
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
  disabled,
}: {
  iconClass: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <ControlButton
      ariaLabel="Random track"
      onClick={onClick}
      disabled={disabled}
    >
      <Shuffle className={iconClass} weight="bold" />
    </ControlButton>
  );
}

function ControlPrevious({
  iconClass,
  onClick,
  disabled,
}: {
  iconClass: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <ControlButton
      ariaLabel="Previous track"
      onClick={onClick}
      disabled={disabled}
    >
      <Rewind className={iconClass} weight="fill" />
    </ControlButton>
  );
}

function ControlPlayPause({
  iconClass,
  disabled,
}: {
  iconClass: string;
  disabled?: boolean;
}) {
  const [isPlaying] = useAtom(isPlayingAtom);

  let ariaLabel: string;
  if (disabled) {
    ariaLabel = "Loading";
  } else if (isPlaying) {
    ariaLabel = "Pause";
  } else {
    ariaLabel = "Play";
  }

  let icon: React.ReactNode;
  if (disabled) {
    icon = <CircleNotch className={`animate-spin ${iconClass}`} />;
  } else if (isPlaying) {
    icon = <Pause className={iconClass} weight="fill" />;
  } else {
    icon = <Play className={iconClass} weight="fill" />;
  }

  return (
    <ControlButton
      ariaLabel={ariaLabel}
      onClick={isPlaying ? handlePause : handlePlay}
      disabled={disabled}
    >
      {icon}
    </ControlButton>
  );
}

function ControlNext({
  iconClass,
  onClick,
  disabled,
}: {
  iconClass: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <ControlButton ariaLabel="Next track" onClick={onClick} disabled={disabled}>
      <FastForward className={iconClass} weight="fill" />
    </ControlButton>
  );
}

function ControlRestart({
  iconClass,
  onClick,
  disabled,
}: {
  iconClass: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <ControlButton
      ariaLabel="Restart track"
      onClick={onClick}
      disabled={disabled}
    >
      <ArrowCounterClockwise className={iconClass} weight="fill" />
    </ControlButton>
  );
}

function ControlJump({
  iconClass,
  disabled,
}: {
  iconClass: string;
  disabled?: boolean;
}) {
  return (
    <ControlButton
      ariaLabel="Jump to playlist"
      onClick={handlePlaylistJump}
      disabled={disabled}
    >
      <ArrowsDownUp className={iconClass} weight="bold" />
    </ControlButton>
  );
}

function ControlFullScreen({ iconClass }: { iconClass: string }) {
  return (
    <ControlButton ariaLabel="Fullscreen" onClick={handleFullscreen}>
      <ArrowsOut className={iconClass} />
    </ControlButton>
  );
}

function ShowcaseControls({
  playlist,
  iconClass,
  disableControls,
}: {
  playlist: Playlist;
  iconClass: string;
  disableControls: boolean;
}) {
  const [showcaseItemIndex] = useAtom(showcaseItemIndexAtom);
  const showcaseTotal = playlist.videoShowCasePayload.total;

  const handleNext = () => {
    const index =
      showcaseItemIndex === showcaseTotal - 1 ? 0 : showcaseItemIndex + 1;
    handleSetCurrentShowcaseItem({ index });
  };

  const handlePrevious = () => {
    const index =
      showcaseItemIndex > 0 ? showcaseItemIndex - 1 : showcaseItemIndex;
    handleSetCurrentShowcaseItem({ index });
  };

  const handleRandom = () => {
    const index = getRandomIndex(showcaseItemIndex, showcaseTotal);
    handleSetCurrentShowcaseItem({ index });
  };

  const handleRestart = () => {
    handleSetCurrentShowcaseItem({ index: 0 });
  };

  return (
    <div className="flex items-center justify-around bg-cream py-3">
      <ControlInfoPanel iconClass={iconClass} />
      <ControlMute iconClass={iconClass} />
      <ControlRandom
        iconClass={iconClass}
        onClick={handleRandom}
        disabled={disableControls}
      />
      <ControlPrevious
        iconClass={iconClass}
        onClick={handlePrevious}
        disabled={disableControls}
      />
      <ControlPlayPause iconClass={iconClass} disabled={disableControls} />
      <ControlNext
        iconClass={iconClass}
        onClick={handleNext}
        disabled={disableControls}
      />
      <ControlRestart
        iconClass={iconClass}
        onClick={handleRestart}
        disabled={disableControls}
      />
      <ControlJump iconClass={iconClass} disabled={disableControls} />
      <ControlFullScreen iconClass={iconClass} />
    </div>
  );
}

function ChapterControls({
  iconClass,
  disableControls,
}: {
  iconClass: string;
  disableControls: boolean;
}) {
  return (
    <div className="flex items-center justify-around bg-cream py-3">
      <ControlInfoPanel iconClass={iconClass} />
      <ControlMute iconClass={iconClass} />
      <ControlRandom iconClass={iconClass} onClick={handleRandomChapter} />
      <ControlPrevious iconClass={iconClass} onClick={handlePreviousChapter} />
      <ControlPlayPause iconClass={iconClass} disabled={disableControls} />
      <ControlNext iconClass={iconClass} onClick={handleNextChapter} />
      <ControlRestart iconClass={iconClass} onClick={handleRestartPlayback} />
      <ControlJump iconClass={iconClass} />
      <ControlFullScreen iconClass={iconClass} />
    </div>
  );
}

function Controls({ playlist }: { playlist: Playlist }) {
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [isSeekLoading] = useAtom(isSeekLoadingAtom);
  const [isVideoLoading] = useAtom(isVideoLoadingAtom);
  const disableControls = isVideoLoading || isSeekLoading;

  const iconClass = [
    "transition-all duration-400 ease-in-out",
    disableControls ? "opacity-75" : "opacity-100",
    isMediaSmall ? "text-[20px]" : "text-[30px] lg:text-[35px] xl:text-[30px]",
  ].join(" ");

  if (playlist.videoShowCasePayload?.data) {
    return (
      <ShowcaseControls
        playlist={playlist}
        iconClass={iconClass}
        disableControls={disableControls}
      />
    );
  }
  return (
    <ChapterControls iconClass={iconClass} disableControls={disableControls} />
  );
}

export default Controls;
