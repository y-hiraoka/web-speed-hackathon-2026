import { SearchPage } from "@web-speed-hackathon-2026/client/src/components/application/SearchPage";
import { InfiniteScroll } from "@web-speed-hackathon-2026/client/src/components/foundation/InfiniteScroll";
import { useInfiniteList } from "@web-speed-hackathon-2026/client/src/hooks/use_infinite_list";
import { useSearchParams } from "@web-speed-hackathon-2026/client/src/hooks/use_search_params";
import { fetchJSON } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

export const SearchContainer = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: posts, fetchMore } = useInfiniteList<Models.Post>(
    query ? `/api/v1/search?q=${encodeURIComponent(query)}` : null,
    fetchJSON,
  );

  return (
    <InfiniteScroll fetchMore={fetchMore}>
      <title>検索 - CaX</title>
      <SearchPage query={query} results={posts} initialValues={{ searchText: query }} />
    </InfiniteScroll>
  );
};
