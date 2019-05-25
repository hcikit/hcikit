const shortcutConversions = {
  // control: "⌃",
  // shift: "⇧",
  // alt: "⌥",
  // meta: "⌘"
};

const shortcutValues = {
  control: 1,
  shift: 3,
  alt: 2,
  meta: 4
};

export const MODIFIERS = ["control", "meta", "shift", "alt", "fn"];
const SHIFT_HELD_KEY_MAPPINGS = {
  "<": ",",
  ">": ".",
  "?": "/",
  ":": ";",
  '"': "'",
  "{": "[",
  "}": "]",
  "|": "\\",

  "~": "`",
  "!": "1",
  "@": "2",
  "#": "3",
  $: "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  _: "-",
  "+": "="
};

/**
 * Takes a keyboard event and returns a unique key mapping. Handles keys that
 * return differently if shift is held.
 *
 * @param {KeyboardEvent} e
 * @returns {String} keyId
 */
export function eventToKey(e) {
  return SHIFT_HELD_KEY_MAPPINGS[e.key] || e.key.toLowerCase();
}

/**
 * Returns true if the key is a modifier key.
 *
 * @param {String} key
 */
export function isModifier(key) {
  return MODIFIERS.indexOf(key) > -1;
}

/**
 * Given a string of commands like "ctrl+g" returns an array of the paths
 * in a sorted fashion
 *
 * @param {string} string
 * @returns {Array<String>} path
 */
export function chordArrayFromString(string) {
  return string.split("+").sort(compareShortcut);
}

/**
 * Converts a path of keys like [ctrl, g] into a sorted string.
 *
 * @param {Array<String>} path
 * @returns {String}
 */
export function chordArrayToString(path) {
  path.sort(compareShortcut);
  return path.join("+");
}

export function shortcutToPrettyString(shortcut) {
  return shortcut.map(chordToPrettyString).join(",");
}

export function chordToPrettyString(chord) {
  chord.sort(compareShortcut);
  chord = chord.map(modifierToSymbol);
  chord[chord.length - 1] = chord[chord.length - 1].toUpperCase();
  return chord.join("+");
}

export const modifierToSymbol = convertItem.bind(
  undefined,
  shortcutConversions
);

export function convertItem(lookup, item) {
  return lookup[item] || item;
}

export function compareShortcut(a, b) {
  if (a === b) {
    return 0;
  } else if (a in shortcutValues) {
    if (b in shortcutValues) {
      return shortcutValues[a] - shortcutValues[b];
    } else {
      return -1;
    }
  } else {
    return 1;
  }
}

export function getModifiersFromChord(chord) {
  return chord.filter(isModifier);
}

export function getLetterFromChord(chord) {
  return chord.filter(chord => !isModifier(chord))[0];
}
