import React from "react";
import { Box } from "@mui/material";
import Info from "./info"; // Adjust the import path
import { paymentMethods } from "../../utils"; // Adjust the import path
import { useNotification } from "@refinedev/core";

interface PaymentMethodsListProps {
  payments: string[];
  showLabel?: boolean; // Default to false
}

const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({
  payments,
  showLabel = false,
}) => {
  const { open } = useNotification();
  const handleDoubleClick = (details: string | undefined) => {
    if (details && details.startsWith("http")) {
      window.open(details, "_blank");
    } else {
      if (details) {
        navigator.clipboard
          .writeText(details)
          .then(() => {
            // open({
            //   message: "Copied to clipboard",
            //   type: "success",
            // });
          })
          .catch(() => {
            //   open({
            //     message: "Failed to copy",
            //     type: "error",
            //   });
          });
      }
    }
  };

  const mappedPayments = payments
    ?.map((payment) => {
      const [methodId, details] = payment.split("|");
      const method = paymentMethods.find((pm) => pm.id === methodId);
      return method ? { ...method, details } : null;
    })
    .filter(Boolean);

  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap">
      {mappedPayments?.map((payment) => (
        <Info
          key={payment?.id}
          icon={
            <img
              src={payment?.icon}
              alt={payment?.name}
              style={{ width: 40, height: 40 }}
            />
          }
          label={showLabel ? `${payment?.id}: ${payment?.name}` : ""}
          value={payment?.details!}
          onDoubleClick={() => handleDoubleClick(payment?.details)}
        />
      ))}
    </Box>
  );
};

export default PaymentMethodsList;
