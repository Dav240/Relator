import {
  DEFAULT_GROUPING_COLOUR,
  getGroupingColourOption,
} from "../../appearance";
import type { GroupingColour, GroupingShape } from "../../types";
import { BaseShape } from "./BaseShape";
import { PolygonShape } from "./PolygonShape";
import type { ShapeProps } from "./types";

const POLYGON_CLIP_PATHS: Partial<Record<GroupingShape, string>> = {
  hexagon:
    "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)",
  star:
    "polygon(50% 0%, 63% 32%, 100% 30%, 70% 55%, 82% 96%, 50% 72%, 18% 96%, 30% 55%, 0% 30%, 37% 32%)",
};

function getNodeBaseSize(label: string) {
  return Math.min(160, Math.max(64, 52 + label.length * 6));
}

function getNodeSize(label: string, shape: GroupingShape = "circle") {
  const baseSize = getNodeBaseSize(label);

  if (shape === "oval") {
    return {
      height: baseSize * 0.64,
      width: baseSize * 1.6,
    };
  }

  if (shape === "rectangle") {
    return {
      height: baseSize * 0.8,
      width: baseSize * 1.6,
    };
  }

  return {
    height: baseSize,
    width: baseSize,
  };
}

function Shape({
  colour = DEFAULT_GROUPING_COLOUR,
  label,
  shape = "circle",
}: {
  colour?: GroupingColour;
  label: string;
  shape?: GroupingShape;
}) {
  const size = getNodeSize(label, shape);
  const colourOption = getGroupingColourOption(colour);
  const props: ShapeProps = {
    ...size,
    borderColor: colourOption.borderColor,
    fillColor: colourOption.fillColor,
    label,
    textColor: colourOption.textColor,
  };
  const clipPath = POLYGON_CLIP_PATHS[shape];

  if (clipPath) {
    return <PolygonShape {...props} clipPath={clipPath} />;
  }

  return (
    <BaseShape
      {...props}
      className={shape === "circle" || shape === "oval" ? "rounded-full" : ""}
    />
  );
}

export { getNodeSize, Shape };
