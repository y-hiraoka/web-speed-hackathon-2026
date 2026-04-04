import { useCallback, useState } from "react";

import { createTranslator } from "@web-speed-hackathon-2026/client/src/utils/create_translator";

type State =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "translated"; text: string };

interface Props {
  text: string;
}

export const TranslatableText = ({ text }: Props) => {
  const [state, updateState] = useState<State | null>(null);

  const handleClick = useCallback(() => {
    if (state === null || state.type === "idle") {
      const original = text;
      updateState({ type: "loading" });
      (async () => {
        try {
          using translator = await createTranslator({
            sourceLanguage: "ja",
            targetLanguage: "en",
          });
          const result = await translator.translate(original);
          updateState({ type: "translated", text: result });
        } catch {
          updateState({ type: "translated", text: "翻訳に失敗しました" });
        }
      })();
    } else if (state.type === "translated") {
      updateState({ type: "idle" });
    }
  }, [state, text]);

  const displayText = state?.type === "translated" ? state.text : text;
  const isLoading = state?.type === "loading";

  return (
    <>
      <p>
        {isLoading ? (
          <span className="bg-cax-surface-subtle text-cax-text-muted">{text}</span>
        ) : (
          <span>{displayText}</span>
        )}
      </p>

      <p>
        <button
          className="text-cax-accent disabled:text-cax-text-subtle hover:underline disabled:cursor-default"
          type="button"
          disabled={isLoading}
          onClick={handleClick}
        >
          {state === null || state.type === "idle" ? <span>Show Translation</span> : null}
          {isLoading ? <span>Translating...</span> : null}
          {state?.type === "translated" ? <span>Show Original</span> : null}
        </button>
      </p>
    </>
  );
};
