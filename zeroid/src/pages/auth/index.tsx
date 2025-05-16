import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { authProvider } from "../../auth-provider";

const stellarSvg = (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M40.6 5.23017L34.908 8.13017L7.422 22.1302C7.32906 21.4213 7.28229 20.7071 7.282 19.9922C7.28576 17.1395 8.0347 14.3374 9.45464 11.8633C10.8746 9.38919 12.9163 7.32896 15.3774 5.8867C17.8386 4.44444 20.6338 3.67018 23.4863 3.64062C26.3388 3.61106 29.1495 4.32722 31.64 5.71817L34.898 4.05817L35.384 3.81017C32.3995 1.64394 28.8741 0.345091 25.1975 0.0571559C21.521 -0.230779 17.8364 0.503418 14.551 2.1786C11.2656 3.85379 8.5074 6.40472 6.58114 9.54948C4.65488 12.6942 3.63562 16.3104 3.636 19.9982C3.636 20.5075 3.65533 21.0148 3.694 21.5202C3.74815 22.2358 3.58944 22.9514 3.23784 23.5771C2.88623 24.2027 2.35744 24.7104 1.718 25.0362L0 25.9122V29.9982L5.058 27.4202L6.696 26.5842L8.31 25.7622L37.286 10.9982L40.542 9.34017L47.272 5.91017V1.82617L40.6 5.23017ZM47.272 10L9.956 29L6.7 30.662L0 34.076V38.158L6.654 34.768L12.346 31.868L39.86 17.848C39.953 18.5616 39.9998 19.2804 40 20C39.9982 22.8559 39.2495 25.6617 37.8282 28.1388C36.4069 30.6159 34.3624 32.6782 31.8976 34.1209C29.4329 35.5637 26.6337 36.3366 23.7779 36.3631C20.9221 36.3896 18.1091 35.6687 15.618 34.272L15.418 34.378L11.886 36.178C14.8699 38.3443 18.3945 39.6435 22.0705 39.9322C25.7465 40.2208 29.4307 39.4876 32.7161 37.8135C36.0014 36.1395 38.7601 33.5898 40.6872 30.4461C42.6143 27.3025 43.6348 23.6873 43.636 20C43.636 19.486 43.616 18.972 43.578 18.464C43.5239 17.7486 43.6825 17.0332 44.0337 16.4077C44.3849 15.7821 44.9131 15.2743 45.552 14.948L47.272 14.072V10ZM" fill="currentColor"/>
  </svg>
);

const authWrapperProps = {
  style: {
    background: "#101014",
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
      if (!authProvider) {
        setError("Authentication provider not available");
        setLoading(false);
        return;
      }
      const result = await (action === "login" ? authProvider.login?.({}) : authProvider.register?.({}));
      if (result && result.success) {
        navigate(result.redirectTo || "/");
      } else {
        setError(result?.error?.message || "Authentication failed");
      }
    } catch (e: any) {
      setError(e.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  if (type !== "login" && type !== "register") return null;

  const isLogin = type === "login";

  return (
    <div style={authWrapperProps.style}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        bgcolor="#212121"
        borderRadius={4}
        boxShadow={8}
        minWidth={350}
        maxWidth={380}
        width="100%"
        sx={{ position: "relative" }}
      >
        <Box mb={2} display="flex" flexDirection="column" alignItems="center">
          <Typography
            sx={{
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: 2,
              background: 'linear-gradient(90deg, #1a6cf6 0%, #1a9ff6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 16px #1a6cf633',
              fontFamily: 'Montserrat, Inter, Arial, sans-serif',
              mb: 1,
            }}
          >
            ZeroID
          </Typography>
          <Typography variant="h5" mt={1} color="#fff" fontWeight={700}>
            {isLogin ? "Welcome Back" : "Create your account"}
          </Typography>
        </Box>
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleAuth(isLogin ? "login" : "register")}
l          disabled={loading}
          fullWidth
          sx={{
            mb: 2,
            py: 1.5,
            fontWeight: 600,
            fontSize: "1.1rem",
            borderRadius: 2,
            background: "linear-gradient(90deg, #1a6cf6 0%, #1a9ff6 100%)",
            boxShadow: "0 2px 16px 0 #1a6cf633",
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : isLogin ? (
            "Sign in with Passkey"
          ) : (
            "Sign up with Passkey"
          )}
        </Button>
        <Button
          variant="text"
          color="secondary"
          onClick={() => navigate(isLogin ? "/register" : "/login")}
          disabled={loading}
          fullWidth
          sx={{ color: "#b0b0b0", fontWeight: 500, mb: 3 }}
        >
          {isLogin ? (
            <>Need an account? <span style={{ color: "#1a9ff6", marginLeft: 4 }}>Sign up</span></>
          ) : (
            <>Already have an account? <span style={{ color: "#1a9ff6", marginLeft: 4 }}>Sign in</span></>
          )}
        </Button>
        <Box width="100%" borderTop="1px solid #23232a" mt={2} mb={1} />
        <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
          {stellarSvg}
          <Typography variant="body2" color="#b0b0b0" ml={1} mr={1}>
            Powered by
          </Typography>
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "#fff",
              fontWeight: 600,
              marginRight: 8,
              transition: "text-decoration 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Stellar
          </a>
          <Typography variant="body2" color="#b0b0b0">& &nbsp;</Typography>
          <a
            href="https://polkadot.network"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "#E6007A",
              fontWeight: 600,
              transition: "text-decoration 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Polkadot
          </a>
        </Box>
      </Box>
    </div>
  );
};
