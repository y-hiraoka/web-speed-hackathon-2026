import { AuthFormSchema, type AuthFormData } from "@web-speed-hackathon-2026/client/src/auth/schema";
import { FormInputField } from "@web-speed-hackathon-2026/client/src/components/foundation/FormInputField";
import { Link } from "@web-speed-hackathon-2026/client/src/components/foundation/Link";
import { ModalErrorMessage } from "@web-speed-hackathon-2026/client/src/components/modal/ModalErrorMessage";
import { ModalSubmitButton } from "@web-speed-hackathon-2026/client/src/components/modal/ModalSubmitButton";
import { useForm } from "@web-speed-hackathon-2026/client/src/hooks/use_form";

interface Props {
  onRequestCloseModal: () => void;
  onSubmit: (values: AuthFormData) => Promise<string | void>;
}

export const AuthModalPage = ({ onRequestCloseModal, onSubmit }: Props) => {
  const form = useForm(AuthFormSchema, onSubmit, {
    type: "signin" as const,
    username: "",
    name: "",
    password: "",
  });

  const type = form.values.type;

  return (
    <form className="grid gap-y-6" onSubmit={form.handleSubmit}>
      <h2 className="text-center text-2xl font-bold">
        {type === "signin" ? "サインイン" : "新規登録"}
      </h2>

      <div className="flex justify-center">
        <button
          className="text-cax-brand underline"
          onClick={() => form.setValue("type", type === "signin" ? "signup" : "signin")}
          type="button"
        >
          {type === "signin" ? "初めての方はこちら" : "サインインはこちら"}
        </button>
      </div>

      <div className="grid gap-y-2">
        <FormInputField
          input={form.getFieldProps("username")}
          meta={form.getFieldMeta("username")}
          label="ユーザー名"
          leftItem={<span className="text-cax-text-subtle leading-none">@</span>}
          autoComplete="username"
        />

        {type === "signup" && (
          <FormInputField
            input={form.getFieldProps("name")}
            meta={form.getFieldMeta("name")}
            label="名前"
            autoComplete="nickname"
          />
        )}

        <FormInputField
          input={form.getFieldProps("password")}
          meta={form.getFieldMeta("password")}
          label="パスワード"
          type="password"
          autoComplete={type === "signup" ? "new-password" : "current-password"}
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

      <ModalSubmitButton disabled={form.submitting || form.invalid} loading={form.submitting}>
        {type === "signin" ? "サインイン" : "登録する"}
      </ModalSubmitButton>

      <ModalErrorMessage>{form.formError ?? null}</ModalErrorMessage>
    </form>
  );
};
