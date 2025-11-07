import { Layout } from "@/components/Layout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import UserTypes from "@/components/UserTypes";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <Layout showSidebar={false}>
      <Hero />
      <Features />
      <UserTypes />
      <Footer />
    </Layout>
  );
};

export default Index;