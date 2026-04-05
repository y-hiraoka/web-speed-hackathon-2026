import { useCallback, useRef, useState } from "react";

import { type AuthFormData } from "@web-speed-hackathon-2026/client/src/auth/schema";
import { AuthModalPage } from "@web-speed-hackathon-2026/client/src/components/auth_modal/AuthModalPage";
import { Modal } from "@web-speed-hackathon-2026/client/src/components/modal/Modal";
import {
  HttpError,
  sendJSON,
} from "@web-speed-hackathon-2026/client/src/utils/fetchers";

interface Props {
  id: string;
  onUpdateActiveUser: (user: Models.User) => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_USERNAME: "ユーザー名に使用できない文字が含まれています",
  USERNAME_TAKEN: "ユーザー名が使われています",
};

function getErrorCode(err: HttpError, type: "signin" | "signup"): string {
  const responseJSON = err.responseJSON;
  if (
    typeof responseJSON !== "object" ||
    responseJSON === null ||
    !("code" in responseJSON) ||
    typeof (responseJSON as Record<string, unknown>)["code"] !== "string" ||
    !Object.keys(ERROR_MESSAGES).includes(
      (responseJSON as Record<string, unknown>)["code"] as string,
    )
  ) {
    if (type === "signup") {
      return "登録に失敗しました";
    } else {
      return "パスワードが異なります";
    }
  }

  const code = (responseJSON as Record<string, string>)["code"]!;
  return ERROR_MESSAGES[code]!;
}

export const AuthModalContainer = ({ id, onUpdateActiveUser }: Props) => {
  const ref = useRef<HTMLDialogElement>(null);
  const [resetKey, setResetKey] = useState(0);

  const handleRequestCloseModal = useCallback(() => {
    ref.current?.close();
  }, [ref]);

  const handleSubmit = useCallback(
    async (values: AuthFormData): Promise<string | void> => {
      try {
        if (values.type === "signup") {
          const user = await sendJSON<Models.User>("/api/v1/signup", values);
          onUpdateActiveUser(user);
        } else {
          const user = await sendJSON<Models.User>("/api/v1/signin", values);
          onUpdateActiveUser(user);
        }
        handleRequestCloseModal();
      } catch (err: unknown) {
        return getErrorCode(err as HttpError, values.type);
      }
    },
    [handleRequestCloseModal, onUpdateActiveUser],
  );

  return (
    <Modal
      id={id}
      ref={ref}
      closedby="any"
      onClose={() => setResetKey((key) => key + 1)}
    >
      <AuthModalPage
        key={resetKey}
        onRequestCloseModal={handleRequestCloseModal}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
};
