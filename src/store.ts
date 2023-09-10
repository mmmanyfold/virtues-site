import { atom, createStore } from "jotai";

// stores
// -----
export const store = createStore();

// atoms
// -----

export const playerAtom = atom(Object.create(null));
export const isPlayingAtom = atom(false);
export const isMutedAtom = atom(false);
export const seekableAtom = atom([0, 1483.3815]);
export const seekPositionAtom = atom(0);

// subscriptions
// -------------
store.sub(isPlayingAtom, () => {
  const player = store.get(playerAtom);
  if (store.get(isPlayingAtom)) {
    player.play().catch(handleError);
  } else {
    player.pause().catch(handleError);
  }
});
store.sub(playerAtom, () => {
  // assuming there is only 1 player url in the store, get the seekable time ranges for a video
  const player = store.get(playerAtom);

  player.on("play", () => {
    store.set(isPlayingAtom, true);
  });
  player.on("pause", () => {
    store.set(isPlayingAtom, false);
  });
});

store.sub(seekPositionAtom, () => {
  // assuming there is only 1 player url in the store, get the seekable time ranges for a video
  const seekPosition = store.get(seekPositionAtom);
  const playing = store.get(isPlayingAtom);
  const player = store.get(playerAtom);

  player
    .setCurrentTime(seekPosition)
    .then((seconds: number) => {
      // seconds = the actual time that the player seeked to
      console.table({
        actualSeek: seconds,
        seekRequested: seekPosition,
        drift: seconds - seekPosition,
      });
    })
    .catch(handleError);

  // begin playing at seek position
  if (!playing) {
    store.set(isPlayingAtom, true);
  }
});

// handlers
// --------

export const handleMute = () => {
  const player = store.get(playerAtom);
  const isMuted = store.get(isMutedAtom);
  store.set(isMutedAtom, !isMuted);
  player.setMuted(!isMuted).catch(handleError);
};

const handleError = (error: any) => {
  console.error(error);
  switch (error.name) {
    case "RangeError":
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
