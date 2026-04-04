import { useEffect, useState, startTransition } from "react";

import { TimelineItem } from "@web-speed-hackathon-2026/client/src/components/timeline/TimelineItem";

const ABOVE_FOLD_COUNT = 3;

interface Props {
  timeline: Models.Post[];
}

export const Timeline = ({ timeline }: Props) => {
  const aboveFold = timeline.slice(0, ABOVE_FOLD_COUNT);
  const belowFold = timeline.slice(ABOVE_FOLD_COUNT);

  const [showBelowFold, setShowBelowFold] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setShowBelowFold(true);
    });
  }, []);

  return (
    <section>
      {aboveFold.map((post, index) => {
        return <TimelineItem key={post.id} post={post} index={index} />;
      })}
      {showBelowFold
        ? belowFold.map((post, index) => {
            return <TimelineItem key={post.id} post={post} index={ABOVE_FOLD_COUNT + index} />;
          })
        : null}
    </section>
  );
};
