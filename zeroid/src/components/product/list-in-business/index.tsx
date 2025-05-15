import {
  Card,
  CardActions,
  Button,
  IconButton,
  Modal,
  Box,
  Typography,
  Stack,
  CardContent,
  CardMedia,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useList, useShow, useTranslate } from "@refinedev/core";
import { IEmployer, ICandidate } from "../../../interfaces";
import { resources } from "../../../utility";
import SaveIcon from "@mui/icons-material/Save";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useState } from "react";
import { useCardStyles } from "../../card-elevated/index";
import { OrderFormModal } from "../../order/form-modal";
interface ProductListProps {
  businessId?: string;
}

const ProductListBusiness: React.FC<ProductListProps> = ({ businessId }) => {
  const cardStyles = useCardStyles();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const { queryResult: businessQueryResult } = useShow<IEmployer>({
    resource: resources.candidates,
    id: businessId || "", // This will prevent fetch until productData is loaded and businessID is available
  });

  const {
    data: businessData,
    isLoading: businessLoading,
    error: businessError,
  } = businessQueryResult;
  const business = businessData?.data;

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useList<ICandidate>({
    resource: resources.candidates,
    filters: [{ field: "businessID", operator: "eq", value: businessId }],
    pagination: { mode: "off" },
  });

  const products = productsData?.data;
  const t = useTranslate();

  if (productsLoading)
    return <Skeleton variant="rectangular" width="100%" height={140} />;
  if (productsError)
    return <Typography color="error">Failed to load products</Typography>;
  if (!products || products.length === 0)
    return <Typography>{t("businesses.products.noneFound")}</Typography>;

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" gutterBottom>
        {t("businesses.products.products-services")}
      </Typography>
      {products.map((product) => (
        <Card
          key={product.id ? product.id.toString() : "undefined"}
          sx={{ ...cardStyles, marginBottom: 2 }}
        >
          {product.productImageURL && (
            <CardMedia
              component="img"
              height="140"
              image={product.productImageURL}
              alt={product.productName}
            />
          )}
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {product.productName}
            </Typography>
            <Typography color="text.secondary">
              {product.productDescription}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
              <AttachMoneyIcon color="primary" />
              <Typography variant="body1">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(product.productPrice))}
              </Typography>
            </Stack>
          </CardContent>
          <CardActions sx={{ justifyContent: "space-between" }}>
            <div></div>
            {/* <Button startIcon={<SaveIcon />} size="small">
              {t("buttons.save")}
            </Button> */}
            <Button
              onClick={() =>
                setSelectedProductId(product.id ? product.id.toString() : null)
              }
              startIcon={<ShoppingCartIcon />}
              size="small"
            >
              {t("buttons.buy")}
            </Button>
          </CardActions>
          <OrderFormModal
            open={
              selectedProductId === (product.id ? product.id.toString() : null)
            }
            onClose={() => setSelectedProductId(null)}
            product={product.id ? product.id.toString() : ""}
            currency={business?.currency}
          />
        </Card>
      ))}
    </Box>
  );
};

export default ProductListBusiness;
