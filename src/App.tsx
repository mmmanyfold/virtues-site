import "react";
import "./App.css";
import { Provider, useAtom } from "jotai";
import { default as Player } from "@vimeo/player";
import { SetStateAction, useEffect, useRef } from "react";
import { Seekbar as Seek } from "react-seekbar";
import {
  store,
  playerAtom,
  isPlayingAtom,
  seekPositionAtom,
  isMutedAtom,
  handleMute,
  handlePlay,
  handleFullscreen,
  durationAtom,
  handlePreviousChapter,
  handleNextChapter,
  handleRestartPlayback,
} from "./store.ts";

function Seekbar() {
  const [position, setSeekPosition] = useAtom(seekPositionAtom);
  const [duration] = useAtom(durationAtom);

  const handleSeek = (position: SetStateAction<number>) => {
    setSeekPosition(position);
  };

  return (
    <Seek
      position={position}
      duration={duration}
      onSeek={handleSeek}
      fullWidth
    />
  );
}

function Controls() {
  const [isPlaying] = useAtom(isPlayingAtom);
  const [isMuted] = useAtom(isMutedAtom);
  const [isFullscreen] = useAtom(isMutedAtom);

  return (
    <div>
      <Seekbar />
      <button onClick={() => handlePreviousChapter()}>prev chapter</button>
      <button onClick={handlePlay}>{isPlaying ? "Pause" : "Play"}</button>
      <button onClick={handleMute}>{isMuted ? "Unmute" : "Mute"}</button>
      <button onClick={handleFullscreen}>
        {isFullscreen ? "un-fullscreen" : "fullscreen"}
      </button>
      <button onClick={handleRestartPlayback}>restart</button>
      <button onClick={() => handleNextChapter()}>next chapter</button>
    </div>
  );
}

function VideoPlayer() {
  const playerRef = useRef(null);
  useEffect(() => {
    const player = new Player("vimeo-player");
    store.set(playerAtom, player);
  }, []);

  return (
    <div className="video-player-wrapper">
      <p>video player wrapper</p>
      <Provider store={store}>
        <div
          ref={playerRef}
          id="vimeo-player"
          data-videmo-autoplay="true"
          data-videmo-portrait="false"
          data-videmo-title="false"
          data-videmo-width={640}
          data-vimeo-url="https://player.vimeo.com/video/653237500?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        ></div>
        <Controls />
      </Provider>
    </div>
  );
}

function App() {
  return (
    <>
      <h1>Virtues</h1>
      <VideoPlayer />
    </>
  );
}

export default App;
