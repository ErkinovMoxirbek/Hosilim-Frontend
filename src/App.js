import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuizApp from "./pages/QuizApp";
import LandingPage from "./components/LandingPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/nilufar" element={<QuizApp />} />
      </Routes>
    </Router>
  );
};

export default App;
