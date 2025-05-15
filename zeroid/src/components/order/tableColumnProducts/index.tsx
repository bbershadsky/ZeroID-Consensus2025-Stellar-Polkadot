import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { CustomTooltip } from "../../customTooltip";
import { IOrder, ICandidate } from "../../../interfaces";
// import { getUniqueListWithCount } from "../../../utils";
import { useOne, HttpError } from "@refinedev/core";
// import { image } from "@uiw/react-md-editor";
import { resources } from "../../../utility";
import ImageCell from "../../product/image-cell";

type Props = {
  order: IOrder;
};

export const OrderTableColumnProducts = ({ order }: Props) => {
  //   const uniqueProducts = getUniqueListWithCount({
  //     list: order?.orderProductID
  //  || [],
  //     field: "id",
  //   });

  // const visibleProducts = uniqueProducts.slice(0, 3);
  // const unvisibleProducts = uniqueProducts.slice(3);
  const product = order.orderProductID;

  const { data } = useOne<ICandidate, HttpError>({
    resource: resources.candidates,
    id: product,
  });
  const productData = data?.data;

  return (
    <Box display="flex">
      {/* <CustomTooltip key={productData?.id} title={productData?.productName}> */}
      <ImageCell
        src={productData?.productImageURL} // Provide a default placeholder if URL is missing
        alt={productData?.productName}
        title={productData?.productName || "No Image Available"}
      />
      {/* </CustomTooltip> */}
      {/* {visibleProducts.map((product) => {
        const image = product.images?.[0];
        return (
          <CustomTooltip key={product.id} title={product.productName}>
            <Avatar
              variant="rounded"
              sx={{
                width: 32,
                height: 32,
              }}
              src={image?.thumbnailUrl || image?.url}
              alt={image?.name}
            />
          </CustomTooltip>
        );
      })}
      {!!unvisibleProducts.length && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="32px"
          height="32px"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#757575" : "#D9D9D9",
          }}
        >
          <Typography
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#121212" : "#FFFFFF",
            }}
          >
            +{unvisibleProducts.length}
          </Typography>
        </Box>
      )} */}
    </Box>
  );
};
