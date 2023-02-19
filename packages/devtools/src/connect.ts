import DevtoolsRelayPlugin from "./DevtoolsRelayPlugin";

console.log("hello");

declare global {
  interface Window {
    __HCIKIT_DEVTOOLS_EXTENSION__: DevtoolsRelayPlugin;
  }
}

window.__HCIKIT_DEVTOOLS_EXTENSION__ = new DevtoolsRelayPlugin();

export {};
