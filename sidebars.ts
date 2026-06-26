import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  projectSidebar: [
    {
      type: 'category',
      label: 'Proyecto',
      collapsed: false,
      items: [
        'proyecto/intro',
        'proyecto/arquitectura',
        'proyecto/tecnologias',
        'proyecto/instalacion-local',
        'proyecto/estructura-de-archivos',
        'proyecto/persistencia',
      ],
    },
    {
      type: 'category',
      label: 'Cliente',
      items: [
        'cliente/arquitectura',
        'cliente/renderizado',
        'cliente/ui',
        'cliente/audio',
      ],
    },
    {
      type: 'category',
      label: 'Servidor',
      items: [
        'servidor/arquitectura',
        'servidor/world-simulation',
        'servidor/combat',
        'servidor/economia',
        'servidor/persistencia',
        'servidor/admin-commands',
      ],
    },
    {
      type: 'category',
      label: 'APIs y Protocolos',
      items: [
        'apis/veloren-protocol',
        'apis/fastapi-web',
        'apis/admin-commands',
        'apis/telemetria',
      ],
    },
    {
      type: 'category',
      label: 'Referencia',
      items: [
        'referencia/asset-formats',
        'referencia/ecs-components',
        'referencia/glosario',
      ],
    },
  ],
  systemsSidebar: [
    {
      type: 'category',
      label: 'Sistemas de Juego',
      collapsed: false,
      items: [
        'sistemas/combate',
        'sistemas/magia',
        'sistemas/clases',
        'sistemas/razas',
        'sistemas/crafting',
        'sistemas/items',
        'sistemas/inventario',
        'sistemas/habilidades',
      ],
    },
  ],
  oracleSidebar: [
    {
      type: 'category',
      label: 'ORACLE — World Director',
      collapsed: false,
      items: [
        'oracle/intro',
        'oracle/arquitectura',
        'oracle/world-state',
        'oracle/world-facts',
        'oracle/event-engine',
        'oracle/narrative',
        'oracle/ecosystem',
        'oracle/astronomy',
        'oracle/llm-integration',
        'oracle/admin',
        'oracle/anti-chaos',
      ],
    },
  ],
  auroraSidebar: [
    {
      type: 'category',
      label: 'AURORA — NPC AI',
      collapsed: false,
      items: [
        'aurora/intro',
        'aurora/npc-mind',
        'aurora/memoria',
        'aurora/social-graph',
        'aurora/life-simulation',
        'aurora/economia',
        'aurora/organizaciones',
        'aurora/quest-generation',
        'aurora/llm-generative',
        'aurora/contratos',
      ],
    },
  ],
  contributeSidebar: [
    {
      type: 'category',
      label: 'Contribución',
      collapsed: false,
      items: [
        'contribucion/como-empezar',
        'contribucion/git-flow',
        'contribucion/code-style',
        'contribucion/testing',
        'contribucion/agregar-npc',
        'contribucion/agregar-hechizo',
        'contribucion/agregar-item',
        'contribucion/agregar-criatura',
      ],
    },
  ],
};

export default sidebars;
