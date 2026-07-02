import React, {type ReactNode, useState, useRef, useEffect} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useAlternatePageUtils} from '@docusaurus/theme-common/internal';
import {mergeSearchStrings, useHistorySelector} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import type {Props} from '@theme/NavbarItem/LocaleDropdownNavbarItem';

import styles from './styles.module.css';

const LOCALE_FLAGS: Record<string, string> = {
  es: '🇦🇷',
  en: '🇺🇸',
};

// Docusaurus's `pathname://` prefix is an internal convention meant to be
// interpreted only by its own <Link> component (which strips it and does
// client-side routing). It is NOT a real URL scheme: assigning a string
// like `pathname:///en/` directly to `window.location.href` (or using it
// as a plain <a href>) is silently ignored by the browser since the
// protocol is unrecognized. Strip it before using the URL for real
// navigation.
function toNavigableUrl(url: string): string {
  return url.startsWith('pathname://') ? url.slice('pathname://'.length) : url;
}

function useLocaleDropdownUtils() {
  const {
    siteConfig,
    i18n: {localeConfigs},
  } = useDocusaurusContext();
  const alternatePageUtils = useAlternatePageUtils();
  const search = useHistorySelector((history) => history.location.search);
  const hash = useHistorySelector((history) => history.location.hash);

  const getLocaleConfig = (locale: string) => {
    const localeConfig = localeConfigs[locale];
    if (!localeConfig) {
      throw new Error(`Docusaurus bug, no locale config found for locale=${locale}`);
    }
    return localeConfig;
  };

  const getBaseURLForLocale = (locale: string) => {
    const localeConfig = getLocaleConfig(locale);
    const isSameDomain = localeConfig.url === siteConfig.url;
    if (isSameDomain) {
      return `pathname://${alternatePageUtils.createUrl({locale, fullyQualified: false})}`;
    }
    return alternatePageUtils.createUrl({locale, fullyQualified: true});
  };

  return {
    getURL: (locale: string, options: {queryString: string | undefined}) => {
      const finalSearch = mergeSearchStrings([search, options.queryString], 'append');
      return `${getBaseURLForLocale(locale)}${finalSearch}${hash}`;
    },
    getLabel: (locale: string) => getLocaleConfig(locale).label,
  };
}

export default function LocaleDropdownNavbarItem({
  mobile,
  dropdownItemsBefore = [],
  dropdownItemsAfter = [],
  queryString,
}: Props): ReactNode {
  const utils = useLocaleDropdownUtils();
  const {
    i18n: {currentLocale, locales},
  } = useDocusaurusContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (mobile) {
    // Mobile sidebar: keep it simple, stock-like list with flags added.
    const items = [...dropdownItemsBefore, ...locales, ...dropdownItemsAfter];
    return (
      <li className={styles.mobileWrapper}>
        <div className="menu__link menu__link--sublist">
          {translate({
            message: 'Languages',
            id: 'theme.navbar.mobileLanguageDropdown.label',
            description: 'The label for the mobile language switcher dropdown',
          })}
        </div>
        <ul>
          {items.map((locale) =>
            typeof locale === 'string' ? (
              <li key={locale}>
                <a
                  href={toNavigableUrl(utils.getURL(locale, {queryString}))}
                  className={`menu__link ${locale === currentLocale ? 'menu__link--active' : ''}`}
                >
                  <span className={styles.flag}>{LOCALE_FLAGS[locale] ?? '🏳️'}</span>{' '}
                  {utils.getLabel(locale)}
                  {locale === currentLocale && <span className={styles.mate}>🧉</span>}
                </a>
              </li>
            ) : null,
          )}
        </ul>
      </li>
    );
  }

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={translate({
          message: 'Change language',
          id: 'theme.navbar.localeDropdown.changeLanguage',
          description: 'Aria label for the locale switcher button',
        })}
        className={styles.trigger}
      >
        <span className={styles.flag}>{LOCALE_FLAGS[currentLocale] ?? '🏳️'}</span>
        <span className={styles.code}>{currentLocale.toUpperCase()}</span>
        <span className={`${styles.caret} ${open ? styles.caretOpen : ''}`}>▾</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => {
                window.location.href = toNavigableUrl(utils.getURL(locale, {queryString}));
              }}
              className={`${styles.dropdownItem} ${locale === currentLocale ? styles.dropdownItemActive : ''}`}
            >
              <span className={styles.flag}>{LOCALE_FLAGS[locale] ?? '🏳️'}</span>
              <span>{utils.getLabel(locale)}</span>
              {locale === currentLocale && <span className={styles.mate}>🧉</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
