import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Avatar,
  Typography,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { CircularProgress } from "@mui/material";
import { useState } from "react";
import { storage } from "../../utility"; // Adjust the import path

interface OrderFilesProps {
  files: string[];
  bucketId: string;
  onFileUploaded: (url: string) => void;
  onFileDeleted: (url: string) => void;
}

const getFileIcon = (file: string) => {
  const extMatch = file.match(/\.(png|jpeg|jpg)(\?|$)/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : null;
  if (ext === "png" || ext === "jpeg" || ext === "jpg") {
    return (
      <Avatar src={file} variant="square" sx={{ width: 48, height: 48 }} />
    );
  }
  return <CloudUploadIcon />;
};

export const OrderFiles: React.FC<OrderFilesProps> = ({
  files,
  bucketId,
  onFileUploaded,
  onFileDeleted,
}) => {
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      let sanitizedFilename = file.name.replace(/\s+/g, "");

      const extension = sanitizedFilename.split(".").pop();
      let baseFilename = sanitizedFilename.substring(
        0,
        sanitizedFilename.lastIndexOf(".")
      );

      if (baseFilename.length > 32) {
        baseFilename = baseFilename.substring(0, 32);
      }

      const uniqueIdentifier = Date.now();
      sanitizedFilename = extension
        ? `${baseFilename}-${uniqueIdentifier}.${extension}`
        : `${baseFilename}-${uniqueIdentifier}`;

      setUploading(true);
      try {
        const response = await storage.createFile(
          bucketId,
          sanitizedFilename,
          file
        );
        const fileUrl = storage.getFileView(bucketId, response.$id);

        onFileUploaded(fileUrl.href);
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.500",
          bgcolor: isDragActive ? "action.hover" : "background.paper",
          p: 2,
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <CircularProgress />
        ) : (
          <Box textAlign="center">
            <CloudUploadIcon
              style={{ fontSize: 48, color: "text.secondary" }}
            />
            <Typography variant="body1">
              {isDragActive
                ? "Drop files here"
                : "Drag 'n' drop some files here, or click to select files"}
            </Typography>
          </Box>
        )}
      </Box>
      <List>
        {files.map((file, index) => (
          <ListItem key={index} sx={{ display: "flex", alignItems: "center" }}>
            {getFileIcon(file)}
            <ListItemText primary={file} sx={{ ml: 2 }} />
            <Tooltip title="Delete">
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onFileDeleted(file)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
