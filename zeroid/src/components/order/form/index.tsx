import React, { useState } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { resources } from "../../../utility";
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  Stack,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { IIdentity, IOrder, ICandidate } from "../../../interfaces";
import { useGetIdentity } from "@refinedev/core";

const useOrderForm = () => {
  const formMethods = useForm<IOrder>();
  //   const [createOrder] = useMutation<IOrder>({
  //     resource: resources.orders,
  //   });

  const onSave = async (data: IOrder) => {
    const newOrderData = {
      ...data,
      //   orderImageURL: selectedProduct?.productImageURL,
      //   orderOwnerID: businessId, // Assuming the businessId is the owner ID
    };
    // await createOrder(newOrderData);
    // handleClose();
  };

  return { formMethods, handleSave: onSave };
};

interface OrderFormProps {
  //   formMethods: UseFormReturn<IOrder>;
  onSave: (data: IOrder) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  //   formMethods,
  onSave,
}) => {
  //   const { register, handleSubmit } = formMethods;

  return null;
  // <form onSubmit={handleSubmit(onSave)}>
  //   <Stack spacing={2}>
  //     <TextField
  //       {...register("orderCode", { required: true })}
  //       label="Order Code"
  //       variant="outlined"
  //       fullWidth
  //     />
  //     <TextField
  //       {...register("orderDescription")}
  //       label="Description"
  //       variant="outlined"
  //       fullWidth
  //       multiline
  //       rows={3}
  //     />
  //     <TextField
  //       {...register("orderOfferPrice", { valueAsNumber: true })}
  //       label="Offer Price"
  //       type="number"
  //       variant="outlined"
  //       fullWidth
  //     />
  //     <Button
  //       type="submit"
  //       variant="contained"
  //       startIcon={<SaveIcon />}
  //       color="primary"
  //     >
  //       Create Order
  //     </Button>
  //   </Stack>
  // </form>
};

interface ProductListProps {
  businessId?: string;
}

const ProductListBusiness: React.FC<ProductListProps> = ({ businessId }) => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ICandidate | null>(null);
  const { formMethods, handleSave } = useOrderForm();

  const handleOpen = (product: ICandidate) => {
    setSelectedProduct(product);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          width: 400,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Create New Order for {selectedProduct?.productName}
        </Typography>
        {/* <OrderForm formMethods={formMethods} onSave={handleSave} /> */}
      </Box>
    </Modal>
  );
};

export default ProductListBusiness;
