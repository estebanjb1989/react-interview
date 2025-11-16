import React from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface TodoItemsHeaderProps {
  listName: string;
  value: string;
  setValue: (value: string) => void;
  addItem: () => void;
}

export default function TodoItemsHeader({
  listName,
  value,
  setValue,
  addItem,
}: TodoItemsHeaderProps) {
  const navigate = useNavigate();

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
      {/* Back button */}
      <Button
        variant="text"
        onClick={() => navigate("/")}
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: "flex-start" }}
      >
        Back
      </Button>

      {/* List Title */}
      <Typography variant="h5" fontWeight={600}>
        {listName}
      </Typography>

      {/* Add Todo */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="New todo"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ flex: 1 }}
        />

        <Button variant="contained" onClick={addItem} size="large">
          Add
        </Button>
      </Box>
    </Paper>
  );
}
