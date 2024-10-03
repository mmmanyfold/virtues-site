import "react";

function RichTextObject({ object, color }: { object: any; color?: string }) {
  let textObject;
  let content;
  let linkUrl;
  let className = "";
  let hasNewlines;

  if (object?.type === "text") {
    textObject = object.text;
    linkUrl = textObject.link?.url;
    content = textObject.content.replace(/(^\n)/gi, "");
    hasNewlines = content.includes("\n");
    const annotations = object.annotations;
    const classes = Object.keys(annotations).filter(
      (k) => annotations[k] === true
    );
    className = classes.join(" ");
  }

  if (!textObject) return null;

  return (
    <>
      {hasNewlines ? (
        <>
          {linkUrl ? (
            <a href={linkUrl} target="_blank">
              <pre className={className} style={color ? { color } : {}}>
                {content}
              </pre>
            </a>
          ) : (
            <pre className={className} style={color ? { color } : {}}>
              {content}
            </pre>
          )}
        </>
      ) : (
        <>
          {linkUrl ? (
            <a href={linkUrl} target="_blank">
              <span className={className} style={color ? { color } : {}}>
                {content}
              </span>{" "}
            </a>
          ) : (
            <span className={className} style={color ? { color } : {}}>
              {content}
            </span>
          )}
        </>
      )}
    </>
  );
}

const RichTextCollectionItem = ({
  object,
  color,
}: {
  object: any;
  color?: string;
}) => {
  switch (object.type) {
    case "text":
      return <RichTextObject key={object.id} object={object} color={color} />;
    case "paragraph":
      return <ParagraphObject key={object.id} object={object} />;
    case "bulleted_list_item":
      return <BulletedListItem key={object.id} block={object} />;
    case "divider":
      return <hr key={object.id} />;
    default:
      return null;
  }
};

function RichTextCollection({
  objects,
  color,
}: {
  objects: any;
  color?: string;
}) {
  return (
    <>
      {objects?.map((object: any, i: number) => (
        <RichTextCollectionItem
          key={`${object.type}-${i}`}
          object={object}
          color={color}
        />
      ))}
    </>
  );
}

const ParagraphObject = ({
  object,
  color,
}: {
  object: any;
  color?: string;
}) => {
  let textObjects;
  let className = "";

  if (object.type === "paragraph") {
    const annotations = object.paragraph?.annotations || {};
    const classes = Object.keys(annotations).filter(
      (k) => annotations[k] === true
    );
    className = classes.join(" ");
    textObjects = object.paragraph?.rich_text || [];
  }

  return (
    <>
      {textObjects && (
        <p
          className={className}
          style={
            color
              ? { color: color, padding: 0, margin: "1rem 0" }
              : { padding: 0, margin: "1rem 0" }
          }
        >
          <RichTextCollection objects={textObjects} />
        </p>
      )}
    </>
  );
};

const BulletedListItem = ({ block }: { block: any }) => {
  return (
    <li className="notion-bulleted-list-item">
      <div>
        <RichTextCollection objects={block.bulleted_list_item?.rich_text} />
      </div>
    </li>
  );
};

export { RichTextObject, RichTextCollection, ParagraphObject };
