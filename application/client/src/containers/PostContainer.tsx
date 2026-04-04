import { useParams } from "react-router";
import useSWR from "swr";

import { InfiniteScroll } from "@web-speed-hackathon-2026/client/src/components/foundation/InfiniteScroll";
import { PostPage } from "@web-speed-hackathon-2026/client/src/components/post/PostPage";
import { NotFoundContainer } from "@web-speed-hackathon-2026/client/src/containers/NotFoundContainer";
import { useInfiniteList } from "@web-speed-hackathon-2026/client/src/hooks/use_infinite_list";
import { fetchJSON } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

const PostContainerContent = ({ postId }: { postId: string | undefined }) => {
  const { data: post, error, isLoading: isLoadingPost } = useSWR<Models.Post>(
    `/api/v1/posts/${postId}`,
    fetchJSON,
  );

  const { data: comments, fetchMore } = useInfiniteList<Models.Comment>(
    `/api/v1/posts/${postId}/comments`,
    fetchJSON,
  );

  if (isLoadingPost) {
    return <title>読込中 - CaX</title>;
  }

  if (error || !post) {
    return <NotFoundContainer />;
  }

  return (
    <InfiniteScroll fetchMore={fetchMore}>
      <title>{post.user.name} さんのつぶやき - CaX</title>
      <PostPage comments={comments} post={post} />
    </InfiniteScroll>
  );
};

export const PostContainer = () => {
  const { postId } = useParams();
  return <PostContainerContent key={postId} postId={postId} />;
};
