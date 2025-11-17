import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TodoItemsHeader from "./TodoItemsHeader";
import ListTile from "@/components/ListTile";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addItemLocal,
  toggleItemLocal,
  removeItemLocal,
  updateItemLocal
} from "@/store/slices/todoItemsSlice";

import {
  enqueueRequest,
  removeQueuedAddItem,
  removeQueuedUpdateItem,
  updateQueuedAddItem,
  removeQueuedDeleteItem,
  updateQueuedUpdateItem
} from "@/store/slices/syncSlice";

import {
  useGetTodoItemsQuery,
  useAddTodoItemMutation,
  useDeleteTodoItemMutation,
  useUpdateTodoItemMutation,
  useToggleCompleteAsyncMutation,
  todoItemsApi
} from "@/store/api/todoItemsApi";

import { useTodoListWebSocket } from "@/hook/useTodoListWebSocket";

import { Container } from "./styled";
import { Button } from "@mui/material";

export default function TodoListItemsPage() {
  const { id } = useParams();
  const numericId = Number(id);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: todosRemote = [], isLoading, isError } = useGetTodoItemsQuery(numericId);
  const todosLocal = useAppSelector((state) =>
    state.todoLists.lists.find(todoList => todoList.id === numericId)?.todos
  );

  const todos = isError ? todosLocal : todosRemote

  const todoListLocal = useAppSelector((state) =>
    state.todoLists.lists.find(todoList => todoList.id === numericId) || { name: "list" }
  );

  const queue = useAppSelector((state) => state.sync.queue);

  const [value, setValue] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const [addTodoItem] = useAddTodoItemMutation();
  const [deleteTodoItem] = useDeleteTodoItemMutation();
  const [toggleCompleteAll] = useToggleCompleteAsyncMutation();

  useTodoListWebSocket(Number(id), (msg) => {
    switch (msg.event) {
      case "toggle_complete_done":
        dispatch(todoItemsApi.util.invalidateTags([{ type: "TodoItems", id: Number(id) }]));
        break;

      case "toggle_complete_error":
        dispatch(todoItemsApi.util.invalidateTags([{ type: "TodoItems", id: Number(id) }]));
        break;
    }
  });

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
    const item = todos?.find((todo) => todo.id === itemId);
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
          description: item.description,
        })
      );
      dispatch(toggleItemLocal({ listId: numericId, itemId }));
      return;
    }

    const pendingUpdate = queue.find(
      (req) =>
        req.type === "UPDATE_ITEM" &&
        "listId" in req.payload &&
        req.payload.listId === numericId &&
        req.payload.id === itemId
    );

    if (pendingUpdate) {
      dispatch(
        updateQueuedUpdateItem({
          listId: numericId,
          id: itemId,
          completed: newCompleted,
          description: item.description,
        })
      );

      dispatch(toggleItemLocal({ listId: numericId, itemId }));
      return;
    }

    const pendingDelete = queue.find(
      (req) =>
        req.type === "DELETE_ITEM" &&
        "listId" in req.payload &&
        req.payload.listId === numericId &&
        req.payload.id === itemId
    );

    if (pendingDelete) {
      dispatch(removeQueuedDeleteItem({ listId: numericId, id: itemId }));

      dispatch(
        enqueueRequest({
          type: "UPDATE_ITEM",
          payload: {
            listId: numericId,
            id: itemId,
            completed: newCompleted,
            description: item.description,
          },
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
            description: item.description,
          },
        })
      );
    }
  };

  const remove = async (itemId: number) => {
    const item = todos?.find((todo) => todo.id === itemId);
    if (!item) return;

    const pendingDelete = queue.find(
      (req) =>
        req.type === "DELETE_ITEM" &&
        "listId" in req.payload &&
        req.payload.listId === numericId &&
        req.payload.id === itemId
    );

    if (pendingDelete) {
      return;
    }

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

    const pendingUpdate = queue.find(
      (req) =>
        req.type === "UPDATE_ITEM" &&
        "listId" in req.payload &&
        req.payload.listId === numericId &&
        req.payload.id === itemId
    );

    if (pendingUpdate || isLocalId) {
      dispatch(removeItemLocal({ listId: numericId, itemId }));

      dispatch(removeQueuedUpdateItem({ listId: numericId, id: itemId }));

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

      // dispatch(removeItemLocal({ listId: numericId, itemId }));

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

    const item = todos?.find((todo) => todo.id === todoId);
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
          description: trimmed
        })
      );

      dispatch(updateItemLocal({
        listId: numericId,
        itemId: editingId,
        description: trimmed,
        completed: item.completed
      }));

      return;
    }

    const pendingUpdate = queue.find(
      (req) =>
        req.type === "UPDATE_ITEM" &&
        "listId" in req.payload &&
        req.payload.listId === numericId &&
        req.payload.id === todoId
    );

    if (pendingUpdate) {
      dispatch(
        updateQueuedUpdateItem({
          listId: numericId,
          id: todoId,
          description: trimmed,
          completed: item.completed,
        })
      );

      dispatch(
        updateItemLocal({
          listId: numericId,
          itemId: todoId,
          description: trimmed,
          completed: item.completed
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
        description: trimmed,
        completed: item.completed
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
        updateItemLocal({
          itemId: todoId,
          listId: numericId,
          description: trimmed,
          completed: item.completed,
        })
      );
    }
  };

  const completeAllAsync = async ({ completed }: { completed: boolean }) => {
    if (!todos || todos.length === 0) return;

    const newCompleted = completed;

    try {
      await toggleCompleteAll({
        listId: numericId,
        completed: newCompleted
      }).unwrap();

      todos.forEach(todo => {
        dispatch(
          updateItemLocal({
            listId: numericId,
            itemId: todo.id,
            description: todo.description,
            completed: newCompleted
          })
        );
      });

      return;
    } catch {

      todos.forEach(todo => {
        const todoId = todo.id;

        const pendingAdd = queue.find(
          req =>
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
              completed: newCompleted,
              description: todo.description
            })
          );

          dispatch(
            updateItemLocal({
              listId: numericId,
              itemId: todoId,
              description: todo.description,
              completed: newCompleted
            })
          );

          return;
        }

        const pendingUpdate = queue.find(
          req =>
            req.type === "UPDATE_ITEM" &&
            "listId" in req.payload &&
            req.payload.listId === numericId &&
            req.payload.id === todoId
        );

        if (pendingUpdate) {
          dispatch(
            updateQueuedUpdateItem({
              listId: numericId,
              id: todoId,
              completed: newCompleted,
              description: todo.description
            })
          );

          dispatch(
            updateItemLocal({
              listId: numericId,
              itemId: todoId,
              description: todo.description,
              completed: newCompleted
            })
          );

          return;
        }

        const pendingDelete = queue.find(
          req =>
            req.type === "DELETE_ITEM" &&
            "listId" in req.payload &&
            req.payload.listId === numericId &&
            req.payload.id === todoId
        );

        const pendingAddForDelete = queue.find(
          req =>
            req.type === "ADD_ITEM" &&
            "listId" in req.payload &&
            req.payload.listId === numericId &&
            req.payload.id === todoId
        );

        const pendingUpdateForDelete = queue.find(
          req =>
            req.type === "UPDATE_ITEM" &&
            "listId" in req.payload &&
            req.payload.listId === numericId &&
            req.payload.id === todoId
        );

        if (pendingAddForDelete) {
          dispatch(removeQueuedAddItem({ listId: numericId, id: todoId }));

          dispatch(
            updateItemLocal({
              listId: numericId,
              itemId: todoId,
              description: todo.description,
              completed: newCompleted
            })
          );

          return;
        }

        if (pendingUpdateForDelete) {
          dispatch(removeQueuedUpdateItem({ listId: numericId, id: todoId }));

          dispatch(
            enqueueRequest({
              type: "DELETE_ITEM",
              payload: { listId: numericId, id: todoId }
            })
          );

          return;
        }

        if (pendingDelete) {
          return;
        }

        dispatch(
          updateItemLocal({
            listId: numericId,
            itemId: todoId,
            description: todo.description,
            completed: newCompleted
          })
        );

        dispatch(
          enqueueRequest({
            type: "UPDATE_ITEM",
            payload: {
              listId: numericId,
              id: todoId,
              completed: newCompleted,
              description: todo.description
            }
          })
        );
      });
    };
  }

  if (!todos) {
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

  const allCompleted = todos.length > 0 && todos.every(todo => todo.completed);

  return (
    <Container>
      <TodoItemsHeader
        listName={todoListLocal?.name}
        value={value}
        setValue={setValue}
        addItem={addItem}
      />

      {todos?.length > 0 ?
        <Button onClick={() => completeAllAsync({
          completed: !allCompleted
        })}>
          {allCompleted ? "Mark all as undone" : "Mark all as done"}
        </Button> : null}

      {todos.map((todo) => {
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
