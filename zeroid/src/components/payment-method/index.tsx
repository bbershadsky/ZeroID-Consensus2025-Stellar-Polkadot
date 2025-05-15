import React from "react";
import { Box, Card, CardContent, Typography, Avatar } from "@mui/material";
import { IPaymentMethod } from "../../interfaces";
interface PaymentMethodCardProps {
  paymentMethod: IPaymentMethod;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
}) => {
  return (
    <Card sx={{ display: "flex", alignItems: "center", p: 2, mb: 2 }}>
      <Avatar src={paymentMethod.icon} sx={{ width: 56, height: 56, mr: 2 }} />
      <CardContent>
        <Typography variant="h6">{paymentMethod.name}</Typography>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;
