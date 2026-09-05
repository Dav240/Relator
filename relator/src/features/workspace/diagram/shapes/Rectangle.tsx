import type { ShapeProps } from "./types";

function Rectangle({
  borderColor,
  fillColor,
  height,
  label,
  textColor,
  width,
}: ShapeProps) {
  return (
    <div
      className="grid place-items-center p-4 text-center text-sm font-medium leading-tight shadow-sm"
      style={{
        backgroundColor: fillColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        height,
        width,
      }}
    >
      <span className="break-words">{label}</span>
    </div>
  );
}

export { Rectangle };
