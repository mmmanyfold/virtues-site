import { SetStateAction, useEffect, Suspense } from "react";
import { Provider, useAtom } from "jotai";
import { useWindowSize } from "@uidotdev/usehooks";
import { default as Player } from "@vimeo/player";
import { Seekbar as Seek } from "react-seekbar";
import { X, Plus } from "@phosphor-icons/react";
import Controls from "./components/Controls.tsx";
import { RichTextCollection } from "./components/Notion.tsx";
import Menu from "./components/Menu.tsx";
import About from "./components/About.tsx";
import "./App.css";
import {
  store,
  playerAtom,
  seekingPositionAtom,
  durationAtom,
  chaptersAtom,
  currentChapterAtom,
  playlistsAtom,
  currentPlaylistIndexAtom,
  readOnlyCurrentSelectionAtom,
  aboutPageAtom,
  isInfoPanelOpenAtom,
  isMenuOpenAtom,
  isAboutOpenAtom,
  videoSizeAtom,
  wrapperWidthAtom,
  windowWidthAtom,
  isMediaSmallAtom,
  timeInSecondsUpdateAtom,
} from "./store.ts";
import {
  handlePlay,
  handleSetCurrentChapter,
  handleToggleMenu,
} from "./handlers.ts";

function Seekbar() {
  const [position] = useAtom(timeInSecondsUpdateAtom);
  const [, setSeekPosition] = useAtom(seekingPositionAtom);
  const [duration] = useAtom(durationAtom);

  const handleSeek = (position: SetStateAction<number>) => {
    setSeekPosition(position);
  };

  return (
    <div className="seekbar-wrapper">
      <Seek
        position={position}
        duration={duration}
        onSeek={handleSeek}
        radius={0}
        height={15}
        outerColor="#a9a9a9"
        innerColor="#6c6c6c"
        hoverColor="#6c6c6c"
        fullWidth
      />
    </div>
  );
}

function VideoPlayer() {
  const [firstVideoSelection] = useAtom(readOnlyCurrentSelectionAtom);
  const [[width, height]] = useAtom(videoSizeAtom);

  const firstVideoUrl = !!firstVideoSelection.videoShowCasePayload.data
    ? firstVideoSelection.videoShowCasePayload.data[0].player_embed_url
    : firstVideoSelection.vimeoPlayerURL;

  return (
    <Suspense fallback={<div>loading...</div>}>
      <div className="relative cursor-pointer" onClick={handlePlay}>
        <div
          id="vimeo-player"
          className={`relative overflow-hidden w-[100%]`}
          style={{
            paddingTop: !!width ? `${(height / width) * 100}%` : "41.67%",
          }}
          data-vimeo-url={firstVideoUrl}
          data-vimeo-background="1"
          data-vimeo-allow="autoplay"
          data-vimeo-muted="1"
        ></div>
      </div>
    </Suspense>
  );
}

