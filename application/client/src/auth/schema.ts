import * as v from "valibot";

export const AuthFormSchema = v.pipe(
  v.object({
    type: v.picklist(["signin", "signup"]),
    username: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty("ユーザー名を入力してください"),
      v.regex(/^[a-zA-Z0-9_]*$/, "ユーザー名に使用できるのは英数字とアンダースコア(_)のみです"),
    ),
    name: v.string(),
    password: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty("パスワードを入力してください"),
      v.check(
        (val) => !/^(?:[^\P{Letter}&&\P{Number}]*){16,}$/v.test(val),
        "パスワードには記号を含める必要があります",
      ),
    ),
  }),
  v.forward(
    v.check(
      (data) => data.type !== "signup" || data.name.trim().length > 0,
      "名前を入力してください",
    ),
    ["name"],
  ),
);

export type AuthFormData = v.InferOutput<typeof AuthFormSchema>;
