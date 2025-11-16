import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListTile from "@/components/ListTile"
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    addListLocal,
    removeListLocal,
    conciliateIds,
    setTodoLists,
    updateListLocal
} from "@/store/slices/todoListsSlice";
import {
    useAddListMutation,
    useDeleteListMutation,
    useGetTodoListsQuery,
    useUpdateListMutation
} from "@/store/api/todoApi";
import { enqueueRequest, clearQueueForList, updateQueuedAddListName } from "@/store/slices/syncSlice";

import { TodoList } from "@/types/TodoList";

import { mergeLists } from "@/util/lists";
import { usePrevious } from "@/hook/usePrevious";
import {
    Container
} from "./styled"
import TodoListHeader from "./TodoListHeader";

export default function TodoListsPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [addList] = useAddListMutation();
    const [deleteList] = useDeleteListMutation();
    const [updateList] = useUpdateListMutation();

    const { data: serverLists, isLoading, isSuccess } = useGetTodoListsQuery();

    const prevServer = usePrevious(serverLists);
    const lists = useAppSelector((state) => state.todoLists.lists);
    const queue = useAppSelector((state) => state.sync.queue);
    const [value, setValue] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState("");

    useEffect(() => {
        if (isLoading) return;
        if (!isSuccess) return;
        if (!serverLists) return;

        if (prevServer === serverLists) return;

        const merged = mergeLists<TodoList>(lists, serverLists);

        if (JSON.stringify(merged) !== JSON.stringify(lists)) {
            dispatch(setTodoLists(merged));
        }

    }, [
        isSuccess,
        serverLists,
        isLoading,
        lists,
        dispatch,
        prevServer, // importante
    ]);

    const startEditing = (list: TodoList) => {
        setEditingId(list.id);
        setEditingValue(list.name);
    };

    const saveEditing = async () => {
        if (!editingId) return;

        const trimmed = editingValue?.trim()
        if (!trimmed) {
            cancelEditing();
            return;
        }

        const id = editingId

        dispatch(updateListLocal({ id, name: trimmed, dirty: true }));

        setEditingId(null);
        setEditingValue("");

        try {
            const updated = await updateList({ id, name: trimmed }).unwrap();

            dispatch(
                updateListLocal({
                    id: updated.id,
                    name: updated.name,
                    dirty: false,
                })
            );
        } catch (err: unknown) {
            if (typeof err === "object" && err !== null && "status" in err) {
                const status = (err as { status: number }).status;

                if (status) {
                    const hasPendingAdd = queue.some(
                        (req) =>
                            req.type === "ADD_LIST" &&
                            req.payload.id === id
                    );

                    const isLocalId = id > 10_000_000_000;

                    if (hasPendingAdd || isLocalId) {
                        dispatch(
                            updateQueuedAddListName({
                                id: id,
                                name: trimmed,
                            })
                        );
                    } else {
                        dispatch(
                            enqueueRequest({
                                type: "UPDATE_LIST",
                                payload: { id, name: trimmed },
                            })
                        );
                    }

                    return;
                }
            }

            console.error("Unexpected app error (update list):", err);
        }
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingValue("");
    };

    const createList = async () => {
        if (!value.trim()) return;

        const name = value.trim();
        const localId = Date.now();

        dispatch(addListLocal({ name, id: localId }));
        setValue("");

        try {
            const created = await addList({ name }).unwrap();

            if (!created?.id) {
                throw new Error("Invalid server response: missing ID");
            }

            dispatch(conciliateIds({ localId, id: created.id }))
        } catch (err: unknown) {
            if (typeof err === "object" && err !== null && "status" in err) {
                const status = (err as { status: number }).status;
                if (status) {
                    dispatch(
                        enqueueRequest({
                            type: "ADD_LIST",
                            payload: { name, id: localId },
                        })
                    );
                    return;
                }
            }

            console.error("Unexpected app error:", err);
        }
    };

    const deleteListHandler = async (id: number) => {
        if (editingId === id) {
            cancelEditing();
        }

        const pendingDelete = queue.find(
            (req) => req.type === "DELETE_LIST" && req.payload.id === id
        );
        if (pendingDelete) return;

        const pendingAdd = queue.find(
            (req) => req.type === "ADD_LIST" && req.payload.id === id
        );

        const isLocalId = id > 10_000_000_000;

        if (pendingAdd || isLocalId) {
            dispatch(removeListLocal({ id }));

            dispatch(clearQueueForList({ listId: id }));

            return;
        }

        try {
            await deleteList(id).unwrap();

            dispatch(removeListLocal({ id }));
            dispatch(clearQueueForList({ listId: id }));
            return;

        } catch (err: unknown) {
            if (typeof err === "object" && err !== null && "status" in err) {
                const status = (err as { status: number }).status;
                if (status) {
                    if (err.status === 404) {
                        dispatch(removeListLocal({ id }));
                        dispatch(clearQueueForList({ listId: id }));
                        return;
                    }

                    dispatch(
                        enqueueRequest({
                            type: "DELETE_LIST",
                            payload: { id },
                        })
                    );
                    return;
                }
            }

            dispatch(
                enqueueRequest({
                    type: "DELETE_LIST",
                    payload: { id },
                })
            );
        }
    };


    return (
        <Container>
            <TodoListHeader 
                value={value}
                setValue={setValue}
                createList={createList}
            />

            {isLoading ? <span>Loading...</span> : lists.map((list) => {
                const isPending = queue.some(req =>
                    (req.type === "ADD_LIST" &&
                        (req.payload as { id?: number }).id === list.id) ||

                    (req.type === "UPDATE_LIST" &&
                        (req.payload as { id: number }).id === list.id) ||

                    (req.type === "DELETE_LIST" &&
                        (req.payload as { id: number }).id === list.id)
                );
                return (
                    <ListTile
                        key={list.id}
                        name={list.name}
                        isEditing={editingId === list.id}
                        editingValue={editingValue}
                        onEditStart={() => startEditing(list)}
                        onEditCancel={cancelEditing}
                        onEditChange={setEditingValue}
                        onEditSave={saveEditing}
                        onDelete={() => deleteListHandler(list.id)}
                        onOpen={() => {
                            if (editingId !== null) cancelEditing();
                            navigate(`/lists/${list.id}`);
                        }}
                        pending={isPending}
                    />
                )
            })}
        </Container>
    );
}