function formatTimestamp(seconds: number) {
  var minutes = Math.floor(seconds / 60);
  var seconds = seconds % 60;
  return (
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
}

function InfoPanel() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentPlaylistIndex] = useAtom(currentPlaylistIndexAtom);
  const [currentChapter] = useAtom(currentChapterAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [chapters] = useAtom(chaptersAtom);
  const [duration] = useAtom(durationAtom);

  const currentPlaylist = playlists[currentPlaylistIndex];
  const { videoTitle, vimeoChapters } = currentPlaylist;
  const chapterIds = Object.keys(vimeoChapters).sort();

  return (
    <div
      className={`info-panel w-[433px] max-w-[100%] absolute top-0 z-10 bg-white overflow-y-scroll opacity-90 ${
        isMediaSmall ? "p-4" : "px-8 pt-10 pb-5"
      }`}
    >
      <h2 className="italic text-2xl tracking-wide mb-2">{videoTitle}</h2>
      <div className="divide-y divide-[#a9a9a9] text-sm">
        {chapterIds.map((id) => {
          const chapterNumber = parseInt(id);

          let start;
          let end;

          if (chapters?.length) {
            const chapter = chapters[chapterNumber - 1];
            const nextChapter =
              chapters.length >= chapterNumber && chapters[chapterNumber];
            start = chapter.startTime;
            end = nextChapter ? nextChapter.startTime - 1 : duration;
          }

          const isCurrentChapter = currentChapter
            ? currentChapter?.index === chapterNumber
            : chapterNumber === 1;
          return (
            <div
              key={id}
              role="button"
              className="py-6"
              style={{ color: isCurrentChapter ? "black" : "#908f8f" }}
              onClick={() => handleSetCurrentChapter(chapterNumber - 1)}
            >
              <div className="flex gap-x-4 mb-6">
                <div className="italic">#{chapterNumber}</div>
                <div>
                  <RichTextCollection objects={vimeoChapters[id]} />
                </div>
              </div>
              {start !== undefined && end !== undefined && (
                <p>
                  {formatTimestamp(start)}—{formatTimestamp(end)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VideoFooter() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentPlaylistIndex] = useAtom(currentPlaylistIndexAtom);
  const currentPlaylist = playlists[currentPlaylistIndex];

  return (
    <div className="sticky bottom-0 z-10">
      <Seekbar />
      <Controls playlist={currentPlaylist} />
    </div>
  );
}

function Title() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentPlaylistIndex] = useAtom(currentPlaylistIndexAtom);
  const [isMenuOpen] = useAtom(isMenuOpenAtom);
  const [isAboutOpen] = useAtom(isAboutOpenAtom);
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);

  const { titleColor } = playlists[currentPlaylistIndex];

  let color = "black";

  if (!isMenuOpen && !isAboutOpen && titleColor) {
    color = titleColor.toLowerCase();
  }

  return (
    <h1
      className={`title absolute ${isInfoPanelOpen ? "hidden" : "z-40"} ${
        isMediaSmall
          ? "text-[3rem] top-[0.25em] left-[0.35em]"
          : "text-[5.5vw] top-[0.35em] left-[0.5em]"
      }`}
      style={{ color }}
    >
      VIRTUES
    </h1>
  );
}

function MenuToggle() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentPlaylistIndex] = useAtom(currentPlaylistIndexAtom);
  const [isMenuOpen] = useAtom(isMenuOpenAtom);
  const [isAboutOpen] = useAtom(isAboutOpenAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [aboutPage] = useAtom(aboutPageAtom);

  const { titleColor } = playlists[currentPlaylistIndex];
  const iconClass = isMediaSmall ? "text-[2rem]" : "text-[35px]";

  let plusColor = "black";

  if (!isMenuOpen && !isAboutOpen && titleColor) {
    plusColor = titleColor.toLowerCase();
  }

  return (
    <>
      <div
        role="button"
        className={`absolute z-40 ${
          isMediaSmall ? "top-3 right-3" : "top-8 right-8"
        }`}
        onClick={handleToggleMenu}
      >
        {isMenuOpen ? (
          <X className={iconClass} weight="bold" />
        ) : (
          <Plus className={iconClass} weight="bold" color={plusColor} />
        )}
      </div>

      {isMenuOpen && <Menu />}
      {isAboutOpen && <About blocks={aboutPage?.blocks} />}
    </>
  );
}

function getWrapperWidth({
  controlsHeight,
  videoWidth,
  videoHeight,
  windowWidth,
  windowHeight,
}: any) {
  const windowHeightWithoutControls = windowHeight - controlsHeight;
  const videoAspectRatio = videoWidth / videoHeight;

  let width = windowHeightWithoutControls * videoAspectRatio;

  if (width < windowWidth) {
    width = windowWidth;
  }

  return width;
}

function VideoWrapper() {
  const windowSize = useWindowSize();
  const [windowWidth] = useAtom(windowWidthAtom);
  const [videoSize] = useAtom(videoSizeAtom);
  const [wrapperWidth] = useAtom(wrapperWidthAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);
  const [isInfoPanelOpen] = useAtom(isInfoPanelOpenAtom);

  useEffect(() => {
    const width = getWrapperWidth({
      controlsHeight: isMediaSmall ? 57 : 67,
      videoWidth: videoSize[0],
      videoHeight: videoSize[1],
      windowWidth: windowSize.width || 1,
      windowHeight: windowSize.height || 1,
    });
    store.set(wrapperWidthAtom, width);
    store.set(windowWidthAtom, windowSize.width || 1);
  }, [windowSize, videoSize, isMediaSmall]);

  const positionLeft =
    wrapperWidth === windowWidth ? 0 : `-${(wrapperWidth - windowWidth) / 2}px`;

  return (
    <>
      <div
        className="relative"
        style={{ width: `${wrapperWidth}px`, left: positionLeft }}
      >
        <VideoPlayer />
      </div>
      {isInfoPanelOpen && <InfoPanel />}
    </>
  );
}

function App() {
  useEffect(() => {
    const player = new Player("vimeo-player");
    store.set(playerAtom, player);
  }, []);

  return (
    <Provider store={store}>
      <Title />
      <MenuToggle />
      <VideoWrapper />
      <VideoFooter />
    </Provider>
  );
}

export default App;
