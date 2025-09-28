import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import UserTypes from "@/components/UserTypes";
import MentorshipPreview from "@/components/MentorshipPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <UserTypes />
      <MentorshipPreview />
      <Footer />
    </div>
  );
};

export default Index;