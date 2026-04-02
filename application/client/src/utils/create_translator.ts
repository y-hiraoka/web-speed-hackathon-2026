interface Translator {
  translate(text: string): Promise<string>;
  [Symbol.dispose](): void;
}

interface Params {
  sourceLanguage: string;
  targetLanguage: string;
}

export async function createTranslator(params: Params): Promise<Translator> {
  const translator = await window.Translator.create({
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
