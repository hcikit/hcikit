import { Configuration } from "@hcikit/workflow";
import { throttle, DebouncedFunc } from "lodash-es";

export abstract class BasePersistence {
  throttleAmount = 1000;

  saveThrottled: DebouncedFunc<(state: Configuration) => Promise<void>>;
  flush: () => Promise<void> | undefined;

  constructor() {
    this.saveThrottled = throttle(this.save, this.throttleAmount);
    this.flush = this.saveThrottled.flush;
  }
  abstract load(): Promise<Configuration | undefined>;
  abstract save(state: Configuration): Promise<void>;
  abstract clear(): Promise<void>;
  abstract init(): Promise<void>;
}

export class StoragePersistence extends BasePersistence {
  storage: Storage = window.sessionStorage;
  state_key: string = "HCIKIT_LOGS";

  constructor(storage = window.sessionStorage, state_key = "HCIKIT_LOGS") {
    super();
    this.storage = storage;
    this.state_key = state_key;
  }

  async init() {}

  async load(): Promise<Configuration | undefined> {
    try {
      const state = this.storage.getItem(this.state_key);
      if (state) {
        return JSON.parse(state);
      }
    } catch (err) {
      console.error("Failed to load from sessionStorage", err);
    }

    return undefined;
  }

  async save(state: Configuration) {
    try {
      this.storage.setItem(this.state_key, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save to sessionStorage", err);
    }
  }

  async clear() {
    try {
      this.storage.removeItem(this.state_key);
    } catch (err) {
      console.error("Failed to clear sessionStorage", err);
    }
  }
}

// TODO: this is a bit tricky because it actually should maybe use the experiment name? I should maybe make the experiment name a required attribute.
export class FileSystemPersistence extends BasePersistence {
  filename: string = "hcikit.json";
  fileHandle: FileSystemFileHandle | undefined = undefined;

  constructor(filename = "hcikit.json") {
    super();
    this.filename = filename;
  }

  async init() {
    // try to create the file using origin private file system
    const opfsRoot = await navigator.storage.getDirectory();
    this.fileHandle = await opfsRoot.getFileHandle(this.filename, {
      create: true,
    });
  }

  async load(): Promise<Configuration | undefined> {
    try {
      if (this.fileHandle) {
        const file = await this.fileHandle.getFile();
        const contents = await file.text();
        if (contents) {
          return JSON.parse(contents);
        }
      }
    } catch (err) {
      console.error("Failed to load from origin private file system", err);
    }

    return undefined;
  }

  async save(config: Configuration) {
    try {
      // const file = await this.file.getFile();
      if (this.fileHandle) {
        const writable = await this.fileHandle.createWritable();
        // Write the contents of the file to the stream.
        await writable.write(JSON.stringify(config));
        // Close the stream, which persists the contents.
        await writable.close();
      }
    } catch (err) {
      console.error("Failed to save to origin private file system", err);
    }
  }

  async clear(): Promise<void> {
    if (this.fileHandle) {
      const writable = await this.fileHandle.createWritable();
      // Write the contents of the file to the stream.
      await writable.write(JSON.stringify(""));
      // Close the stream, which persists the contents.
      await writable.close();
    }
  }
}
