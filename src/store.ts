import { atom, createStore } from "jotai";
import { default as Player } from "@vimeo/player";
import { handleError } from "./handlers.ts";

// stores
// -----
export const store = createStore();

// atoms
// -----

export const playerAtom = atom(Object.create(null));
export const isPlayingAtom = atom(false);
export const isMutedAtom = atom(false);
export const isFullscreenAtom = atom(false);
export const seekableTimesAtom = atom<Player.VimeoTimeRange[]>([]);
export const seekPositionAtom = atom<number>(0);
export const durationAtom = atom<number>(0);
export const chaptersAtom = atom<Player.VimeoChapter[]>([]);
export const chapterIndexAtom = atom<number>(0);
export const currentChapterAtom = atom<Player.VimeoChapter | null>(null);
export const playlistsAtom = atom(async (_get, { signal }) => {
  const response = await fetch(
    `https://rami-notion-api.fly.dev/public/virtues-videos.json`,
    { signal }
  );

  return await response.json();
});

export const aboutPageAtom = atom(async (_get, { signal }) => {
  const response = await fetch(
    `https://rami-notion-api.fly.dev/public/virtues-about.json`,
    { signal }
  );

  return await response.json();
});

export const currentVideoIndexAtom = atom<number>(0);

export const readOnlyCurrentSelectionAtom = atom(async (get) => {
  const playlist = await get(playlistsAtom);
  return playlist.rows[0].vimeoPlayerURL || "";
});

export const isInfoPanelOpenAtom = atom<boolean>(false);

export const isMenuOpenAtom = atom<boolean>(false);

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
  bindEventsToPlayer();
});

store.sub(seekPositionAtom, () => {
  const seekPosition = store.get(seekPositionAtom);
  const playing = store.get(isPlayingAtom);
  const player = store.get(playerAtom);

  player.setCurrentTime(seekPosition).catch(handleError);

  // begin playing at seek position
  if (!playing) {
    store.set(isPlayingAtom, true);
  }
});

export const bindEventsToPlayer = () => {
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
      store.set(seekableTimesAtom, seekable);
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
    store.set(chapterIndexAtom, chapter.index - 1);
  });
};
