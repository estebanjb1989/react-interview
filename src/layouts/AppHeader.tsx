import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/themeSlice";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import {
  ModeButton,
  IconCircle
} from './styled'

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <AppBar position="fixed" elevation={1} color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap>
            Todo App
          </Typography>
        </Box>

        <ModeButton onClick={() => dispatch(toggleTheme())}>
          <IconCircle dark={!darkMode} />
        </ModeButton>
      </Toolbar>
    </AppBar>
  );
}
