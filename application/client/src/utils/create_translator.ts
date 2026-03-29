interface Translator {
  translate(text: string): Promise<string>;
  [Symbol.dispose](): void;
}

interface Params {
  sourceLanguage: string;
  targetLanguage: string;
}

export async function createTranslator(params: Params): Promise<Translator> {
  // Use the browser built-in Translator API
  // https://developer.mozilla.org/en-US/docs/Web/API/Translator
  const translator = await (window as any).Translator.create({
    sourceLanguage: params.sourceLanguage,
    targetLanguage: params.targetLanguage,
  });

  return {
    async translate(text: string): Promise<string> {
      return await translator.translate(text);
    },
    [Symbol.dispose]: () => {
      translator.destroy();
    },
  };
}
