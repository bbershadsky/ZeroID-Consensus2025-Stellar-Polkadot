import { Box, CircularProgress, Typography } from "@mui/material";
import { useNotification, useTranslate } from "@refinedev/core";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { storage } from "../../utility";

interface FileDropzoneProps {
  bucketID: string; // Correct type: This should be a string
  onFileUploaded: (url: string) => void;
  setFilename: (filename: string) => void;
  imageURL: string;
  setImageURL: (url: string) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  bucketID, // Now correctly typed as string
  onFileUploaded,
  setFilename,
  imageURL,
  setImageURL,
}) => {
  const { open } = useNotification();
  const t = useTranslate();

  const [uploading, setUploading] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return; // Handle cases where no file is dropped

      let sanitizedFilename = file.name.replace(/\s+/g, ""); // Remove all spaces

      // Extract the extension
      const parts = sanitizedFilename.split(".");
      const extension = parts.length > 1 ? parts.pop() : "";
      let baseFilename = parts.join(".");

      // Trim base filename to a maximum of 32 characters
      if (baseFilename.length > 32) {
        baseFilename = baseFilename.substring(0, 32);
      }

      // Append a unique identifier to handle duplicates and ensure Appwrite fileId constraints
      // Appwrite fileId: Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can't start with a special char. Max length is 36 chars.
      // Ensure baseFilename is valid before appending unique parts.
      baseFilename = baseFilename.replace(/[^a-zA-Z0-9.-_]/g, '_'); // Sanitize baseFilename for allowed characters
      if (baseFilename.startsWith('.') || baseFilename.startsWith('-') || baseFilename.startsWith('_')) {
        baseFilename = "file" + baseFilename; // Ensure it doesn't start with special char
      }
      if (baseFilename.length === 0) { // Handle empty filename after sanitization
        baseFilename = "upload";
      }
      // Recalculate max length for baseFilename considering the unique identifier and extension
      const uniqueSuffix = `-${Date.now()}`;
      let maxBaseLength = 36;
      if (extension) {
        maxBaseLength -= (extension.length + 1); // Subtract length of ".extension"
      }
      maxBaseLength -= uniqueSuffix.length;

      if (baseFilename.length > maxBaseLength && maxBaseLength > 0) {
        baseFilename = baseFilename.substring(0, maxBaseLength);
      } else if (maxBaseLength <= 0) {
        // This case means the suffix and extension are too long, needs a strategy
        // For now, we'll use a very short base or error
        baseFilename = "f"; // Fallback, or handle error appropriately
      }


      sanitizedFilename = extension
        ? `${baseFilename}${uniqueSuffix}.${extension}`
        : `${baseFilename}${uniqueSuffix}`;

      // Final check for total length
      if (sanitizedFilename.length > 36) {
        // This should ideally not happen if maxBaseLength logic is correct
        // Trim further if necessary, though it might corrupt the unique ID or extension
        sanitizedFilename = sanitizedFilename.substring(0, 36);
      }


      setFilename(sanitizedFilename);
      setUploading(true);
      try {
        // const formData = new FormData(); // Not needed for Appwrite SDK createFile
        // formData.append("file", file, sanitizedFilename);

        const response = await storage.createFile(
          bucketID,          // Now a string, as expected
          sanitizedFilename, // This is used as the Appwrite fileId
          file
        );
        const fileUrl = storage.getFileView(bucketID, response.$id); // bucketID is a string

        onFileUploaded(fileUrl.href);
        setImageURL(fileUrl.href);
      } catch (error) {
        console.error("Error uploading file:", error);
        // It's good practice to provide a more user-friendly error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        open?.({
          type: "error",
          message: t("businesses.notifications.uploadError", { error: errorMessage }), // Example using translate
          description: t("businesses.notifications.uploadErrorDescription"),
          key: "upload-error-key",
        });
      } finally {
        setUploading(false);
      }
    },
  });

  return (
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
        textAlign: "center", // Center text content
      }}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <CircularProgress />
      ) : imageURL ? (
        <img
          src={imageURL}
          alt={t("businesses.fields.uploadedFile", "Uploaded File")}
          style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }}
        />
      ) : (
        <>
          <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography variant="h6">
            {isDragActive
              ? t("businesses.fields.dropImageHere", "Drop the file here ...")
              : t("businesses.fields.dragNDrop", "Drag 'n' drop a file here, or click to select a file")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("businesses.fields.fileUploadHint", "Max file name length 36 chars after sanitization.")}
          </Typography>
        </>
      )}
    </Box>
  );
};