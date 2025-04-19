import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CTS from "./cts";
import Dashboard from "./dashboard";
import File from "./files";
import Home from "./home";
import Notifications from "./notifications";
import Staff from "./staff";
import Auth from "./auth";
import NotificationsSection from "./components/notifications_section.tsx";
import AuditLogs from "./audit_logs";
import Customize from "./customize";
import Messaging from "./messaging";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/cts" element={<CTS />} />
        <Route path="/files" element={<File />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path={"/all_notifications"} element={<NotificationsSection/>}/>
        <Route path={"/messaging"} element={<Messaging/>}/>

        {/*Protected Paths - Super Admin*/}
        <Route path={"/audit_logs"} element={<AuditLogs/>}/>
        <Route path={"/customize"} element={<Customize/>}/>
      </Routes>
    </Router>
  );
}

export default App;
