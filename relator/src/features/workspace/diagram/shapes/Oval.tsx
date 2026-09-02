import type { ShapeProps } from "./types";

function Oval({ height, label, width }: ShapeProps) {
  return (
    <div
      className="grid place-items-center rounded-full bg-sky-200 p-4 text-center text-sm font-medium leading-tight text-black shadow-sm ring-1 ring-sky-300"
      style={{ height, width }}
    >
      <span className="break-words">{label}</span>
    </div>
  );
}

export { Oval };
