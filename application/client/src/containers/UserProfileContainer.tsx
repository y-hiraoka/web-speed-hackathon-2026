import { useParams } from "react-router";
import useSWR from "swr";

import { InfiniteScroll } from "@web-speed-hackathon-2026/client/src/components/foundation/InfiniteScroll";
import { UserProfilePage } from "@web-speed-hackathon-2026/client/src/components/user_profile/UserProfilePage";
import { NotFoundContainer } from "@web-speed-hackathon-2026/client/src/containers/NotFoundContainer";
import { useInfiniteList } from "@web-speed-hackathon-2026/client/src/hooks/use_infinite_list";
import { fetchJSON } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

export const UserProfileContainer = () => {
  const { username } = useParams();

  const { data: user, error, isLoading: isLoadingUser } = useSWR<Models.User>(
    `/api/v1/users/${username}`,
    fetchJSON,
  );
  const { data: posts, fetchMore } = useInfiniteList<Models.Post>(
    `/api/v1/users/${username}/posts`,
    fetchJSON,
    { limit: 12 },
  );

  if (isLoadingUser) {
    return <title>読込中 - CaX</title>;
  }

  if (error || !user) {
    return <NotFoundContainer />;
  }

  return (
    <InfiniteScroll fetchMore={fetchMore}>
      <title>{user.name} さんのタイムライン - CaX</title>
      <UserProfilePage timeline={posts} user={user} />
    </InfiniteScroll>
  );
};
