/**
 * Local hotspot definitions for the trade-show poster.
 *
 * `x` and `y` are percentages (0-100) relative to the poster image content area.
 * The screen computes the actual rendered bounds for `resizeMode="contain"` and
 * places hotspots relative to that rectangle so alignment remains correct across tablet sizes.
 */
export type HotspotDefinition = {
  id: string;
  title: string;
  body: string;
  x: number;
  y: number;
};

export const HOTSPOTS: HotspotDefinition[] = [
  {
    id: 'reducing-impact-loading',
    title: 'Reducing Impact Loading',
    body: 'Optimized Gap B geometry helps reduce pressure pulsations, limit vibration, and protect diffuser hardware.',
    x: 34,
    y: 15,
  },
  {
    id: 'balance-line-flow-monitoring',
    title: 'Balance Line Flow Monitoring',
    body: 'Leakoff flow monitoring helps surface shaft orbit changes, internal wear, and potential cracking earlier.',
    x: 24,
    y: 32,
  },
  {
    id: 'stable-operating-range',
    title: 'Stable Operating Range',
    body: 'A bypass line helps the pump avoid low-flow operation and supports more stable, reliable service.',
    x: 10,
    y: 48,
  },
  {
    id: 'optimizing-hydraulics',
    title: 'Optimizing Hydraulics',
    body: 'Hydraulic optimization can improve reliability while reducing unnecessary energy demand.',
    x: 26,
    y: 74,
  },
  {
    id: 'field-service',
    title: 'Field Service',
    body: 'Field specialists provide assembly oversight and turnkey support before startup.',
    x: 60,
    y: 16,
  },
  {
    id: 'field-testing-analysis',
    title: 'Field Testing & Analysis',
    body: 'Field testing and CFD help identify inlet flow problems and define corrective actions with confidence.',
    x: 76,
    y: 40,
  },
  {
    id: 'condition-monitoring-centaur',
    title: 'Condition Monitoring (CENTAUR)',
    body: 'Wireless condition monitoring supports earlier detection, faster analysis, and better engineering visibility.',
    x: 80,
    y: 59,
  },
  {
    id: 'direct-laser-deposition',
    title: 'Direct Laser Deposition',
    body: 'Harder wear components help reduce galling, slow wear, and improve rotor stiffness.',
    x: 68,
    y: 78,
  },
  {
    id: 'seal-system-optimization',
    title: 'Seal System Optimization',
    body: 'Engineered seal upgrades reduce leakage, extend maintenance intervals, and improve environmental compliance.',
    x: 48,
    y: 50,
  },
];
