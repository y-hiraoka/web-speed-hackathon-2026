import * as v from "valibot";

export const NewDirectMessageFormSchema = v.object({
  username: v.pipe(
    v.string(),
    v.trim(),
    v.transform((s) => s.replace(/^@/, "")),
    v.nonEmpty("ユーザー名を入力してください"),
  ),
});

export type NewDirectMessageFormData = v.InferOutput<typeof NewDirectMessageFormSchema>;
