import { Layout } from "@/components/Layout";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";

const CreditScoreAssessment = () => {
  return (
    <Layout showSidebar={true}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Credit Score Assessment</h1>
          <p className="text-lg text-muted-foreground">
            Complete this comprehensive assessment to receive your business credit score
          </p>
        </div>
        <AssessmentForm />
      </div>
    </Layout>
  );
};

export default CreditScoreAssessment;