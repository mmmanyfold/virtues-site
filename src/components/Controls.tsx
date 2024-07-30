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
  isSeekLoadingAtom,
  isVideoLoadingAtom,
  isMutedAtom,
  isFullscreenAtom,
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

function ControlButton({
  ariaLabel,
  onClick,
  disabled,
  children,
}: {
  ariaLabel: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button aria-label={ariaLabel} disabled={disabled} className="relative" onClick={onClick}>
      {children}
    </button>
  );
}

function ControlInfoPanel({ iconClass }: { iconClass: string }) {
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);
  return (
    <ControlButton
      ariaLabel={isInfoPanelOpen ? "Close tracklist" : "Open tracklist"}
      disabled={false}
      onClick={handleToggleInfoPanel}
    >
      <Info className={iconClass} weight="light" />
    </ControlButton>
  );
}

function ControlMute({ iconClass }: { iconClass: string }) {
  const [isMuted] = useAtom(isMutedAtom);
  return (
    <ControlButton ariaLabel={isMuted ? "Unmute" : "Mute"} disabled={false} onClick={handleMute}>
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
  disabled,
  onClick,
}: {
  iconClass: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <ControlButton ariaLabel="Random track" disabled={disabled} onClick={onClick}>
      <Shuffle className={iconClass} weight="bold" />
    </ControlButton>
  );
}

function ControlPrevious({
  iconClass,
  disabled,
  onClick,
}: {
  iconClass: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <ControlButton ariaLabel="Previous track" disabled={disabled} onClick={onClick}>
      <Rewind className={iconClass} weight="fill" />
    </ControlButton>
  );
}

function ControlPlayPause({ iconClass, disabled }: { iconClass: string, disabled: boolean }) {
  const [isPlaying] = useAtom(isPlayingAtom);
  const [isSeekLoading] = useAtom(isSeekLoadingAtom);
  const [isVideoLoading] = useAtom(isVideoLoadingAtom);
  return (
    <ControlButton
      ariaLabel={isPlaying ? "Pause" : "Play"}
      disabled={disabled}
      onClick={isPlaying ? handlePause : handlePlay}
    >
      {isPlaying || isSeekLoading || isVideoLoading ? (
        <Pause className={iconClass} weight="fill" />
      ) : (
        <Play className={iconClass} weight="fill" />
      )}
    </ControlButton>
  );
}

function ControlNext({
  iconClass,
  disabled,
  onClick,
}: {
  iconClass: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <ControlButton ariaLabel="Next track" disabled={disabled} onClick={onClick}>
      <FastForward className={iconClass} weight="fill" />
    </ControlButton>
  );
}

function ControlRestart({
  iconClass,
  disabled,
  onClick,
}: {
  iconClass: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <ControlButton ariaLabel="Restart track" disabled={disabled} onClick={onClick}>
      <ArrowCounterClockwise className={iconClass} weight="fill" />
    </ControlButton>
  );
}

function ControlJump({ iconClass, disabled }: { iconClass: string, disabled: boolean }) {
  return (
    <ControlButton ariaLabel="Jump to playlist" disabled={disabled} onClick={handlePlaylistJump}>
      <ArrowsDownUp className={iconClass} weight="bold" />
    </ControlButton>
  );
}

function ControlFullScreen({ iconClass }: { iconClass: string }) {
  const [isFullscreen] = useAtom(isFullscreenAtom);
  return (
    <ControlButton ariaLabel="Fullscreen" disabled={false} onClick={handleFullscreen}>
      {isFullscreen ? (
        <ArrowsIn className={iconClass} />
      ) : (
        <ArrowsOut className={iconClass} />
      )}
    </ControlButton>
  );
}

function ShowcaseControls({ playlist, iconClass, disableControls }: { playlist: any, iconClass: string, disableControls: boolean }) {
  const [showcaseItemIndex] = useAtom(showcaseItemIndexAtom);
  const showcaseTotal = playlist.videoShowCasePayload.total;

  const handleNext = () => {
    const i =
      showcaseItemIndex === showcaseTotal - 1
        ? 0
        : showcaseItemIndex + 1;
    handleSetCurrentShowcaseItem(i);
  };

  const handlePrevious = () => {
    const i = showcaseItemIndex > 0 ? showcaseItemIndex - 1 : showcaseItemIndex;
    handleSetCurrentShowcaseItem(i);
  };

  const handleRandom = () => {
    const i = getRandomIndex(showcaseItemIndex, showcaseTotal);
    handleSetCurrentShowcaseItem(i);
  };

  const handleRestart = () => {
    handleSetCurrentShowcaseItem(0);
  };

  return (
    <div className="flex items-center justify-around bg-cream py-3">
      <ControlInfoPanel iconClass={iconClass} />
      <ControlMute iconClass={iconClass} />
      <ControlRandom iconClass={iconClass} onClick={handleRandom} disabled={disableControls} />
      <ControlPrevious iconClass={iconClass} onClick={handlePrevious} disabled={disableControls} />
      <ControlPlayPause iconClass={iconClass} disabled={disableControls} />
      <ControlNext iconClass={iconClass} onClick={handleNext} disabled={disableControls} />
      <ControlRestart iconClass={iconClass} onClick={handleRestart} disabled={disableControls} />
      <ControlJump iconClass={iconClass} disabled={disableControls} />
      <ControlFullScreen iconClass={iconClass} />
    </div>
  );
}

function ChapterControls({ iconClass }: { iconClass: string }) {
  return (
    <div className="flex items-center justify-around bg-cream py-3">
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
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [isSeekLoading] = useAtom(isSeekLoadingAtom);
  const [isVideoLoading] = useAtom(isVideoLoadingAtom);

  const iconClass = isMediaSmall ? "text-[20px]" : "text-[30px] lg:text-[35px] xl:text-[30px]";

  if (playlist.videoShowCasePayload?.data) {
    return <ShowcaseControls playlist={playlist} iconClass={iconClass} disableControls={isVideoLoading || isSeekLoading} />;
  }
  return <ChapterControls iconClass={iconClass} />;
}

export default Controls;
