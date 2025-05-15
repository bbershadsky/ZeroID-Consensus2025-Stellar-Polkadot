import { useGetIdentity, useShow } from "@refinedev/core";
import {
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardMedia,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import MuiPhoneNumber from "material-ui-phone-number";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { languageMenuItems } from "../../utils";
import { Controller, SubmitHandler } from "react-hook-form";
import MDEditor from "@uiw/react-md-editor";
import { useState, useEffect, useContext } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { IEmployer, IIdentity } from "../../interfaces";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDropzone } from "../../components";
import { ColorModeContext } from "../../contexts";
import { Edit } from "@refinedev/mui";
import { t } from "i18next";
import CurrencySelector from "../../components/currency-selector";
import { resources } from "../../utility";
import PaymentMethodsForm from "../../components/payment-methods-form";
interface PaymentMethodData {
  methodId: string;
  details: string;
}

interface PaymentMethodsFormData {
  paymentMethods: PaymentMethodData[];
}
export const BusinessEdit = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity<IIdentity | null>();
  const { pathname } = useLocation();
  const businessId = pathname.split("/")[2];

  const { queryResult } = useShow<IEmployer>({
    resource: resources.employers,
    id: businessId,
  });
  const { data, isLoading, isError } = queryResult;

  // Redirect if not the owner
  useEffect(() => {
    if (!isLoading && data && user?.$id !== data.data.userID) {
      setTimeout(() => {
        navigate(-1); // Go back to the previous page
      }, 1000); // Delay for 1 second before redirecting
      alert("You are not authorized to edit this business.");
    }
  }, [data, isLoading, user?.$id, navigate]);

  const { mode } = useContext(ColorModeContext);
  const [imageURL, setImageURL] = useState("");
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [filename, setFilename] = useState("");
  const {
    refineCore: { onFinish, queryResult: qr2 },
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IEmployer>({
    defaultValues: data?.data, // Ensure form is initialized with data
  });

  useEffect(() => {
    if (data) {
      setValue("name", data.data.name);
      setValue("description", data.data.description);
      setValue("phone", data.data.phone);
      setValue("email", data.data.email);
      setValue("languages", data.data.languages);
      setValue("currency", data.data.currency);
      setValue("imageURL", data.data.imageURL);
    }
  }, [data, setValue]);

  const imageURLWatch = watch("imageURL");

  useEffect(() => {
    if (imageURLWatch) {
      setImageURL(imageURLWatch);
    }
  }, [imageURLWatch]);

  const onFileUploaded = (url: string) => {
    setValue("imageURL", url); // Set imageURL in form
    setImageURL(url); // Update local state if necessary for display
    setIsUploadLoading(false);
  };

  const initialPaymentData = data?.data?.payments.map((payment: string) => {
    const [methodId, details] = payment.split(":");
    return { methodId, details };
  });

  const [paymentMethodsData, setPaymentMethodsData] =
    useState<PaymentMethodsFormData>({
      paymentMethods: initialPaymentData || [],
    });

  const handlePaymentMethodsChange = (data: PaymentMethodsFormData) => {
    setPaymentMethodsData(data);
  };

  const onSubmit: SubmitHandler<IEmployer> = (formData: any) => {
    const updatedData = {
      ...formData,
      payments: paymentMethodsData.paymentMethods
        .map((payment) => {
          if (payment.methodId) {
            return `${payment.methodId}:${payment.details}`;
          }
          return "";
        })
        .filter(Boolean),
    };

    const { id, ...rest } = updatedData;

    onFinish(rest);
  };

  return (
    <Edit
      isLoading={qr2?.isLoading}
      footerButtons={({ saveButtonProps, deleteButtonProps }) => <></>}
    >
      <form onSubmit={handleSubmit(onFinish)}>
        <input {...register("imageURL")} style={{ display: "none" }} />
        {imageURL?.length > 0 ? (
          <Card
            sx={{
              height: "100%",
            }}
          >
            <CardActionArea
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "normal",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  "&:hover": {
                    ".view-button": {
                      display: "flex",
                    },
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={imageURL}
                  // alt={product.productName}
                />
                <Button
                  className="view-button"
                  variant="contained"
                  color="inherit"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => {
                    setImageURL("");
                  }}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: "50%",
                    transform: "translate(50%, -50%)",
                    display: "none",
                    zIndex: 1,
                  }}
                >
                  {t("buttons.replace-image")}
                </Button>
              </Box>
            </CardActionArea>
          </Card>
        ) : (
          <FileDropzone
            bucketID={resources.bucketFiles}
            onFileUploaded={onFileUploaded}
            setFilename={setFilename}
            setImageURL={setImageURL}
            imageURL={imageURL}
          />
        )}
        <TextField
          {...register("name", { required: true })}
          label="Name"
          error={!!errors.name}
          InputLabelProps={{ shrink: true }}
          helperText={errors.name ? "This field is required" : ""}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <Controller
          name="description"
          // control={control}
          defaultValue=" "
          render={({ field }) => (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t("businesses.fields.description")}
              </Typography>
              <MDEditor
                data-color-mode={mode === "dark" ? "dark" : "light"}
                {...field}
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
            </Box>
          )}
        />
        <FormControl fullWidth margin="normal" error={!!errors.phone}>
          <Controller
            name="phone"
            // control={control}
            rules={{ required: "Phone number is required" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <MuiPhoneNumber
                variant="outlined"
                defaultCountry={"ca"}
                onChange={onChange}
                value={value}
                error={!!error}
                helperText={error ? error.message : null}
                label="Phone"
              />
            )}
          />
        </FormControl>
        <TextField
          {...register("email", {
            required: "Email is required",
          })}
          InputLabelProps={{ shrink: true }}
          label="Email"
          fullWidth
          variant="outlined"
          margin="normal"
          error={!!errors.email}
          helperText={errors.email ? t("businesses.fields.emailHelper") : ""}
        />
        <FormControl fullWidth margin="normal" error={!!errors.languages}>
          <InputLabel id="language-label">
            {t("businesses.fields.languages")}
          </InputLabel>
          <Controller
            {...register("languages")}
            // control={control}
            defaultValue={[]}
            rules={{
              required: t("validation.required", {
                field: t("businesses.fields.language"),
              }),
            }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="language-label"
                label={t("businesses.fields.language")}
                fullWidth
                multiple
                variant="outlined"
                value={field.value || []}
                onChange={(event) => field.onChange(event.target.value)}
              >
                {languageMenuItems.map((item) => (
                  <MenuItem key={item.key} value={item.key}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <Controller
            name="currency"
            // control={control}
            defaultValue=""
            render={({ field }) => (
              <CurrencySelector
                currentCurrency={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormControl>
        {/* <PaymentMethodsForm
          initialData={initialPaymentData}
          onChange={handlePaymentMethodsChange}
        /> */}

        <Button type="submit" variant="contained" color="primary">
          {t("buttons.saveChanges")}
        </Button>
      </form>
    </Edit>
  );
};
