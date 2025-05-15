import { useForm } from "@refinedev/react-hook-form";
import {
  TextField,
  Button,
  Select,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { FileDropzone } from "../../components";
import { languageMenuItems } from "../../utils";
import MDEditor from "@uiw/react-md-editor";

import { useContext, useState } from "react";
import { ColorModeContext } from "../../contexts";
import { Create } from "@refinedev/mui";
import { resources } from "../../utility";
import CurrencySelector from "../../components/currency-selector";
import { useGetIdentity, useTranslate } from "@refinedev/core";
import { IIdentity } from "../../interfaces";
import MuiPhoneNumber from "material-ui-phone-number";
export const BusinessCreate: React.FC = () => {
  const { mode } = useContext(ColorModeContext);
  const t = useTranslate();

  const [imageURL, setImageURL] = useState("");
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [filename, setFilename] = useState("");
  const { data: user } = useGetIdentity<IIdentity | null>();

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();

  const onFileUploaded = (url: string) => {
    setValue("imageURL", url);
    setImageURL(url);
    setIsUploadLoading(false);
  };

  return (
    <Create footerButtons={({ saveButtonProps }) => <></>}>
      <form onSubmit={handleSubmit(onFinish)}>
        <input {...register("imageURL")} style={{ display: "none" }} />
        {imageURL?.length > 0 ? (
          <img
            src={imageURL}
            alt={t("businesses.uploadedFile")}
            style={{ maxWidth: "100%", maxHeight: 200 }}
          />
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
          helperText={errors.name ? t("businesses.fields.nameHelper") : ""}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          {...register("userID", { required: true })}
          label="userID"
          fullWidth
          value={user?.$id}
          typeof="hidden"
          variant="outlined"
          margin="normal"
          style={{ display: "none" }}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Controller
          name="description"
          // control={control}
          defaultValue=""
          rules={{ required: t("businesses.fields.descriptionRequired") }} // Adding a rule for required
          render={({ field, fieldState: { error } }) => (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t("businesses.fields.descriptionLabel")}
              </Typography>
              <MDEditor
                data-color-mode={mode === "dark" ? "dark" : "light"}
                {...field}
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
              {/* Conditionally render helper text if there's an error */}
              {error && (
                <Typography
                  color="error"
                  variant="caption"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  {error.message || t("businesses.fields.descriptionHelper")}
                </Typography>
              )}
            </Box>
          )}
        />
        <FormControl fullWidth margin="normal" error={!!errors.phone}>
          <Controller
            name="phone"
            // control={control}
            rules={{ required: t("businesses.fields.phoneHelper") }}
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
          {...(register("email"), { required: false })}
          label="Email"
          error={!!errors.email}
          helperText={errors.email ? t("businesses.fields.emailHelper") : ""}
          fullWidth
          variant="outlined"
          margin="normal"
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
                label={t("businesses.fields.languages")}
                fullWidth
                multiple
                variant="outlined"
                value={field.value || []} // Ensure value is an array
                onChange={(event) => field.onChange(event.target.value)} // Handle change correctly
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
        <Box
          sx={{
            paddingTop: 2,
            position: "relative",
            "&:hover": {
              ".view-button": {
                display: "flex",
              },
            },
          }}
        >
          <Controller
            name="currency"
            // control={control}
            defaultValue="" // Set a default value or manage it via external props
            render={({ field }) => (
              <CurrencySelector
                currentCurrency={field.value}
                onChange={field.onChange} // Link directly to React Hook Form's Controller
              />
            )}
          />
        </Box>

        <FormControlLabel
          style={{ display: "none" }} // Hide the label
          control={<Switch {...register("isPublic")} />}
          label="Is Public"
        />

        <Button type="submit" variant="contained" color="primary">
          {t("buttons.saveChanges")}
        </Button>
      </form>
    </Create>
  );
};
