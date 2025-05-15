import React, { useLayoutEffect, useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  TextField,
  ListItem,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useList } from "@refinedev/core";
import { format } from "date-fns";
import { t } from "i18next";
interface INote {
  noteId: string;
  title: string;
  dateModified: string;
  dateCreated: string;
}
interface NoteListProps {
  onSelectNote: (noteId: string) => void;
  selectedNoteId: string | null;
  containerWidth: number;
}

export const NoteList: React.FC<NoteListProps> = ({
  onSelectNote,
  selectedNoteId,
  containerWidth,
}) => {
  const { data, isLoading, error } = useList<INote>({
    resource: "notes",
    dataProviderName: "etapi",
    filters: [{ field: "search", operator: "eq", value: "e" }], // Adjust search value as needed
    pagination: { current: 1, pageSize: 10 },
  });

  const [searchTerm, setSearchTerm] = useState("");
  // const theme = useTheme();
  useLayoutEffect(() => {
    if (selectedNoteId) {
      const params = new URLSearchParams(window.location.search);
      params.set("noteId", selectedNoteId);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params}`
      );
    }
  }, [selectedNoteId]);

  // useLayoutEffect(() => {
  //   console.log("NoteList container width:", containerWidth);
  // }, [containerWidth]);

  if (isLoading) return <CircularProgress />;
  if (error)
    return <Typography color="error">Error: {error.message}</Typography>;

  const filteredNotes =
    data?.data
      .filter((note) => {
        const lowerTitle = note.title.toLowerCase();
        return (
          !/^\d{2} - (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(
            lowerTitle
          ) &&
          lowerTitle !== "new note" &&
          lowerTitle !== "hidden notes" &&
          !lowerTitle.match(/\.(png|jpg|jpeg|gif)$/i) &&
          lowerTitle.includes(searchTerm.toLowerCase())
        );
      })
      .sort(
        (a, b) =>
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      ) ?? [];
  const isNarrow = containerWidth < 250;

  return (
    <Paper sx={{ padding: 2, maxHeight: "100vh", overflow: "auto" }}>
      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        {t("recipes.communityRecipes")}
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={t("recipes.searchRecipes")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: !isNarrow && (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <List>
        {filteredNotes.map((note) => (
          <ListItemButton
            key={note.noteId}
            onClick={() => onSelectNote(note.noteId)}
            selected={note.noteId === selectedNoteId}
            divider
          >
            <ListItemText
              primary={
                <Typography
                  noWrap={!isNarrow}
                  sx={{
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: isNarrow ? 4 : 3,
                    fontSize: isNarrow ? "0.875rem" : "1rem",
                  }}
                >
                  {note.title}
                </Typography>
              }
              secondary={
                !isNarrow &&
                format(new Date(note.dateModified), "MMM dd, yyyy HH:mm")
              }
            />
          </ListItemButton>
        ))}
        {filteredNotes.length === 0 && (
          <ListItem>
            <ListItemText primary={t("recipes.noRecipes")} />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default NoteList;
