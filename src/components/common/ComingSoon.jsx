import ComingSoonImage from "../../assets/png/coming-soon.png";
import { Button } from "antd";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div
        style={{
          // padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          width: "100%",
          gap: "20px",
        }}
      >
        <div style={{ width: "100%" }}>
          <img
            src={ComingSoonImage}
            alt="Coming Soon"
            style={{
              maxWidth: "90%", // Ensures it fits within the viewport width
              maxHeight: "70vh", // Ensures it doesn't overflow the viewport height
              objectFit: "contain", // Maintains the aspect ratio
              margin: "0 auto", // Centers the image
            }}
          />
          <h2 className="m-0">Coming Soon</h2>
          <p>
            Exciting things are on the way! This page is under construction and
            will be available soon. Stay tuned!
          </p>
        </div>
        <Button type="primary" href="/" component={Link} className="px-5.5">
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default ComingSoon;
