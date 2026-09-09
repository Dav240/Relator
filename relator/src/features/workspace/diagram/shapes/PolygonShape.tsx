import type { ShapeProps } from "./types";

type PolygonShapeProps = ShapeProps & {
  clipPath: string;
};

function PolygonShape({
  borderColor,
  clipPath,
  fillColor,
  height,
  label,
  textColor,
  width,
}: PolygonShapeProps) {
  return (
    <div
      className="relative grid place-items-center p-4 text-center text-sm font-medium leading-tight drop-shadow-sm"
      style={{ color: textColor, height, width }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: fillColor,
          border: `1px solid ${borderColor}`,
          clipPath,
        }}
      />
      <span className="relative z-10 break-words">{label}</span>
    </div>
  );
}

export { PolygonShape };
