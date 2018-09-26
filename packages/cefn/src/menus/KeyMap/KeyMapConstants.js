import { mapValues } from "lodash";

export const baseLayout = [
  [
    { label: "`" },
    { label: "1" },
    { label: "2" },
    { label: "3" },
    { label: "4" },
    { label: "5" },
    { label: "6" },
    { label: "7" },
    { label: "8" },
    { label: "9" },
    { label: "0" },
    { label: "-" },
    { label: "=" },
    { label: "delete" }
  ],
  [
    { label: "tab" },
    { label: "q", type: "letter" },
    { label: "w", type: "letter" },
    { label: "e", type: "letter" },
    { label: "r", type: "letter" },
    { label: "t", type: "letter" },
    { label: "y", type: "letter" },
    { label: "u", type: "letter" },
    { label: "i", type: "letter" },
    { label: "o", type: "letter" },
    { label: "p", type: "letter" },
    { label: "[", id: "left-square-bracket" },
    { label: "]", id: "right-square-bracket" },
    { label: "\\", id: "backslash" }
  ],
  [
    { label: "caps lock", id: "caps-lock" },
    { label: "a", type: "letter" },
    { label: "s", type: "letter" },
    { label: "d", type: "letter" },
    { label: "f", type: "letter" },
    { label: "g", type: "letter" },
    { label: "h", type: "letter" },
    { label: "j", type: "letter" },
    { label: "k", type: "letter" },
    { label: "l", type: "letter" },
    { label: ";" },
    { label: "'" },
    { label: "return" }
  ],
  [
    { label: "shift", id: "left-shift", type: "modifier" },
    { label: "z", type: "letter" },
    { label: "x", type: "letter" },
    { label: "c", type: "letter" },
    { label: "v", type: "letter" },
    { label: "b", type: "letter" },
    { label: "n", type: "letter" },
    { label: "m", type: "letter" },
    { label: "," },
    { label: "." },
    { label: "/" },
    { label: "shift", id: "right-shift" }
  ]
];

export const macbookBottomRow = [
  { label: "fn", type: "modifier" },
  { label: "control", symbol: "⌃", type: "modifier" },
  {
    label: "option",
    id: "left-option",
    keyName: "alt",
    symbol: "⌥",
    type: "modifier"
  },
  {
    label: "command",
    id: "left-command",
    keyName: "meta",
    symbol: "⌘",
    type: "modifier"
  },
  { label: " ", id: "space" },
  { label: "command", id: "right-command", keyName: "meta", symbol: "⌘" },
  { label: "option", id: "right-option", keyName: "alt", symbol: "⌥" },
  {
    label: "",
    symbol: "◀",
    type: "arrow",
    id: "left-arrow",
    keyName: "arrowleft"
  },
  {
    label: "",
    symbol: "▲\n▼",
    id: "vertical-arrow",
    type: "arrow"
  },
  {
    label: "",
    symbol: "▶",
    type: "arrow",
    id: "right-arrow",
    keyName: "arrowright"
  }
];

export const macBottomRow = [
  { label: "control", symbol: "⌃", type: "modifier" },
  {
    label: "option",
    id: "left-option",
    keyName: "alt",
    symbol: "⌥",
    type: "modifier"
  },
  {
    label: "command",
    id: "left-command",
    keyName: "meta",
    symbol: "⌘",
    type: "modifier"
  },
  { label: " ", id: "space" },
  { label: "command", id: "right-command", keyName: "meta", symbol: "⌘" },
  { label: "option", id: "right-option", keyName: "alt", symbol: "⌥" },
  {
    label: "",
    symbol: "◀",
    type: "arrow",
    id: "left-arrow",
    keyName: "arrowleft"
  },
  {
    label: "",
    symbol: "▲\n▼",
    id: "vertical-arrow",
    type: "arrow"
  },
  {
    label: "",
    symbol: "▶",
    type: "arrow",
    id: "right-arrow",
    keyName: "arrowright"
  }
];

export const windowsBottomRow = [
  { label: "ctrl", type: "modifier", keyName: "control" },
  {
    label: "",
    id: "left-meta",
    type: "modifier",
    symbol: "⊞"
  },
  {
    label: "alt",
    id: "left-alt",
    keyName: "alt",
    type: "modifier"
  },
  { label: " ", id: "space" },
  {
    label: "alt",
    id: "right-alt",
    keyName: "alt"
  },
  { label: "", id: "right-meta", keyName: "meta", symbol: "⊞" },
  { label: "", id: "context", symbol: "≣" },
  { label: "ctrl", id: "right-ctrl", keyName: "meta" }
];

export const windowsLaptopBottomRow = [
  { label: "ctrl", type: "modifier", keyName: "control" },
  { label: "fn", type: "modifier" },
  {
    label: "",
    symbol: "⊞",
    id: "left-meta",
    type: "modifier"
  },
  {
    label: "alt",
    id: "left-alt",
    keyName: "alt",
    type: "modifier"
  },
  { label: " ", id: "space" },
  {
    label: "alt",
    id: "right-alt",
    keyName: "alt"
  },
  { label: "", id: "context", symbol: "≣" },
  { label: "ctrl", id: "right-ctrl", keyName: "ctrl" },
  {
    label: "",
    symbol: "◀",
    type: "arrow",
    id: "left-arrow",
    keyName: "arrowleft"
  },
  {
    label: "",
    symbol: "▲\n▼",
    id: "vertical-arrow",
    type: "arrow"
  },
  {
    label: "",
    symbol: "▶",
    type: "arrow",
    id: "right-arrow",
    keyName: "arrowright"
  }
];

export const surfaceBottomRow = [
  { label: "ctrl", type: "modifier", keyName: "control" },
  { label: "fn", type: "modifier" },
  {
    label: "",
    symbol: "⊞",
    id: "left-meta",
    type: "modifier"
  },
  {
    label: "alt",
    id: "left-alt",
    keyName: "alt",
    type: "modifier"
  },
  { label: " ", id: "space" },
  {
    label: "alt",
    id: "right-alt",
    keyName: "alt"
  },
  { label: "", id: "context", symbol: "≣" },
  {
    label: "",
    symbol: "◀",
    type: "arrow",
    id: "left-arrow",
    keyName: "arrowleft"
  },
  {
    label: "",
    symbol: "▲\n▼",
    id: "vertical-arrow",
    type: "arrow"
  },
  {
    label: "",
    symbol: "▶",
    type: "arrow",
    id: "right-arrow",
    keyName: "arrowright"
  }
];

export const bottomRows = {
  mac: macBottomRow,
  macbook: macbookBottomRow,
  windows: windowsBottomRow,
  "windows-laptop": windowsLaptopBottomRow,
  surface: surfaceBottomRow
};

export const layouts = mapValues(bottomRows, bottomRow => [
  ...baseLayout,
  bottomRow
]);
