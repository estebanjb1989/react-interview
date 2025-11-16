import { useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "@/styles/global";
import { lightTheme, darkTheme } from "@/styles/theme";
import AppLayout from "@/layouts/AppLayout";
import TodoListsPage from "@/pages/TodoListsPage/index";
import TodoListItemsPage from "@/pages/TodoListItemsPage/index";
import { Routes, Route } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { processSyncQueue } from "@/store/sync/processSyncQueue";

function App() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const queue = useAppSelector((state) => state.sync.queue);
  const hasSyncedOnStartup = useRef(false);

  useEffect(() => {
    if (!hasSyncedOnStartup.current) {
      hasSyncedOnStartup.current = true;

      if (navigator.onLine && queue.length > 0) {
        dispatch(processSyncQueue());
      }
    }

    function handleOnline() {
      if (queue.length > 0) {
        dispatch(processSyncQueue());
      }
    }

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [dispatch, queue.length]);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <GlobalStyle />

      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<TodoListsPage />} />
            <Route path="/lists/:id" element={<TodoListItemsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
