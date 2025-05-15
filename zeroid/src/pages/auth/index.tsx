import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { authProvider } from "../../auth-provider";

const authWrapperProps = {
  style: {
    background:
      "radial-gradient(50% 50% at 50% 50%,rgba(255, 255, 255, 0) 0%,rgba(0, 0, 0, 0.5) 100%),url('images/login-bg.png')",
    backgroundSize: "cover",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export const AuthPage: React.FC<{ type: "login" | "register" | "forgotPassword" | "updatePassword"}> = ({ type }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (action: "login" | "register") => {
    setLoading(true);
    setError(null);
    try {
      const result = await (action === "login"
        ? authProvider.login?.({}) 
        : authProvider.register?.({}));

      if (!result) {
        throw new Error("Authentication method is not defined");
      }
      if (result.success) {
        navigate(result.redirectTo || "/");
      } else {
        setError(result.error?.message || "Authentication failed");
      }
    } catch (e: any) {
      setError(e.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authWrapperProps.style}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        bgcolor="rgba(255,255,255,0.9)"
        borderRadius={2}
        boxShadow={3}
        minWidth={320}
      >
        <Typography variant="h4" mb={2}>
          {type === "login" ? "Sign in with Passkey" : "Sign up with Passkey"}
        </Typography>
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (type === "login" || type === "register") {
              handleAuth(type);
            }
          }}
          disabled={loading}
          fullWidth
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : type === "login" ? "Sign in with Passkey" : "Sign up with Passkey"}
        </Button>
        <Button
          variant="text"
          color="secondary"
          onClick={() => navigate(type === "login" ? "/register" : "/login")}
          disabled={loading}
          fullWidth
        >
          {type === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </Button>
      </Box>
    </div>
  );
};
