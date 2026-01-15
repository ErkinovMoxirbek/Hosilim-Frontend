import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuizApp from "./pages/QuizApp";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuizApp />} />
      </Routes>
    </Router>
  );
};

export default App;
