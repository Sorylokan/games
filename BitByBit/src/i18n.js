// Translator (same generic module as Grid of Greed / Free the Memes).
const DEFAULT_LOCALE = "fr";

const replaceVariables = (text, variables) => text.replace(
  /\{([^}]+)\}/g,
  (_, key) => variables[key] === undefined ? `{${key}}` : String(variables[key])
);

export const createTranslator = ({ locale, fallbackLocale = DEFAULT_LOCALE, messages }) => {
  const activeMessages = messages[locale] ?? {};
  const fallbackMessages = messages[fallbackLocale] ?? {};

  return (key, variables = {}) => {
    const text = activeMessages[key] ?? fallbackMessages[key];

    if (text === undefined) {
      return replaceVariables(
        fallbackMessages["errors.missingTranslation"] ?? key,
        { key, ...variables }
      );
    }

    return replaceVariables(text, variables);
  };
};

// locales/ is resolved from this file, not the page: the game and editor/ sit at different depths.
const LOCALES_URL = new URL("../locales", import.meta.url).href;

export const loadLocale = async (locale, { baseUrl = LOCALES_URL, fetcher = fetch } = {}) => {
  const response = await fetcher(`${baseUrl}/${locale}.json`);

  if (!response.ok) {
    throw new Error(`Impossible de charger la langue : ${locale}`);
  }

  return response.json();
};

export const getLocale = () => {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }

  return navigator.language.split("-")[0] || DEFAULT_LOCALE;
};

export { DEFAULT_LOCALE };
