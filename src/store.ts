import { atom, createStore } from "jotai";

// stores
// -----
export const store = createStore();

// atoms
// -----

export const playerAtom = atom(Object.create(null));
export const playingAtom = atom(false);
export const seekableAtom = atom([0, 1483.3815]);
export const seekPositionAtom = atom(0);

// subscriptions
// -------------
store.sub(playingAtom, () => {
  const player = store.get(playerAtom);
  if (store.get(playingAtom)) {
    player.play().catch(handleError);
  } else {
    player.pause().catch(handleError);
  }
});
store.sub(playerAtom, () => {
  // assuming there is only 1 player url in the store, get the seekable time ranges for a video
  console.log("___player ref has been set___");
  const player = store.get(playerAtom);
  // TODO: maybe look into setting seekable
  // player.getSeekable().then((seekable: Player.VimeoTimeRange[]) => {
  //   console.log({ seekable });
  //   store.set(seekableAtom, seekable);
  // });
  player.on("play", () => {
    store.set(playingAtom, true);
    console.log(store.get(seekableAtom));
  });
  player.on("pause", () => {
    store.set(playingAtom, false);
  });
});

store.sub(seekPositionAtom, () => {
  console.log("__seeking__");
  // assuming there is only 1 player url in the store, get the seekable time ranges for a video
  const seekPosition = store.get(seekPositionAtom);
  const player = store.get(playerAtom);

  player
    .setCurrentTime(seekPosition)
    .then((seconds: number) => {
      // TODO: maybe use seconds to verify seek position
      // seconds = the actual time that the player seeked to
      console.table({
        seconds,
        seekPosition: seekPosition,
        drift: seconds - seekPosition,
      });
      // console.log(seconds != seekPosition);
    })
    .catch(handleError);
});

// handlers
// --------

const handleError = (error: any) => {
  console.error(error);
  switch (error.name) {
    case "RangeError":
      alert("got RangeError");
      break;
    case "PasswordError":
      // the video is password-protected and the viewer needs to enter the
      // password first
      break;

    case "PrivacyError":
      // the video is private
      break;

    default:
      // some other error occurred
      break;
  }
};
