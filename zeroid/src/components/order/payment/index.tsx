import { DateField } from "@refinedev/mui";
import { useTranslate } from "@refinedev/core";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import { IOrder } from "../../../interfaces";
import QRCode from "react-qr-code";
import Skeleton from "@mui/material/Skeleton";
import {
  MoneyOutlined,
  PaymentRounded,
  PaymentsTwoTone,
} from "@mui/icons-material";
import * as htmlToImage from "html-to-image";
import { ReactNode, useRef } from "react";
import { Chip } from "@mui/material";

type Props = {
  order?: IOrder;
};

export const OrderPayment = ({ order }: Props) => {
  const { palette } = useTheme();
  const t = useTranslate();
  let paymentStatus = "UNPAID";

  order?.orderisPaid ? (paymentStatus = "PAID") : "";

  return (
    <Box>
      <PaymentBadge
        icon={<PaymentsTwoTone />}
        label={t("orders.fields.payment")}
        value={paymentStatus}
      />
      <Divider />
      {order?.orderPaymentURL && (
        <div
          style={{
            height: "auto",
            margin: "0 auto",
            maxWidth: 364,
            width: "100%",
            // background: palette.primary.main,
            // padding: "16px",
          }}
        >
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={order?.orderPaymentURL!}
            viewBox={`0 0 256 256`}
          />
        </div>
      )}

      <Divider />
      <Info
        icon={<WatchLaterOutlinedIcon />}
        label={t("orders.fields.updatedAt")}
        value={
          order?.$updatedAt && (
            <DateField value={order.$updatedAt} format="LL / LT" />
          )
        }
      />
    </Box>
  );
};

type InfoProps = {
  icon: ReactNode;
  label: string;
  value?: ReactNode;
};

const Info = ({ icon, label, value }: InfoProps) => {
  const { palette } = useTheme();

  return (
    <Box display="flex" p="16px 0px 16px 24px">
      <Box
        mr="8px"
        display="flex"
        // alignItems="center"
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

interface PaymentBadgeProps {
  icon: React.ReactNode;
  label: string;
  value?: string; // Ensuring value is string as we're comparing it directly
}

const PaymentBadge: React.FC<PaymentBadgeProps> = ({ icon, label, value }) => {
  const { palette } = useTheme();

  // Logic to determine chip color based on payment status
  const getChipColor = (status: string | undefined) => {
    switch (status) {
      case "PAID":
        return "success";
      case "UNPAID":
        return "error";
      default:
        return "default";
    }
  };

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
      {value ? (
        <Chip label={value} color={getChipColor(value)} />
      ) : (
        <Skeleton variant="text" width={120} />
      )}
    </Box>
  );
};

export default PaymentBadge;
