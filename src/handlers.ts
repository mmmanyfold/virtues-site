// handlers
// --------

import {
  chaptersAtom,
  chapterIndexAtom,
  currentPlaylistIndexAtom,
  getPlaylistVideo,
  getVideoLink,
  isAboutOpenAtom,
  isInfoPanelOpenAtom,
  isMenuOpenAtom,
  isSeekLoadingAtom,
  isVideoLoadingAtom,
  playerRefAtom,
  playlistsAtom,
  seekingPositionAtom,
  setPlayerVideoData,
  showcaseItemIndexAtom,
  store,
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
  const player = store.get(playerRefAtom);
  const chapters = store.get(chaptersAtom);
  const chapterIndex = store.get(chapterIndexAtom);

  if (chapters.length === 0 || chapterIndex === 0) {
    return;
  }

  const previousChapterIndex = (chapterIndex - 1) % chapters.length;
  const seekTo = chapters[previousChapterIndex];

  store.set(chapterIndexAtom, previousChapterIndex);
  player.currentTime = seekTo.timecode
};

export const handleNextChapter = () => {
  const chapters = store.get(chaptersAtom);
  if (chapters.length === 0) {
    return;
  }

  const player = store.get(playerRefAtom);
  const chapterIndex = store.get(chapterIndexAtom);
  const newChapterIndex = (chapterIndex + 1) % chapters.length;
  const seekTo = chapters[newChapterIndex];

  store.set(chapterIndexAtom, newChapterIndex);
  player.currentTime = seekTo.timecode
};

export const handleRestartPlayback = () => {
  const player = store.get(playerRefAtom);
  player.currentTime = 0;
};

export const getRandomIndex = (currentIndex: number, listLength: number) => {
  if (listLength === 1) {
    return 0;
  }
  if (listLength === 2) {
    return currentIndex === 0 ? 1 : 0;
  }
  let i;
  do {
    i = Math.floor(Math.random() * listLength);
  } while (i === currentIndex);
  return i;
};

export const handleRandomChapter = () => {
  const player = store.get(playerRefAtom);
  const chapters = store.get(chaptersAtom);
  const currentChapterIndex = store.get(chapterIndexAtom);
  const randomChapterIndex = getRandomIndex(
    currentChapterIndex,
    chapters.length,
  );
  const randomChapter = chapters[randomChapterIndex];

  store.set(chapterIndexAtom, randomChapterIndex);
  player.currentTime = randomChapter.timecode
};

export const handleSetCurrentChapter = (index: number) => {
  const player = store.get(playerRefAtom);
  const chapters = store.get(chaptersAtom);
  const newChapter = chapters[index];

  store.set(chapterIndexAtom, index);
  player.currentTime = newChapter.timecode
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
  const currentPlaylist = playlists[currentPlaylistIndex]
  const newVideo = getPlaylistVideo(currentPlaylist, index)

  if (newVideo && newVideo.files.length) {
    const sourceElement = player.querySelector('source');
    sourceElement.src = getVideoLink(newVideo)
    player.load();
    
    setPlayerVideoData(newVideo, currentPlaylist.vimeoChaptersPayload.data)
    store.set(showcaseItemIndexAtom, index);
    store.set(seekingPositionAtom, pos);
    
    if (!playFromBeginning) {
      player.currentTime = pos
    }
  }
};

export const handlePlaylistJump = async () => {
  const playlists = await store.get(playlistsAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const newIndex = getRandomIndex(currentPlaylistIndex, playlists.length);

  store.set(currentPlaylistIndexAtom, newIndex);
  store.set(isMenuOpenAtom, false);
  store.set(isAboutOpenAtom, false);
};

export const handleSeek = (position: number) => {
  const player = store.get(playerRefAtom);
  store.set(isVideoLoadingAtom, true);
  store.set(seekingPositionAtom, position);
  player.currentTime = position;
};
