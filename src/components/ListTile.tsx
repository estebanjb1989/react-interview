import React from "react";
import { TextField, IconButton, Checkbox, InputAdornment } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SaveIcon from "@mui/icons-material/Save"; 

interface ListTileProps {
  name: string;

  isEditing: boolean;
  editingValue: string;

  onEditStart: () => void;
  onEditCancel: () => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;

  onDelete: () => void;
  onOpen: () => void;

  hideEditButton?: boolean;
  hideChevron?: boolean;

  showCheckbox?: boolean;
  checked?: boolean;
  onToggle?: () => void;

  allowEditing?: boolean;
  pending?: boolean;
}

function ListTile({
  name,
  isEditing,
  editingValue,

  onEditStart,
  onEditCancel,
  onEditChange,
  onEditSave,

  onDelete,
  onOpen,

  hideEditButton = false,
  hideChevron = false,

  showCheckbox = false,
  checked = false,
  onToggle,

  allowEditing = false,
  pending = false
}: ListTileProps) {
  return (
    <div
      style={{
        display: "flex",
        padding: "12px 16px",
        borderRadius: 8,
        border: "1px solid #ddd",
        marginBottom: 12,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {showCheckbox && (
          <Checkbox checked={checked} onChange={onToggle} />
        )}

        {!hideEditButton && !checked && (
          <IconButton onClick={onEditStart} aria-label="edit" size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        )}

        {isEditing ? (
          <TextField
            value={editingValue}
            size="small"
            autoFocus
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditSave();
              if (e.key === "Escape") onEditCancel();
            }}
            sx={{ width: 180 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="save"
                    onClick={onEditSave}
                    size="small"
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12
            }}
          >
            {pending && (
              <HourglassEmptyIcon
                fontSize="small"
                style={{ opacity: 0.7 }}
              />
            )}

            <strong
              style={{
                textDecoration: checked ? "line-through" : "none",
                opacity: checked ? 0.6 : 1,
                cursor: allowEditing ? "pointer" : "default",
              }}
              onClick={() => {
                if (allowEditing) onEditStart();
              }}
            >
              {name}
            </strong>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!checked && (
          <IconButton aria-label="delete" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        )}

        {!hideChevron && (
          <IconButton aria-label="go-to-list" onClick={onOpen}>
            <ChevronRightIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
}

export default React.memo(ListTile);
