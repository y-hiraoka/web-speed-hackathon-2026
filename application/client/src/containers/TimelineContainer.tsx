import { DocumentTitle } from "@web-speed-hackathon-2026/client/src/components/foundation/DocumentTitle";
import { InfiniteScroll } from "@web-speed-hackathon-2026/client/src/components/foundation/InfiniteScroll";
import { TimelinePage } from "@web-speed-hackathon-2026/client/src/components/timeline/TimelinePage";
import { useInfiniteFetch } from "@web-speed-hackathon-2026/client/src/hooks/use_infinite_fetch";
import { fetchJSON } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

export const TimelineContainer = () => {
  const { data: posts, fetchMore } = useInfiniteFetch<Models.Post>("/api/v1/posts", fetchJSON);

  return (
    <InfiniteScroll fetchMore={fetchMore} items={posts}>
      <DocumentTitle title="タイムライン - CaX" />
      <TimelinePage timeline={posts} />
    </InfiniteScroll>
  );
};
