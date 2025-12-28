/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-named-as-default-member */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import { getLocales } from 'react-native-localize';

import en from './en.json';
import tr from './tr.json';

const languageDetectorPlugin = {
  type: 'languageDetector' as const,
  async: true,
  init: () => {},
  cacheUserLanguage: () => {},
  detect: function (callback: (lang: string) => void) {
    //const locales = getLocales();
    //const language = locales[0].languageCode;
    callback('tr');
  },
};

const resources = {
  en: {
    translation: en,
  },
  tr: {
    translation: tr,
  },
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin)
  .init({
    resources,
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
