import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import HeroSection from "../../components/landing/Hero";
const Home: React.FC = () => {

  return (
    <div className="home-page">
      <Header />
      <HeroSection/>
      <Footer />
    </div>
  );
};

export default Home;
