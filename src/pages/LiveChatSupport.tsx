import { Layout } from "@/components/Layout";
import { ComingSoon } from "@/components/ComingSoon";
import { useNavigate } from "react-router-dom";

const LiveChatSupport = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <ComingSoon
        title="Live Chat Support"
        description="Real-time chat support with our team will be available soon to help you with any questions."
        type="feature"
        showBackButton={true}
        onBack={() => navigate('/help-center')}
      />
    </Layout>
  );
};

export default LiveChatSupport;
