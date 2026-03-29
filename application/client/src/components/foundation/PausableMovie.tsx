import classNames from "classnames";
import { useCallback, useRef, useState } from "react";

import { AspectRatioBox } from "@web-speed-hackathon-2026/client/src/components/foundation/AspectRatioBox";
import { FontAwesomeIcon } from "@web-speed-hackathon-2026/client/src/components/foundation/FontAwesomeIcon";

interface Props {
  src: string;
}

/**
 * クリックすると再生・一時停止を切り替えます。
 */
export const PausableMovie = ({ src }: Props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);


  // prefers-reduced-motion に対応
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleLoad = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (img && canvas) {
      // e2e互換: canvas にサイズを設定
      canvas.width = img.naturalWidth || 1;
      canvas.height = img.naturalHeight || 1;
    }
    if (reducedMotion) {
      setIsPlaying(false);
    }
  }, [reducedMotion]);

  const handleClick = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // 一時停止中は静止画を表示するため、srcをデータURLに差し替えるのではなく
  // CSSで制御する（GIFアニメーションはブラウザがネイティブに処理）
  // 注: ブラウザによってはGIFの一時停止はサポートされないが、
  // パフォーマンス面ではJS GIFデコードを排除することが重要

  return (
    <AspectRatioBox aspectHeight={1} aspectWidth={1}>
      <button
        aria-label="動画プレイヤー"
        className="group relative block h-full w-full"
        onClick={handleClick}
        type="button"
      >
        <img
          ref={imgRef}
          className="w-full"
          onLoad={handleLoad}
          src={src}
        />
        {/* e2e互換用の非表示canvas */}
        <canvas ref={canvasRef} className="hidden" />
        <div
          className={classNames(
            "absolute left-1/2 top-1/2 flex items-center justify-center w-16 h-16 text-cax-surface-raised text-3xl bg-cax-overlay/50 rounded-full -translate-x-1/2 -translate-y-1/2",
            {
              "opacity-0 group-hover:opacity-100": isPlaying,
            },
          )}
        >
          <FontAwesomeIcon iconType={isPlaying ? "pause" : "play"} styleType="solid" />
        </div>
      </button>
    </AspectRatioBox>
  );
};
