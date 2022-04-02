import React from "react";
import axios from "axios";

const PrivateScreen = ({ history }) => {
  const [error, setError] = React.useState("");
  const [privateData, setPrivateData] = React.useState("");

  React.useEffect(() => {
    const fetchPrivateData = async () => {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      };

      try {
        const { data } = await axios.post("/api/private", {}, config);
        setPrivateData(data.data);
      } catch (error) {
        localStorage.removeItem("authToken");
        setError("You are not authorized, please login");
      }
    };

    fetchPrivateData();
  }, []);

  return (
    <div className="mt-3">
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="success">
          {privateData}
          <button
            className="auth-btn"
            onClick={() => {
              localStorage.removeItem("authToken", null);
              history.push("/");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default PrivateScreen;
