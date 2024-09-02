import { atom, createStore } from "jotai";
import {videos} from "./data.ts"

// stores
// -----
export const store = createStore();

// atoms
// -----

export const playerRefAtom = atom(Object.create(null))
export const isPlayingAtom = atom(false);
export const isMutedAtom = atom(true);
export const isFullscreenAtom = atom(false);
export const seekableTimesAtom = atom<[]>([]);
export const seekingPositionAtom = atom<number>(0);
export const durationAtom = atom<number>(0);
export const isSeekLoadingAtom = atom(false);
export const isVideoLoadingAtom = atom(true);

// chapter-based control
export const chaptersAtom = atom<[]>([]);
export const chapterIndexAtom = atom<number>(0);
export const currentChapterAtom = atom(null);

// showcase-based control
export const showcaseItemIndexAtom = atom<number>(0);

export const playlistsAtom = atom(videos)
// atom(async (_get, { signal }) => {
//   const response = await fetch(
//     `https://rami-notion-api.fly.dev/public/virtues-videos.json`,
//     { signal },
//   );
//   const { rows } = await response.json();
//   return rows;
// });

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
  store.set(isVideoLoadingAtom, true);
  store.set(seekingPositionAtom, 0);
  store.set(showcaseItemIndexAtom, 0);

  const player = store.get(playerRefAtom);
  const newIndex = store.get(currentPlaylistIndexAtom);
  const playlists = await store.get(playlistsAtom);

  const { videoSourceUrl, videoShowCasePayload } = playlists[newIndex];
  const videoUrl = !!videoShowCasePayload.data
    ? videoShowCasePayload.data[0].videoSourceUrl
    : videoSourceUrl;

  if (player) {
    const sourceElement = player.querySelector('source');
    if (sourceElement) {
      sourceElement.src = videoUrl;
      player.load();
    }
  }
});

store.sub(windowWidthAtom, () => {
  const windowWidth = store.get(windowWidthAtom);
  store.set(isMediaSmallAtom, windowWidth < 768);
});

// export const setPlayerVideoData = () => {
//   player
//     .getDuration()
//     .then((duration: number) => {
//       store.set(durationAtom, duration);
//     })

//   player
//     .getChapters()
//     .then((chapters: Player.VimeoChapter[]) => {
//       store.set(chaptersAtom, chapters);
//     })

//   player
//     .getSeekable()
//     .then((seekable: Player.VimeoTimeRange[]) => {
//       store.set(seekableTimesAtom, seekable);
//     })

//   Promise.all([player.getVideoWidth(), player.getVideoHeight()])
//     .then((dimensions) => {
//       store.set(videoSizeAtom, dimensions);
//     })
// }

// export const bindEventsToPlayer = () => {
//   player.on("chapterchange", (chapter: Player.VimeoChapter) => {
//     store.set(currentChapterAtom, chapter);
//     store.set(chapterIndexAtom, chapter.index - 1);
//   });
// };
