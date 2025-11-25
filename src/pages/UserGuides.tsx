import { Layout } from "@/components/Layout";
import { ComingSoon } from "@/components/ComingSoon";
import { useNavigate } from "react-router-dom";

const UserGuides = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <ComingSoon
        title="User Guides"
        description="Comprehensive step-by-step guides for all platform features will be available here soon."
        type="content"
        showBackButton={true}
        onBack={() => navigate('/help-center')}
      />
    </Layout>
  );
};

export default UserGuides;
