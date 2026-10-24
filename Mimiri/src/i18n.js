// i18n minimal (même modèle que Free the Memes) : messages plats par langue
// dans locales/<langue>.json, variables {entre accolades}, repli sur le français.
const DEFAULT_LOCALE = "fr";
const SUPPORTED_LOCALES = ["fr", "en"];

const replaceVariables = (text, variables) => text.replace(
  /\{([^}]+)\}/g,
  (_, key) => variables[key] === undefined ? `{${key}}` : String(variables[key])
);

export const createTranslator = ({ locale, messages }) => {
  const activeMessages = messages[locale] ?? {};
  const fallbackMessages = messages[DEFAULT_LOCALE] ?? {};

  return (key, variables = {}) => {
    const text = activeMessages[key] ?? fallbackMessages[key] ?? key;
    return replaceVariables(text, variables);
  };
};

export const loadLocale = async (locale, { baseUrl = "./locales", fetcher = fetch } = {}) => {
  const response = await fetcher(`${baseUrl}/${locale}.json`);
  if (!response.ok) {
    throw new Error(`Unable to load locale: ${locale}`);
  }
  return response.json();
};

// Langue du navigateur si supportée, sinon français.
export const getLocale = () => {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }
  const lang = navigator.language.split("-")[0];
  return SUPPORTED_LOCALES.includes(lang) ? lang : DEFAULT_LOCALE;
};

export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
