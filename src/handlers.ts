// handlers
// --------

import { isIOS, isMobileOnly } from "react-device-detect";
import {
  chaptersAtom,
  chapterIndexAtom,
  currentPlaylistIndexAtom,
  getPlaylistVideo,
  getVideoLink,
  iosFullscreenPlayerRefAtom,
  isAboutOpenAtom,
  isInfoPanelOpenAtom,
  isMenuOpenAtom,
  isMutedAtom,
  isPlayingAtom,
  isSeekLoadingAtom,
  isVideoLoadingAtom,
  playerRefAtom,
  playlistsAtom,
  seekingPositionAtom,
  setPlayerVideoData,
  showcaseItemIndexAtom,
  store,
} from "./store.ts";
import { VimeoChapter } from "./types.ts";

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
  const iosFullscreenPlayer = store.get(iosFullscreenPlayerRefAtom);

  if (player) {
    if (player.muted) {
      player.muted = false;
    } else {
      player.muted = true;
    }
  }
  if (iosFullscreenPlayer) {
    if (iosFullscreenPlayer.muted) {
      iosFullscreenPlayer.muted = false;
    } else {
      iosFullscreenPlayer.muted = true;
    }
  }
};

export const handlePlay = () => {
  const player = store.get(playerRefAtom);
  player.play();
};

export const handlePause = () => {
  const player = store.get(playerRefAtom);
  player.pause();
};

const getIsShowcase = async () => {
  const playlists = await store.get(playlistsAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const currentPlaylist = playlists[currentPlaylistIndex];
  return !!currentPlaylist?.videoShowCasePayload?.data;
};

export const handleFullscreen = async () => {
  const player = store.get(playerRefAtom);
  const iosFullscreenPlayer = store.get(iosFullscreenPlayerRefAtom);

  if (isIOS && isMobileOnly && player && iosFullscreenPlayer) {
    player.pause();

    const isShowcase = await getIsShowcase();
    const seekingPosition = store.get(seekingPositionAtom);

    if (isShowcase) {
      handleSetCurrentShowcaseItem({
        index: store.get(showcaseItemIndexAtom),
        pos: seekingPosition,
        iosPlayer: true,
        play: true,
      });
    } else {
      handleSeek({
        pos: seekingPosition,
        iosPlayer: true,
        play: true,
      });
    }
    return;
  }

  if (player) {
    if (player.requestFullscreen) {
      player.requestFullscreen();
    } else if (player.mozRequestFullScreen) {
      // Firefox
      player.mozRequestFullScreen();
    } else if (player.webkitRequestFullscreen) {
      // Chrome, Safari, Opera
      player.webkitRequestFullscreen();
    } else if (player.msRequestFullscreen) {
      // IE/Edge
      player.msRequestFullscreen();
    }
  }
};

const setCurrentTime = (player: any, time: number) => {
  player.currentTime = time;
  store.set(seekingPositionAtom, time);
};

const findChapterIndex = (chapters: VimeoChapter[], currentTime: number) => {
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const nextChapter = chapters[i + 1];
    // If this is the last chapter or x is less than the next chapter's timecode
    if (!nextChapter || currentTime < nextChapter.timecode) {
      if (currentTime >= chapter.timecode) {
        return i;
      }
    }
  }
  // If x doesn't fit in any chapter, return -1 (this could mean x is out of bounds)
  return -1;
};

export const handleTimeUpdate = async (currentTime: number) => {
  store.set(seekingPositionAtom, Math.trunc(currentTime));
  const isShowcase = await getIsShowcase();
  if (!isShowcase) {
    const chapters = store.get(chaptersAtom);
    const currentChapterIndex = findChapterIndex(chapters, currentTime);
    store.set(chapterIndexAtom, currentChapterIndex);
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
  setCurrentTime(player, seekTo.timecode);
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
  setCurrentTime(player, seekTo.timecode);
};

export const handleRestartPlayback = () => {
  const player = store.get(playerRefAtom);
  setCurrentTime(player, 0);
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
    chapters.length
  );
  const randomChapter = chapters[randomChapterIndex];

  store.set(chapterIndexAtom, randomChapterIndex);
  setCurrentTime(player, randomChapter.timecode);
};

export const handleSetCurrentChapter = (index: number) => {
  const player = store.get(playerRefAtom);
  const chapters = store.get(chaptersAtom);
  const newChapter = chapters[index];

  store.set(chapterIndexAtom, index);
  setCurrentTime(player, newChapter.timecode);
};

export const handleSetCurrentPlaylist = async (newIndex: number) => {
  store.set(currentPlaylistIndexAtom, newIndex);
  store.set(isMenuOpenAtom, false);
  store.set(isAboutOpenAtom, false);
};

export const handleSetCurrentShowcaseItem = async ({
  index,
  pos = 0,
  iosPlayer,
  play,
}: {
  index: number;
  pos?: number;
  iosPlayer?: boolean;
  play?: boolean;
}) => {
  const playFromBeginning = pos === 0;

  if (playFromBeginning) {
    store.set(isVideoLoadingAtom, true);
  } else {
    store.set(isSeekLoadingAtom, true);
  }

  const player = iosPlayer
    ? store.get(iosFullscreenPlayerRefAtom)
    : store.get(playerRefAtom);

  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const playlists = await store.get(playlistsAtom);
  const currentPlaylist = playlists[currentPlaylistIndex];
  const newVideo = getPlaylistVideo(currentPlaylist, index);

  if (newVideo && newVideo.files.length) {
    const sourceElement = player.querySelector("source");
    sourceElement.src = getVideoLink(newVideo);
    player.load();

    setPlayerVideoData(newVideo, currentPlaylist.vimeoChaptersPayload.data);
    store.set(showcaseItemIndexAtom, index);
    store.set(seekingPositionAtom, pos);

    if (!playFromBeginning) {
      setCurrentTime(player, pos);
    }
    if (play) {
      player.play();
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

export const handleSeek = ({
  pos,
  iosPlayer,
  play,
}: {
  pos: number;
  iosPlayer?: boolean;
  play?: boolean;
}) => {
  const isPlaying = store.get(isPlayingAtom);
  const pauseAndPlay = !iosPlayer && isPlaying;

  const player = iosPlayer
    ? store.get(iosFullscreenPlayerRefAtom)
    : store.get(playerRefAtom);

  if (pauseAndPlay) {
    player.pause();
    store.set(isVideoLoadingAtom, true);
  }
  setCurrentTime(player, pos);
  setTimeout(() => {
    if (play || pauseAndPlay) {
      player.play();
      store.set(isVideoLoadingAtom, false);
    }
  }, 500);
};

export const handleIosFullscreenExit = () => {
  if (!document.fullscreenElement) {
    const iosPlayer = store.get(iosFullscreenPlayerRefAtom);
    const player = store.get(playerRefAtom);

    const isMuted = store.get(isMutedAtom);
    const pos = store.get(seekingPositionAtom);

    iosPlayer.pause();
    setCurrentTime(player, pos);
    player.muted = isMuted;
    player.play();
    store.set(isVideoLoadingAtom, false);
  }
};
