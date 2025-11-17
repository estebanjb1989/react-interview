import {
  addItemLocal,
  toggleItemLocal,
  removeItemLocal,
  conciliateItemIds,
  setItemsFetched,
  updateItemLocal,
  itemsReducerHOF,
} from "@/store/slices/todoItemsSlice";

import { TodoItem, TodoList } from "@/types/TodoList";

describe("todoItemsSlice + itemsReducerHOF", () => {
  const baseState = {
    todoLists: {
      lists: [
        {
          id: 1,
          name: "List 1",
          dirty: false,
          todos: [
            { id: 10, listId: 1, description: "A", completed: false },
            { id: 11, listId: 1, description: "B", completed: true },
          ],
        },
      ] as TodoList[],
    },
  };

  const clone = <T>(obj: T): T =>
    JSON.parse(JSON.stringify(obj)) as T;

  it("should add a new item to a list", () => {
    const state = clone(baseState);

    const action = addItemLocal({
      id: 100,
      listId: 1,
      description: "Nuevo",
      completed: false,
    });

    const result = itemsReducerHOF(state, action);

    expect(result.todoLists?.lists[0].todos.length).toBe(3);
  });

  it("should NOT add item if list does not exist", () => {
    const state = clone(baseState);

    const action = addItemLocal({
      id: 100,
      listId: 999,
      description: "Test",
      completed: false,
    });

    const result = itemsReducerHOF(state, action);

    expect(result).toEqual(state);
  });

  it("should toggle an item", () => {
    const state = clone(baseState);

    const action = toggleItemLocal({ listId: 1, itemId: 10 });

    const result = itemsReducerHOF(state, action);

    expect(result.todoLists?.lists[0].todos[0].completed).toBe(true);
  });

  it("should do nothing if item doesn't exist", () => {
    const state = clone(baseState);

    const action = toggleItemLocal({ listId: 1, itemId: 999 });

    const result = itemsReducerHOF(state, action);

    expect(result).toEqual(state);
  });

  it("should remove an item", () => {
    const state = clone(baseState);

    const action = removeItemLocal({ listId: 1, itemId: 10 });

    const result = itemsReducerHOF(state, action);

    expect(result.todoLists?.lists[0].todos.length).toBe(1);
  });

  it("should replace localId with serverId", () => {
    const state = {
      todoLists: {
        lists: [
          {
            id: 1,
            name: "L",
            dirty: false,
            todos: [
              {
                id: -1,
                listId: 1,
                description: "Local pending",
                completed: false,
              },
            ],
          },
        ],
      },
    };

    const action = conciliateItemIds({
      listId: 1,
      localId: -1,
      serverId: 500,
    });

    const result = itemsReducerHOF(state, action);

    expect(result.todoLists?.lists[0].todos[0].id).toBe(500);
  });

  it("should merge fetched + local items", () => {
    const state = {
      todoLists: {
        lists: [
          {
            id: 1,
            name: "L",
            dirty: false,
            todos: [
              { id: -1, listId: 1, description: "Local only", completed: false },
              { id: 20, listId: 1, description: "Old server", completed: true },
            ],
          },
        ],
      },
    };

    const fetched: TodoItem[] = [
      { id: 20, listId: 1, description: "Updated server", completed: true },
      { id: 21, listId: 1, description: "New from server", completed: false },
    ];

    const action = setItemsFetched({ listId: 1, todos: fetched });

    const result = itemsReducerHOF(state, action);

    expect(result.todoLists?.lists[0].todos.length).toBe(3);
  });

  it("should update item description", () => {
    const state = clone(baseState);

    const action = updateItemLocal({
      listId: 1,
      itemId: 10,
      description: "EDITED",
      completed: state.todoLists.lists[0].todos[0].completed
    });

    const result = itemsReducerHOF(state, action);

    expect(result.todoLists?.lists[0].todos[0].completed).toBe(false);
    expect(result.todoLists?.lists[0].todos[0].description).toBe("EDITED");
  });

  it("should do nothing if item does not exist", () => {
    const state = clone(baseState);

    const action = updateItemLocal({
      listId: 1,
      itemId: 999,
      description: "X",
      completed: false
    });

    const result = itemsReducerHOF(state, action);

    expect(result).toEqual(state);
  });

  it("should do nothing if list does not exist", () => {
    const state = clone(baseState);

    const action = updateItemLocal({
      listId: 999,
      itemId: 10,
      description: "X",
      completed: false
    });

    const result = itemsReducerHOF(state, action);

    expect(result).toEqual(state);
  });
});
