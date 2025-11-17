
import styled from "styled-components";

export const Container = styled.div`
  padding: 40px 0px;
  max-width: 600px;
  margin: auto;
`;

export const TodoItemRow = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: ${(p) => (p.completed ? "#f2f2f2" : "white")};
  border: 1px solid #ddd;
  border-radius: 12px;
  transition: 0.2s;

  .text {
    flex: 1;
    text-decoration: ${(p) => (p.completed ? "line-through" : "none")};
    opacity: ${(p) => (p.completed ? 0.6 : 1)};
  }
`;