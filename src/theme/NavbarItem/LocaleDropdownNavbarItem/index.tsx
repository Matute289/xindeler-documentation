import React, {type ReactNode, useState, useRef, useEffect} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useAlternatePageUtils} from '@docusaurus/theme-common/internal';
import {
  mergeSearchStrings,
  useHistorySelector,
  useCollapsible,
  Collapsible,
} from '@docusaurus/theme-common';
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

type LocaleDropdownUtils = ReturnType<typeof useLocaleDropdownUtils>;

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

export default function LocaleDropdownNavbarItem({mobile, queryString}: Props): ReactNode {
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
    // Mobile sidebar: a single expandable button (matches Docusaurus's own
    // collapsible dropdown pattern) instead of listing every locale flat —
    // this is the only way that scales once more languages are added.
    return <MobileLocaleDropdown utils={utils} currentLocale={currentLocale} locales={locales} queryString={queryString} />;
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

function MobileLocaleDropdown({
  utils,
  currentLocale,
  locales,
  queryString,
}: {
  utils: LocaleDropdownUtils;
  currentLocale: string;
  locales: readonly string[];
  queryString: string | undefined;
}): ReactNode {
  // Uses the same useCollapsible/Collapsible mechanism as Docusaurus's own
  // stock mobile dropdown (JS-driven height animation, no CSS class
  // dependency — see Collapsible's source), but styled as a compact pill
  // instead of a full-width menu row, since flag+code+caret don't need the
  // whole sidebar width.
  const {collapsed, toggleCollapsed} = useCollapsible({initialState: true});

  return (
    <li className={styles.mobileWrapper}>
      <button
        type="button"
        className={styles.mobilePill}
        aria-label={
          collapsed
            ? translate({
                message: 'Expand the language switcher',
                id: 'theme.navbar.mobileLanguageDropdown.expandAriaLabel',
                description: 'The ARIA label for expanding the mobile language switcher',
              })
            : translate({
                message: 'Collapse the language switcher',
                id: 'theme.navbar.mobileLanguageDropdown.collapseAriaLabel',
                description: 'The ARIA label for collapsing the mobile language switcher',
              })
        }
        aria-expanded={!collapsed}
        onClick={toggleCollapsed}
      >
        <span className={styles.flag}>{LOCALE_FLAGS[currentLocale] ?? '🏳️'}</span>
        <span className={styles.code}>{currentLocale.toUpperCase()}</span>
        <span className={`${styles.mobileCaret} ${!collapsed ? styles.mobileCaretOpen : ''}`}>›</span>
      </button>

      <Collapsible lazy as="ul" className={styles.mobileSubList} collapsed={collapsed}>
        {locales.map((locale) => (
          <li key={locale}>
            <a
              href={toNavigableUrl(utils.getURL(locale, {queryString}))}
              className={`${styles.mobileDropdownItem} ${locale === currentLocale ? styles.dropdownItemActive : ''}`}
            >
              <span className={styles.flag}>{LOCALE_FLAGS[locale] ?? '🏳️'}</span>
              <span>{utils.getLabel(locale)}</span>
              {locale === currentLocale && <span className={styles.mateInline}>🧉</span>}
            </a>
          </li>
        ))}
      </Collapsible>
    </li>
  );
}
