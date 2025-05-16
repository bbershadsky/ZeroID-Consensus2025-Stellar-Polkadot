import React, { useContext, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { FileDropzone } from "../../components";
import { languageMenuItems } from "../../utils";
import MDEditor from "@uiw/react-md-editor";
import { ColorModeContext } from "../../contexts";
import { Create } from "@refinedev/mui";
import { resources } from "../../utility";
import CurrencySelector from "../../components/currency-selector";
import { useGetIdentity, useTranslate } from "@refinedev/core";
import { IIdentity } from "../../interfaces";
import MuiPhoneNumber from "material-ui-phone-number";

// Define a type for your form values for better type safety
interface EmployerFormValues {
  imageURL: string;
  name: string;
  userID: string;
  description: string;
  phone: string;
  email: string; // Assuming email is optional based on { required: false }
  languages: string[];
  currency: string;
  isPublic: boolean;
}

export const EmployersCreate: React.FC = () => {
  const { mode } = useContext(ColorModeContext);
  const t = useTranslate();

  const [imageURL, setImageURL] = useState("");

  const { data: user } = useGetIdentity<IIdentity | null>();

  const {
    // Removed refineCore as it does not exist on useForm
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control, // control will be of type Control<EmployerFormValues>
  } = useForm<EmployerFormValues>({ // Use the specific interface here
    defaultValues: {
      imageURL: "",
      name: "",
      userID: user?.$id || "", // Initialize with user ID if available, will be updated by useEffect
      description: "",
      phone: "",
      email: "",
      languages: [],
      currency: "",
      isPublic: false,
      // originalFilename: "",
    },
  });

  // Effect to update userID when user data is available/changes
  useEffect(() => {
    if (user?.$id) {
      setValue("userID", user.$id, { shouldValidate: false, shouldDirty: false });
    }
  }, [user, setValue]);

  const onFileUploaded = (url: string /*, uploadedFilename: string */) => { // Potentially receive filename too
    setValue("imageURL", url, { shouldValidate: true, shouldDirty: true });
    setImageURL(url);
    // setIsUploadLoading(false); // FileDropzone handles its internal loading state
    // If you need to save the filename from FileDropzone:
    // setValue("originalFilename", uploadedFilename, { shouldValidate: true, shouldDirty: true });
    // setFilename(uploadedFilename);
  };

  // If FileDropzone's setFilename prop is still needed, adjust its signature or how it's used.
  // For now, assuming original filename might be passed back in onFileUploaded if needed for the form.
  const handleSetFilename = (newFilename: string) => {
    // If 'filename' from FileDropzone is purely informational for that component or for direct use
    // and not part of the main form data, its handling might differ.
    // If it *is* form data, it should be part of EmployerFormValues.
    console.log("Uploaded filename (from FileDropzone):", newFilename);
    // setFilename(newFilename); // If you still need this local state for some reason
  };


  return (
    <Create footerButtons={({ saveButtonProps }) => <></>}> {/* Consider adding saveButtonProps if you want Refine's default save button logic */}
      <form onSubmit={handleSubmit((data) => {
        console.log("Form submitted with data:", data);
        // Add your custom onFinish logic here
      })}>
        {/* imageURL is handled by setValue, this hidden input might be redundant unless onFinish directly uses FormData from the form element */}
        {/* If onFinish uses the data object from handleSubmit, this hidden input is not strictly necessary for react-hook-form's state */}
        <input type="hidden" {...register("imageURL")} />

        {imageURL && imageURL.length > 0 ? ( // Check imageURL state which is synced with the form value
          <img
            src={imageURL}
            alt={t("businesses.uploadedFile")}
            style={{ maxWidth: "100%", maxHeight: 200, display: "block", margin: "10px 0" }}
          />
        ) : (
          <FileDropzone
            bucketID={resources.bucketFiles}
            onFileUploaded={onFileUploaded} // Pass the updated handler
            setFilename={handleSetFilename} // Pass a handler for filename if needed
            setImageURL={setImageURL} // This updates local imageURL for preview
            imageURL={imageURL} // Pass current local imageURL for FileDropzone's internal logic
          />
        )}

        <TextField
          {...register("name", { required: t("businesses.fields.nameRequired", "Name is required") })}
          label={t("businesses.fields.nameLabel", "Name")}
          error={!!errors.name}
          helperText={errors.name?.message || (errors.name ? t("businesses.fields.nameHelper", "Please enter a name") : "")}
          fullWidth
          variant="outlined"
          margin="normal"
        />

        {/* userID is managed by setValue and is hidden. No need for visible TextField elements usually. */}
        {/* This hidden input ensures userID is part of the form submission if onFinish relies on native form data. */}
        {/* If onFinish uses the object from handleSubmit(data => ...), this is less critical. */}
        <input type="hidden" {...register("userID", { required: true })} />
        {/* If you need to display it for debugging (remove for production):
          <TextField label="UserID (Debug)" {...register("userID")} disabled fullWidth margin="normal" />
        */}

        <Controller
          name="description"
          control={control} // Removed 'as any', should work with Control<EmployerFormValues>
          defaultValue=""
          rules={{ required: t("businesses.fields.descriptionRequired", "Description is required") }}
          render={({ field, fieldState: { error } }) => (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}> {/* Changed to subtitle1 for better hierarchy if Name is h6-like */}
                {t("businesses.fields.descriptionLabel", "Description")}
              </Typography>
              <MDEditor
                data-color-mode={mode === "dark" ? "dark" : "light"}
                {...field}
              // value={field.value} // {...field} already includes value
              // onChange={(value) => field.onChange(value)} // {...field} already includes onChange
              />
              {error && (
                <Typography
                  color="error"
                  variant="caption"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  {error.message || t("businesses.fields.descriptionHelper", "Please provide a description")}
                </Typography>
              )}
            </Box>
          )}
        />

        <FormControl fullWidth margin="normal" error={!!errors.phone}>
          <Controller
            name="phone"
            control={control}
            rules={{ required: t("businesses.fields.phoneRequired", "Phone number is required") }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <MuiPhoneNumber // Ensure this component is compatible with RHF Controller's field props
                variant="outlined"
                label={t("businesses.fields.phoneLabel", "Phone")}
                defaultCountry={"ca"}
                onChange={onChange} // This should be compatible
                value={value || ""} // Ensure value is not null/undefined if MuiPhoneNumber requires a string
                error={!!error}
                helperText={error?.message || (error ? t("businesses.fields.phoneHelper", "Invalid phone number") : null)}
              />
            )}
          />
        </FormControl>

        <TextField
          {...register("email", { required: false })} // Corrected spread syntax for register options
          label={t("businesses.fields.emailLabel", "Email")}
          type="email"
          error={!!errors.email}
          helperText={errors.email?.message || (errors.email ? t("businesses.fields.emailHelper", "Invalid email format") : "")}
          fullWidth
          variant="outlined"
          margin="normal"
        />

        <FormControl fullWidth margin="normal" error={!!errors.languages}>
          <InputLabel id="language-select-label">{t("businesses.fields.languagesLabel", "Languages Spoken")}</InputLabel>
          <Controller
            name="languages" // Added 'name' prop
            control={control}
            defaultValue={[]}
            rules={{
              required: t("validation.requiredRule", { // Using a more generic key for the rule itself
                field: t("businesses.fields.languagesLabel", "Languages"), // Field name for the message
              }),
            }}
            render={({ field, fieldState: { error } }) => (
              <>
                <Select
                  {...field}
                  labelId="language-select-label"
                  label={t("businesses.fields.languagesLabel", "Languages Spoken")}
                  multiple
                  variant="outlined"
                  value={field.value || []} // Ensure value is an array for multiple Select
                // onChange is handled by {...field}
                >
                  {languageMenuItems.map((item) => (
                    <MenuItem key={item.key} value={item.key}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
                {error && (
                  <Typography color="error" variant="caption" sx={{ pl: 2, pt: 0.5 }}>
                    {error.message}
                  </Typography>
                )}
              </>
            )}
          />
        </FormControl>

        <Box sx={{ paddingTop: 2, position: "relative" }}>
          <Controller
            name="currency"
            control={control}
            defaultValue=""
            rules={{ required: t("businesses.fields.currencyRequired", "Currency is required") }}
            render={({ field, fieldState: { error } }) => ( // Corrected render prop syntax
              <>
                <CurrencySelector
                  currentCurrency={field.value || ""} // Ensure value is not null/undefined
                  onChange={field.onChange}
                // You might want to pass error state to CurrencySelector if it can display errors
                />
                {error && (
                  <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {error.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Box>

        <FormControlLabel
          control={<Switch {...register("isPublic")} defaultChecked={false} />} // defaultChecked for initial render before RHF takes over
          label={t("businesses.fields.isPublicLabel", "Make Publicly Visible")}
          sx={{ mt: 1, mb: 1 }}
        // style={{ display: "none" }} // If you want it hidden, consider if it should be in the form at all
        // or set its value programmatically without user interaction.
        // For a boolean toggle, it's usually visible.
        />

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          {t("buttons.saveChanges", "Save Changes")}
        </Button>
      </form>
    </Create>
  );
};