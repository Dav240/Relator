import type { ShapeProps } from "./types";

const HEXAGON_CLIP_PATH =
  "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)";

function Hexagon({ height, label, width }: ShapeProps) {
  return (
    <div
      className="relative grid place-items-center p-4 text-center text-sm font-medium leading-tight text-black drop-shadow-sm"
      style={{ height, width }}
    >
      <div
        className="absolute inset-0 bg-sky-200 ring-1 ring-sky-300"
        style={{ clipPath: HEXAGON_CLIP_PATH }}
      />
      <span className="relative z-10 break-words">{label}</span>
    </div>
  );
}

export { Hexagon };
