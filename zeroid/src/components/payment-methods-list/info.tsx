import React from "react";
import { Box, Tooltip } from "@mui/material";

interface InfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onDoubleClick?: () => void;
}

const Info: React.FC<InfoProps> = ({ icon, label, value, onDoubleClick }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      onDoubleClick={onDoubleClick}
      style={{ cursor: onDoubleClick ? "pointer" : "default" }}
    >
      {icon}
      {label && (
        <Tooltip title={value} arrow>
          <Box ml={1}>{label}</Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default Info;
