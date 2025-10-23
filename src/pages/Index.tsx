import { Layout } from "@/components/Layout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import UserTypes from "@/components/UserTypes";
import MentorshipPreview from "@/components/MentorshipPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <Layout showSidebar={true}>
      <Hero />
      <Features />
      <UserTypes />
      <MentorshipPreview />
      <Footer />
    </Layout>
  );
};

export default Index;