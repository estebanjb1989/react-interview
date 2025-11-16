import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TodoItemsHeader from "./TodoItemsHeader";
import ListTile from "@/components/ListTile";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addItemLocal,
  toggleItemLocal,
  removeItemLocal,
  setItemsFetched,
  updateItemLocal
} from "@/store/slices/todoItemsSlice";

import {
  enqueueRequest,
  removeQueuedAddItem,
  updateQueuedAddItem,
  removeQueuedDeleteItem
} from "@/store/slices/syncSlice";

import {
  useGetTodoItemsQuery,
  useAddTodoItemMutation,
  useDeleteTodoItemMutation,
  useUpdateTodoItemMutation
} from "@/store/api/todoItemsApi";

import { Container } from "./styled";

export default function TodoListItemsPage() {
  const { id } = useParams();
  const numericId = Number(id);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data, isLoading } = useGetTodoItemsQuery(numericId);

  const list = useAppSelector((state) =>
    state.todoLists.lists.find((l) => l.id === numericId)
  );

  const queue = useAppSelector((state) => state.sync.queue);

  useEffect(() => {
    if (!data) return;

    dispatch(
      setItemsFetched({
        listId: numericId,
        todos: data,
      })
    );
  }, [data, dispatch, numericId]);

  const [value, setValue] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const [addTodoItem] = useAddTodoItemMutation();
  const [deleteTodoItem] = useDeleteTodoItemMutation();

  const addItem = async () => {
    if (!value.trim()) return;

    const description = value.trim();

    try {
      const created = await addTodoItem({
        listId: numericId,
        description,
        completed: false,
      }).unwrap();

      dispatch(
        addItemLocal({
          id: created.id,
          listId: numericId,
          description,
          completed: false,
        })
      );

      setValue("");
    } catch {
      const tempId = Date.now();

      dispatch(
        addItemLocal({
          id: tempId,
          listId: numericId,
          description,
          completed: false,
        })
      );

      dispatch(
        enqueueRequest({
          type: "ADD_ITEM",
          payload: {
            listId: numericId,
            id: tempId,
            description,
            completed: false,
          },
        })
      );

      setValue("");
    }
  };

  const [updateTodoItem] = useUpdateTodoItemMutation();

  const toggle = async (itemId: number) => {
    const item = list?.todos.find((i) => i.id === itemId);
    if (!item) return;

    const newCompleted = !item.completed;

    const pendingAdd = queue.find(
      (req) =>
        req.type === "ADD_ITEM" &&
        "listId" in req.payload &&
        req.payload.listId === numericId &&
        req.payload.id === itemId
    );

    if (pendingAdd) {
      dispatch(
        updateQueuedAddItem({
          listId: numericId,
          id: itemId,
          completed: newCompleted,
        })
      );

      dispatch(toggleItemLocal({ listId: numericId, itemId }));
      return;
    }

    try {
      await updateTodoItem({
        listId: numericId,
        itemId,
        description: item.description,
        completed: newCompleted,
      }).unwrap();

      dispatch(toggleItemLocal({ listId: numericId, itemId }));
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "status" in err) {
        const status = (err as { status: number }).status;
        if (status === 404) {
          dispatch(removeItemLocal({ listId: numericId, itemId }));
          return;
        }
      }

      dispatch(toggleItemLocal({ listId: numericId, itemId }));

      dispatch(
        enqueueRequest({
          type: "UPDATE_ITEM",
          payload: {
            listId: numericId,
            id: itemId,
            completed: newCompleted,
          },
        })
      );
    }
  };

  const remove = async (itemId: number) => {
    const item = list?.todos.find((i) => i.id === itemId);
    if (!item) return;

    const pendingAdd = queue.find(
      (req) =>
        req.type === "ADD_ITEM" &&
        "listId" in req.payload &&
        req.payload.listId === numericId &&
        req.payload.id === itemId
    );

    const isLocalId = itemId > 10_000_000_000;

    if (pendingAdd || isLocalId) {
      dispatch(removeItemLocal({ listId: numericId, itemId }));

      dispatch(removeQueuedAddItem({ listId: numericId, id: itemId }));

      return;
    }

    try {
      await deleteTodoItem({
        listId: numericId,
        itemId,
      }).unwrap();

      dispatch(removeItemLocal({ listId: numericId, itemId }));
      dispatch(removeQueuedDeleteItem({ listId: numericId, id: itemId }));
      dispatch(removeQueuedAddItem({ listId: numericId, id: itemId }));

    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "status" in err) {
        const status = (err as { status: number }).status;
        if (status === 404) {
          dispatch(removeItemLocal({ listId: numericId, itemId }));
          dispatch(removeQueuedAddItem({ listId: numericId, id: itemId }));
          dispatch(removeQueuedDeleteItem({ listId: numericId, id: itemId }));
          return;
        }
      }

      dispatch(removeItemLocal({ listId: numericId, itemId }));

      dispatch(
        enqueueRequest({
          type: "DELETE_ITEM",
          payload: { listId: numericId, id: itemId },
        })
      );

      dispatch(removeQueuedAddItem({ listId: numericId, id: itemId }));
    }
  };


  const startEditing = (todoId: number, current: string) => {
    setEditingId(todoId);
    setEditingValue(current);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveEditing = async () => {
    if (!editingId) return;

    const trimmed = editingValue.trim();
    if (!trimmed) return cancelEditing();

    const todoId = editingId;

    const item = list?.todos.find((t) => t.id === todoId);
    if (!item) return;

    cancelEditing();

    const pendingAdd = queue.find(
      (req) =>
        req.type === "ADD_ITEM" &&
        "listId" in req.payload &&
        req.payload.listId === numericId &&
        req.payload.id === todoId
    );

    if (pendingAdd) {
      dispatch(
        updateQueuedAddItem({
          listId: numericId,
          id: todoId,
          completed: item.completed,
        })
      );

      dispatch(
        toggleItemLocal({
          listId: numericId,
          itemId: todoId,
        })
      );

      return;
    }

    try {
      await updateTodoItem({
        listId: numericId,
        itemId: todoId,
        description: trimmed,
        completed: item.completed,
      }).unwrap();

      dispatch(updateItemLocal({
        listId: numericId,
        itemId: editingId,
        description: trimmed
      }));

    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "status" in err) {
        const status = (err as { status: number }).status;
        if (status === 404) {
          dispatch(removeItemLocal({ listId: numericId, itemId: todoId }));
          return;
        }
      }

      dispatch(
        enqueueRequest({
          type: "UPDATE_ITEM",
          payload: { listId: numericId, id: todoId, description: trimmed },
        })
      );

      dispatch(
        addItemLocal({
          id: todoId,
          listId: numericId,
          description: trimmed,
          completed: item.completed,
        })
      );
    }
  };

  if (!list) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <Container>
        <h2>Loading items...</h2>
      </Container>
    );
  }

  return (
    <Container>
      <TodoItemsHeader 
        listName={list.name}
        value={value}
        setValue={setValue}
        addItem={addItem}
      />

      {list.todos.map((todo) => {
        const isPending = queue.some(req =>
          (req.type === "ADD_ITEM" && req.payload.id === todo.id) ||
          (req.type === "UPDATE_ITEM" && req.payload.id === todo.id) ||
          (req.type === "DELETE_ITEM" && req.payload.id === todo.id)
        );
        return (
          <ListTile
            key={todo.id}
            name={todo.description}
            allowEditing
            isEditing={editingId === todo.id}
            editingValue={editingValue}
            onEditStart={() => startEditing(todo.id, todo.description)}
            onEditCancel={cancelEditing}
            onEditChange={(v) => setEditingValue(v)}
            onEditSave={saveEditing}
            onDelete={() => remove(todo.id)}
            hideChevron
            showCheckbox
            checked={todo.completed}
            onToggle={() => toggle(todo.id)}
            onOpen={() => { }}
            pending={isPending}
          />
        )
      })}
    </Container>
  );
}
