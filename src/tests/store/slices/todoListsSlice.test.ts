// tests/todoListsSlice.test.ts
import reducer, {
    setTodoLists,
    addListLocal,
    removeListLocal,
    conciliateIds,
    updateListLocal,
} from "@/store/slices/todoListsSlice";

import { TodoList } from "@/types/TodoList";

describe("todoListsSlice", () => {
    it("should return initial state", () => {
        const state = reducer(undefined, { type: "@@INIT" });

        expect(state).toEqual({
            lists: []
        });
    });

    it("should set the todo lists", () => {
        const data: TodoList[] = [
            { id: 1, name: "List 1", todos: [], dirty: false },
            { id: 2, name: "List 2", todos: [], dirty: false },
        ];

        const state = reducer(undefined, setTodoLists(data));

        expect(state.lists.length).toBe(2);
        expect(state.lists[0].name).toBe("List 1");
    });

    it("should add a new list locally", () => {
        const initial = { lists: [] };

        const state = reducer(
            initial,
            addListLocal({ id: 123, name: "Nueva Lista" })
        );

        expect(state.lists.length).toBe(1);
        expect(state.lists[0]).toEqual({
            id: 123,
            name: "Nueva Lista",
            todos: [],
            dirty: false
        });
    });

    it("should remove a list by id", () => {
        const initial = {
            lists: [
                { id: 1, name: "A", todos: [], dirty: false },
                { id: 2, name: "B", todos: [], dirty: false },
            ],
        };

        const state = reducer(initial, removeListLocal({ id: 1 }));

        expect(state.lists.length).toBe(1);
        expect(state.lists[0].id).toBe(2);
    });

    it("should update localId to real id", () => {
        const initial = {
            lists: [
                { id: -99, name: "Temporal", todos: [], dirty: false },
            ],
        };

        const state = reducer(
            initial,
            conciliateIds({ localId: -99, id: 500 })
        );

        expect(state.lists[0].id).toBe(500);
    });

    it("should update list name", () => {
        const initial = {
            lists: [
                { id: 10, name: "Old Name", todos: [], dirty: false }
            ],
        };

        const state = reducer(
            initial,
            updateListLocal({ id: 10, name: "New Name" })
        );

        expect(state.lists[0].name).toBe("New Name");
    });

    it("should update dirty flag", () => {
        const initial = {
            lists: [
                { id: 10, name: "List", todos: [], dirty: false }
            ],
        };

        const state = reducer(
            initial,
            updateListLocal({ id: 10, dirty: true })
        );

        expect(state.lists[0].dirty).toBe(true);
    });

    it("should do nothing if list does not exist", () => {
        const initial = {
            lists: [
                { id: 1, name: "A", todos: [], dirty: false }
            ],
        };

        const state = reducer(
            initial,
            updateListLocal({ id: 999, name: "X" })
        );

        expect(state).toEqual(initial);
    });
});