import { CardMedia } from "@mui/material";
import { Box } from "@mui/system";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

export const ImageCell = ({ value }: { value: string }) => {
  return value ? (
    <CardMedia
      component="img"
      sx={{ width: 50, height: 50, objectFit: "cover", borderRadius: 2 }} // Ensuring the image fits well within the cell
      image={value}
      alt="Product"
    />
  ) : (
    <Box
      sx={{
        width: 50,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ImageOutlinedIcon color="action" />
    </Box>
  );
};
