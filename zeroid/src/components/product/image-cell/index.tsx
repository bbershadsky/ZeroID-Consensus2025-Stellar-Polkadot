import React from "react";
import { Avatar, Typography } from "@mui/material";
import { CustomTooltip } from "../../customTooltip";

interface ImageCellProps {
  src?: string;
  alt?: string;
  title: string; // Adding title as a required prop for fallback display
}

const ImageCell: React.FC<ImageCellProps> = ({ src, alt, title }) => {
  // Check if the src is provided and not empty
  if (src) {
    return (
      <CustomTooltip key={src} title={title}>
        <Avatar
          variant="rounded"
          sx={{
            width: 32,
            height: 32, // Adjust size as needed or make it a prop
          }}
          src={src}
          alt={alt}
        />
      </CustomTooltip>
    );
  } else {
    // Display the title if no image URL is present
    return (
      <Typography
        sx={{
          fontSize: 14, // Style as needed
          color: "gray", // Styling placeholder text
        }}
      >
        {title}
      </Typography>
    );
  }
};

export default ImageCell;
