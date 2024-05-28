import { atom, createStore } from "jotai";
import { default as Player } from "@vimeo/player";
import { handleError } from "./handlers.ts";
import { TimeUpdate } from "./types.ts";

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
export const seekingPositionAtom = atom<number>(0);
export const durationAtom = atom<number>(0);
export const isSeekLoadingAtom = atom(false);

// chapter-based control
export const chaptersAtom = atom<Player.VimeoChapter[]>([]);
export const chapterIndexAtom = atom<number>(0);
export const currentChapterAtom = atom<Player.VimeoChapter | null>(null);

// showcase-based control
export const showcaseItemIndexAtom = atom<number>(0);

export const playlistsAtom = atom(async (_get, { signal }) => {
  const response = await fetch(
    `https://rami-notion-api.fly.dev/public/virtues-videos.json`,
    { signal },
  );
  const { rows } = await response.json();
  return rows;
});

export const aboutPageAtom = atom(async (_get, { signal }) => {
  const response = await fetch(
    `https://rami-notion-api.fly.dev/public/virtues-about.json`,
    { signal },
  );

  return await response.json();
});

export const currentPlaylistIndexAtom = atom<number>(0);

export const readOnlyCurrentSelectionAtom = atom(async (get) => {
  const [first] = await get(playlistsAtom);
  return first;
});

export const isInfoPanelOpenAtom = atom<boolean>(false);
export const isMenuOpenAtom = atom<boolean>(false);
export const isAboutOpenAtom = atom<boolean>(false);

export const videoSizeAtom = atom<[number, number]>([0, 0]);
export const wrapperWidthAtom = atom<number>(0);
export const windowWidthAtom = atom<number>(0);
export const isMediaSmallAtom = atom<boolean>(true);

export const externalLinksPageAtom = atom(async (_get, { signal }) => {
  const response = await fetch(
    `https://rami-notion-api.fly.dev/public/virtues-external-links.json`,
    { signal },
  );

  return await response.json();
});

// subscriptions
// -------------

store.sub(currentPlaylistIndexAtom, async () => {
  const player = store.get(playerAtom);
  const newIndex = store.get(currentPlaylistIndexAtom);
  const playlists = await store.get(playlistsAtom);

  const { vimeoPlayerURL, videoShowCasePayload } = playlists[newIndex];
  const videoUrl = !!videoShowCasePayload.data
    ? videoShowCasePayload.data[0].player_embed_url
    : vimeoPlayerURL;

  player
    .loadVideo(videoUrl)
    .then(() => {
      bindEventsToPlayer();
      store.set(seekingPositionAtom, 0);
    })
    .catch(handleError);
})

store.sub(windowWidthAtom, () => {
  const windowWidth = store.get(windowWidthAtom);
  store.set(isMediaSmallAtom, windowWidth < 890);
});

store.sub(playerAtom, () => {
  bindEventsToPlayer();
  const player = store.get(playerAtom);
  player.setMuted(true)
    .then(() => {
      player.play().catch(handleError);
      store.set(isMutedAtom, true);
    })
    .catch(handleError);
});

export const bindEventsToPlayer = () => {
  const player = store.get(playerAtom);
  const isMuted = store.get(isMutedAtom);
  const isPlaying = store.get(isPlayingAtom);

  player.setMuted(isMuted).catch(handleError);

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

  Promise.all([player.getVideoWidth(), player.getVideoHeight()])
    .then((dimensions) => {
      store.set(videoSizeAtom, dimensions);
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

  player.on("timeupdate", (timeupdate: TimeUpdate) => {
    store.set(seekingPositionAtom, Math.trunc(timeupdate.seconds));
  });

  player.on("fullscreenchange", ({ fullscreen }: any) => {
    store.set(isFullscreenAtom, fullscreen);
    if (isPlaying) {
      player.play().catch(handleError);
    }
  });
};
