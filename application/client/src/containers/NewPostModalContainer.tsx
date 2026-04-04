import { useCallback, useEffect, useId, useState } from "react";

import { NewPostModalPage } from "@web-speed-hackathon-2026/client/src/components/new_post_modal/NewPostModalPage";
import { sendFile, sendJSON } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

interface SubmitParams {
  images: File[];
  movie: File | undefined;
  sound: File | undefined;
  text: string;
}

async function sendNewPost({ images, movie, sound, text }: SubmitParams): Promise<Models.Post> {
  const payload = {
    images: images
      ? await Promise.all(images.map((image) => sendFile("/api/v1/images", image)))
      : [],
    movie: movie ? await sendFile("/api/v1/movies", movie) : undefined,
    sound: sound ? await sendFile("/api/v1/sounds", sound) : undefined,
    text,
  };

  return sendJSON("/api/v1/posts", payload);
}

interface Props {
  dialogId: string;
}

export const NewPostModalContainer = ({ dialogId }: Props) => {
  const headingId = useId();
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    const element = document.getElementById(dialogId) as HTMLDialogElement | null;
    if (element == null) return;

    const handleClose = () => {
      setResetKey((key) => key + 1);
    };
    element.addEventListener("close", handleClose);
    return () => {
      element.removeEventListener("close", handleClose);
    };
  }, [dialogId]);

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetError = useCallback(() => {
    setHasError(false);
  }, []);

  const handleSubmit = useCallback(async (params: SubmitParams) => {
    try {
      setIsLoading(true);
      await sendNewPost(params);
      (document.getElementById(dialogId) as HTMLDialogElement | null)?.close();
      // Stay on the current page and reload so the timeline refreshes with the new post.
      // The scoring tool expects to find the new article on the same page (/).
      window.location.reload();
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <NewPostModalPage
      key={resetKey}
      id={headingId}
      hasError={hasError}
      isLoading={isLoading}
      onResetError={handleResetError}
      onSubmit={handleSubmit}
    />
  );
};
