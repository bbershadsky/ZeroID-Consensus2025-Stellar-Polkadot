import React, { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseSharp from "@mui/icons-material/CloseSharp";
import { useTranslate } from "@refinedev/core";
import { paymentMethods } from "../../utils/payment-methods"; // Adjust the import path
import { IPaymentMethod } from "../../interfaces"; // Adjust the import path

interface FormData {
  paymentMethods: { method: IPaymentMethod | null; details: string }[];
}

interface PaymentMethodsFormProps {
  initialData?: { methodId: string; details: string }[];
  onChange: (data: PaymentMethodsFormData) => void;
}

interface PaymentMethodsFormData {
  paymentMethods: { methodId: string; details: string }[];
}

const PaymentMethodsForm: React.FC<PaymentMethodsFormProps> = ({
  initialData,
  onChange,
}) => {
  const t = useTranslate();

  const { handleSubmit, control, watch, register, reset } = useForm<FormData>({
    defaultValues: {
      paymentMethods: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "paymentMethods",
  });

  useEffect(() => {
    if (initialData) {
      const formattedData = initialData.map((data) => ({
        method: paymentMethods.find((pm) => pm.id === data.methodId) || null,
        details: data.details,
      }));
      reset({ paymentMethods: formattedData });
    }
  }, [initialData, reset]);

  const paymentMethodsWatch = watch("paymentMethods");

  useEffect(() => {
    const mappedData: PaymentMethodsFormData = {
      paymentMethods: paymentMethodsWatch.map((payment) => ({
        methodId: payment.method?.id || "",
        details: payment.details,
      })),
    };
    onChange(mappedData);
  }, [paymentMethodsWatch, onChange]);

  const allMethodsSelected = paymentMethodsWatch.every(
    (payment) => payment.method !== null
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
        width: "100%",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t("businesses.addPayments")}
      </Typography>
      {fields.map((field, index) => {
        const selectedMethods = paymentMethodsWatch.map((pm) => pm.method?.id);
        const availableMethods = paymentMethods.filter(
          (pm) =>
            !selectedMethods.includes(pm.id) ||
            pm.id === paymentMethodsWatch[index]?.method?.id
        );

        return (
          <Grid
            container
            spacing={2}
            key={field.id}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Grid
              item
              xs={1}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              {paymentMethodsWatch[index] &&
                paymentMethodsWatch[index].method && (
                  <img
                    src={paymentMethodsWatch[index].method!.icon}
                    alt={paymentMethodsWatch[index].method!.name}
                    style={{ width: 40, height: 40 }}
                  />
                )}
            </Grid>
            <Grid item xs={4}>
              <Controller
                name={`paymentMethods.${index}.method`}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={availableMethods}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option) => (
                      <li {...props}>
                        <img
                          src={option.icon}
                          alt={option.name}
                          style={{ width: 40, height: 40, marginRight: 10 }}
                        />
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Payment Method"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    value={field.value}
                    onChange={(_, data) => field.onChange(data)}
                    sx={{ width: "100%" }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                label="Details"
                variant="outlined"
                fullWidth
                {...register(`paymentMethods.${index}.details` as const)}
              />
              <IconButton
                onClick={() => remove(index)}
                sx={{ ml: 1, color: "grey.500" }}
              >
                <CloseSharp />
              </IconButton>
            </Grid>
          </Grid>
        );
      })}
      <Button
        type="button"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => append({ method: null, details: "" })}
        sx={{ mb: 2 }}
        disabled={!allMethodsSelected}
      >
        {t("businesses.addPaymentMethod")}
      </Button>
    </Box>
  );
};

export default PaymentMethodsForm;
