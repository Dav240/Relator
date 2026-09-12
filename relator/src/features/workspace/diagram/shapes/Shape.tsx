import {
  DEFAULT_GROUPING_COLOUR,
  getGroupingColourOption,
} from "../../appearance";
import type { GroupingColour, GroupingShape } from "../../types";
import { BaseShape } from "./BaseShape";
import { PolygonShape } from "./PolygonShape";
import {
  getNodeSize,
  getPolygonClipPath,
  getShapeDefinition,
} from "./shape-config";
import type { ShapeProps } from "./types";

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
  const shapeDefinition = getShapeDefinition(shape);
  const props: ShapeProps = {
    ...size,
    borderColor: colourOption.borderColor,
    fillColor: colourOption.fillColor,
    label,
    textColor: colourOption.textColor,
  };

  if (shapeDefinition.polygonPoints) {
    return (
      <PolygonShape
        {...props}
        clipPath={getPolygonClipPath(shapeDefinition.polygonPoints)}
      />
    );
  }

  return <BaseShape {...props} className={shapeDefinition.className ?? ""} />;
}

export { getNodeSize, Shape };
