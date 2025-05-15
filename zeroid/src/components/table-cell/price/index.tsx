import { Typography } from "@mui/material";

export const PriceCell = ({
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
    <Typography variant="body2">
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(value))}
    </Typography>
  </div>
);
