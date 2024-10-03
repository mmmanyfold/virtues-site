import { atom, createStore } from "jotai";
import { Playlist, VimeoChapter, Video } from "./types";

export const getPlaylistVideo = (
  playlist: Playlist,
  showcaseIndex?: number
): Video => {
  if (playlist.videoShowCasePayload?.data?.length) {
    let index = showcaseIndex || 0;
    return playlist.videoShowCasePayload.data[index];
  }
  return playlist.vimeoPlaybackPayload;
};

export const getVideoLink = (video: Video) => {
  const files = video.files.sort((a, b) => b.width - a.width);
  return files[0].link;
};

// stores
// -----
export const store = createStore();

// atoms
// -----

// player
export const currentPlaylistIndexAtom = atom<number>(0);
export const durationAtom = atom<number>(0);
export const isFullscreenAtom = atom(false);
export const isMutedAtom = atom(true);
export const isPlayingAtom = atom(false);
export const isSeekLoadingAtom = atom(false);
export const isVideoLoadingAtom = atom(true);
export const playerRefAtom = atom(Object.create(null));
export const iosFullscreenPlayerRefAtom = atom(Object.create(null));
export const seekingPositionAtom = atom<number>(0);
export const videoSizeAtom = atom<[number, number]>([0, 0]);
export const windowWidthAtom = atom<number>(0);
export const displaySizeAtom = atom<{
  displayWidth: number;
  displayHeight: number;
  windowHeightWithoutControls: number;
}>({
  displayWidth: 0,
  displayHeight: 0,
  windowHeightWithoutControls: 0,
});

// controls
export const chaptersAtom = atom<VimeoChapter[]>([]);
export const chapterIndexAtom = atom<number>(0);
export const currentChapterAtom = atom<VimeoChapter | null>(null);
export const showcaseItemIndexAtom = atom<number>(0);

// menus
export const isAboutOpenAtom = atom<boolean>(false);
export const isInfoPanelOpenAtom = atom<boolean>(false);
export const isMediaSmallAtom = atom<boolean>(true);
export const isMenuOpenAtom = atom<boolean>(false);

// data
export const playlistsAtom = atom(async (_get, { signal }) => {
  const response = await fetch(
    `https://rami-notion-api.fly.dev/public/virtues-videos.json`,
    { signal }
  );
  const { rows } = await response.json();
  return rows;
});

export const aboutPageAtom = atom(async (_get, { signal }) => {
  const response = await fetch(
    `https://rami-notion-api.fly.dev/public/virtues-about.json`,
    { signal }
  );

  return await response.json();
});

export const externalLinksPageAtom = atom(async (_get, { signal }) => {
  const response = await fetch(
    `https://rami-notion-api.fly.dev/public/virtues-external-links.json`,
    { signal }
  );

  return await response.json();
});

export const setPlayerVideoData = (video: Video, chapters: VimeoChapter[]) => {
  store.set(chaptersAtom, chapters);
  store.set(durationAtom, video.duration);
  store.set(videoSizeAtom, [video.width, video.height]);
};

// subscriptions
// -------------

store.sub(currentPlaylistIndexAtom, async () => {
  store.set(isVideoLoadingAtom, true);
  store.set(seekingPositionAtom, 0);
  store.set(showcaseItemIndexAtom, 0);

  const player = store.get(playerRefAtom);
  const playlists = await store.get(playlistsAtom);
  const newIndex = store.get(currentPlaylistIndexAtom);
  const newPlaylist = playlists[newIndex];
  const video = getPlaylistVideo(newPlaylist);

  if (player && video.files.length) {
    const sourceElement = player.querySelector("source");
    if (sourceElement) {
      sourceElement.src = getVideoLink(video);
      setPlayerVideoData(video, newPlaylist.vimeoChaptersPayload.data);
      player.load();
    }
  }
});

store.sub(chapterIndexAtom, () => {
  const index = store.get(chapterIndexAtom);
  const chapters = store.get(chaptersAtom);
  const chapter = chapters[index];

  store.set(currentChapterAtom, { ...chapter, index });
  store.set(chapterIndexAtom, index);
});

store.sub(windowWidthAtom, () => {
  const windowWidth = store.get(windowWidthAtom);
  store.set(isMediaSmallAtom, windowWidth < 768);
});
