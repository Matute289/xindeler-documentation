import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: "Xindeler Docs",
  tagline: 'Technical documentation for the Xindeler MMORPG project',
  favicon: 'img/favicon.svg',

  url: 'https://docs.xindeler.greenmountain.dev',
  baseUrl: '/',

  organizationName: 'Matute289',
  projectName: 'xindeler-documentation',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    localeConfigs: {
      en: { label: 'English', direction: 'ltr' },
      es: { label: 'Español', direction: 'ltr' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/Matute289/xindeler-documentation/tree/main/',
          exclude: ['**/superpowers/**'],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "Xindeler Docs",
      logo: {
        alt: "Xindeler",
        src: 'img/logo.svg',
        srcDark: 'img/logo.svg',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'projectSidebar', position: 'left', label: 'Proyecto' },
        { type: 'docSidebar', sidebarId: 'systemsSidebar', position: 'left', label: 'Sistemas' },
        { type: 'docSidebar', sidebarId: 'oracleSidebar', position: 'left', label: 'ORACLE' },
        { type: 'docSidebar', sidebarId: 'auroraSidebar', position: 'left', label: 'AURORA' },
        { type: 'docSidebar', sidebarId: 'contributeSidebar', position: 'left', label: 'Contribuir' },
        { type: 'localeDropdown', position: 'right' },
        {
          href: 'https://github.com/Matute289/xindeler',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Instalación local', to: '/proyecto/instalacion-local' },
            { label: 'Arquitectura', to: '/proyecto/arquitectura' },
            { label: 'Contribuir', to: '/contribucion/como-empezar' },
          ],
        },
        {
          title: 'Sistemas',
          items: [
            { label: 'ORACLE', to: '/oracle/intro' },
            { label: 'AURORA', to: '/aurora/intro' },
            { label: 'Combate', to: '/sistemas/combate' },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            { label: 'Discord', href: 'https://discord.gg/xindeler' },
            { label: 'Landing', href: 'https://xindeler.greenmountain.dev' },
            { label: 'Wiki', href: 'https://wiki.xindeler.greenmountain.dev' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Xindeler. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.vsDark,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['rust', 'toml', 'bash', 'yaml'],
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
