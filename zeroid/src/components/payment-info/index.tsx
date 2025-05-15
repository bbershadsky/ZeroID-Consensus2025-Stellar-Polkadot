import React from "react";
import { Box, Skeleton, useTheme } from "@mui/material";

interface InfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const Info: React.FC<InfoProps> = ({ icon, label, value }) => {
  const { palette } = useTheme();

  return (
    <Box display="flex" alignItems="center" p="16px 0px 16px 24px">
      <Box
        mr="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          color: palette.primary.main,
        }}
      >
        {icon}
      </Box>
      {label && (
        <Box mr="8px" display="flex" alignItems="center" width="112px">
          {label}
        </Box>
      )}
      {value ? (
        <Box>{value}</Box>
      ) : (
        <Skeleton variant="text" sx={{ fontSize: "1rem", width: "120px" }} />
      )}
    </Box>
  );
};

export default Info;
