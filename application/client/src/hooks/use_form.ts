import { ChangeEvent, FocusEvent, FormEvent, startTransition, useActionState, useCallback, useRef, useState } from "react";
import * as v from "valibot";

interface UseFormReturn<TInput extends Record<string, unknown>> {
  values: TInput;
  errors: Partial<Record<keyof TInput, string>>;
  touched: Partial<Record<keyof TInput, boolean>>;
  submitting: boolean;
  formError: string | undefined;
  invalid: boolean;
  getFieldProps: (name: keyof TInput & string) => {
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement>) => void;
  };
  getFieldMeta: (name: keyof TInput & string) => {
    touched: boolean;
    error: string | undefined;
  };
  setValue: (name: keyof TInput & string, value: TInput[keyof TInput & string]) => void;
  handleSubmit: (e: FormEvent) => void;
}

export function useForm<TSchema extends v.GenericSchema<Record<string, unknown>>>(
  schema: TSchema,
  onSubmit: (values: v.InferOutput<TSchema>) => Promise<string | void>,
  initialValues: v.InferInput<TSchema>,
): UseFormReturn<v.InferInput<TSchema>> {
  type TInput = v.InferInput<TSchema>;

  const [values, setValues] = useState<TInput>(initialValues as TInput);
  const [touched, setTouched] = useState<Partial<Record<keyof TInput, boolean>>>({});

  const valuesRef = useRef(values);
  valuesRef.current = values;

  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const result = v.safeParse(schema, values);
  const errors: Partial<Record<keyof TInput, string>> = {};
  if (!result.success) {
    const flat = v.flatten(result.issues);
    if (flat.nested) {
      for (const [key, messages] of Object.entries(flat.nested)) {
        if (messages && messages.length > 0) {
          (errors as Record<string, string>)[key] = messages[0]!;
        }
      }
    }
  }

  const invalid = Object.keys(errors).length > 0;

  const [formError, submitAction, submitting] = useActionState(
    async (_prev: string | undefined) => {
      const err = await onSubmitRef.current(valuesRef.current as v.InferOutput<TSchema>);
      if (typeof err === "string") {
        return err;
      }
      return undefined;
    },
    undefined,
  );

  const setValue = useCallback((name: keyof TInput & string, value: TInput[keyof TInput & string]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getFieldProps = useCallback(
    (name: keyof TInput & string) => ({
      name,
      value: String(valuesRef.current[name] ?? ""),
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        setValues((prev) => ({ ...prev, [name]: e.target.value }));
      },
      onBlur: (_e: FocusEvent<HTMLInputElement>) => {
        setTouched((prev) => ({ ...prev, [name]: true }));
      },
    }),
    [],
  );

  const getFieldMeta = useCallback(
    (name: keyof TInput & string) => ({
      touched: !!touched[name],
      error: errors[name],
    }),
    [touched, errors],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched: Partial<Record<keyof TInput, boolean>> = {};
      for (const key of Object.keys(valuesRef.current) as (keyof TInput & string)[]) {
        allTouched[key] = true;
      }
      setTouched(allTouched);

      // Don't submit if invalid
      const checkResult = v.safeParse(schema, valuesRef.current);
      if (!checkResult.success) {
        return;
      }

      startTransition(() => {
        submitAction();
      });
    },
    [schema, submitAction],
  );

  return {
    values,
    errors,
    touched,
    submitting,
    formError,
    invalid,
    getFieldProps,
    getFieldMeta,
    setValue,
    handleSubmit,
  };
}
