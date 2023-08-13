import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
// import default from @vimeo/player

import { default as Player } from "@vimeo/player";



function App() {
    const options = {
        id: 795682177,
        width: 640,
        loop: true
    };

    const player = new Player('playertwo', options);
    //
    // player.setVolume(0);
    //
    player.on('play', function() {
        console.log('played the video!');
    });
  return (
    <>
      <h1>!!!</h1>

      {/*<iframe*/}
      {/*  src="https://player.vimeo.com/video/76979871?h=8272103f6e"*/}
      {/*  width="640"*/}
      {/*  height="360"*/}
      {/*  frameBorder="0"*/}
      {/*  allowFullScreen*/}
      {/*  allow="autoplay; encrypted-media"*/}
      {/*></iframe>*/}
    </>
  );
}

export default App;
