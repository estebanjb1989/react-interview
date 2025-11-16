import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    transition: background 0.25s ease, color 0.25s ease;
  }
`;
