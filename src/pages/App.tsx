import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "../routes/AppRoute";
import "./App.css";
import FloatingChat from "../components/chat/FloatingChat";
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <AppRoutes />
        <FloatingChat />
      </div>
    </BrowserRouter>
  );
};

export default App;
