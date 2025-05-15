import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  CircularProgress,
  Button,
  Box,
  Modal,
} from "@mui/material";
import parse from "html-react-parser"; // Assuming you're using html-react-parser
import { useOne } from "@refinedev/core";
import { useLocation } from "react-router-dom";

interface INoteDetailsProps {
  noteId: string;
}

const NoteDetails: React.FC<INoteDetailsProps> = ({ noteId }) => {
  const [openModal, setOpenModal] = useState(false);
  const [modalUrl, setModalUrl] = useState("");
  if (!noteId) {
    return (
      <Paper sx={{ padding: 2, height: "100vh", overflowY: "auto" }}>
        <Typography>Select a recipe to view details.</Typography>
      </Paper>
    );
  }
  const search = useLocation();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const noteIdFromUrl = searchParams.get("noteId");
  useEffect(() => {
    const noteId = searchParams.get("noteId");
    if (noteId) {
      setSelectedNoteId(noteId);
    }
  }, [search]);

  const { data, isLoading, error } = useOne({
    resource: "notes",
    id: noteId,
    dataProviderName: "etapi",
  });

  const handleOpenModal = (url: string) => {
    setModalUrl(url);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
  useEffect(() => {
    if (noteIdFromUrl) {
      setSelectedNoteId(noteIdFromUrl);
    }
  }, [noteIdFromUrl]);

  // const options = {
  //   replace: ({ attribs, children, name }) => {
  //     if (name === "img") {
  //       return <></>; // Removes all <img> tags
  //     }
  //     if (name === "a" && attribs && attribs.href) {
  //       return (
  //         <Button onClick={() => handleOpenModal(attribs.href)}>
  //           {domToReact(children)}
  //         </Button>
  //       ); // Replace <a> tags with buttons that open modals
  //     }
  //   },
  // };
  const note = data?.data; // Correctly accessing the data from the response
  // // Preprocess function to replace URL segments
  // const preprocessContent = (content: string): string => {
  //   return content.replace(/api\//g, "https://cookbook.covidian.life/api/");
  // };
  if (isLoading) return <CircularProgress />;
  if (error)
    return <Typography color="error">Error: {error.message}</Typography>;
  if (!note) return <Typography>Note not found</Typography>;

  // const processedContent = preprocessContent(note);
  return (
    <>
      <Paper sx={{ padding: 2, height: "89vh", overflowY: "auto" }}>
        {note && parse(note.toString())}
      </Paper>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            External Link
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            You are viewing:{" "}
            <a href={modalUrl} target="_blank" rel="noopener noreferrer">
              {modalUrl}
            </a>
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default NoteDetails;
