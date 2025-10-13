import * as React from "react";
import { cn } from "@/lib/utils";

interface TriangleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

const TriangleAvatar = React.forwardRef<HTMLDivElement, TriangleAvatarProps>(
  ({ className, src, alt, fallback, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const [aspectRatio, setAspectRatio] = React.useState(1);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    };

    const showFallback = !src || imageError;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center shrink-0 overflow-hidden rounded-2xl ring-4 ring-primary/20",
          "transition-all duration-300 shadow-lg",
          className
        )}
        style={{
          width: aspectRatio >= 1 ? "128px" : `${128 * aspectRatio}px`,
          height: aspectRatio <= 1 ? "128px" : `${128 / aspectRatio}px`,
        }}
        {...props}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl font-bold text-primary">
            {fallback}
          </div>
        )}
      </div>
    );
  }
);

TriangleAvatar.displayName = "TriangleAvatar";

export { TriangleAvatar };
