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

function formatTimestamp(seconds: number) {
  var minutes = Math.floor(seconds / 60);
  var seconds = seconds % 60;
  return (
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
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
          <div
            key={id}
            role="button"
            className="py-6"
            style={{ color: isCurrentChapter ? "black" : "#908f8f" }}
            onClick={() => handleSetCurrentChapter(metaNumber - 1)}
          >
            <div className="flex gap-x-4 mb-6">
              <div className="italic">#{metaNumber}</div>
              <div>
                <RichTextCollection objects={metadata[id]} />
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

  return (
    <>
      {metaIds.map((id) => {
        const metaIndex = parseInt(id) - 1;
        const isCurrentItem = metaIndex === showcaseItemIndex;

        let start = 0;
        let end;

        if (showcaseItems?.length) {
          if (metaIndex > 0) {
            start = durationOfPrevShowcaseItems(showcaseItems, metaIndex) + 1;
          }
          end = start + showcaseItems[metaIndex].duration;
        }

        return (
          <div
            key={id}
            role="button"
            className="py-6"
            style={{ color: isCurrentItem ? "black" : "#908f8f" }}
            onClick={() => handleSetCurrentShowcaseItem(metaIndex)}
          >
            <div className="flex gap-x-4 mb-6">
              <div className="italic">#{metaIndex + 1}</div>
              <div>
                <RichTextCollection objects={metadata[id]} />
              </div>
            </div>
            {!!start && !!end && (
              <p>
                {formatTimestamp(start)}—{formatTimestamp(end)}
              </p>
            )}
          </div>
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
      className={`info-panel w-[433px] max-w-[100%] absolute top-0 z-10 bg-white overflow-y-scroll opacity-90 ${
        isMediaSmall ? "p-4" : "px-8 pt-10 pb-5"
      }`}
    >
      <h2 className="italic text-2xl tracking-wide mb-2">{videoTitle}</h2>
      <div className="divide-y divide-[#a9a9a9] text-sm">
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
