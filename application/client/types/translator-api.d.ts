interface TranslatorCreateOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

interface TranslatorInstance {
  translate(text: string): Promise<string>;
  destroy(): void;
}

interface TranslatorConstructor {
  create(options: TranslatorCreateOptions): Promise<TranslatorInstance>;
}

interface Window {
  Translator: TranslatorConstructor;
}
