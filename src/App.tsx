import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AuditLogs from "./audit_logs";
import Auth from "./auth";
import NotificationsSection from "./components/notifications_section.tsx";
import CTS from "./cts";
import Customize from "./customize";
import Dashboard from "./dashboard";
import File from "./files";
import Home from "./home";
import Messaging from "./messaging";
import Notifications from "./notifications";
import Staff from "./staff";
import Tools from "./tools/index.tsx";

import { Navigate } from "react-router-dom";
import { useAuth } from "./context/auth_context.tsx";
import Diary from "./diary/index.tsx";

const PrivateRoute = ({
  authData,
  children,
}: {
  authData: any;
  children: React.ReactNode;
}) => {
  return authData ? children : <Navigate to="/" replace />;
};

function App() {
  const { authData } = useAuth();
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Auth />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute authData={authData}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute authData={authData}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/cts"
          element={
            <PrivateRoute authData={authData}>
              <CTS />
            </PrivateRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <PrivateRoute authData={authData}>
              <Diary />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <PrivateRoute authData={authData}>
              <Staff />
            </PrivateRoute>
          }
        />
        <Route
          path="/files"
          element={
            <PrivateRoute authData={authData}>
              <File />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute authData={authData}>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/all_notifications"
          element={
            <PrivateRoute authData={authData}>
              <NotificationsSection />
            </PrivateRoute>
          }
        />
        <Route
          path="/messaging"
          element={
            <PrivateRoute authData={authData}>
              <Messaging />
            </PrivateRoute>
          }
        />
        <Route
          path="/tools"
          element={
            <PrivateRoute authData={authData}>
              <Tools />
            </PrivateRoute>
          }
        />
        <Route
          path="/audit_logs"
          element={
            <PrivateRoute authData={authData}>
              <AuditLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/customize"
          element={
            <PrivateRoute authData={authData}>
              <Customize />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
