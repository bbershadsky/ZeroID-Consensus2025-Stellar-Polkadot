import { Skeleton, Badge, Typography, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import QrCode2Icon from "@mui/icons-material/QrCode2";

type InfoProps = {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  isBold?: boolean; // New prop to control bold text
  orderPaymentURL?: string; // New prop for payment URL
};

const Info2: React.FC<InfoProps> = ({
  icon,
  label,
  value,
  isBold,
  orderPaymentURL,
}) => {
  const isUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch (_) {
      return false;
    }
  };

  const renderLabel = () => {
    if (isUrl(label)) {
      return (
        <IconButton onClick={() => window.open(label, "_blank")}>
          <QrCode2Icon />
        </IconButton>
      );
    }
    return (
      <Typography
        variant="body2"
        style={{ fontWeight: isBold ? "bold" : "normal" }}
      >
        {label}
      </Typography>
    );
  };

  return (
    <Box
      display="flex"
      //   alignItems="center"
      p="16px 0px 16px 24px"
    >
      <Box
        mr="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={
          {
          }
        }
      >
        {icon}
      </Box>
      <Box mr="8px" display="flex" alignItems="center" width="112px">
        {renderLabel()}
      </Box>
      <Typography
        variant="body2"
        style={{ fontWeight: isBold ? "bold" : "normal", marginLeft: 8 }}
      >
        {value}
      </Typography>
    </Box>
  );
};
export default Info2;
