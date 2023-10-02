import { FileSystemPersistence, StoragePersistence } from ".";

describe("storage persistence", () => {
  it("saves, loads, and clears storage properly", async () => {
    const storage = new StoragePersistence();
    const obj = { foo: "bar" };
    storage.init();

    storage.save(obj);

    const received = await storage.load();

    expect(received).toEqual(obj);
    storage.clear();

    const receivedAfterClear = await storage.load();

    expect(receivedAfterClear).toEqual(undefined);
  });

  it("saves, loads, and clears storage properly with a different key and local", async () => {
    const storage = new StoragePersistence(window.localStorage, "NEW_KEY");
    const obj = { foo: "bar" };
    storage.init();

    storage.save(obj);

    const received = await storage.load();

    expect(received).toEqual(obj);
    storage.clear();

    const receivedAfterClear = await storage.load();

    expect(receivedAfterClear).toEqual(undefined);
  });
});

// Skipping because this is not currently mocked
xdescribe("origin private file system", () => {
  it("saves, loads, and clears storage properly", async () => {
    const storage = new FileSystemPersistence();
    const obj = { foo: "bar" };
    storage.init();
    storage.save(obj);

    const received = await storage.load();
    console.log(received);
    expect(received).toEqual(obj);
    storage.clear();

    const receivedAfterClear = await storage.load();

    expect(receivedAfterClear).toEqual(undefined);
  });
});
