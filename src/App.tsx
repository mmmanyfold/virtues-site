import { useEffect, useRef, Suspense, CSSProperties } from "react";
import { Provider, useAtom } from "jotai";
import { X, Plus } from "@phosphor-icons/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { isIOS } from "react-device-detect";

import About from "./components/About.tsx";
import Controls from "./components/Controls.tsx";
import InfoPanel from "./components/InfoPanel.tsx";
import Menu from "./components/Menu.tsx";
import Seekbar from "./components/Seekbar.tsx";

import "./App.css";
import { handleToggleMenu, handleIosFullscreenExit } from "./handlers.ts";
import {
  store,
  aboutPageAtom,
  currentPlaylistIndexAtom,
  displaySizeAtom,
  getPlaylistVideo,
  getVideoLink,
  iosFullscreenPlayerRefAtom,
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
  seekingPositionAtom,
  setPlayerVideoData,
  videoSizeAtom,
  windowWidthAtom,
} from "./store.ts";

function VideoPlayer({ style }: { style: CSSProperties}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const iosFullscreenVideoRef = useRef<HTMLVideoElement>(null)

  const player = videoRef.current
  const iosFullscreenPlayer = iosFullscreenVideoRef.current

  const [_isMuted, setIsMuted] = useAtom(isMutedAtom)
  const [_isPlaying, setIsPlaying] = useAtom(isPlayingAtom)
  const [_isSeekLoading, setIsSeekLoading] = useAtom(isSeekLoadingAtom)
  const [_isVideoLoading, setIsVideoLoading] = useAtom(isVideoLoadingAtom)
  const [_playerRef, setPlayerRef] = useAtom(playerRefAtom)
  const [_iosFullscreenPlayerRef, setIosFullscreenPlayerRef] = useAtom(iosFullscreenPlayerRefAtom)
  const [_seekingPosition, setSeekingPosition] = useAtom(seekingPositionAtom)
  
  const [playlists] = useAtom(playlistsAtom)
  const firstPlaylist = playlists[0]
  const defaultVideo = getPlaylistVideo(firstPlaylist)
  const defaultVideoLink = getVideoLink(defaultVideo)

  useEffect(() => {
    if (player) {
      setPlayerRef(player)
    }

    if (player && iosFullscreenPlayer) {
      setIosFullscreenPlayerRef(iosFullscreenPlayer)

      iosFullscreenPlayer.addEventListener("fullscreenchange", handleIosFullscreenExit);
      iosFullscreenPlayer.addEventListener("webkitfullscreenchange", handleIosFullscreenExit);
      iosFullscreenPlayer.addEventListener("webkitendfullscreen", handleIosFullscreenExit);
      return () => {
        iosFullscreenPlayer.removeEventListener("fullscreenchange", handleIosFullscreenExit);
        iosFullscreenPlayer.removeEventListener("webkitfullscreenchange", handleIosFullscreenExit);
        iosFullscreenPlayer.removeEventListener("webkitendfullscreen", handleIosFullscreenExit);
      };
    }
  }, [player, iosFullscreenPlayer])

  useEffect(() => {
    if (defaultVideo) {
      setPlayerVideoData(defaultVideo, firstPlaylist.vimeoChaptersPayload.data)
    }
  }, [defaultVideo])

  const onCanPlay = () => {
    setIsVideoLoading(false)
    setIsSeekLoading(false)
  }

  const onTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e.target instanceof HTMLVideoElement) {
      const currentTime = e.target.currentTime || 0
      setSeekingPosition(Math.trunc(currentTime))
    }
  }
  
  const onVolumeChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e.target instanceof HTMLVideoElement) {
      setIsMuted(e.target.muted)
    }
  }

  const videoEvents = {
    onCanPlay,
    onTimeUpdate,
    onVolumeChange,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
  }

  if (!defaultVideoLink) {
    return null;
  }

  return (
      <>
        {isIOS && (
          <video
            muted
            id="ios-fullscreen-video" 
            ref={iosFullscreenVideoRef}
            style={{ position: "absolute", height: "1px", zIndex: -100 }}
            {...videoEvents}
          >
            <source src={defaultVideoLink} />
          </video>
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
  controlsHeight: number,
  videoWidth: number,
  videoHeight: number,
  windowWidth: number,
  windowHeight: number,
}) {
  const windowHeightWithoutControls = windowHeight - controlsHeight;

  let width = windowHeightWithoutControls * (videoWidth / videoHeight);
  if (width < windowWidth) {
    width = windowWidth;
  }

  return { 
    displayWidth: width, 
    displayHeight: width * (videoHeight / videoWidth),
    windowHeightWithoutControls
  };
}

function VideoWrapper() {
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

  const { 
    displayWidth, 
    displayHeight, 
    windowHeightWithoutControls 
  } = displaySize;
  
  const positionLeft = displayWidth === windowWidth ? 0 : `-${(displayWidth - windowWidth) / 2}px`;
  const positionTop = displayHeight === windowHeightWithoutControls ? 0 : `-${(displayHeight - windowHeightWithoutControls) / 2}px`;

  const videoStyle = {
    width: `${displayWidth}px`,
    left: positionLeft,
    top: positionTop
  }

  return (
    <>
      <div
        className="relative"
        style={{
          ...videoStyle,
          height: "100%",
        }}
      >
        <VideoPlayer style={videoStyle} />
      </div>
      {isInfoPanelOpen && <InfoPanel />}
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Title />
      <MenuToggle />
      <VideoWrapper />
      <VideoFooter />
    </Provider>
  );
}

export default App;
