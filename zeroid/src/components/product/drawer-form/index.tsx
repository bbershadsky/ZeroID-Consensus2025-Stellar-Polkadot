import {
  HttpError,
  useGo,
  useTranslate,
  useList,
  useGetIdentity,
} from "@refinedev/core";
import { DeleteButton } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import {
  Alert,
  AlertTitle,
  Card,
  CardActionArea,
  CardMedia,
  CircularProgress,
  InputLabel,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import { Drawer, DrawerHeader, FileDropzone } from "../../../components";
import { IEmployer, IIdentity, ICandidate, Nullable } from "../../../interfaces";
import { resources } from "../../../utility";
import { useContext, useState, useEffect } from "react";
import { ColorModeContext } from "../../../contexts";

type Props = {
  action: "create" | "edit";
  open: boolean;
  onClose: () => void;
  product?: ICandidate;
  isDrawerOpen: boolean;
};

export const ProductDrawerForm = (props: Props) => {
  const go = useGo();
  const t = useTranslate();
  const { mode } = useContext(ColorModeContext);
  const [imageURL, setImageURL] = useState("");
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [filename, setFilename] = useState("");

  const {
    watch,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    refineCore: { onFinish, id, formLoading },
    saveButtonProps,
  } = useForm<ICandidate, HttpError, Nullable<ICandidate>>({
    defaultValues: {
      productName: "",
      productDescription: "",
      productPrice: "",
      productCategory: null,
      isActive: true,
      productImageURL: null,
    },
    refineCoreProps: {
      redirect: false,
      onMutationSuccess: () => {
        if (props.action === "create" || props.action === "edit") {
          props.onClose();
        }
        go({
          to: {
            action: "show",
            resource: resources.candidates,
            id: id!,
          },
        });
      },
    },
  });

  const { data: user } = useGetIdentity<IIdentity | null>();
  const isLoggedIn = !!user;
  const imageURLWatch = watch("productImageURL");

  useEffect(() => {
    if (imageURLWatch) {
      setImageURL(imageURLWatch);
    }
  }, [imageURLWatch]);

  useEffect(() => {
    if (props.action === "edit" && props.product) {
      const {
        productName,
        productDescription,
        productPrice,
        productCategory,
        isActive,
        productImageURL,
      } = props.product;
      setValue("productName", productName);
      setValue("productDescription", productDescription);
      setValue("productPrice", productPrice);
      setValue("productCategory", productCategory);
      setValue("isActive", isActive);
      setValue("productImageURL", productImageURL);
      setImageURL(productImageURL || "");
    }
  }, [props.action, props.product, setValue]);

  const {
    data: businesses,
    isLoading,
    error,
  } = useList<IEmployer>({
    resource: resources.candidates,
    filters: user?.$id
      ? [{ field: "userID", operator: "eq", value: user.$id }]
      : [],
  });

  const onFileUploaded = (url: string) => {
    setValue("productImageURL", url);
    setImageURL(url);
    setIsUploadLoading(false);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error fetching businesses!</div>;
  }

  return (
    <Drawer
      PaperProps={{ sx: { width: { sm: "100%", md: "416px" } } }}
      open={props.open}
      anchor="right"
      onClose={props.onClose}
    >
      <DrawerHeader
        title={
          props.action === "edit"
            ? t("businesses.products.titles.edit")
            : t("businesses.products.titles.create")
        }
        onCloseClick={props.onClose}
      />
      <form
        onSubmit={handleSubmit((data) => {
          onFinish(data);
        })}
      >
        <Paper
          sx={{
            marginTop: "32px",
          }}
        >
          <Stack padding="24px" spacing="24px">
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
                    <CardMedia component="img" height="160" image={imageURL} />
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

            {!isLoading &&
              businesses?.data.length === 0 &&
              props.isDrawerOpen && (
                <Stack sx={{ width: "100%" }} spacing={2}>
                  <Alert severity="error">
                    <AlertTitle>{t("businesses.error")}</AlertTitle>
                    {t("businesses.createFirst")}
                  </Alert>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      go({
                        to: {
                          action: "create",
                          resource: resources.candidates,
                        },
                      })
                    }
                  >
                    {t("business.createNew")}
                  </Button>
                </Stack>
              )}
            <Controller
              name="businessID"
              // control={control}
              defaultValue=""
              rules={{ required: t("business.required") }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.businessID}>
                  <InputLabel id="business-select-label">
                    {t("businesses.business")}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="business-select-label"
                    label={t("businesses.business")}
                  >
                    {businesses?.data.map((business) => (
                      <MenuItem key={business.id} value={business.id}>
                        {business.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors.businessID ? errors.businessID.message : ""}
                  </FormHelperText>
                </FormControl>
              )}
            />
            <FormControl fullWidth>
              <Controller
                // control={control}
                name="productName"
                defaultValue=""
                rules={{
                  required: t("errors.required.field", {
                    field: "productName",
                  }),
                }}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      id="name"
                      label={t("businesses.fields.name")}
                      placeholder={t("businesses.fields.name")}
                    />
                  );
                }}
              />
              {errors.productName && props.open && (
                <FormHelperText error>
                  {errors.productName.message}
                </FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth>
              <Controller
                // control={control}
                name="productDescription"
                defaultValue=""
                rules={{
                  required: t("errors.required.field", {
                    field: "productDescription",
                  }),
                }}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      id="productDescription"
                      label={t("businesses.fields.description")}
                      placeholder={t("businesses.fields.description")}
                    />
                  );
                }}
              />
              {errors.productDescription && props.open && (
                <FormHelperText error>
                  {errors.productDescription.message}
                </FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth>
              <Controller
                // control={control}
                name="productPrice"
                rules={{
                  required: t("errors.required.field", {
                    field: "productPrice",
                  }),
                }}
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      variant="outlined"
                      id="productPrice"
                      label={t("businesses.fields.price")}
                      placeholder={t("businesses.fields.price")}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  );
                }}
              />
              {errors.productPrice && props.open && (
                <FormHelperText error>
                  {errors.productPrice.message}
                </FormHelperText>
              )}
            </FormControl>
          </Stack>
        </Paper>
        <Stack
          direction="row"
          justifyContent="space-between"
          padding="16px 24px"
        >
          <Button variant="text" color="inherit" onClick={props.onClose}>
            {t("buttons.cancel")}
          </Button>
          {props.action === "edit" && (
            <DeleteButton
              recordItemId={id}
              variant="contained"
              onSuccess={() => {
                props.onClose();
              }}
            />
          )}
          <Button {...saveButtonProps} variant="contained">
            {t("buttons.save")}
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
};
