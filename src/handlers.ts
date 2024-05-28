// handlers
// --------

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
  isSeekLoadingAtom,
} from "./store.ts";

export const handleToggleInfoPanel = () => {
  const isOpen = store.get(isInfoPanelOpenAtom);
  store.set(isInfoPanelOpenAtom, !isOpen);
};

export const handleToggleMenu = () => {
  const isOpen = store.get(isMenuOpenAtom);
  store.set(isMenuOpenAtom, !isOpen);
  store.set(isInfoPanelOpenAtom, false);
  store.set(isAboutOpenAtom, false);
};

export const handleOpenAbout = () => {
  store.set(isAboutOpenAtom, true);
  store.set(isMenuOpenAtom, false);
  store.set(isPlayingAtom, false);
};

export const handleMute = () => {
  const player = store.get(playerAtom);
  const isMuted = store.get(isMutedAtom);
  store.set(isMutedAtom, !isMuted);
  player.setMuted(!isMuted).catch(handleError);
};

export const handlePlay = () => {
  const player = store.get(playerAtom);
  player.play().catch(handleError);
};

export const handlePause = () => {
  const player = store.get(playerAtom);
  player.pause().catch(handleError);
};

export const handleFullscreen = () => {
  const player = store.get(playerAtom);
  player.requestFullscreen().catch(handleError);
};

export const handlePreviousChapter = () => {
  const player = store.get(playerAtom);
  const chapters = store.get(chaptersAtom);
  const chapterIndex = store.get(chapterIndexAtom);

  if (chapters.length === 0 || chapterIndex === 0) {
    return;
  }

  const previousChapterIndex = (chapterIndex - 1) % chapters.length;
  const seekTo = chapters[previousChapterIndex];

  store.set(chapterIndexAtom, previousChapterIndex);
  player.setCurrentTime(seekTo.startTime).catch(handleError);
};

export const handleNextChapter = () => {
  const chapters = store.get(chaptersAtom);
  if (chapters.length === 0) {
    return;
  }

  const player = store.get(playerAtom);
  const chapterIndex = store.get(chapterIndexAtom);
  const newChapterIndex = (chapterIndex + 1) % chapters.length;
  const seekTo = chapters[newChapterIndex];

  store.set(chapterIndexAtom, newChapterIndex);
  player.setCurrentTime(seekTo.startTime).catch(handleError);
};

export const handleRestartPlayback = () => {
  const player = store.get(playerAtom);
  player.setCurrentTime(0).catch(handleError);
};

export const handleRandomChapter = () => {
  const player = store.get(playerAtom);
  const chapters = store.get(chaptersAtom);
  const currentChapterIndex = store.get(chapterIndexAtom);

  const randomChapterIndex = Math.floor(Math.random() * chapters.length);
  const randomChapter = chapters[randomChapterIndex];

  if (currentChapterIndex === randomChapterIndex) {
    handleRandomChapter();
  }

  store.set(chapterIndexAtom, randomChapterIndex);
  player.setCurrentTime(randomChapter.startTime).catch(handleError);
};

export const handleSetCurrentChapter = (index: number) => {
  const player = store.get(playerAtom);
  const chapters = store.get(chaptersAtom);
  const newChapter = chapters[index];

  store.set(chapterIndexAtom, index);
  player.setCurrentTime(newChapter.startTime).catch(handleError);
};

export const handleSetCurrentPlaylist = async (newIndex: number) => {
  store.set(showcaseItemIndexAtom, 0);
  store.set(currentPlaylistIndexAtom, newIndex);
  store.set(isMenuOpenAtom, false);
  store.set(isAboutOpenAtom, false);
};

export const handleSetCurrentShowcaseItem = async (
  index: number,
  pos: number = 0,
) => {
  if (pos > 0) {
    store.set(isSeekLoadingAtom, true);
  }

  const player = store.get(playerAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const playlists = await store.get(playlistsAtom);
  const newVideo =
    playlists[currentPlaylistIndex].videoShowCasePayload.data[index];

  player
    .loadVideo(newVideo.player_embed_url)
    .then(() => {
      store.set(seekingPositionAtom, pos);
      store.set(showcaseItemIndexAtom, index);
      bindEventsToPlayer();
      player
        .setCurrentTime(pos)
        .then(() => {
          store.set(isSeekLoadingAtom, false);
        })
        .catch(handleError);
    })
    .catch(handleError);
};

export const handlePlaylistJump = async () => {
  const player = store.get(playerAtom);
  const playlist = await store.get(playlistsAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const randomChapterIndex = Math.floor(Math.random() * playlist.length);

  if (currentPlaylistIndex === randomChapterIndex) {
    await handlePlaylistJump();
    return;
  }

  const { videoShowCasePayload, vimeoPlayerURL } = playlist[randomChapterIndex];
  const nextVideoUrl = !!videoShowCasePayload.data
    ? videoShowCasePayload.data[0].player_embed_url
    : vimeoPlayerURL;

  store.set(currentPlaylistIndexAtom, randomChapterIndex);
  store.set(isMenuOpenAtom, false);
  store.set(isAboutOpenAtom, false);

  player
    .loadVideo(nextVideoUrl)
    .then(() => {
      bindEventsToPlayer();
      store.set(seekingPositionAtom, 0);
    })
    .catch(handleError);
};

export const handleSeek = (position: number) => {
  const player = store.get(playerAtom);
  store.set(seekingPositionAtom, position);
  player.setCurrentTime(position).catch(handleError);
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
