import { useEffect, Suspense } from "react";
import { Provider, useAtom } from "jotai";
import { useWindowSize } from "@uidotdev/usehooks";
import { default as Player } from "@vimeo/player";
import { X, Plus } from "@phosphor-icons/react";
import Seekbar from "./components/Seekbar.tsx";
import Controls from "./components/Controls.tsx";
import InfoPanel from "./components/InfoPanel.tsx";
import Menu from "./components/Menu.tsx";
import About from "./components/About.tsx";
import "./App.css";
import {
  store,
  playerAtom,
  playlistsAtom,
  currentPlaylistIndexAtom,
  readOnlyCurrentSelectionAtom,
  aboutPageAtom,
  isInfoPanelOpenAtom,
  isMenuOpenAtom,
  isAboutOpenAtom,
  videoSizeAtom,
  wrapperWidthAtom,
  windowWidthAtom,
  isMediaSmallAtom,
} from "./store.ts";
import { handlePlay, handleToggleMenu } from "./handlers.ts";

function VideoPlayer() {
  const [firstVideoSelection] = useAtom(readOnlyCurrentSelectionAtom);
  const [[width, height]] = useAtom(videoSizeAtom);

  const firstVideoUrl = !!firstVideoSelection.videoShowCasePayload.data
    ? firstVideoSelection.videoShowCasePayload.data[0].player_embed_url
    : firstVideoSelection.vimeoPlayerURL;

  return (
    <Suspense fallback={<div>loading...</div>}>
      <div className="relative cursor-pointer" onClick={handlePlay}>
        <div
          id="vimeo-player"
          className={`relative overflow-hidden w-[100%]`}
          style={{
            paddingTop: !!width ? `${(height / width) * 100}%` : "41.67%",
          }}
          data-vimeo-url={firstVideoUrl}
          data-vimeo-background="1"
          data-vimeo-allow="autoplay"
          data-vimeo-muted="1"
        ></div>
      </div>
    </Suspense>
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
          ? "text-[3rem] top-[0.25em] left-[0.35em]"
          : "text-[5.5vw] top-[0.35em] left-[0.5em]"
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
  const iconClass = isMediaSmall ? "text-[2rem]" : "text-[35px]";

  let plusColor = "black";

  if (!isMenuOpen && !isAboutOpen && titleColor) {
    plusColor = titleColor.toLowerCase();
  }

  return (
    <>
      <div
        role="button"
        className={`absolute ${isInfoPanelOpen ? "hidden" : "z-40"} ${
          isMediaSmall ? "top-3 right-3" : "top-8 right-8"
        }`}
        onClick={handleToggleMenu}
      >
        {isMenuOpen ? (
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
        className="relative"
        style={{
          width: `${wrapperWidth}px`,
          left: positionLeft,
          height: "100%",
        }}
      >
        <VideoPlayer />
      </div>
      {isInfoPanelOpen && <InfoPanel />}
    </>
  );
}

function App() {
  useEffect(() => {
    const player = new Player("vimeo-player");
    store.set(playerAtom, player);
  }, []);

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
