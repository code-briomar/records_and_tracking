import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./dashboard";
import Home from "./home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
