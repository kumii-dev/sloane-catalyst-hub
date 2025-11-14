import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import Hero from "@/components/Hero";
import VideoIntroduction from "@/components/VideoIntroduction";
import Features from "@/components/Features";
import UserTypes from "@/components/UserTypes";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    // Handle hash navigation on page load
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  return (
    <Layout showSidebar={false}>
      <Hero />
      <VideoIntroduction />
      <Features />
      <UserTypes />
      <Footer />
    </Layout>
  );
};

export default Index;