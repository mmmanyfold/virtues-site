import "react";
import { RichTextObject } from "../components/Notion.tsx";
import { useAtom } from "jotai";
import { isMenuOpenAtom, isMediaSmallAtom } from "../store.ts";

const ContentBlock = ({ block, imgShadow }: any) => {
  switch (block.type) {
    case "paragraph":
      return (
        <p>
          {block.paragraph.rich_text.map((richText: any, i: number) => (
            <RichTextObject key={`object-${i}`} object={richText} />
          ))}
        </p>
      );
    case "image":
      const caption = block.image.caption;
      return (
        <img
          className={`w-[100%] ${imgShadow ? "shadow-xl" : ""}`}
          src={block.image.file.url}
          alt={caption ? caption[0].plain_text : ""}
        />
      );
    default:
      return null;
  }
};

function Section({ blocks, imgShadow, className }: any) {
  return (
    <div
      className={`flex flex-col gap-y-6 pt-14 text-lg leading-tight ${
        className || ""
      }`}
    >
      {blocks.map((block: any) => {
        return (
          <ContentBlock key={block.id} block={block} imgShadow={imgShadow} />
        );
      })}
    </div>
  );
}

export default function About({ blocks }: any) {
  const [isMenuOpen] = useAtom(isMenuOpenAtom);
  const [isMediaSmall] = useAtom(isMediaSmallAtom);

  if (!blocks) {
    return null;
  }

  const sections = blocks.reduce(
    (acc: any, block: any) => {
      if (block.type === "divider") {
        return [...acc, []];
      } else {
        acc[acc.length - 1].push(block);
        return acc;
      }
    },
    [[]],
  );

  return (
    <div
      className={`about absolute z-20 w-[100%] h-[100dvh] overflow-scroll bg-cream ${
        isMenuOpen ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"
      }`}
    >
      <div className={`${isMediaSmall ? "flex flex-col" : "grid"}`}>
        <Section
          blocks={sections[0]}
          className={`${
            isMediaSmall
              ? "px-[1em]"
              : "px-[1.5em] w-1/2 h-[85dvh] fixed overflow-y-scroll"
          }`}
        />

        <Section
          blocks={sections[1]}
          imgShadow={true}
          className={`${
            isMediaSmall ? "px-[1em]" : "px-[1.5em] w-1/2 justify-self-end"
          }`}
        />
      </div>
    </div>
  );
}
