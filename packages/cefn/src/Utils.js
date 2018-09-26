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

// Return array of string values, or NULL if CSV string not well formed.
// https://stackoverflow.com/a/8497474/1036813
export function CSVtoArray(text) {
  var reValid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/
  var reValue = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g
  // Return NULL if input string is not well formed CSV string.
  if (!reValid.test(text)) return null
  var a = [] // Initialize array to receive values.
  text.replace(
    reValue, // "Walk" the string using replace with callback.
    function(m0, m1, m2, m3) {
      // Remove backslash from \' in single quoted values.
      if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"))
      // Remove backslash from \" in double quoted values.
      else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'))
      else if (m3 !== undefined) a.push(m3)
      return '' // Return empty string.
    }
  )
  // Handle special case of empty last value.
  if (/,\s*$/.test(text)) a.push('')
  return a
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
