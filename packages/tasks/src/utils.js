/**
 * Gets the OS of the user.
 */
export function getOS() {
  const oss = {
    Win: "Windows",
    Mac: "MacOS",
    X11: "UNIX",
    Linux: "Linux"
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
    sizeDocW: document.width,
    sizeDocH: document.height,
    sizeInW: window.innerWidth,
    sizeInH: window.innerHeight,
    sizeAvailW: window.screen.availWidth,
    sizeAvailH: window.screen.availHeight,
    scrColorDepth: window.screen.colorDepth,
    scrPixelDepth: window.screen.pixelDepth
  };
}
