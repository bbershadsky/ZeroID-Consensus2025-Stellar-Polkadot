import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Typography,
  Avatar,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Modal,
  Divider,
} from "@mui/material";
import { IIdentity, IUser } from "../../interfaces";
import {
  useGetIdentity,
  useTranslate,
  useInvalidate,
  useUpdate,
  useOne,
  useList,
} from "@refinedev/core";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { FileDropzone } from "../../components";
import {
  getPrefs,
  resources,
  updateEmail,
  updateName,
  updatePrefs,
} from "../../utility";

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity<IIdentity | null>();
  const [email, setEmail] = useState(user?.email);
  const [originalEmail] = useState(user?.email);
  const [myProfile, setMyProfile] = useState(false);
  const [name, setName] = useState(user?.name);
  let { id } = useParams();
  const [password, setPassword] = useState("");
  const [imageURL, setImageURL] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const t = useTranslate();
  const invalidate = useInvalidate();

  const { mutate } = useUpdate();

  const {
    data: userData,
    isLoading,
    isError,
  } = useList<IUser>({
    resource: resources.candidates,
    filters: [
      {
        field: "userID",
        operator: "eq",
        value: user?.$id,
      },
    ],
  });

  const userId = userData?.data[0]?.id;

  useEffect(() => {
    if (user) {
      if (user.$id === id) {
        setMyProfile(true);
        // tood get user's image
      } else {
        try {
          const result = getPrefs(id!);
          console.log("got prefs:", result);
        } catch (error) {
          console.error("Failed to get user:", error);
        }
      }
      setEmail(user.email);
      setName(user.name);
      setImageURL(user.prefs.profilePhoto);
      console.log(id, user?.$id);
    }
  }, [user, id]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleOpenProfile = () => {
    navigate(`/users/${id}`);
  };

  if (!userId) {
    console.error("User data not found");
    return;
  }

  const handleSubmit = async () => {
    if (name) {
      try {
        const result = await updateName(name);
        console.log("Updated name successfully:", result);
        invalidate({
          resource: "auth",
          // dataProviderName: "identity",
          invalidates: ["all"],
        });
        try {
          mutate(
            {
              resource: resources.candidates,
              id: userId,
              values: {
                name: name,
              },
            },
            {
              onSuccess: () => {
                setTimeout(() => {}, 3000);
                navigate(`/users/${user?.$id}`, { replace: true });
              },
              onError: (error) => {
                console.error("Error editing name:", error);
              },
            }
          );
        } catch (error) {
          console.error("Failed to update profile photo:", error);
        }
      } catch (error) {
        console.error("Failed to update name:", error);
      }
    }
    if (email && password) {
      try {
        const result = await updateEmail(email, password);
        console.log("email updated successfully:", result);
      } catch (error) {
        console.error("Failed to update email:", error);
      }
    }

    if (imageURL) {
      try {
        const newPreferences = {
          // theme: "dark",
          // notifications: true,
          // language: "",
          // currency: "USD",
          profilePhoto: imageURL,
        };
        const result = await updatePrefs(newPreferences);
        console.log("Preferences updated successfully:", result);
      } catch (error) {
        console.error("Failed to update preferences:", error);
      }
      try {
        mutate(
          {
            resource: resources.candidates,
            id: userId,
            values: {
              profilePhoto: imageURL,
            },
          },
          {
            onSuccess: () => {
              navigate(`/users/${user?.$id}`, { replace: true });
            },
            onError: (error) => {
              console.error("Error editing user:", error);
            },
          }
        );
      } catch (error) {
        console.error("Failed to update profile photo:", error);
      }
    }
    // navigate(0);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const onFileUploaded = (url: string) => {
    setImageURL(url);
  };

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      noValidate
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {myProfile ? t("profile.myProfile") : t("profile.usersProfile")}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleOpenProfile}>
        {t("profile.view")}
      </Button>
      <Divider sx={{ mb: 2 }} />
      {imageURL?.length > 0 ? (
        <Card>
          <CardContent>
            <Box
              sx={{
                position: "relative",
                "&:hover .view-button": {
                  display: "flex",
                },
              }}
            >
              <Avatar
                alt=""
                sx={{ width: 250, height: 250, mb: 2 }}
                src={imageURL}
                variant="rounded"
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
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "none",
                  zIndex: 1,
                }}
              >
                {t("buttons.replace-image")}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <FileDropzone
          bucketID={resources.bucketFiles}
          onFileUploaded={onFileUploaded}
          setFilename={() => {}}
          setImageURL={setImageURL}
          imageURL={imageURL}
        />
      )}
      <Divider sx={{ mb: 2 }} />

      {myProfile ? (
        <>
          <TextField
            required
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            variant="outlined"
            onClick={handleOpenModal}
            sx={{ display: email !== originalEmail ? "block" : "none" }}
          >
            {t("profile.updateEmail")}
          </Button>
          <TextField
            InputLabelProps={{ shrink: true }}
            required
            id="name"
            label="Name"
            type="text"
            value={name}
            onChange={handleNameChange}
          />
        </>
      ) : (
        <></>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2, mb: 2 }}
      >
        {t("profile.updatePrefs")}
      </Button>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {t("pages.updatePassword.enterPassword")}
          </Typography>
          <TextField
            required
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleSubmit();
              handleCloseModal();
            }}
            sx={{ mt: 2 }}
          >
            {t("pages.updatePassword.confirm")}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default UserProfile;
