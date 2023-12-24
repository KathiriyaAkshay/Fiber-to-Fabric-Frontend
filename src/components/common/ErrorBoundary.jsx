import { Box, Button, Typography } from "@mui/material";
import { Link, useRouteError } from "react-router-dom";

function ErrorBoundary() {
  let error = useRouteError();
  console.error("Error:----->", error);
  // Uncaught ReferenceError: path is not defined
  return (
    <Box className="flex items-center justify-center w-full">
      <Box
        sx={{
          p: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          width: "100%",
          gap: "20px",
        }}
      >
        <Box>
          <Typography variant="h1" sx={{ mb: 2.5 }}>
            500
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 2.5, fontSize: "1.5rem !important" }}
          >
            Internal server error 👨🏻‍💻
          </Typography>
          <Typography variant="body2">Oops, something went wrong!</Typography>
        </Box>
        <Button href="/" component={Link} variant="contained" sx={{ px: 5.5 }}>
          Back to Home
        </Button>
      </Box>
    </Box>
  );
}

export default ErrorBoundary;
