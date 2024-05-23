import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { RichTextCollection } from "../components/Notion.tsx";
import {
  durationAtom,
  chaptersAtom,
  currentChapterAtom,
  playlistsAtom,
  currentPlaylistIndexAtom,
  isMediaSmallAtom,
  showcaseItemIndexAtom,
} from "../store.ts";
import {
  handleSetCurrentChapter,
  handleSetCurrentShowcaseItem,
} from "../handlers.ts";

function formatTimestamp(timestamp: number) {
  const minutes = Math.floor(timestamp / 60);
  const seconds = timestamp % 60;
  return (
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
}

function Track({
  isCurrent,
  onClick,
  number,
  start,
  end,
  richTextObjects,
}: any) {
  const trackRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (isCurrent && trackRef.current) {
      trackRef.current.scrollIntoView({
        behavior: "smooth", // Smooth scrolling
        block: "center", // Vertical alignment
        inline: "start", // Horizontal alignment
      });
    }
  }, [isCurrent]);

  return (
    <div
      ref={trackRef}
      role="button"
      className="py-6"
      style={{
        color: isCurrent ? "black" : "#908f8f",
        fontWeight: isCurrent ? 500 : 400,
      }}
      onClick={onClick}
    >
      <div className="flex gap-x-4 mb-6">
        <div className="italic">#{number}</div>
        <div>
          <RichTextCollection objects={richTextObjects} />
        </div>
      </div>
      {start !== undefined && end !== undefined && (
        <p>
          {formatTimestamp(start)}—{formatTimestamp(end)}
        </p>
      )}
    </div>
  );
}

function ChapterList({ metadata }: { metadata: any }) {
  const [currentChapter] = useAtom(currentChapterAtom);
  const [chapters] = useAtom(chaptersAtom);
  const [duration] = useAtom(durationAtom);
  const metaIds = Object.keys(metadata).sort();
  return (
    <>
      {metaIds.map((id) => {
        const metaNumber = parseInt(id);

        let start;
        let end;

        if (chapters?.length) {
          const chapter = chapters[metaNumber - 1];
          const nextChapter =
            chapters.length >= metaNumber && chapters[metaNumber];

          start = chapter.startTime;
          end = nextChapter ? nextChapter.startTime - 1 : duration;
        }

        const isCurrentChapter = currentChapter
          ? currentChapter?.index === metaNumber
          : metaNumber === 1;

        return (
          <Track
            key={id}
            isCurrent={isCurrentChapter}
            onClick={() => handleSetCurrentChapter(metaNumber - 1)}
            number={metaNumber}
            start={start}
            end={end}
            richTextObjects={metadata[id]}
          />
        );
      })}
    </>
  );
}

function durationOfPrevShowcaseItems(showcaseItems: any[], index: number) {
  let duration = 0;
  for (let i = 0; i < index; i++) {
    duration += showcaseItems[i].duration;
  }
  return duration;
}

function ShowcaseList({
  metadata,
  showcaseItems,
}: {
  metadata: any;
  showcaseItems: any[];
}) {
  const [showcaseItemIndex] = useAtom(showcaseItemIndexAtom);
  const metaIds = Object.keys(metadata).sort();

  const getIndexFromMetaId = (id: string) =>
    metaIds[0] === "00" ? parseInt(id) : parseInt(id) - 1;

  return (
    <>
      {metaIds.map((id) => {
        const metaIndex = getIndexFromMetaId(id);
        const isCurrentItem = metaIndex === showcaseItemIndex;

        let start = 0;
        let end;

        if (metaIndex > 0) {
          start =
            durationOfPrevShowcaseItems(showcaseItems, metaIndex) + metaIndex;
        }
        end = start + showcaseItems[metaIndex].duration;

        return (
          <Track
            key={id}
            isCurrent={isCurrentItem}
            onClick={() => handleSetCurrentShowcaseItem(metaIndex)}
            number={metaIndex + 1}
            start={start}
            end={end}
            richTextObjects={metadata[id]}
          />
        );
      })}
    </>
  );
}

function InfoPanel() {
  const [playlists] = useAtom(playlistsAtom);
  const [currentPlaylistIndex] = useAtom(currentPlaylistIndexAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);

  const { videoTitle, vimeoChapters, videoShowCasePayload } =
    playlists[currentPlaylistIndex];

  return (
    <div
      className={`info-panel w-[433px] max-w-[100%] absolute top-0 z-10 bg-cream overflow-y-scroll opacity-80 ${
        isMediaSmall ? "px-4 pt-4 pb-16" : "px-8 pt-10 pb-20"
      }`}
    >
      <h2 className="italic text-2xl tracking-wide mb-2">{videoTitle}</h2>
      <div className="divide-y divide-[#a9a9a9] text-lg tracklist">
        {!!videoShowCasePayload?.data ? (
          <ShowcaseList
            metadata={vimeoChapters}
            showcaseItems={videoShowCasePayload.data}
          />
        ) : (
          <ChapterList metadata={vimeoChapters} />
        )}
      </div>
    </div>
  );
}

export default InfoPanel;
