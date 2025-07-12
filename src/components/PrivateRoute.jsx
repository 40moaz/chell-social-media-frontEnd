import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
