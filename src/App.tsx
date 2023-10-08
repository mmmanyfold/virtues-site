import { SetStateAction, useEffect, Suspense } from "react";
import "./App.css";
import { Provider, useAtom } from "jotai";
import { default as Player } from "@vimeo/player";
import { Seekbar as Seek } from "react-seekbar";
import { X, Plus } from "@phosphor-icons/react";
import { RichTextCollection } from "./components/Notion.tsx";
import Menu from "./components/Menu.tsx";
import {
  store,
  playerAtom,
  isPlayingAtom,
  seekPositionAtom,
  isMutedAtom,
  durationAtom,
  currentChapterAtom,
  playlistsAtom,
  currentVideoIndexAtom,
  readOnlyCurrentSelectionAtom,
  isFullscreenAtom,
  // aboutPageAtom,
  isInfoPanelOpenAtom,
  isMenuOpenAtom,
} from "./store.ts";
import {
  createVimeoPlayerUrl,
  handleFullscreen,
  handleMute,
  handleNextChapter,
  handlePlay,
  handlePreviousChapter,
  handleRandomChapter,
  handleRestartPlayback,
  handleSetCurrentChapter,
  handleToggleInfoPanel,
  handleToggleMenu,
} from "./handlers.ts";

function Seekbar() {
  const [position, setSeekPosition] = useAtom(seekPositionAtom);
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
    <div>
      <Seekbar />
      <div className="flex items-center justify-around bg-[#fdfcfa] py-4">
        <button onClick={handleToggleInfoPanel}>info</button>
        <button onClick={handlePreviousChapter}>prev chapter</button>
        <button onClick={handlePlay}>{isPlaying ? "Pause" : "Play"}</button>
        <button onClick={handleMute}>{isMuted ? "Unmute" : "Mute"}</button>
        <button onClick={handleFullscreen}>
          {isFullscreen ? "un-fullscreen" : "fullscreen"}
        </button>
        <button onClick={handleRestartPlayback}>restart</button>
        <button onClick={handleRandomChapter}>random chapter</button>
        <button onClick={handleNextChapter}>next chapter</button>
      </div>
    </div>
  );
}

function VideoPlayer() {
  const [firstVideoSelection] = useAtom(readOnlyCurrentSelectionAtom);
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);

  return (
    <Suspense fallback={<div>loading...</div>}>
      <div className="relative">
        <div
          id="vimeo-player"
          className="iframe-wrapper"
          // TODO: uncomment this
          // data-vimeo-autoplay="true"
          data-vimeo-portrait="false"
          data-vimeo-title="false"
          data-vimeo-url={createVimeoPlayerUrl(firstVideoSelection)}
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

  const currentVideo = playlists?.rows[currentVideoIndex];

  const { videoTitle, vimeoChapters } = currentVideo;
  const chapterIds = Object.keys(vimeoChapters).sort();

  return (
    <div className="info-panel w-[433px] absolute top-0 z-10 bg-white overflow-y-scroll px-8 pt-10 pb-5">
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

  const currentVideo = playlists?.rows[currentVideoIndex];

  const { titleColor } = currentVideo;
  let color = "black";

  if (!isMenuOpen && titleColor) {
    color = titleColor.toLowerCase();
  }

  return (
    <h1 className={`title ${isMenuOpen ? "z-30" : "z-10"}`} style={{ color }}>
      Virtues
    </h1>
  );
}

function MenuToggle() {
  const [isMenuOpen] = useAtom(isMenuOpenAtom);
  return (
    <>
      <div
        role="button"
        className="absolute top-8 right-8 z-30"
        onClick={handleToggleMenu}
      >
        {isMenuOpen ? (
          <X size={35} weight="bold" />
        ) : (
          <Plus size={35} weight="bold" />
        )}
      </div>

      {isMenuOpen && <Menu />}
    </>
  );
}

function App() {
  useEffect(() => {
    const player = new Player("vimeo-player");
    store.set(playerAtom, player);
  }, []);

  return (
    <div className="video-player-wrapper">
      <Provider store={store}>
        <Title />
        <MenuToggle />
        <VideoPlayer />
        <Controls />
      </Provider>
    </div>
  );
}

export default App;
