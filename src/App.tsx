import { useEffect, useRef, Suspense, CSSProperties } from "react";
import { Provider, useAtom } from "jotai";
import { X, Plus } from "@phosphor-icons/react";
import { useWindowSize } from "@uidotdev/usehooks";

import About from "./components/About.tsx";
import Controls from "./components/Controls.tsx";
import InfoPanel from "./components/InfoPanel.tsx";
import Menu from "./components/Menu.tsx";
import Seekbar from "./components/Seekbar.tsx";

import "./App.css";
import { useConnectionQuality } from "./useConnectionQuality.ts";
import type { ConnectionQualityState } from "./useConnectionQuality";
import {
  autoplayOnFullscreenExit,
  handleTimeUpdate,
  handleToggleMenu,
  handleIPhoneFullscreenExit,
  isIPhone,
} from "./handlers.ts";
import {
  store,
  aboutPageAtom,
  currentPlaylistIndexAtom,
  displaySizeAtom,
  getPlaylistVideo,
  getVideoLink,
  iPhoneFSPlayerRefAtom,
  isAboutOpenAtom,
  isInfoPanelOpenAtom,
  isMediaSmallAtom,
  isMenuOpenAtom,
  isMutedAtom,
  isPlayingAtom,
  isSeekLoadingAtom,
  isVideoLoadingAtom,
  playerRefAtom,
  playlistsAtom,
  setPlayerVideoData,
  videoSizeAtom,
  windowWidthAtom,
} from "./store.ts";

function VideoPlayer({
  style,
  connectionQuality,
}: {
  style: CSSProperties;
  connectionQuality: ConnectionQualityState;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iosFullscreenVideoRef = useRef<HTMLVideoElement>(null);

  const player = videoRef.current;
  const iPhoneFSPlayer = iosFullscreenVideoRef.current;

  const [_isMuted, setIsMuted] = useAtom(isMutedAtom);
  const [_isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [_isSeekLoading, setIsSeekLoading] = useAtom(isSeekLoadingAtom);
  const [_isVideoLoading, setIsVideoLoading] = useAtom(isVideoLoadingAtom);
  const [_playerRef, setPlayerRef] = useAtom(playerRefAtom);
  const [_iPhoneFSPlayerRef, setIPhoneFSPlayerRef] = useAtom(
    iPhoneFSPlayerRefAtom
  );

  const [playlists] = useAtom(playlistsAtom);
  const firstPlaylist = playlists[0];
  const defaultVideo = getPlaylistVideo(firstPlaylist);
  const defaultVideoLink = getVideoLink(defaultVideo, connectionQuality);

  useEffect(() => {
    if (player) {
      setPlayerRef(player);

      if (!isIPhone) {
        // needed for iPad specifically
        player.addEventListener(
          "webkitfullscreenchange",
          autoplayOnFullscreenExit
        );
        player.addEventListener(
          "webkitendfullscreen",
          autoplayOnFullscreenExit
        );
        return () => {
          player.removeEventListener(
            "webkitfullscreenchange",
            autoplayOnFullscreenExit
          );
          player.removeEventListener(
            "webkitendfullscreen",
            autoplayOnFullscreenExit
          );
        };
      }
    }

    if (player && iPhoneFSPlayer) {
      setIPhoneFSPlayerRef(iPhoneFSPlayer);

      iPhoneFSPlayer.addEventListener(
        "webkitfullscreenchange",
        handleIPhoneFullscreenExit
      );
      iPhoneFSPlayer.addEventListener(
        "webkitendfullscreen",
        handleIPhoneFullscreenExit
      );
      return () => {
        iPhoneFSPlayer.removeEventListener(
          "webkitfullscreenchange",
          handleIPhoneFullscreenExit
        );
        iPhoneFSPlayer.removeEventListener(
          "webkitendfullscreen",
          handleIPhoneFullscreenExit
        );
      };
    }
  }, [player, iPhoneFSPlayer]);

  useEffect(() => {
    if (defaultVideo) {
      setPlayerVideoData(defaultVideo, firstPlaylist.vimeoChaptersPayload.data);
    }
  }, [defaultVideo]);

  const onCanPlay = () => {
    setIsVideoLoading(false);
    setIsSeekLoading(false);
  };

  const onTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e.target instanceof HTMLVideoElement) {
      const currentTime = e.target.currentTime || 0;
      const isIPhoneFSPlayer = e.target === iPhoneFSPlayer;
      handleTimeUpdate(currentTime, isIPhoneFSPlayer);
    }
  };

  const onVolumeChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e.target instanceof HTMLVideoElement) {
      setIsMuted(e.target.muted);
    }
  };

  const videoEvents = {
    onCanPlay,
    onTimeUpdate,
    onVolumeChange,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
  };

  if (!defaultVideoLink || connectionQuality.isLoading) {
    return null;
  }

  return (
    <>
      {isIPhone && (
        <>
          <video
            muted
            id="ios-fullscreen-video"
            ref={iosFullscreenVideoRef}
            style={{ position: "fixed", zIndex: -100, ...style }}
            {...videoEvents}
          >
            <source src={defaultVideoLink} />
          </video>
          <div
            style={{
              position: "absolute",
              width: "100vw",
              height: "100vh",
              zIndex: -99,
              backgroundColor: "black",
            }}
          ></div>
        </>
      )}
      <video
        muted
        autoPlay
        playsInline
        ref={videoRef}
        style={style}
        {...videoEvents}
      >
        <source src={defaultVideoLink} />
      </video>
    </>
  );
}

