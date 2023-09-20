import { atom, createStore } from "jotai";
import { default as Player } from "@vimeo/player";
// stores
// -----
export const store = createStore();

// atoms
// -----

export const playerAtom = atom(Object.create(null));
export const isPlayingAtom = atom(false);
export const isMutedAtom = atom(false);
export const isFullscreen = atom(false);
export const seekableAtom = atom<Player.VimeoTimeRange[]>([]);
export const seekPositionAtom = atom<number>(0);
export const durationAtom = atom<number>(0);
export const chaptersAtom = atom<Player.VimeoChapter[]>([]);
export const chapterIndexAtom = atom<number>(0);
export const currentChapterAtom = atom<Player.VimeoChapter | null>(null);

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

  player
    .getDuration()
    .then((duration: number) => {
      store.set(durationAtom, duration);
    })
    .catch(handleError);

  player
    .getChapters()
    .then((chapters: Player.VimeoChapter[]) => {
      store.set(chaptersAtom, chapters);
    })
    .catch(handleError);

  player
    .getSeekable()
    .then((seekable: Player.VimeoTimeRange[]) => {
      store.set(seekableAtom, seekable);
    })
    .catch(handleError);

  // register event listeners
  player.on("play", () => {
    store.set(isPlayingAtom, true);
  });

  player.on("pause", () => {
    store.set(isPlayingAtom, false);
  });

  player.on("chapterchange", (chapter: Player.VimeoChapter) => {
    store.set(currentChapterAtom, chapter);
  });
});

store.sub(seekPositionAtom, () => {
  // assuming there is only 1 player url in the store, get the seekable time ranges for a video
  const seekPosition = store.get(seekPositionAtom);
  const playing = store.get(isPlayingAtom);
  const player = store.get(playerAtom);

  player
    .setCurrentTime(seekPosition)
    // .then((seconds: number) => {
    // seconds = the actual time that the player seeked to
    // console.table({
    //   actualSeek: seconds,
    //   seekRequested: seekPosition,
    //   drift: seconds - seekPosition,
    // });
    // })
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

export const handlePlay = () => {
  store.set(isPlayingAtom, !store.get(isPlayingAtom));
};

export const handleFullscreen = () => {
  const player = store.get(playerAtom);
  player.requestFullscreen().catch(handleError);
};

export const handlePreviousChapter = () => {
  const chapters = store.get(chaptersAtom);
  const chapterIndex = store.get(chapterIndexAtom);
  if (chapterIndex === 0) {
    return;
  }

  const newChapterIndex = chapterIndex - (1 % chapters.length);
  const seekTo = chapters[newChapterIndex];

  store.set(chapterIndexAtom, newChapterIndex);
  store.set(seekPositionAtom, seekTo.startTime);
};

export const handleNextChapter = () => {
  const chapters = store.get(chaptersAtom);
  const chapterIndex = store.get(chapterIndexAtom);
  const newChapterIndex = (chapterIndex + 1) % chapters.length;
  const seekTo = chapters[newChapterIndex];

  store.set(chapterIndexAtom, newChapterIndex);
  store.set(seekPositionAtom, seekTo.startTime);
};

export const handleRestartPlayback = () => {
  const player = store.get(playerAtom);

  player
    .setCurrentTime(0)
    .then(() => {
      player.play().catch(handleError);
      store.set(seekPositionAtom, 1);
    })
    .catch(handleError);
};

export const handleRandomChapter = () => {
  const chapters = store.get(chaptersAtom);
  const currentChapterIndex = store.get(chapterIndexAtom);
  const randomChapterIndex = Math.floor(Math.random() * chapters.length);
  const randomChapter = chapters[randomChapterIndex];
  if (currentChapterIndex === randomChapterIndex) {
    handleRandomChapter();
  }

  store.set(chapterIndexAtom, randomChapterIndex);
  store.set(seekPositionAtom, randomChapter.startTime);
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
