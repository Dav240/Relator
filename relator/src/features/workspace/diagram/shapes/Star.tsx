import type { ShapeProps } from "./types";

const STAR_CLIP_PATH =
  "polygon(50% 0%, 63% 32%, 100% 30%, 70% 55%, 82% 96%, 50% 72%, 18% 96%, 30% 55%, 0% 30%, 37% 32%)";

function Star({
  borderColor,
  fillColor,
  height,
  label,
  textColor,
  width,
}: ShapeProps) {
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
          clipPath: STAR_CLIP_PATH,
        }}
      />
      <span className="relative z-10 break-words">{label}</span>
    </div>
  );
}

export { Star };
