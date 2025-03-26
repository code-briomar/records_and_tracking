import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CTS from "./cts";
import Dashboard from "./dashboard";
import File from "./files";
import Home from "./home";
import Notifications from "./notifications";
import Staff from "./staff";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/cts" element={<CTS />} />
        <Route path="/files" element={<File />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </Router>
  );
}

export default App;
