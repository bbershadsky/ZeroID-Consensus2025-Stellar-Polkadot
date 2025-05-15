import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Typography,
  Stack,
  DialogActions,
  CardMedia,
  Skeleton,
  AlertTitle,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import {
  useTranslate,
  useCreate,
  useNotification,
  useGetIdentity,
  HttpError,
  useOne,
  useGo,
} from "@refinedev/core";
import { ICandidate, IOrder, IIdentity } from "../../../interfaces";
import { resources } from "../../../utility";
interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  product?: string;
  currency?: string;
}
export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  open,
  onClose,
  product,
  currency,
}) => {
  const { data: user } = useGetIdentity<IIdentity | null>();

  const t = useTranslate();
  const go = useGo();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IOrder>({
    defaultValues: {
      orderCustomerID: user?.$id,
      // orderCustomerContactEmail: user?.email,
      orderDescription: "",
      // orderOfferPrice: 0,
      // orderOfferPrice: Number(product.productPrice),
    },
  });
  const { data, isLoading } = useOne<ICandidate, HttpError>({
    resource: resources.candidates,
    id: product,
  });

  const productData = data?.data;
  const businessID = productData?.businessID;
  const { mutate } = useCreate<IOrder>();
  // const notify = useNotification();

  const generateOrderNumber = (customerID: string) => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const prefix = customerID.includes("@") ? "CUS" : "USR";
    return `${prefix}-${timestamp}-${randomNum}`;
  };

  const onSubmit = async (data: IOrder) => {
    const orderNumber = generateOrderNumber(data?.orderCustomerID!);
    mutate(
      {
        resource: resources.candidates,
        values: {
          orderOwnerID: businessID,
          orderCustomerID: data?.orderCustomerID,
          orderStatus: "Pending",
          orderProductID: productData?.id,
          orderDescription: data.orderDescription,
          orderOfferPrice: Number(productData?.productPrice),
          orderCode: orderNumber,
        },
      },
      {
        onError: (error, variables, context) => {
          console.log("Error creating order", error, variables, context);
        },
        onSuccess: (data, variables, context) => {
          reset(); // Reset form fields
          onClose(); // Close the modal
          go({
            to: {
              action: "show",
              resource: resources.candidates,
              id: data.data.id,
            },
          });
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("orders.newOrder")}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height={190} />
          ) : (
            productData?.productImageURL && (
              <CardMedia
                component="img"
                height="140"
                image={productData.productImageURL}
                alt={productData.productName}
              />
            )
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2} mt={2}>
              {isLoading ? (
                <>
                  <Skeleton width="80%" height={40} />
                  <Skeleton width="100%" height={100} />
                </>
              ) : (
                <>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="h4" gutterBottom>
                      {productData?.productName || "No product name"}
                    </Typography>
                    <Typography variant="h3" color="primary" gutterBottom>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: currency || "USD",
                      }).format(Number(productData?.productPrice) || 0)}
                    </Typography>
                  </Stack>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    {productData?.productDescription || "No Description"}
                  </Typography>
                  <Controller
                    name="orderDescription"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t("orders.notes")}
                        variant="outlined"
                        error={!!errors.orderDescription}
                        helperText={errors.orderDescription?.message}
                        fullWidth
                        multiline
                      />
                    )}
                  />
                  {!user?.$id && (
                    <>
                      <Alert severity="info">
                        <AlertTitle>{t("orders.notLoggedIn")}</AlertTitle>
                        {t("orders.enterEmail")}
                      </Alert>
                      <Controller
                        name="orderCustomerID"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={t("orders.customerID")}
                            variant="outlined"
                            error={!!errors.orderCustomerID}
                            helperText={errors.orderCustomerID?.message}
                            fullWidth
                            multiline
                            hidden
                          />
                        )}
                      />
                    </>
                  )}
                  {/* <FormControl fullWidth sx={{ m: 1 }}>
                    <InputLabel htmlFor="outlined-adornment-amount">
                      Offer Price
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-amount"
                      startAdornment={
                        <InputAdornment position="start">$</InputAdornment>
                      }
                      label="Amount"
                      value={productData?.productPrice || ""}
                      disabled
                    />
                  </FormControl> */}
                </>
              )}
            </Stack>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" color="primary">
                Create Order
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
