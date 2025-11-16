import { Box, Paper, TextField, Button, Typography } from "@mui/material";

interface TodoListHeaderProps {
  value: string;
  setValue: (value: string) => void;
  createList: () => void;
}

export default function TodoListHeader({
  value,
  setValue,
  createList,
}: TodoListHeaderProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mb: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" fontWeight={600}>
        Todo Lists
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="New list"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ flex: 1 }}
        />

        <Button variant="contained" size="large" onClick={createList}>
          Add
        </Button>
      </Box>
    </Paper>
  );
}
