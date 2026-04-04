import { memo, useCallback, useEffect, useState } from "react";

import { AuthFormData } from "@web-speed-hackathon-2026/client/src/auth/types";
import { AuthModalPage } from "@web-speed-hackathon-2026/client/src/components/auth_modal/AuthModalPage";
import { sendJSON } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

interface Props {
  dialogId: string;
  onUpdateActiveUser: (user: Models.User) => void;
}

interface ErrorResponse {
  responseJSON?: unknown;
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_USERNAME: "ユーザー名に使用できない文字が含まれています",
  USERNAME_TAKEN: "ユーザー名が使われています",
};

function getErrorCode(err: ErrorResponse, type: "signin" | "signup"): string {
  const responseJSON = err.responseJSON;
  if (
    typeof responseJSON !== "object" ||
    responseJSON === null ||
    !("code" in responseJSON) ||
    typeof responseJSON.code !== "string" ||
    !Object.keys(ERROR_MESSAGES).includes(responseJSON.code)
  ) {
    if (type === "signup") {
      return "登録に失敗しました";
    } else {
      return "パスワードが異なります";
    }
  }

  return ERROR_MESSAGES[responseJSON.code]!;
}

export const AuthModalContainer = memo(({ dialogId, onUpdateActiveUser }: Props) => {
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    const element = document.getElementById(dialogId) as HTMLDialogElement | null;
    if (!element) return;

    const handleClose = () => {
      setResetKey((key) => key + 1);
    };
    element.addEventListener("close", handleClose);
    return () => {
      element.removeEventListener("close", handleClose);
    };
  }, [dialogId]);

  const handleRequestCloseModal = useCallback(() => {
    const element = document.getElementById(dialogId) as HTMLDialogElement | null;
    element?.close();
  }, [dialogId]);

  const handleSubmit = useCallback(
    async (values: AuthFormData): Promise<string | null> => {
      try {
        if (values.type === "signup") {
          const user = await sendJSON<Models.User>("/api/v1/signup", values);
          onUpdateActiveUser(user);
        } else {
          const user = await sendJSON<Models.User>("/api/v1/signin", values);
          onUpdateActiveUser(user);
        }
        handleRequestCloseModal();
        return null;
      } catch (err: unknown) {
        return getErrorCode(err as ErrorResponse, values.type);
      }
    },
    [handleRequestCloseModal, onUpdateActiveUser],
  );

  return (
    <AuthModalPage
      key={resetKey}
      onRequestCloseModal={handleRequestCloseModal}
      onSubmit={handleSubmit}
    />
  );
});
