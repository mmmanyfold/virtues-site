// handlers
// --------

import { PlaylistVideo } from "./types.ts";
import {
  isInfoPanelOpenAtom,
  isMenuOpenAtom,
  bindEventsToPlayer,
  chapterIndexAtom,
  chaptersAtom,
  isMutedAtom,
  isPlayingAtom,
  playerAtom,
  playlistsAtom,
  seekPositionAtom,
  store,
  currentVideoIndexAtom,
} from "./store.ts";

export const handleToggleInfoPanel = () => {
  const isOpen = store.get(isInfoPanelOpenAtom);
  store.set(isInfoPanelOpenAtom, !isOpen);
};

export const handleToggleMenu = () => {
  const isOpen = store.get(isMenuOpenAtom);
  store.set(isMenuOpenAtom, !isOpen);
};

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
  if (chapters.length === 0) {
    return;
  }

  const chapterIndex = store.get(chapterIndexAtom);
  if (chapterIndex === 0) {
    return;
  }

  const previousChapterIndex = (chapterIndex - 1) % chapters.length;
  const seekTo = chapters[previousChapterIndex];

  store.set(chapterIndexAtom, previousChapterIndex);
  store.set(seekPositionAtom, seekTo.startTime);
};

export const handleNextChapter = () => {
  const chapters = store.get(chaptersAtom);
  if (chapters.length === 0) {
    return;
  }

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
      store.set(seekPositionAtom, 0);
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

export const handleSetCurrentChapter = (index: number) => {
  const chapters = store.get(chaptersAtom);
  const newChapter = chapters[index];

  store.set(chapterIndexAtom, index);
  store.set(seekPositionAtom, newChapter.startTime);
};

export const handleSetCurrentVideo = async (videoId: string) => {
  const player = store.get(playerAtom);
  const playlists = await store.get(playlistsAtom);
  const newIndex = playlists?.rows?.findIndex(
    (row: PlaylistVideo) => row.vimeoId === videoId
  );

  store.set(seekPositionAtom, 0);
  store.set(currentVideoIndexAtom, newIndex);

  player
    .loadVideo(videoId)
    .then(() => {
      bindEventsToPlayer();
      player.play().catch(handleError);
    })
    .catch(handleError);
};

export const handleError = (error: Error) => {
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
