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
