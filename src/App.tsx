import { SetStateAction, useEffect, Suspense } from "react";
import { Provider, useAtom } from "jotai";
import { useWindowSize } from "@uidotdev/usehooks";
import { default as Player } from "@vimeo/player";
import { Seekbar as Seek } from "react-seekbar";
import { X, Plus } from "@phosphor-icons/react";
import { RichTextCollection } from "./components/Notion.tsx";
import Menu from "./components/Menu.tsx";
import About from "./components/About.tsx";
import "./App.css";
import {
  store,
  playerAtom,
  isPlayingAtom,
  seekingPositionAtom,
  isMutedAtom,
  durationAtom,
  currentChapterAtom,
  playlistsAtom,
  currentVideoIndexAtom,
  readOnlyCurrentSelectionAtom,
  isFullscreenAtom,
  aboutPageAtom,
  isInfoPanelOpenAtom,
  isMenuOpenAtom,
  isAboutOpenAtom,
  videoSizeAtom,
  wrapperWidthAtom,
  isMediaSmallAtom,
  timeInSecondsUpdateAtom,
} from "./store.ts";
import {
  handleFullscreen,
  handleMute,
  handleNextChapter,
  handlePlay,
  handlePlaylistJump,
  handlePreviousChapter,
  handleRandomChapter,
  handleRestartPlayback,
  handleSetCurrentChapter,
  handleToggleInfoPanel,
  handleToggleMenu,
} from "./handlers.ts";

function Seekbar() {
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

function Controls() {
  const [isPlaying] = useAtom(isPlayingAtom);
  const [isMuted] = useAtom(isMutedAtom);
  const [isFullscreen] = useAtom(isFullscreenAtom);

  return (
    <div className="flex items-center justify-around bg-[#fdfcfa] py-4">
      <button onClick={handleToggleInfoPanel}>i</button>
      <button onClick={handlePreviousChapter}>prev</button>
      <button onClick={handlePlay}>{isPlaying ? "||" : "|>"}</button>
      <button onClick={handleMute}>{isMuted ? "unmu" : "mu"}</button>
      <button onClick={handleFullscreen}>
        {isFullscreen ? "shrink" : "full"}
      </button>
      <button onClick={handleRestartPlayback}>re</button>
      <button onClick={handleRandomChapter}>rand</button>
      <button onClick={handleNextChapter}>next</button>
      <button onClick={handlePlaylistJump}>j</button>
    </div>
  );
}

function VideoPlayer() {
  const [firstVideoSelection] = useAtom(readOnlyCurrentSelectionAtom);
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);
  const [[width, height]] = useAtom(videoSizeAtom);

  return (
    <Suspense fallback={<div>loading...</div>}>
      <div className="relative cursor-pointer" onClick={handlePlay}>
        <div
          id="vimeo-player"
          className="relative overflow-hidden w-[100%] pointer-events-none"
          style={{
            paddingTop: !!width ? `${(height / width) * 100}%` : "41.67%",
          }}
          data-vimeo-url={firstVideoSelection}
        ></div>
        {isInfoPanelOpen && <InfoPanel />}
      </div>
    </Suspense>
  );
}

