import type { GroupingColour } from "./types";

type GroupingColourOption = {
  borderColor: string;
  fillColor: string;
  label: string;
  textColor: string;
  value: GroupingColour;
};

const GROUPING_COLOURS: GroupingColourOption[] = [
  {
    borderColor: "#ef4444",
    fillColor: "#fecaca",
    label: "Light Red",
    textColor: "#000000",
    value: "light-red",
  },
  {
    borderColor: "#f97316",
    fillColor: "#fed7aa",
    label: "Light Orange",
    textColor: "#000000",
    value: "light-orange",
  },
  {
    borderColor: "#eab308",
    fillColor: "#fef08a",
    label: "Light Yellow",
    textColor: "#000000",
    value: "light-yellow",
  },
  {
    borderColor: "#22c55e",
    fillColor: "#bbf7d0",
    label: "Light Green",
    textColor: "#000000",
    value: "light-green",
  },
  {
    borderColor: "#0ea5e9",
    fillColor: "#bae6fd",
    label: "Light Blue",
    textColor: "#000000",
    value: "light-blue",
  },
  {
    borderColor: "#6366f1",
    fillColor: "#c7d2fe",
    label: "Light Indigo",
    textColor: "#000000",
    value: "light-indigo",
  },
  {
    borderColor: "#8b5cf6",
    fillColor: "#ddd6fe",
    label: "Light Violet",
    textColor: "#000000",
    value: "light-violet",
  },
  {
    borderColor: "#7f1d1d",
    fillColor: "#991b1b",
    label: "Dark Red",
    textColor: "#ffffff",
    value: "dark-red",
  },
  {
    borderColor: "#7c2d12",
    fillColor: "#9a3412",
    label: "Dark Orange",
    textColor: "#ffffff",
    value: "dark-orange",
  },
  {
    borderColor: "#713f12",
    fillColor: "#854d0e",
    label: "Dark Yellow",
    textColor: "#ffffff",
    value: "dark-yellow",
  },
  {
    borderColor: "#14532d",
    fillColor: "#166534",
    label: "Dark Green",
    textColor: "#ffffff",
    value: "dark-green",
  },
  {
    borderColor: "#1e3a8a",
    fillColor: "#1d4ed8",
    label: "Dark Blue",
    textColor: "#ffffff",
    value: "dark-blue",
  },
  {
    borderColor: "#312e81",
    fillColor: "#3730a3",
    label: "Dark Indigo",
    textColor: "#ffffff",
    value: "dark-indigo",
  },
  {
    borderColor: "#581c87",
    fillColor: "#6b21a8",
    label: "Dark Violet",
    textColor: "#ffffff",
    value: "dark-violet",
  },
];

const DEFAULT_GROUPING_COLOUR: GroupingColour = "light-blue";

function getGroupingColourOption(colour: GroupingColour) {
  return (
    GROUPING_COLOURS.find((colourOption) => colourOption.value === colour) ??
    GROUPING_COLOURS.find(
      (colourOption) => colourOption.value === DEFAULT_GROUPING_COLOUR,
    )!
  );
}

export {
  DEFAULT_GROUPING_COLOUR,
  getGroupingColourOption,
  GROUPING_COLOURS,
};
export type { GroupingColourOption };
