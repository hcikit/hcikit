import { Object } from 'es6-shim'

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a An array containing the items.
 */
export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Returns a random choice from the array.
 * @param {Array} a An array containing the options.
 */
export function randomChoice(a) {
  return a[Math.floor(Math.random() * a.length)]
}

/**
 * Returns a random choice from the array.
 * @param {Array} a An array containing the options.
 */
export function randomChoiceNoReplacement(a) {
  const index = [Math.floor(Math.random() * a.length)]
  const choice = a[index]
  a.splice(index, 1)

  return choice
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function randInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

/**
 * Generates a random GUID.
 */
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0

    var v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generates a random string.
 */
export function randomString() {
  return Math.random()
    .toString(36)
    .substring(2)
}

export function getOS() {
  const oss = {
    Win: 'Windows',
    Mac: 'MacOS',
    X11: 'UNIX',
    Linux: 'Linux'
  }

  for (const os of Object.keys(oss)) {
    if (navigator.appVersion.indexOf(os) >= 0) {
      return oss[os]
    }
  }

  return 'Unknown'
}

export function getBrowserInfo() {
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
    sizeDocW: document.width,
    sizeDocH: document.height,
    sizeInW: window.innerWidth,
    sizeInH: window.innerHeight,
    sizeAvailW: window.screen.availWidth,
    sizeAvailH: window.screen.availHeight,
    scrColorDepth: window.screen.colorDepth,
    scrPixelDepth: window.screen.pixelDepth
  }
}
