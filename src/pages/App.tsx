import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "../routes/AppRoute";
import "./App.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
};

export default App;