function InfoPanel() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentVideoIndex] = useAtom(currentVideoIndexAtom);
  const [currentChapter] = useAtom(currentChapterAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);

  const currentVideo = playlists[currentVideoIndex];
  const { videoTitle, vimeoChapters } = currentVideo;
  const chapterIds = Object.keys(vimeoChapters).sort();

  return (
    <div className={`info-panel w-[433px] max-w-[100%] absolute top-0 z-10 bg-white overflow-y-scroll ${isMediaSmall ? "p-4" : "px-8 pt-10 pb-5"}`}>
      <h2 className="italic text-2xl tracking-wide mb-2">{videoTitle}</h2>
      <div className="divide-y divide-[#a9a9a9] text-sm">
        {chapterIds.map((id) => {
          const chapterNumber = parseInt(id);
          const isCurrentChapter = currentChapter
            ? currentChapter?.index === chapterNumber
            : chapterNumber === 1;
          return (
            <div
              key={id}
              role="button"
              className="flex gap-x-4 py-6"
              style={{ color: isCurrentChapter ? "black" : "#908f8f" }}
              onClick={() => handleSetCurrentChapter(chapterNumber - 1)}
            >
              <div className="italic">#{chapterNumber}</div>
              <div>
                <RichTextCollection objects={vimeoChapters[id]} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Title() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentVideoIndex] = useAtom(currentVideoIndexAtom);
  const [isMenuOpen] = useAtom(isMenuOpenAtom);
  const [isAboutOpen] = useAtom(isAboutOpenAtom);
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  
  const { titleColor } = playlists[currentVideoIndex];

  let color = "black";

  if (!isMenuOpen && !isAboutOpen && titleColor) {
    color = titleColor.toLowerCase();
  }

  return (
    <h1
      className={`title absolute ${isInfoPanelOpen ? "z-10" : "z-40"} ${isMediaSmall ? "text-[8vw] top-[0.25em] left-[0.35em]" : "text-[5.5vw] top-[0.35em] left-[0.5em]"}`}
      style={{ color }}
    >
      VIRTUES
    </h1>
  );
}

function MenuToggle() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentVideoIndex] = useAtom(currentVideoIndexAtom);
  const [isMenuOpen] = useAtom(isMenuOpenAtom);
  const [isAboutOpen] = useAtom(isAboutOpenAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [aboutPage] = useAtom(aboutPageAtom);

  const { titleColor } = playlists[currentVideoIndex];
  const iconClass = isMediaSmall ? "text-2xl" : "text-[35px]";
  
  let plusColor = "black";

  if (!isMenuOpen && !isAboutOpen && titleColor) {
    plusColor = titleColor.toLowerCase();
  }

  return (
    <>
      <div
        role="button"
        className={`absolute z-40 ${isMediaSmall ? "top-3 right-3" : "top-8 right-8"}`}
        onClick={handleToggleMenu}
      >
        {isMenuOpen ? (
          <X className={iconClass} weight="bold" />
        ) : (
          <Plus className={iconClass} weight="bold" color={plusColor} />
        )}
      </div>

      {isMenuOpen && <Menu />}
      {isAboutOpen && <About blocks={aboutPage?.blocks} />}
    </>
  );
}

function getWrapperWidth({videoWidth, videoHeight, windowWidth, windowHeight}: any) {
  const controlsHeight = 69;
  const windowHeightWithoutControls = windowHeight - controlsHeight;
  const windowAspectRatio = windowWidth / windowHeightWithoutControls;
  const videoAspectRatio = videoWidth / videoHeight;

  let width = windowWidth;

  if (windowAspectRatio >= videoAspectRatio && videoHeight > windowHeightWithoutControls) {
    width = (windowHeight - 69) * videoAspectRatio;
  }

  return width;
}

function Wrapper({ children }: React.PropsWithChildren) {
  const windowSize = useWindowSize();
  const [videoSize] = useAtom(videoSizeAtom);
  const [wrapperWidth] = useAtom(wrapperWidthAtom);

  useEffect(() => {
    const width = getWrapperWidth({
      videoWidth: videoSize[0], 
      videoHeight: videoSize[1], 
      windowWidth: windowSize.width || 1, 
      windowHeight: windowSize.height || 1
    });
    store.set(wrapperWidthAtom, width);
  }, [windowSize, videoSize])

  return (
    <div className="relative" style={{ width: `${wrapperWidth}px`, margin: "0 auto" }}>
      {children}
    </div>
  );
}

function App() {
  useEffect(() => {
    const player = new Player("vimeo-player");
    store.set(playerAtom, player);
  }, []);

  return (
    <Provider store={store}>
      <Wrapper>
        <Title />
        <MenuToggle />
        <VideoPlayer />
        <Seekbar />
        <Controls />
      </Wrapper>
    </Provider>
  );
}

export default App;
