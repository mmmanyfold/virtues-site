import "react";
import "./App.css";
import { default as Player } from "@vimeo/player";
import { useEffect } from "react";

function Controls() {
  return null;
}

function VideoPlayer() {
  useEffect(() => {
    const player = new Player("vimeo-player");

    player.on("play", function () {
      console.log("played the video!");
    });
  }, []);

  return (
    <div className="video-player-wrapper">
      <p>video player wrapper</p>
      <div
        id="vimeo-player"
        data-videmo-autoplay="true"
        data-videmo-portrait="false"
        data-videmo-title="false"
        data-videmo-width={640}
        data-vimeo-url="https://player.vimeo.com/video/795682177?h=015d115cec&background=1"
      ></div>
    </div>
  );
}

function App() {
  return (
    <>
      <h1>Virtues</h1>
      <VideoPlayer />
      <Controls />
    </>
  );
}

export default App;
