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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cts" element={<CTS />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/files" element={<File />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path={"/all_notifications"} element={<NotificationsSection />} />
        <Route path={"/messaging"} element={<Messaging />} />
        <Route path={"/tools"} element={<Tools />} />

        {/*Protected Paths - Super Admin*/}
        <Route path={"/audit_logs"} element={<AuditLogs />} />
        <Route path={"/customize"} element={<Customize />} />
      </Routes>
    </Router>
  );
}

export default App;
