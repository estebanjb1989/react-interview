export interface TodoItem {
  id: number;
  description: string;
  completed: boolean;
  listId: number;
}

export interface TodoList {
  id: number;
  name: string;
  todos: TodoItem[];
  dirty: boolean;
}
