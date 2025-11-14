import { Layout } from "@/components/Layout";
import Hero from "@/components/Hero";
import VideoIntroduction from "@/components/VideoIntroduction";
import Features from "@/components/Features";
import UserTypes from "@/components/UserTypes";
import Footer from "@/components/Footer";

const Index = () => {
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