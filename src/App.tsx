import { useEffect, useRef, Suspense } from "react";
import { Provider, useAtom } from "jotai";
import { X, Plus } from "@phosphor-icons/react";
import { useWindowSize } from "@uidotdev/usehooks";

import About from "./components/About.tsx";
import Controls from "./components/Controls.tsx";
import InfoPanel from "./components/InfoPanel.tsx";
import Menu from "./components/Menu.tsx";
import Seekbar from "./components/Seekbar.tsx";

import "./App.css";
import { handleToggleMenu } from "./handlers.ts";
import {
  store,
  aboutPageAtom,
  currentPlaylistIndexAtom,
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
  videoSizeAtom,
  windowWidthAtom,
  wrapperWidthAtom,
} from "./store.ts";

const getDefaultVideoUrl = (playlist: any) => {
  if (playlist?.videoShowCasePayload?.data?.length) {
    return playlist.videoShowCasePayload.data[0].videoSourceUrl
  }
  return playlist?.videoSourceUrl
}

function VideoPlayer() {
  const [[width, height]] = useAtom(videoSizeAtom);

  const videoRef = useRef<HTMLVideoElement>(null)
  const player = videoRef.current

  useEffect(() => {
    if (player) {
      store.set(playerRefAtom, player)
    }
  }, [player])

  const [playlists] = useAtom(playlistsAtom)
  const firstPlaylist = playlists[0]
  const defaultVideoUrl = getDefaultVideoUrl(firstPlaylist)

  const [_isMuted, setIsMuted] = useAtom(isMutedAtom)
  const [_isPlaying, setIsPlaying] = useAtom(isPlayingAtom)
  const [_isSeekLoading, setIsSeekLoading] = useAtom(isSeekLoadingAtom)
  const [_isVideoLoading, setIsVideoLoading] = useAtom(isVideoLoadingAtom)
  const [_seekingPosition, setSeekingPosition] = useAtom(seekingPositionAtom)

  const onCanPlay = () => {
    setIsVideoLoading(false)
    setIsSeekLoading(false)
  }

  const onTimeUpdate = () => {
    const currentTime = player?.currentTime || 0
    setSeekingPosition(Math.trunc(currentTime))
  }

  if (!defaultVideoUrl) {
    return null;
  }

  return (
    <div>
      <video
        muted
        autoPlay
        playsInline
        ref={videoRef}
        className="h-[100dvh]"
        style={{
          // paddingTop: !!width ? `${(height / width) * 100}%` : "41.67%",
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onCanPlay={onCanPlay}
        onTimeUpdate={onTimeUpdate}
        onVolumeChange={() => setIsMuted(player?.muted || false)}
      >
        <source src={defaultVideoUrl} />
      </video>
    </div>
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

function getWrapperWidth({
  controlsHeight,
  videoWidth,
  videoHeight,
  windowWidth,
  windowHeight,
}: any) {
  const windowHeightWithoutControls = windowHeight - controlsHeight;
  const videoAspectRatio = videoWidth / videoHeight;

  let width = windowHeightWithoutControls * videoAspectRatio;

  if (width < windowWidth) {
    width = windowWidth;
  }

  return width;
}

function VideoWrapper() {
  const windowSize = useWindowSize();
  const [windowWidth] = useAtom(windowWidthAtom);
  const [videoSize] = useAtom(videoSizeAtom);
  const [wrapperWidth] = useAtom(wrapperWidthAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);

  useEffect(() => {
    const width = getWrapperWidth({
      controlsHeight: isMediaSmall ? 57 : 67,
      videoWidth: videoSize[0],
      videoHeight: videoSize[1],
      windowWidth: windowSize.width || 1,
      windowHeight: windowSize.height || 1,
    });
    store.set(wrapperWidthAtom, width);
    store.set(windowWidthAtom, windowSize.width || 1);
  }, [windowSize, videoSize, isMediaSmall]);

  const positionLeft =
    wrapperWidth === windowWidth ? 0 : `-${(wrapperWidth - windowWidth) / 2}px`;

  return (
    <>
      <div
        // className="relative"
        // style={{
        //   width: `${wrapperWidth}px`,
        //   left: positionLeft,
        //   height: "100%",
        // }}
      >
        <VideoPlayer />
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
