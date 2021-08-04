/**
 * Shuffles array in place. ES6 version
 * @param {Array} a An array containing the items.
 */
export function shuffle<T>(a: Array<T>): Array<T> {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns a random choice from the array.
 * @param {Array} a An array containing the options.
 */
export function randomChoice<T>(a: Array<T>): T {
  return a[Math.floor(Math.random() * a.length)];
}

/**
 * Returns a random choice from the array.
 * @param {Array} a An array containing the options.
 */
export function randomChoiceNoReplacement<T>(a: Array<T>): T {
  const index = Math.floor(Math.random() * a.length);
  const choice = a[index];
  a.splice(index, 1);

  return choice;
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function randInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}

/**
 * Generates a random GUID.
 */
export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}

/**
 * Generates a random string.
 */
export function randomString(): string {
  return Math.random().toString(36).substring(2);
}

type OS = "Windows" | "MacOS" | "UNIX" | "Linux" | "Unknown";
/**
 * Gets the OS of the user.
 */
export function getOS(): OS {
  const oss: Record<string, OS> = {
    Win: "Windows",
    Mac: "MacOS",
    X11: "UNIX",
    Linux: "Linux",
  };

  for (const os of Object.keys(oss)) {
    if (navigator.appVersion.indexOf(os) >= 0) {
      return oss[os];
    }
  }

  return "Unknown";
}

/**
 * Grabs a bunch of info from the browser for logging. Tries not to include too much information but there is more such as the location API etc.
 */
export function getBrowserInfo() {
  // https://stackoverflow.com/a/37093316/1036813
  return {
    browserName: navigator.appName,
    browserEngine: navigator.product,
    browserVersion1a: navigator.appVersion,
    browserVersion1b: navigator.userAgent,
    browserLanguage: navigator.language,
    browserOnline: navigator.onLine,
    browserPlatform: navigator.platform,
    sizeScreenW: window.screen.width,
    sizeScreenH: window.screen.height,
    sizeInW: window.innerWidth,
    sizeInH: window.innerHeight,
    sizeAvailW: window.screen.availWidth,
    sizeAvailH: window.screen.availHeight,
    scrColorDepth: window.screen.colorDepth,
    scrPixelDepth: window.screen.pixelDepth,
  };
}

export function getMturkParameters(
  defaults = {
    participant: "worker",
    worker_id: "",
    assignment_id: "",
    hit_id: "",
  }
) {
  // TODO: use a random number instead of defaults.
  const params = new URL(window.location.href).searchParams;

  const participant =
    params.get("WORKER_ID") ||
    defaults.participant ||
    `${randomString()}-default`;

  // eslint-disable-next-line camelcase
  const worker_id =
    params.get("WORKER_ID") ||
    defaults.worker_id ||
    `${randomString()}-default`;

  // eslint-disable-next-line camelcase
  const assignment_id =
    params.get("ASSIGNMENT_ID") ||
    defaults.assignment_id ||
    `${randomString()}-default`;

  // eslint-disable-next-line camelcase
  const hit_id =
    params.get("HIT_ID") || defaults.hit_id || `${randomString()}-default`;

  return {
    participant,
    hit_id,
    worker_id,
    assignment_id,
  };
}
