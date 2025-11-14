import { AspectRatio } from "@/components/ui/aspect-ratio";

const VideoIntroduction = () => {
  return (
    <section
      className="py-20 px-4 bg-gradient-to-b from-background via-secondary/10 to-background relative overflow-hidden"
      id="kumii_youtube"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Discover Our Platform
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch how Kumii empowers entrepreneurs and SMMEs across South Africa with access to capital, mentorship, and
            market opportunities
          </p>
        </div>

        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          {/* Video container */}
          <div className="relative bg-card rounded-2xl shadow-elegant overflow-hidden border border-border/50">
            <AspectRatio ratio={16 / 9}>
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/Ah7E6HUbAuU?si=As5bRSjTYB2Wkjvz&controls=0&modestbranding=1&rel=0&showinfo=0"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoIntroduction;
