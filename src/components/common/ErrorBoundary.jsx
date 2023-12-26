import { Button } from "antd";
import { Link, useRouteError } from "react-router-dom";

function ErrorBoundary() {
  let error = useRouteError();
  console.error("Error:----->", error);
  // Uncaught ReferenceError: path is not defined
  return (
    <div className="flex items-center justify-center w-full">
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          width: "100%",
          gap: "20px",
        }}
      >
        <div>
          <h1 className="mb-2.5">500</h1>
          <h5 className="mb-2.5 text-xl">Internal server error 👨🏻‍💻</h5>
          <p>Oops, something went wrong!</p>
        </div>
        <Button
          href="/"
          component={Link}
          variant="contained"
          className="px-5.5"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
