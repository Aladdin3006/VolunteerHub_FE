
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import CampaignDetail from"./campaignDetail/CampaignDetail";
import AboutUs from "../pages/about-us/aboutus";
import DonatePage from "../pages/about-us/DonatePage";
import ForgotPW from "./login/ForgotPW";
import ResetPW from "./login/ResetPW";
import Profile from "./profile/Profile";
import CampaignHome from '../pages/campaign/CampaignHome';
import "./App.css";


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/campagin" element={<CampaignHome />} />

          <Route path="/forgot-password" element={<ForgotPW />} />
          <Route path="/reset-password" element={<ResetPW />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/donate" element={<DonatePage />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
