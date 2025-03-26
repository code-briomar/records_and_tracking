import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CTS from "./cts";
import Dashboard from "./dashboard";
import Home from "./home";
import Staff from "./staff";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/cts" element={<CTS />} />
      </Routes>
    </Router>
  );
}

export default App;
