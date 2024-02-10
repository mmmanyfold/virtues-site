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
  seekingPositionAtom,
  store,
  currentPlaylistIndexAtom,
  isAboutOpenAtom,
  showcaseItemIndexAtom,
} from "./store.ts";

export const handleToggleInfoPanel = () => {
  const isOpen = store.get(isInfoPanelOpenAtom);
  store.set(isInfoPanelOpenAtom, !isOpen);
};

export const handleToggleMenu = () => {
  const isOpen = store.get(isMenuOpenAtom);
  store.set(isMenuOpenAtom, !isOpen);
  store.set(isInfoPanelOpenAtom, false);
};

export const handleOpenAbout = () => {
  const player = store.get(playerAtom);

  store.set(isAboutOpenAtom, true);
  store.set(isMenuOpenAtom, false);
  player.pause().catch(handleError);
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
  store.set(seekingPositionAtom, seekTo.startTime);
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
  store.set(seekingPositionAtom, seekTo.startTime);
};

export const handleRestartPlayback = () => {
  const player = store.get(playerAtom);

  player
    .setCurrentTime(0)
    .then(() => {
      player.play().catch(handleError);
      store.set(seekingPositionAtom, 0);
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
  store.set(seekingPositionAtom, randomChapter.startTime);
};

export const handleSetCurrentChapter = (index: number) => {
  const chapters = store.get(chaptersAtom);
  const newChapter = chapters[index];

  store.set(chapterIndexAtom, index);
  store.set(seekingPositionAtom, newChapter.startTime);
};

export const handleSetCurrentPlaylist = async (newIndex: number) => {
  const player = store.get(playerAtom);
  const playlists = await store.get(playlistsAtom);
  const { vimeoPlayerURL, videoShowCasePayload } = playlists[newIndex];
  const videoUrl = !!videoShowCasePayload.data
    ? videoShowCasePayload.data[0].player_embed_url
    : vimeoPlayerURL;

  store.set(seekingPositionAtom, 0);
  store.set(currentPlaylistIndexAtom, newIndex);
  store.set(isMenuOpenAtom, false);
  store.set(isAboutOpenAtom, false);

  player
    .loadVideo(videoUrl)
    .then(() => {
      bindEventsToPlayer();
      player.play().catch(handleError);
    })
    .catch(handleError);
};

export const handleSetCurrentShowcaseItem = async (index: number) => {
  const player = store.get(playerAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const playlists = await store.get(playlistsAtom);
  const newVideo =
    playlists[currentPlaylistIndex].videoShowCasePayload.data[index];

  store.set(seekingPositionAtom, 0);
  store.set(showcaseItemIndexAtom, index);
  store.set(isMenuOpenAtom, false);
  store.set(isAboutOpenAtom, false);

  player
    .loadVideo(newVideo.player_embed_url)
    .then(() => {
      bindEventsToPlayer();
      player.play().catch(handleError);
    })
    .catch(handleError);
};

export const handlePlaylistJump = async () => {
  const player = store.get(playerAtom);
  const playlist = await store.get(playlistsAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const randomChapterIndex = Math.floor(Math.random() * playlist.length);
  const nextPlaylist = playlist[randomChapterIndex];

  if (currentPlaylistIndex === randomChapterIndex) {
    await handlePlaylistJump();
    return;
  }

  store.set(seekingPositionAtom, 0);
  store.set(currentPlaylistIndexAtom, randomChapterIndex);
  store.set(isMenuOpenAtom, false);
  store.set(isAboutOpenAtom, false);

  player
    .loadVideo(nextPlaylist.vimeoPlayerURL)
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
