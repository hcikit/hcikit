import {
  chordArrayFromString,
  chordArrayToString,
  getLetterFromChord,
  getModifiersFromChord
} from "./ShortcutUtils";

/**
 * Merges two command hierarchies. The right side is merged into the right in place.
 *
 * @param {Object} h1 This is assumed to be in proper working order with sorted modifiers. This object is modified
 * @param {Object} h2 New hierarchy to merge in.
 * @param {*} level Level to add to all commands.
 *
 * @returns {Object} mergedCommandHierarchy
 */
export function mergeCommandHierarchy(left, right) {
  for (const key of Object.keys(right)) {
    let keyFixed = chordArrayToString(chordArrayFromString(key));

    if (keyFixed in left) {
      if (typeof left[keyFixed] === "object") {
        mergeCommandHierarchy(left[keyFixed], right[key]);
      }
    } else {
      left[keyFixed] = right[key];
    }
  }

  return left;
}

/**
 * Given a list of linear menus it returns a command hierarchy from traversing the shortcuts.
 *
 * @param {Array} menus
 * @returns {Object} commandHierarchy
 */
export function menuToCommandHierarchy(menus) {
  let commandHierarchy = {};

  menus.forEach(menu => {
    let others = { ...menu };
    delete others["items"];
    menu.items.forEach(({ command, shortcut }) => {
      let currentHierarchy = commandHierarchy;

      shortcut.forEach((chord, index) => {
        let modifiers = chordArrayToString(getModifiersFromChord(chord));
        let letter = getLetterFromChord(chord);

        if (!(modifiers in currentHierarchy)) {
          currentHierarchy[modifiers] = {};
        }

        if (!(letter in currentHierarchy[modifiers])) {
          currentHierarchy[modifiers][letter] = {};
        }

        if (index === shortcut.length - 1) {
          currentHierarchy[modifiers][letter] = { command, ...others };
        }

        currentHierarchy = currentHierarchy[modifiers][letter];
      });
    });
  });

  return commandHierarchy;
}

export function navigateToSubmenu(commandHierarchy, shortcut) {
  let modifiers = getModifiersFromChord(shortcut[0]);
  let letter = getLetterFromChord(shortcut[0]);

  if (shortcut.length === 1) {
    return commandHierarchy[modifiers][letter];
  } else {
    return navigateToSubmenu(commandHierarchy);
  }
}

export const MACOS_COMMAND_HIERARCHY = {
  meta: {
    q: {
      command: "quit application"
    },
    space: {
      command: "spotlight search"
    }
  }
};

export const CHROME_COMMAND_HIERARCHY = {
  meta: {
    w: {
      command: "close tab"
    },
    t: {
      command: "new tab"
    },
    n: {
      command: "new window"
    },
    r: {
      command: "refresh"
    }
  },
  "meta+shift": {
    n: {
      command: "new incognito window"
    },
    r: {
      command: "hard refresh"
    }
  }
};

export const GOOGLE_DOCS_COMMAND_HIERARCHY = {
  meta: {
    b: {
      icon: "bold.png",
      command: "bold"
    },
    i: {
      command: "italics"
    },
    u: {
      command: "underline"
    },
    ".": {
      command: "superscript"
    },
    ",": {
      command: "subscript"
    },
    space: {
      command: "clear formatting"
    },
    backslash: {
      command: "clear formatting"
    },
    c: {
      command: "copy"
    },
    v: {
      command: "paste"
    },
    k: {
      command: "insert link"
    },
    f: {
      command: "find"
    },
    h: {
      command: "find and replace"
    }
    // g: {
    //   submenu: "submenu",
    //   meta: {
    //     w: {
    //       command: "wait"
    //     }
    //   }
    // }
  },
  alt: {
    f: {
      command: "file menu"
    },
    e: {
      command: "edit menu"
    },
    v: {
      command: "view menu"
    },
    i: {
      command: "insert menu"
    },
    o: {
      command: "format menu"
    },
    t: {
      command: "tools menu"
    },
    n: {
      command: "add-ons menu"
    },
    h: {
      command: "help menu"
    }
  },
  "meta+shift": {
    c: {
      command: "count words"
    },
    l: {
      command: "left align"
    },
    e: {
      command: "center align"
    },
    r: {
      command: "right align"
    },
    j: {
      command: "justify text"
    },
    "7": {
      command: "numbered list"
    },
    "8": {
      command: "bulleted list"
    },
    y: {
      command: "define word"
    },
    backslash: {
      command: "context menu"
    },
    x: {
      command: "context menu"
    }
  },
  "alt+shift": {
    "5": {
      command: "strikethrough"
    },

    f: {
      command: "file menu"
    },
    e: {
      command: "edit menu"
    },
    v: {
      command: "view menu"
    },
    i: {
      command: "insert menu"
    },
    o: {
      command: "format menu"
    },
    t: {
      command: "tools menu"
    },
    n: {
      command: "add-ons menu"
    },
    h: {
      command: "help menu"
    }
  },
  "alt+meta": {
    "0": {
      command: "normal text"
    },
    "1": {
      command: "heading 1"
    },
    "2": {
      command: "heading 2"
    },
    "3": {
      command: "heading 3"
    },
    "4": {
      command: "heading 4"
    },
    "5": {
      command: "heading 5"
    },
    "6": {
      command: "heading 6"
    },
    k: {
      command: "resize larger"
    },
    j: {
      command: "resize smaller"
    },
    c: {
      command: "copy formatting"
    },
    v: {
      command: "paste formatting"
    },
    f: {
      command: "insert footnote"
    },
    m: {
      command: "add comment"
    }
  },
  "alt+meta+shift": {
    z: {
      command: "switch to editing"
    },
    x: {
      command: "switch to suggesting"
    },
    c: {
      command: "switch to viewing"
    },
    a: {
      command: "open comments thread"
    }
  }
};

const hierarchies = {};

mergeCommandHierarchy(hierarchies, GOOGLE_DOCS_COMMAND_HIERARCHY);
mergeCommandHierarchy(hierarchies, MACOS_COMMAND_HIERARCHY);
mergeCommandHierarchy(hierarchies, CHROME_COMMAND_HIERARCHY);

export const all_hierarchies = hierarchies;
