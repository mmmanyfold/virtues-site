import "react";
import "./App.css";
import { Provider, useAtom } from "jotai";
import { default as Player } from "@vimeo/player";
import { SetStateAction, useEffect, Suspense } from "react";
import { Seekbar as Seek } from "react-seekbar";
import {
  store,
  playerAtom,
  isPlayingAtom,
  seekPositionAtom,
  isMutedAtom,
  durationAtom,
  // currentChapterAtom,
  playlistsAtom,
  currentVideoIdAtom,
  // currentVideoIndexAtom,
  readOnlyCurrentSelectionAtom,
  isFullscreenAtom,
  aboutPageAtom,
  isInfoPanelOpenAtom,
} from "./store.ts";
import { Block, PlaylistVideo } from "./types.ts";
import {
  handleFullscreen,
  handleMute,
  handleNextChapter,
  handlePlay,
  handlePreviousChapter,
  handleRandomChapter,
  handleRestartPlayback,
  handleOpenInfoPanel
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
      <div className="controls">
        <button onClick={handleOpenInfoPanel}>info</button>
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

// function Stats() {
//   const [chapterIndex] = useAtom(currentChapterAtom);
//   const [currentVideoSelection] = useAtom(currentVideoIndexAtom);
//   const [seekPosition] = useAtom(seekPositionAtom);
//   return (
//     <div>
//       <p className="text-2xl">
//         <u>stats</u>
//       </p>
//       <pre>chapterIndex: {chapterIndex?.index || 0}</pre>
//       <pre>currentVideoSelection: {currentVideoSelection}</pre>
//       <pre>seekPosition: {seekPosition}</pre>
//     </div>
//   );
// }

function PlaylistPicker() {
  const [firstVideoSelection] = useAtom(readOnlyCurrentSelectionAtom);

  return (
    <Suspense fallback={<div>loading...</div>}>
      <div>
        <div
          id="vimeo-player"
          className="iframe-wrapper"
          // TODO: uncomment this
          // data-vimeo-autoplay="true"
          data-vimeo-portrait="false"
          data-vimeo-title="false"
          data-vimeo-url={`https://player.vimeo.com/video/${firstVideoSelection}?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479`}
        ></div>
      </div>
    </Suspense>
  );
}

function InfoPanel() {
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);
  const [playlists] = useAtom(playlistsAtom);
  const [currentVideoId] = useAtom(currentVideoIdAtom);

  const currentVideo = playlists.rows.find((video: PlaylistVideo) => video.vimeoId === currentVideoId);
  const { videoTitle, vimeoChapters } = currentVideo;
  const chapterIds = Object.keys(vimeoChapters).sort();

  if (!isInfoPanelOpen) {
    return null;
  }
  
  return (
    <div className="info-panel absolute bottom-0 bg-white">
      <h2>{videoTitle}</h2>
      {chapterIds.map(id => {
        return (
          <div key={id}>
            {vimeoChapters[id]}
          </div>
        )
      })}
    </div>
  )
}

function VideoPlayer() {
  useEffect(() => {
    const player = new Player("vimeo-player");
    store.set(playerAtom, player);
  }, []);

function Title() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentVideoId] = useAtom(currentVideoIdAtom);

  const currentVideo = playlists.rows.find((video: PlaylistVideo) => video.vimeoId === currentVideoId);
  const { titleColor } = currentVideo;

  return <h1 className="title" style={{color: titleColor ? titleColor.toLowerCase() : "black"}}>Virtues</h1>
}

  return (
    <div className="video-player-wrapper">
      <Provider store={store}>
        <Title />
        <div className="relative">
          <PlaylistPicker />
          <InfoPanel />
        </div>
        <Controls />
        {/* <Stats /> */}
      </Provider>
    </div>
  );
}

function App() {
  const [aboutPage] = useAtom(aboutPageAtom);
  return (
    <>
      <VideoPlayer />
      <p>{JSON.stringify(aboutPage.blocks.map((block: Block) => block.id))}</p>
    </>
  );
}

export default App;
