import { Layout } from "@/components/Layout";
import { ComingSoon } from "@/components/ComingSoon";
import { useNavigate } from "react-router-dom";

const VideoTutorials = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <ComingSoon
        title="Video Tutorials"
        description="Watch comprehensive video walkthroughs covering all platform features. Coming soon."
        type="content"
        showBackButton={true}
        onBack={() => navigate('/help-center')}
      />
    </Layout>
  );
};

export default VideoTutorials;
