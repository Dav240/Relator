import type { ShapeProps } from "./types";

type BaseShapeProps = ShapeProps & {
  className?: string;
};

function BaseShape({
  borderColor,
  className = "",
  fillColor,
  height,
  label,
  textColor,
  width,
}: BaseShapeProps) {
  return (
    <div
      className={`grid place-items-center p-4 text-center text-sm font-medium leading-tight shadow-sm ${className}`}
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

export { BaseShape };
