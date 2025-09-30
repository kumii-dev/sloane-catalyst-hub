import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";

const CreditScoreAssessment = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Credit Score Assessment</h1>
            <p className="text-lg text-muted-foreground">
              Complete this comprehensive assessment to receive your business credit score
            </p>
          </div>
          <AssessmentForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreditScoreAssessment;