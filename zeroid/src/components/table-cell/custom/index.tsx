import { Typography } from "@mui/material";

// Custom cell render component for aligning content
export const CustomCell = ({
  align,
  value,
}: {
  align: "left" | "right" | "center";
  value: any;
}) => (
  <div
    style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent:
        align === "right"
          ? "flex-end"
          : align === "left"
          ? "flex-start"
          : "center",
    }}
  >
    <Typography variant="body2">{value}</Typography>
  </div>
);
