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
} from "./store.ts";

function Seekbar() {
  const [position, setSeekPosition] = useAtom(seekPositionAtom);

  const handleSeek = (position: SetStateAction<number>) => {
    setSeekPosition(position);
  };

  return (
    <Seek
      position={position}
      duration={1483.3815}
      onSeek={handleSeek}
      fullWidth
    />
  );
}

function Controls() {
  const [playing] = useAtom(isPlayingAtom);
  const [muted] = useAtom(isMutedAtom);

  return (
    <div>
      <Seekbar />
      <button
        onClick={() => store.set(isPlayingAtom, !store.get(isPlayingAtom))}
      >
        {playing ? "Pause" : "Play"}
      </button>
      <button onClick={handleMute}>{muted ? "Unmute" : "Mute"}</button>
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
          data-vimeo-url="https://player.vimeo.com/video/795682177?h=015d115cec&background=1"
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
