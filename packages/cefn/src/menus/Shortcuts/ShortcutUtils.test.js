import {
  chordToPrettyString,
  shortcutToPrettyString,
  modifierToSymbol,
  convertItem,
  compareShortcut,
  chordArrayFromString,
  chordArrayToString,
  isModifier,
  eventToKey
} from "./ShortcutUtils";

it("sorts modifiers properly", () => {
  const shortcuts = ["meta", "shift", "alt", "a", "control"];
  shortcuts.sort(compareShortcut);
  expect(shortcuts).toEqual(["control", "alt", "shift", "meta", "a"]);
});

it("converts items", () => {
  const mapping = { a: "b", b: "c" };
  expect(convertItem(mapping, "a")).toEqual("b");
  expect(convertItem(mapping, "b")).toEqual("c");
  expect(convertItem(mapping, "c")).toEqual("c");
});

xit("converts shortcut symbols", () => {
  expect(modifierToSymbol("a")).toEqual("a");
  expect(modifierToSymbol("control")).toEqual("⌃");
  expect(modifierToSymbol("shift")).toEqual("⇧");
  expect(modifierToSymbol("alt")).toEqual("⌥");
  expect(modifierToSymbol("meta")).toEqual("⌘");
});

xit("converts shortcuts to strings", () => {
  expect(chordToPrettyString(["meta", "shift", "c"])).toEqual("⇧⌘c");
  expect(
    shortcutToPrettyString([
      ["b", "shift", "meta", "control", "alt"],
      ["meta", "c"]
    ])
  ).toEqual("⌃⌥⇧⌘b,⌘c");
});

describe("chordArrayToString", () => {
  it("empty path to string", () => {
    expect(chordArrayToString([])).toEqual("");
  });

  it("single key", () => {
    expect(chordArrayToString(["control"])).toEqual("control");
  });

  it("modifiers", () => {
    expect(chordArrayToString(["alt", "control"])).toEqual("control+alt");
  });

  it("sorting keys", () => {
    expect(chordArrayToString(["control", "alt"])).toEqual("control+alt");
  });

  it("space", () => {
    expect(chordArrayToString(["control", " "])).toEqual("control+ ");
  });
});

describe("pathFromString", () => {
  it("empty path", () => {
    expect(chordArrayFromString("")).toEqual([""]);
  });

  it("single key", () => {
    expect(chordArrayFromString("control")).toEqual(["control"]);
  });

  it("modifiers", () => {
    expect(chordArrayFromString("alt+control")).toEqual(["control", "alt"]);
  });

  it("sorting keys", () => {
    expect(chordArrayFromString("control+alt")).toEqual(["control", "alt"]);
  });

  it("space", () => {
    expect(chordArrayFromString(" +control")).toEqual(["control", " "]);
  });
});

describe("isModifier", () => {
  it("modifier", () => {
    expect(isModifier("alt")).toEqual(true);
    expect(isModifier("control")).toEqual(true);
    expect(isModifier("meta")).toEqual(true);
    expect(isModifier("shift")).toEqual(true);
  });
  it("keys", () => {
    expect(isModifier("k")).toEqual(false);
    expect(isModifier("a")).toEqual(false);
    expect(isModifier(" ")).toEqual(false);
    expect(isModifier("\\")).toEqual(false);
    expect(isModifier("5")).toEqual(false);
    expect(isModifier("5")).toEqual(false);
  });
});

describe("eventToKey", () => {
  it("handles regular keys", () => {
    expect(eventToKey({ key: "k" })).toEqual("k");
    expect(eventToKey({ key: "control" })).toEqual("control");
    expect(eventToKey({ key: "5" })).toEqual("5");
  });

  it("handles shifted keys", () => {
    expect(eventToKey({ key: ">" })).toEqual(".");
    expect(eventToKey({ key: "|" })).toEqual("\\");
    expect(eventToKey({ key: "$" })).toEqual("4");
  });
});
