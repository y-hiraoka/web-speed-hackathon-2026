import { InfiniteScroll } from "@web-speed-hackathon-2026/client/src/components/foundation/InfiniteScroll";
import { TimelinePage } from "@web-speed-hackathon-2026/client/src/components/timeline/TimelinePage";
import { useInfiniteList } from "@web-speed-hackathon-2026/client/src/hooks/use_infinite_list";
import { fetchJSON } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

export const TimelineContainer = () => {
  const { data: posts, fetchMore } = useInfiniteList<Models.Post>("/api/v1/posts", fetchJSON, { limit: 12 });

  return (
    <InfiniteScroll fetchMore={fetchMore}>
      <title>タイムライン - CaX</title>
      <TimelinePage timeline={posts} />
    </InfiniteScroll>
  );
};