function VideoFooter() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentPlaylistIndex] = useAtom(currentPlaylistIndexAtom);
  const currentPlaylist = playlists[currentPlaylistIndex];

  return (
    <div className="sticky bottom-0 z-10">
      <Seekbar playlist={currentPlaylist} />
      <Controls playlist={currentPlaylist} />
    </div>
  );
}

function Title() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentPlaylistIndex] = useAtom(currentPlaylistIndexAtom);
  const [isMenuOpen] = useAtom(isMenuOpenAtom);
  const [isAboutOpen] = useAtom(isAboutOpenAtom);
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);

  const { titleColor } = playlists[currentPlaylistIndex];

  let color = "black";

  if (!isMenuOpen && !isAboutOpen && titleColor) {
    color = titleColor.toLowerCase();
  }

  return (
    <h1
      className={`title absolute ${isInfoPanelOpen ? "hidden" : "z-40"} ${
        isMediaSmall
          ? "text-[3rem] top-2 left-3.5"
          : "text-[7.5vh] top-[0.15em] left-[0.3em]"
      }`}
      style={{ color }}
    >
      VIRTUES
    </h1>
  );
}

function MenuToggle() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentPlaylistIndex] = useAtom(currentPlaylistIndexAtom);
  const [isMenuOpen] = useAtom(isMenuOpenAtom);
  const [isAboutOpen] = useAtom(isAboutOpenAtom);
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [aboutPage] = useAtom(aboutPageAtom);

  const { titleColor } = playlists[currentPlaylistIndex];
  const iconClass = isMediaSmall ? "text-[2rem]" : "text-[4.5vh]";

  let plusColor = "black";

  if (!isMenuOpen && !isAboutOpen && titleColor) {
    plusColor = titleColor.toLowerCase();
  }

  return (
    <>
      <div
        role="button"
        className={`absolute ${isInfoPanelOpen ? "hidden" : "z-40"} ${
          isMediaSmall ? "top-4 right-3.5" : "top-6 right-6"
        }`}
        onClick={handleToggleMenu}
      >
        {isMenuOpen || isAboutOpen ? (
          <X className={iconClass} weight="bold" />
        ) : (
          <Plus className={iconClass} weight="bold" color={plusColor} />
        )}
      </div>

      {isMenuOpen && (
        <Suspense fallback={<div>...</div>}>
          <Menu />
        </Suspense>
      )}
      {isAboutOpen && <About blocks={aboutPage?.blocks} />}
    </>
  );
}

function getDisplaySize({
  controlsHeight,
  videoWidth,
  videoHeight,
  windowWidth,
  windowHeight,
}: {
  controlsHeight: number;
  videoWidth: number;
  videoHeight: number;
  windowWidth: number;
  windowHeight: number;
}) {
  const windowHeightWithoutControls = windowHeight - controlsHeight;

  let width = windowHeightWithoutControls * (videoWidth / videoHeight);
  if (width < windowWidth) {
    width = windowWidth;
  }

  return {
    displayWidth: width,
    displayHeight: width * (videoHeight / videoWidth),
    windowHeightWithoutControls,
  };
}

function VideoWrapper({
  connectionQuality,
}: {
  connectionQuality: ConnectionQualityState;
}) {
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);
  const [videoSize] = useAtom(videoSizeAtom);
  const [windowWidth, setWindowWidth] = useAtom(windowWidthAtom);
  const [displaySize, setDisplaySize] = useAtom(displaySizeAtom);
  const windowSize = useWindowSize();

  useEffect(() => {
    const size = getDisplaySize({
      controlsHeight: isMediaSmall ? 57 : 67,
      videoWidth: videoSize[0],
      videoHeight: videoSize[1],
      windowWidth: windowSize.width || 1,
      windowHeight: windowSize.height || 1,
    });
    setDisplaySize(size);
    setWindowWidth(windowSize.width || 1);
  }, [windowSize, videoSize, isMediaSmall]);

  const { displayWidth, displayHeight, windowHeightWithoutControls } =
    displaySize;

  const positionLeft =
    displayWidth === windowWidth ? 0 : `-${(displayWidth - windowWidth) / 2}px`;
  const positionTop =
    displayHeight === windowHeightWithoutControls
      ? 0
      : `-${(displayHeight - windowHeightWithoutControls) / 2}px`;

  const videoStyle = {
    width: `${displayWidth}px`,
    left: positionLeft,
    top: positionTop,
  };

  return (
    <>
      <div
        className="relative"
        style={{
          ...videoStyle,
          height: "100%",
        }}
      >
        <VideoPlayer style={videoStyle} connectionQuality={connectionQuality} />
      </div>
      {isInfoPanelOpen && <InfoPanel />}
    </>
  );
}

function App() {
  const connectionQuality = useConnectionQuality();
  return (
    <Provider store={store}>
      <Title />
      <MenuToggle />
      <VideoWrapper connectionQuality={connectionQuality} />
      <VideoFooter />
    </Provider>
  );
}

export default App;
