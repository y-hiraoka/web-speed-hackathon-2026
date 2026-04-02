import { useCallback, useEffect, useRef, useState } from "react";

import { AspectRatioBox } from "@web-speed-hackathon-2026/client/src/components/foundation/AspectRatioBox";
import { FontAwesomeIcon } from "@web-speed-hackathon-2026/client/src/components/foundation/FontAwesomeIcon";

interface Props {
  src: string;
}

/**
 * クリックすると再生・一時停止を切り替えます。
 */
export const PausableMovie = ({ src }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // prefers-reduced-motion に対応
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Lazy load: only load the video when it enters the viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth || 1;
      canvas.height = video.videoHeight || 1;
    }
    if (reducedMotion && video) {
      video.pause();
      setIsPlaying(false);
    }
  }, [reducedMotion]);

  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return (
    <AspectRatioBox aspectHeight={1} aspectWidth={1}>
      <button
        ref={containerRef}
        aria-label="動画プレイヤー"
        className="group relative block h-full w-full"
        onClick={handleClick}
        type="button"
      >
        {isVisible ? (
          <video
            ref={videoRef}
            autoPlay
            className="aspect-square w-full object-cover"
            loop
            muted
            onLoadedMetadata={handleLoadedMetadata}
            playsInline
            preload="metadata"
            src={src}
          />
        ) : (
          <div className="aspect-square w-full bg-cax-surface-subtle" />
        )}
        {/* e2e互換用の非表示canvas */}
        <canvas ref={canvasRef} className="hidden" />
        <div
          className={`text-cax-surface-raised bg-cax-overlay/50 absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-3xl ${isPlaying ? "opacity-0 group-hover:opacity-100" : ""}`}
        >
          <FontAwesomeIcon iconType={isPlaying ? "pause" : "play"} styleType="solid" />
        </div>
      </button>
    </AspectRatioBox>
  );
};
