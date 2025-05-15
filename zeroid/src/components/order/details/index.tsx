import React, { useEffect } from "react";
import dayjs from "dayjs";
import { DateField } from "@refinedev/mui";
import { useTranslate, useNotification, useUpdate } from "@refinedev/core";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import Skeleton from "@mui/material/Skeleton";
// import Chat from "../../chat";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { resources } from "../../../utility";
import { OrderFiles } from "../../order-files";
import { IOrder } from "../../../interfaces";

type Props = {
  order?: IOrder;
};

enum OrderStatus {
  Pending = "Pending",
  Ready = "Ready",
  OnTheWay = "On The Way",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

interface OrderFormValues {
  orderFiles: string[];
}

export const OrderDetails = ({ order }: Props) => {
  const { palette } = useTheme();
  const t = useTranslate();
  // const { open } = useNotification();
  const { mutate } = useUpdate();

  const { control, setValue, watch } = useForm<OrderFormValues>({
    defaultValues: {
      orderFiles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    //@ts-ignore
    name: "orderFiles",
  });

  const orderFiles = watch("orderFiles");

  useEffect(() => {
    if (order?.orderFiles) {
      setValue("orderFiles", order.orderFiles);
    }
  }, [order, setValue]);

  const orderStatusSteps = [
    { key: OrderStatus.Pending, label: "Pending" },
    { key: OrderStatus.Ready, label: "Ready" },
    { key: OrderStatus.OnTheWay, label: "On The Way" },
    { key: OrderStatus.Delivered, label: "Delivered" },
    { key: OrderStatus.Cancelled, label: "Cancelled" },
  ];

  const activeStep = orderStatusSteps.findIndex(
    (step) => step.key === order?.orderStatus
  );

  const handleFileUploaded = (url: string) => {
    if (!order) {
      return;
    }
    const updatedOrderFiles = [...(orderFiles || []), url];
    mutate({
      resource: resources.candidates,
      values: {
        orderFiles: updatedOrderFiles,
      },
      id: order.id,
    });
    append({ id: url }); // Append the URL to the local state array
    setValue("orderFiles", updatedOrderFiles); // Update the form state
    // open({
    //   type: "success",
    //   message: t("orders.fileUploadSuccess"),
    // });
  };

  const handleFileDeleted = (url: string) => {
    if (!order) {
      return;
    }
    const updatedOrderFiles = (orderFiles || []).filter((file) => file !== url);
    mutate({
      resource: resources.candidates,
      values: {
        orderFiles: updatedOrderFiles,
      },
      id: order.id,
    });
    remove(orderFiles.findIndex((file) => file === url));
    setValue("orderFiles", updatedOrderFiles); // Update the form state
    // open({
    //   type: "success",
    //   message: t("orders.fileDeleteSuccess"),
    // });
  };

  return (
    <Box>
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        sx={{
          minHeight: "360px",
          padding: "24px",
          ".MuiStepIcon-text": {
            fill: palette.mode === "dark" ? "black" : "white",
          },
        }}
      >
        {orderStatusSteps.map((step, index) => (
          <Step key={index}>
            <StepLabel
              optional={
                index === activeStep && order?.$createdAt ? (
                  <Typography variant="caption">
                    {dayjs(order.$createdAt).format("LL LT")}
                  </Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Divider />
      <Info
        icon={<AccountCircleOutlinedIcon />}
        label={t("orders.fields.customer")}
        value={order?.orderCustomerID}
      />
      <Divider />
      <Info
        icon={<WatchLaterOutlinedIcon />}
        label={t("orders.fields.createdAt")}
        value={
          order?.$createdAt && (
            <DateField value={order.$createdAt} format="LL / LT" />
          )
        }
      />
      <Divider />

      <Controller
        name="orderFiles"
        control={control}
        render={({ field }) => (
          <OrderFiles
            files={field.value}
            bucketId={resources.bucketFiles}
            onFileUploaded={(url) => {
              handleFileUploaded(url);
              field.onChange([...field.value, url]);
            }}
            onFileDeleted={(url) => {
              handleFileDeleted(url);
              field.onChange(field.value.filter((file) => file !== url));
            }}
          />
        )}
      />
      {/* {order && <Chat destinationId={order?.id ?? ""} />} */}
    </Box>
  );
};

type InfoProps = {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
};

const Info = ({ icon, label, value }: InfoProps) => {
  const { palette } = useTheme();

  return (
    <Box display="flex" alignItems="center" p="16px 0px 16px 24px">
      <Box
        mr="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          color: palette.primary.main,
        }}
      >
        {icon}
      </Box>
      <Box mr="8px" display="flex" alignItems="center" width="112px">
        {label}
      </Box>

      {value ?? (
        <Skeleton variant="text" sx={{ fontSize: "1rem", width: "120px" }} />
      )}
    </Box>
  );
};
