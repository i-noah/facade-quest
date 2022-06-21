import { Skeleton } from "@mui/material";
import { FC, useEffect, useState } from "react";

interface ImageLoaderProps {
  src: string;
  className?: string;
}

export const ProgressiveBackgroundImage: FC<ImageLoaderProps> = ({ src, className }) => {
  const [sourceLoaded, setSourceLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setSourceLoaded(true);
  }, [src]);

  if (sourceLoaded)
    return (
      <div
        className={className}
        style={{
          backgroundImage: `url(${src})`,
        }}
      />
    );
  else
    return (
      <Skeleton
        className={className}
        sx={{ bgcolor: "grey.900" }}
        variant="rectangular"
        width="100%"
        height="100%"
      />
    );
};
