import { FormEvent, useCallback, useState } from "react";

import { Button } from "@web-speed-hackathon-2026/client/src/components/foundation/Button";
import { FormInputField } from "@web-speed-hackathon-2026/client/src/components/foundation/FormInputField";
import { ModalErrorMessage } from "@web-speed-hackathon-2026/client/src/components/modal/ModalErrorMessage";
import { ModalSubmitButton } from "@web-speed-hackathon-2026/client/src/components/modal/ModalSubmitButton";
import { NewDirectMessageFormData } from "@web-speed-hackathon-2026/client/src/direct_message/types";
import { validate } from "@web-speed-hackathon-2026/client/src/direct_message/validation";

interface Props {
  id: string;
  onSubmit: (values: NewDirectMessageFormData) => Promise<string | null>;
}

export const NewDirectMessageModalPage = ({ id, onSubmit }: Props) => {
  const [username, setUsername] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const values: NewDirectMessageFormData = { username };
  const errors = validate(values);
  const invalid = Object.keys(errors).length > 0;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setTouched({ username: true });
      if (invalid) return;
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
    [invalid, onSubmit, values],
  );

  return (
    <div className="grid gap-y-6">
      <h2 className="text-center text-2xl font-bold">新しくDMを始める</h2>

      <form className="flex flex-col gap-y-6" onSubmit={handleSubmit}>
        <FormInputField
          name="username"
          label="ユーザー名"
          placeholder="username"
          leftItem={<span className="text-cax-text-subtle leading-none">@</span>}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
          touched={!!touched["username"]}
          error={errors["username"]}
        />

        <div className="grid gap-y-2">
          <ModalSubmitButton disabled={submitting || invalid} loading={submitting}>
            DMを開始
          </ModalSubmitButton>
          <Button variant="secondary" command="close" commandfor={id}>
            キャンセル
          </Button>
        </div>

        <ModalErrorMessage>{error}</ModalErrorMessage>
      </form>
    </div>
  );
};
