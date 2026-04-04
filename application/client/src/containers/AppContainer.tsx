import { lazy, Suspense, useCallback, useEffect, useId, useState, useTransition } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";

import { AppPage } from "@web-speed-hackathon-2026/client/src/components/application/AppPage";
import { NotFoundContainer } from "@web-speed-hackathon-2026/client/src/containers/NotFoundContainer";
import { fetchJSON, sendJSON } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

const TimelineContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/TimelineContainer").then((m) => ({
    default: m.TimelineContainer,
  })),
);
const CrokContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/CrokContainer").then((m) => ({
    default: m.CrokContainer,
  })),
);
const DirectMessageContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/DirectMessageContainer").then((m) => ({
    default: m.DirectMessageContainer,
  })),
);
const DirectMessageListContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/DirectMessageListContainer").then(
    (m) => ({ default: m.DirectMessageListContainer }),
  ),
);
const PostContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/PostContainer").then((m) => ({
    default: m.PostContainer,
  })),
);
const SearchContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/SearchContainer").then((m) => ({
    default: m.SearchContainer,
  })),
);
const TermContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/TermContainer").then((m) => ({
    default: m.TermContainer,
  })),
);
const UserProfileContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/UserProfileContainer").then((m) => ({
    default: m.UserProfileContainer,
  })),
);
import { AuthModalContainer } from "@web-speed-hackathon-2026/client/src/containers/AuthModalContainer";
import { NewPostModalContainer } from "@web-speed-hackathon-2026/client/src/containers/NewPostModalContainer";

export const AppContainer = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const initialData = window.__INITIAL_DATA__;
  const hasInitialMe = initialData != null && "me" in initialData;

  const [activeUser, setActiveUser] = useState<Models.User | null>(
    hasInitialMe ? initialData.me : null,
  );
  const [, startTransition] = useTransition();
  useEffect(() => {
    if (hasInitialMe) {
      return;
    }
    const prefetched = window.__PREFETCH__?.["/api/v1/me"];
    const mePromise = prefetched
      ? (prefetched as Promise<Models.User>).then((user) => {
          delete window.__PREFETCH__!["/api/v1/me"];
          return user;
        })
      : fetchJSON<Models.User>("/api/v1/me");
    void mePromise.then((user) => {
      startTransition(() => {
        setActiveUser(user);
      });
    });
  }, [setActiveUser, hasInitialMe]);
  const handleLogout = useCallback(async () => {
    await sendJSON("/api/v1/signout", {});
    startTransition(() => {
      setActiveUser(null);
    });
    navigate("/");
  }, [navigate]);
  const handleUpdateActiveUser = useCallback((user: Models.User) => {
    startTransition(() => {
      setActiveUser(user);
    });
  }, []);

  const authModalId = useId();
  const newPostModalId = useId();

  return (
    <>
      <AppPage
        activeUser={activeUser}
        authModalId={authModalId}
        newPostModalId={newPostModalId}
        onLogout={handleLogout}
      >
        <Suspense fallback={null}>
          <Routes>
            <Route element={<TimelineContainer />} path="/" />
            <Route
              element={
                <DirectMessageListContainer activeUser={activeUser} authModalId={authModalId} />
              }
              path="/dm"
            />
            <Route
              element={<DirectMessageContainer activeUser={activeUser} authModalId={authModalId} />}
              path="/dm/:conversationId"
            />
            <Route element={<SearchContainer />} path="/search" />
            <Route element={<UserProfileContainer />} path="/users/:username" />
            <Route element={<PostContainer />} path="/posts/:postId" />
            <Route element={<TermContainer />} path="/terms" />
            <Route
              element={<CrokContainer activeUser={activeUser} authModalId={authModalId} />}
              path="/crok"
            />
            <Route element={<NotFoundContainer />} path="*" />
          </Routes>
        </Suspense>
      </AppPage>

      <dialog
        className="backdrop:bg-cax-overlay/50 bg-cax-surface fixed inset-0 m-auto w-full max-w-[calc(min(var(--container-md),100%)-var(--spacing)*4)] rounded-lg p-4"
        id={authModalId}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      >
        <AuthModalContainer dialogId={authModalId} onUpdateActiveUser={handleUpdateActiveUser} />
      </dialog>
      <dialog
        aria-label="新規投稿"
        className="backdrop:bg-cax-overlay/50 bg-cax-surface fixed inset-0 m-auto w-full max-w-[calc(min(var(--container-md),100%)-var(--spacing)*4)] rounded-lg p-4"
        id={newPostModalId}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      >
        <NewPostModalContainer dialogId={newPostModalId} />
      </dialog>
    </>
  );
};
