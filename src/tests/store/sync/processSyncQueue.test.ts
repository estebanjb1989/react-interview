import { configureStore } from "@reduxjs/toolkit";
import { processSyncQueue } from "@/store/sync/processSyncQueue";
import syncReducer, { enqueueRequest } from "@/store/slices/syncSlice";
import todoListsReducer from "@/store/slices/todoListsSlice";
import { todoApi, todoItemsApi } from "@/store/api";

jest.mock("@/store/api", () => ({
  todoApi: {
    endpoints: {
      addList: { initiate: jest.fn() },
      updateList: { initiate: jest.fn() },
      deleteList: { initiate: jest.fn() },
    },
  },
  todoItemsApi: {
    endpoints: {
      addTodoItem: { initiate: jest.fn() },
      updateTodoItem: { initiate: jest.fn() },
      deleteTodoItem: { initiate: jest.fn() },
    },
  },
}));

type UnwrapMock = {
  unwrap: () => Promise<unknown>;
};

type MockInitiateReturn = () => UnwrapMock;

type MockedEndpoint = {
  initiate: jest.Mock<MockInitiateReturn, [unknown]>;
};

const toMocked = (endpoint: unknown): MockedEndpoint =>
  endpoint as MockedEndpoint;

const mockApi = <Response>(
  endpoint: MockedEndpoint,
  response: Response
): void => {
  endpoint.initiate.mockImplementation(() => {
    return () => ({
      unwrap: () => Promise.resolve(response),
    });
  });
};

const mockApiError = (
  endpoint: MockedEndpoint,
  error: unknown
): void => {
  endpoint.initiate.mockImplementation(() => {
    return () => ({
      unwrap: () => Promise.reject(error),
    });
  });
};

const mockStore = () =>
  configureStore({
    reducer: {
      sync: syncReducer,
      todoLists: todoListsReducer,
    },
    middleware: (gDM) =>
      gDM({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });

describe("processSyncQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("processes ADD_LIST correctly", async () => {
    const store = mockStore();

    store.dispatch(
      enqueueRequest({
        type: "ADD_LIST",
        payload: { id: 111, name: "Local List" },
      })
    );

    mockApi(
      toMocked(todoApi.endpoints.addList),
      { id: 999, name: "Local List" }
    );

    await store.dispatch(processSyncQueue());

    expect(toMocked(todoApi.endpoints.addList).initiate).toHaveBeenCalledWith({
      name: "Local List",
    });

    expect(store.getState().sync.queue.length).toBe(0);
  });

  it("processes UPDATE_LIST correctly", async () => {
    const store = mockStore();

    store.dispatch(
      enqueueRequest({
        type: "UPDATE_LIST",
        payload: { id: 5, name: "NewName" },
      })
    );

    mockApi(
      toMocked(todoApi.endpoints.updateList),
      { id: 5, name: "NewName" }
    );

    await store.dispatch(processSyncQueue());

    expect(toMocked(todoApi.endpoints.updateList).initiate).toHaveBeenCalledWith({
      id: 5,
      name: "NewName",
    });

    expect(store.getState().sync.queue.length).toBe(0);
  });

  it("processes DELETE_LIST correctly", async () => {
    const store = mockStore();

    store.dispatch(
      enqueueRequest({
        type: "DELETE_LIST",
        payload: { id: 123 },
      })
    );

    mockApi(
      toMocked(todoApi.endpoints.deleteList),
      { ok: true }
    );

    await store.dispatch(processSyncQueue());

    expect(toMocked(todoApi.endpoints.deleteList).initiate).toHaveBeenCalledWith(123);

    expect(store.getState().sync.queue.length).toBe(0);
  });

  it("processes ADD_ITEM correctly", async () => {
    const store = mockStore();

    store.dispatch(
      enqueueRequest({
        type: "ADD_ITEM",
        payload: {
          listId: 1,
          id: 99,
          description: "Local desc",
          completed: false,
        },
      })
    );

    mockApi(
      toMocked(todoItemsApi.endpoints.addTodoItem),
      { id: 555, description: "Local desc", completed: false }
    );

    await store.dispatch(processSyncQueue());

    expect(toMocked(todoItemsApi.endpoints.addTodoItem).initiate).toHaveBeenCalledWith({
      listId: 1,
      description: "Local desc",
      completed: false,
    });

    expect(store.getState().sync.queue.length).toBe(0);
  });

  it("processes UPDATE_ITEM correctly", async () => {
    const store = mockStore();

    store.dispatch(
      enqueueRequest({
        type: "UPDATE_ITEM",
        payload: {
          listId: 1,
          id: 10,
          description: "NewDesc",
          completed: true,
        },
      })
    );

    mockApi(
      toMocked(todoItemsApi.endpoints.updateTodoItem),
      { id: 10, description: "NewDesc", completed: true }
    );

    await store.dispatch(processSyncQueue());

    expect(toMocked(todoItemsApi.endpoints.updateTodoItem).initiate).toHaveBeenCalledWith({
      listId: 1,
      itemId: 10,
      description: "NewDesc",
      completed: true,
    });

    expect(store.getState().sync.queue.length).toBe(0);
  });

  it("processes DELETE_ITEM correctly", async () => {
    const store = mockStore();

    store.dispatch(
      enqueueRequest({
        type: "DELETE_ITEM",
        payload: { listId: 1, id: 77 },
      })
    );

    mockApi(
      toMocked(todoItemsApi.endpoints.deleteTodoItem),
      { ok: true }
    );

    await store.dispatch(processSyncQueue());

    expect(toMocked(todoItemsApi.endpoints.deleteTodoItem).initiate).toHaveBeenCalledWith({
      listId: 1,
      itemId: 77,
    });

    expect(store.getState().sync.queue.length).toBe(0);
  });

  it("keeps request in queue on API error", async () => {
    const store = mockStore();

    store.dispatch(
      enqueueRequest({
        type: "ADD_LIST",
        payload: { id: 1, name: "Fail" },
      })
    );

    mockApiError(
      toMocked(todoApi.endpoints.addList),
      new Error("Network error")
    );

    await store.dispatch(processSyncQueue());

    expect(store.getState().sync.queue.length).toBe(1);
  });
});
