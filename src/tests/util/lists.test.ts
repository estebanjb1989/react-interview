import { mergeLists } from "@/util/lists";

interface Item {
  id: number;
  dirty: boolean;
  value: string;
}

describe("mergeLists", () => {

  it("returns empty when both arrays are empty", () => {
    const result = mergeLists<Item>([], []);
    expect(result).toEqual([]);
  });

  it("returns server items when local is empty", () => {
    const server = [
      { id: 1, dirty: false, value: "A" },
      { id: 2, dirty: false, value: "B" },
    ];

    const result = mergeLists<Item>([], server);

    expect(result).toEqual(server);
  });

  it("returns local items when server is empty", () => {
    const local = [
      { id: 1, dirty: false, value: "L1" },
      { id: 2, dirty: true, value: "L2" },
    ];

    const result = mergeLists<Item>(local, []);

    expect(result).toEqual(local);
  });

  it("local dirty items overwrite server items, but keep dirty=false if server had it", () => {
    const local = [
      { id: 1, dirty: true, value: "local" },
    ];

    const server = [
      { id: 1, dirty: false, value: "server" },
    ];

    const result = mergeLists<Item>(local, server);

    expect(result).toEqual([
      { id: 1, dirty: false, value: "local" } // value from local, dirty reset
    ]);
  });

  it("local dirty items stay dirty if the server does NOT have the item", () => {
    const local = [
      { id: 1, dirty: true, value: "local" },
    ];

    const server: Item[] = [];

    const result = mergeLists<Item>(local, server);

    expect(result).toEqual([
      { id: 1, dirty: true, value: "local" } // stays dirty
    ]);
  });

  it("local non-dirty items do NOT overwrite server items", () => {
    const local = [
      { id: 1, dirty: false, value: "local" },
    ];

    const server = [
      { id: 1, dirty: false, value: "server" },
    ];

    const result = mergeLists<Item>(local, server);

    expect(result).toEqual(server);
  });

  it("local non-dirty items are added if server does not have them", () => {
    const local = [
      { id: 3, dirty: false, value: "local3" },
    ];

    const server = [
      { id: 1, dirty: false, value: "s1" },
    ];

    const result = mergeLists<Item>(local, server);

    expect(result).toEqual([
      { id: 1, dirty: false, value: "s1" },
      { id: 3, dirty: false, value: "local3" },
    ]);
  });

  it("merges mixed lists correctly", () => {
    const local = [
      { id: 1, dirty: true, value: "L1" },  // overwrite + clean
      { id: 2, dirty: false, value: "L2" }, // ignored (server wins)
      { id: 4, dirty: false, value: "L4" }, // added
    ];

    const server = [
      { id: 1, dirty: false, value: "S1" },
      { id: 2, dirty: false, value: "S2" },
      { id: 3, dirty: false, value: "S3" },
    ];

    const result = mergeLists<Item>(local, server);

    expect(result).toEqual([
      { id: 1, dirty: false, value: "L1" }, // dirty local overwrote server
      { id: 2, dirty: false, value: "S2" }, // server kept
      { id: 3, dirty: false, value: "S3" }, // server kept
      { id: 4, dirty: false, value: "L4" }, // local added
    ]);
  });

});
