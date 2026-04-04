import { Button } from "@web-speed-hackathon-2026/client/src/components/foundation/Button";
import { FormInputField } from "@web-speed-hackathon-2026/client/src/components/foundation/FormInputField";
import { ModalErrorMessage } from "@web-speed-hackathon-2026/client/src/components/modal/ModalErrorMessage";
import { ModalSubmitButton } from "@web-speed-hackathon-2026/client/src/components/modal/ModalSubmitButton";
import {
  NewDirectMessageFormSchema,
  type NewDirectMessageFormData,
} from "@web-speed-hackathon-2026/client/src/direct_message/schema";
import { useForm } from "@web-speed-hackathon-2026/client/src/hooks/use_form";

interface Props {
  id: string;
  onSubmit: (values: NewDirectMessageFormData) => Promise<string | void>;
}

export const NewDirectMessageModalPage = ({ id, onSubmit }: Props) => {
  const form = useForm(NewDirectMessageFormSchema, onSubmit, {
    username: "",
  });

  return (
    <div className="grid gap-y-6">
      <h2 className="text-center text-2xl font-bold">新しくDMを始める</h2>

      <form className="flex flex-col gap-y-6" onSubmit={form.handleSubmit}>
        <FormInputField
          input={form.getFieldProps("username")}
          meta={form.getFieldMeta("username")}
          label="ユーザー名"
          placeholder="username"
          leftItem={<span className="text-cax-text-subtle leading-none">@</span>}
        />

        <div className="grid gap-y-2">
          <ModalSubmitButton disabled={form.submitting || form.invalid} loading={form.submitting}>
            DMを開始
          </ModalSubmitButton>
          <Button variant="secondary" command="close" commandfor={id}>
            キャンセル
          </Button>
        </div>

        <ModalErrorMessage>{form.formError ?? null}</ModalErrorMessage>
      </form>
    </div>
  );
};
