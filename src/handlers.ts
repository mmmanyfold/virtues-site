// handlers
// --------

import { isIOS, isMobileOnly } from "react-device-detect";
import {
  chaptersAtom,
  chapterIndexAtom,
  currentPlaylistIndexAtom,
  getPlaylistVideo,
  getVideoLink,
  iPhoneFSPlayerRefAtom,
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

export const isIPhone = isIOS && isMobileOnly;

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
  const iPhoneFSPlayer = store.get(iPhoneFSPlayerRefAtom);

  if (player) {
    if (player.muted) {
      player.muted = false;
    } else {
      player.muted = true;
    }
  }
  if (iPhoneFSPlayer) {
    if (iPhoneFSPlayer.muted) {
      iPhoneFSPlayer.muted = false;
    } else {
      iPhoneFSPlayer.muted = true;
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

const isPlaylistShowcase = async () => {
  const playlists = await store.get(playlistsAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const currentPlaylist = playlists[currentPlaylistIndex];
  return !!currentPlaylist?.videoShowCasePayload?.data;
};

export const handleFullscreen = async () => {
  const player = store.get(playerRefAtom);
  const iPhoneFSPlayer = store.get(iPhoneFSPlayerRefAtom);

  if (player && !iPhoneFSPlayer) {
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

  if (player && iPhoneFSPlayer) {
    player.pause();

    const isShowcase = await isPlaylistShowcase();
    const seekingPosition = store.get(seekingPositionAtom);

    if (isShowcase) {
      handleSetCurrentShowcaseItem({
        index: store.get(showcaseItemIndexAtom),
        pos: seekingPosition,
        isIPhoneFSPlayer: true,
        play: true,
      });
    } else {
      handleSeek({
        pos: seekingPosition,
        isIPhoneFSPlayer: true,
        play: true,
      });
    }
    return;
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

export const handleTimeUpdate = async (
  currentTime: number,
  isIPhoneFSPlayer: boolean
) => {
  store.set(seekingPositionAtom, Math.trunc(currentTime));

  const playlists = await store.get(playlistsAtom);
  const currentPlaylistIndex = store.get(currentPlaylistIndexAtom);
  const currentPlaylist = playlists[currentPlaylistIndex];
  const showcaseVideos = currentPlaylist?.videoShowCasePayload?.data;

  if (showcaseVideos) {
    const currentIndex = store.get(showcaseItemIndexAtom);
    const isPlaying = store.get(isPlayingAtom);

    if (currentTime >= showcaseVideos[currentIndex].duration - 1) {
      const isLast = currentIndex === showcaseVideos.length - 1;
      handleSetCurrentShowcaseItem({
        index: isLast ? 0 : currentIndex + 1,
        pos: 0.1,
        isIPhoneFSPlayer,
        play: isPlaying,
      });
    }
  } else {
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
  isIPhoneFSPlayer,
  play,
}: {
  index: number;
  pos?: number;
  isIPhoneFSPlayer?: boolean;
  play?: boolean;
}) => {
  const playFromBeginning = pos === 0;

  if (playFromBeginning) {
    store.set(isVideoLoadingAtom, true);
  } else {
    store.set(isSeekLoadingAtom, true);
  }

  const player = isIPhoneFSPlayer
    ? store.get(iPhoneFSPlayerRefAtom)
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
  isIPhoneFSPlayer,
  play,
}: {
  pos: number;
  isIPhoneFSPlayer?: boolean;
  play?: boolean;
}) => {
  const isPlaying = store.get(isPlayingAtom);
  const isIPhoneMainVideo = isIPhone && !isIPhoneFSPlayer;

  const player = isIPhoneFSPlayer
    ? store.get(iPhoneFSPlayerRefAtom)
    : store.get(playerRefAtom);

  if (isIPhoneMainVideo) {
    player.pause();
    store.set(isVideoLoadingAtom, true);
  }

  setCurrentTime(player, pos);

  if (isIPhoneMainVideo) {
    setTimeout(() => {
      if (isPlaying) {
        player.play();
      }
      store.set(isVideoLoadingAtom, false);
    }, 500);
  } else if (play) {
    player.play();
  }
};

export const handleIPhoneFullscreenExit = async () => {
  if (!document.fullscreenElement) {
    const isIPhoneFSPlayer = store.get(iPhoneFSPlayerRefAtom);
    const player = store.get(playerRefAtom);
    const isMuted = store.get(isMutedAtom);
    const pos = store.get(seekingPositionAtom);

    isIPhoneFSPlayer.pause();
    player.muted = isMuted;

    const isShowcase = await isPlaylistShowcase();
    if (isShowcase) {
      handleSetCurrentShowcaseItem({
        index: store.get(showcaseItemIndexAtom),
        play: true,
        pos,
      });
    } else {
      setCurrentTime(player, pos);
      player.play();
    }
    store.set(isVideoLoadingAtom, false);
  }
};

export const autoplayOnFullscreenExit = () => {
  if (!document.fullscreenElement) {
    const player = store.get(playerRefAtom);
    setTimeout(() => {
      player.play();
    }, 500);
  }
};
