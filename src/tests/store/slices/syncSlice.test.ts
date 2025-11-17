import reducer, {
  enqueueRequest,
  clearQueue,
  clearQueueForList,
  removeQueuedAddItem,
  removeQueuedDeleteItem,
  updateQueuedAddListName,
  updateQueuedAddItem,
  updateQueuedUpdateItem,
  dequeueRequest,
  updateQueueListId
} from "@/store/slices/syncSlice";

import type {
  SyncState,
  PendingRequest
} from "@/store/slices/sync/types";

const makeAddList = (id: number, name: string): PendingRequest => ({
  type: "ADD_LIST",
  payload: { id, name }
});

const makeAddItem = (
  listId: number,
  id: number,
  description = "Desc",
  completed = false
): PendingRequest => ({
  type: "ADD_ITEM",
  payload: { listId, id, description, completed }
});

const makeUpdateItem = (
  listId: number,
  id: number,
  completed?: boolean,
  description?: string
): PendingRequest => ({
  type: "UPDATE_ITEM",
  payload: { listId, id, completed, description: description }
});

const makeDeleteItem = (listId: number, id: number): PendingRequest => ({
  type: "DELETE_ITEM",
  payload: { listId, id }
});

const wrap = (queue: PendingRequest[]): SyncState => ({ queue });

describe("syncSlice", () => {
  const initial: SyncState = { queue: [] };

  it("enqueueRequest adds queueId", () => {
    const req = makeAddList(1, "A");
    const result = reducer(initial, enqueueRequest(req));

    expect(result.queue.length).toBe(1);

    const stored = result.queue[0];
    expect(stored.type).toBe("ADD_LIST");
    expect("queueId" in stored).toBe(true);
  });

  it("clearQueue clears the queue", () => {
    const mod = wrap([makeAddList(1, "A"), makeAddItem(1, 10)]);
    const result = reducer(mod, clearQueue());
    expect(result.queue.length).toBe(0);
  });

  it("clearQueueForList removes listId entries", () => {
    const state = wrap([
      makeAddList(1, "A"),
      makeAddItem(1, 100),
      makeDeleteItem(1, 100),
      makeAddList(2, "B"),
      makeAddItem(2, 50)
    ]);

    const result = reducer(state, clearQueueForList({ listId: 1 }));
    console.log({
      result: JSON.stringify(result, null, 2)
    })
    expect(result.queue.length).toBe(2);

    const r0 = result.queue[0];
    expect(r0.type).toBe("ADD_LIST");
    if (r0.type === "ADD_LIST") {
      expect(r0.payload.id).toBe(2);
    }

    const r1 = result.queue[1];
    expect(r1.type).toBe("ADD_ITEM");
    if (r1.type === "ADD_ITEM" && "listId" in r1.payload) {
      expect(r1.payload.listId).toBe(2);
    }
  });

  it("removeQueuedAddItem only removes the correct ADD_ITEM", () => {
    const state = wrap([makeAddItem(1, 10), makeAddItem(2, 20)]);

    const result = reducer(state, removeQueuedAddItem({ listId: 1, id: 10 }));

    expect(result.queue.length).toBe(1);

    const rem = result.queue[0];
    expect(rem.type).toBe("ADD_ITEM");

    if (rem.type === "ADD_ITEM" && "listId" in rem.payload) {
      expect(rem.payload.listId).toBe(2);
    }
  });

  it("updateQueuedAddListName updates name in ADD_LIST", () => {
    const state = wrap([makeAddList(1, "Old")]);

    const result = reducer(
      state,
      updateQueuedAddListName({ id: 1, name: "New" })
    );

    const req = result.queue[0];
    expect(req.type).toBe("ADD_LIST");

    if (req.type === "ADD_LIST" && "name" in req.payload) {
      expect(req.payload.name).toBe("New");
    }
  });

  it("updateQueuedAddItem updates completed in ADD_ITEM", () => {
    const state = wrap([makeAddItem(1, 10, "Test", false)]);

    const result = reducer(
      state,
      updateQueuedAddItem({ listId: 1, id: 10, completed: true, description: "Test" })
    );

    const req = result.queue[0];
    expect(req.type).toBe("ADD_ITEM");

    if (req.type === "ADD_ITEM" && "completed" in req.payload) {
      expect(req.payload.completed).toBe(true);
    }
  });

  it("updateQueuedUpdateItem updates completed in UPDATE_ITEM", () => {
    const state = wrap([makeUpdateItem(1, 10, false, "Old description")]);

    const result = reducer(
      state,
      updateQueuedUpdateItem({
        listId: 1,
        id: 10,
        completed: true,
        description: "New description"
      })
    );

    const req = result.queue[0];
    expect(req.type).toBe("UPDATE_ITEM");

    if (req.type === "UPDATE_ITEM" && "completed" in req.payload && "description" in req.payload) {
      expect(req.payload.completed).toBe(true);
      expect(req.payload.description).toBe("New description");
    }
  });

  it("removeQueuedDeleteItem only removes the correct DELETE_ITEM", () => {
    const state = wrap([makeDeleteItem(1, 10), makeDeleteItem(2, 20)]);

    const result = reducer(
      state,
      removeQueuedDeleteItem({ listId: 1, id: 10 })
    );

    expect(result.queue.length).toBe(1);

    const req = result.queue[0];
    expect(req.type).toBe("DELETE_ITEM");

    if (req.type === "DELETE_ITEM" && "listId" in req.payload) {
      expect(req.payload.listId).toBe(2);
    }
  });

  it("dequeueRequest removes by queueId", () => {
    const q1 = { ...makeAddList(1, "A"), queueId: "AAA" };
    const q2 = { ...makeAddList(2, "B"), queueId: "BBB" };

    const result = reducer(wrap([q1, q2]), dequeueRequest(q1));

    expect(result.queue.length).toBe(1);
    expect(result.queue[0].queueId).toBe("BBB");
  });

  it("updateQueueListId only deletes operations for ITEM", () => {
    const q0 = { ...makeAddItem(1, 10), queueId: "A" };
    const q1 = { ...makeUpdateItem(2, 20), queueId: "B" };
    const q2 = { ...makeDeleteItem(1, 30), queueId: "C" };
    const q3 = { ...makeAddList(1, "List1"), queueId: "D" };

    const state = wrap([q0, q1, q2, q3]);

    const result = reducer(
      state,
      updateQueueListId({ oldListId: 1, newListId: 99 })
    );

    const [r0, r1, r2, r3] = result.queue;

    if (r0.type === "ADD_ITEM" && "listId" in r0.payload)
      expect(r0.payload.listId).toBe(99);

    if (r2.type === "DELETE_ITEM" && "listId" in r2.payload)
      expect(r2.payload.listId).toBe(99);

    if (r1.type === "UPDATE_ITEM" && "listId" in r1.payload)
      expect(r1.payload.listId).toBe(2);

    expect(r3).toEqual(q3);
  });
});
