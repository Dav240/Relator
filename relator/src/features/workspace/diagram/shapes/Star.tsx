import type { ShapeProps } from "./types";

const STAR_CLIP_PATH =
  "polygon(50% 0%, 63% 32%, 100% 30%, 70% 55%, 82% 96%, 50% 72%, 18% 96%, 30% 55%, 0% 30%, 37% 32%)";

function Star({ height, label, width }: ShapeProps) {
  return (
    <div
      className="relative grid place-items-center p-4 text-center text-sm font-medium leading-tight text-black drop-shadow-sm"
      style={{ height, width }}
    >
      <div
        className="absolute inset-0 bg-sky-200 ring-1 ring-sky-300"
        style={{ clipPath: STAR_CLIP_PATH }}
      />
      <span className="relative z-10 break-words">{label}</span>
    </div>
  );
}

export { Star };
