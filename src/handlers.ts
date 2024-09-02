// handlers
// --------

import {
  isInfoPanelOpenAtom,
  isMenuOpenAtom,
  chapterIndexAtom,
  chaptersAtom,
  playerRefAtom,
  playlistsAtom,
  seekingPositionAtom,
  store,
  currentPlaylistIndexAtom,
  isAboutOpenAtom,
  showcaseItemIndexAtom,
  isSeekLoadingAtom,
  isVideoLoadingAtom,
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
};

export const handleMute = () => {
  const player = store.get(playerRefAtom);
  if (player) {
    if (player.muted) {
      player.muted = false;
    } else {
      player.muted = true;
    }
  }
};

export const handlePlay = () => {
  const player = store.get(playerRefAtom);
  player.play()
};

export const handlePause = () => {
  const player = store.get(playerRefAtom);
  player.pause()
};

export const handleFullscreen = () => {
  const player = store.get(playerRefAtom);
  if (player) {
    if (player.requestFullscreen) {
      player.requestFullscreen();
    } else if (player.mozRequestFullScreen) { // Firefox
      player.mozRequestFullScreen();
    } else if (player.webkitRequestFullscreen) { // Chrome, Safari, Opera
      player.webkitRequestFullscreen();
    } else if (player.msRequestFullscreen) { // IE/Edge
      player.msRequestFullscreen();
    }
  }
};

export const handlePreviousChapter = () => {
  // const player = store.get(playerAtom);
  const chapters = store.get(chaptersAtom);
  const chapterIndex = store.get(chapterIndexAtom);

  if (chapters.length === 0 || chapterIndex === 0) {
    return;
  }

  const previousChapterIndex = (chapterIndex - 1) % chapters.length;
  const seekTo = chapters[previousChapterIndex];

  store.set(chapterIndexAtom, previousChapterIndex);
  // player.setCurrentTime(seekTo.startTime).catch(handleError);
};

export const handleNextChapter = () => {
  const chapters = store.get(chaptersAtom);
  if (chapters.length === 0) {
    return;
  }

  // const player = store.get(playerAtom);
  const chapterIndex = store.get(chapterIndexAtom);
  const newChapterIndex = (chapterIndex + 1) % chapters.length;
  const seekTo = chapters[newChapterIndex];

  store.set(chapterIndexAtom, newChapterIndex);
  // player.setCurrentTime(seekTo.startTime).catch(handleError);
};

export const handleRestartPlayback = () => {
  const player = store.get(playerRefAtom);
  player.currentTime = 0;
};

export const getRandomIndex = (currentIndex: number, listLength: number) => {
  if (listLength === 1) {
    return 0;
  } else if (listLength === 2) {
    return currentIndex === 0 ? 1 : 0;
  } else {
    let i;
    do {
      i = Math.floor(Math.random() * (listLength - 1));
    } while (i === currentIndex);
    return i;
  }
};

export const handleRandomChapter = () => {
  // const player = store.get(playerAtom);
  const chapters = store.get(chaptersAtom);
  const currentChapterIndex = store.get(chapterIndexAtom);
  const randomChapterIndex = getRandomIndex(
    currentChapterIndex,
    chapters.length,
  );
  const randomChapter = chapters[randomChapterIndex];

  store.set(chapterIndexAtom, randomChapterIndex);
  // player.setCurrentTime(randomChapter.startTime).catch(handleError);
};

export const handleSetCurrentChapter = (index: number) => {
  // const player = store.get(playerAtom);
  const chapters = store.get(chaptersAtom);
  const newChapter = chapters[index];

  store.set(chapterIndexAtom, index);
  // player.setCurrentTime(newChapter.startTime).catch(handleError);
};

export const handleSetCurrentPlaylist = async (newIndex: number) => {
  store.set(currentPlaylistIndexAtom, newIndex);
  store.set(isMenuOpenAtom, false);
  store.set(isAboutOpenAtom, false);
};

export const handleSetCurrentShowcaseItem = async (
  index: number,
  pos: number = 0,
) => {
  const playFromBeginning = pos === 0;

  if (playFromBeginning) {
    store.set(isVideoLoadingAtom, true);
  } else {
    store.set(isSeekLoadingAtom, true);
  }

  const player = store.get(playerRefAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const playlists = await store.get(playlistsAtom);
  const showcaseVideos = playlists[currentPlaylistIndex].videoShowCasePayload.data
  const newVideo = showcaseVideos && showcaseVideos[index];

  const sourceElement = player.querySelector('source');
  if (sourceElement && newVideo) {
    sourceElement.src = newVideo.videoSourceUrl;
    player.load();

    if (!playFromBeginning) {
      player.currentTime = pos
    }

    store.set(seekingPositionAtom, pos);
    store.set(showcaseItemIndexAtom, index);
  }
};

export const handlePlaylistJump = async () => {
  const playlist = await store.get(playlistsAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const newIndex = getRandomIndex(currentPlaylistIndex, playlist.length);

  store.set(currentPlaylistIndexAtom, newIndex);
  store.set(isMenuOpenAtom, false);
  store.set(isAboutOpenAtom, false);
};

export const handleSeek = (position: number) => {
  const player = store.get(playerRefAtom);
  store.set(seekingPositionAtom, position);
  player.currentTime = position;
};
