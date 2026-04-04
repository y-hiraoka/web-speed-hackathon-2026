import { FormEvent, memo, useCallback, useRef, useState } from "react";

import { AuthFormData } from "@web-speed-hackathon-2026/client/src/auth/types";
import { validate } from "@web-speed-hackathon-2026/client/src/auth/validation";
import { FormInputField } from "@web-speed-hackathon-2026/client/src/components/foundation/FormInputField";
import { Link } from "@web-speed-hackathon-2026/client/src/components/foundation/Link";
import { ModalErrorMessage } from "@web-speed-hackathon-2026/client/src/components/modal/ModalErrorMessage";
import { ModalSubmitButton } from "@web-speed-hackathon-2026/client/src/components/modal/ModalSubmitButton";

interface Props {
  onRequestCloseModal: () => void;
  onSubmit: (values: AuthFormData) => Promise<string | null>;
}

export const AuthModalPage = memo(({ onRequestCloseModal, onSubmit }: Props) => {
  const [type, setType] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const formRef = useRef<HTMLFormElement>(null);

  const getValues = useCallback((): AuthFormData => {
    const form = formRef.current;
    if (!form) {
      return { type, username: "", name: "", password: "" };
    }
    const formData = new FormData(form);
    return {
      type,
      username: (formData.get("username") as string) ?? "",
      name: (formData.get("name") as string) ?? "",
      password: (formData.get("password") as string) ?? "",
    };
  }, [type]);

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const values = getValues();
      const errors = validate(values);
      setValidationErrors(errors);
    },
    [getValues],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const values = getValues();
      const errors = validate(values);
      setTouched({ username: true, name: true, password: true });
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) return;
      setSubmitting(true);
      setError(null);
      try {
        const submitError = await onSubmit(values);
        if (submitError) {
          setError(submitError);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [getValues, onSubmit],
  );

  return (
    <form ref={formRef} className="grid gap-y-6" onSubmit={handleSubmit}>
      <h2 className="text-center text-2xl font-bold">
        {type === "signin" ? "サインイン" : "新規登録"}
      </h2>

      <div className="flex justify-center">
        <button
          className="text-cax-brand underline"
          onClick={() => setType(type === "signin" ? "signup" : "signin")}
          type="button"
        >
          {type === "signin" ? "初めての方はこちら" : "サインインはこちら"}
        </button>
      </div>

      <div className="grid gap-y-2">
        <FormInputField
          name="username"
          label="ユーザー名"
          leftItem={<span className="text-cax-text-subtle leading-none">@</span>}
          autoComplete="username"
          onBlur={() => handleBlur("username")}
          touched={!!touched["username"]}
          error={validationErrors["username"]}
        />

        {type === "signup" && (
          <FormInputField
            name="name"
            label="名前"
            autoComplete="nickname"
            onBlur={() => handleBlur("name")}
            touched={!!touched["name"]}
            error={validationErrors["name"]}
          />
        )}

        <FormInputField
          name="password"
          label="パスワード"
          type="password"
          autoComplete={type === "signup" ? "new-password" : "current-password"}
          onBlur={() => handleBlur("password")}
          touched={!!touched["password"]}
          error={validationErrors["password"]}
        />
      </div>

      {type === "signup" ? (
        <p>
          <Link className="text-cax-brand underline" onClick={onRequestCloseModal} to="/terms">
            利用規約
          </Link>
          に同意して
        </p>
      ) : null}

      <ModalSubmitButton disabled={submitting} loading={submitting}>
        {type === "signin" ? "サインイン" : "登録する"}
      </ModalSubmitButton>

      <ModalErrorMessage>{error}</ModalErrorMessage>
    </form>
  );
});
