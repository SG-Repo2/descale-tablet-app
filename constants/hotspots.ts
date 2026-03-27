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
    body: 'Establishing the ideal Gap B geometry reduces pressure pulsations that cause high vibration at vane pass frequency and diffuser damage.',
    x: 34,
    y: 15,
  },
  {
    id: 'balance-line-flow-monitoring',
    title: 'Balance Line Flow Monitoring',
    body: 'Monitoring the balance line leakoff flow provides early warning of increasing shaft orbit, which can indicate internal wear or an incipient shaft crack.',
    x: 24,
    y: 32,
  },
  {
    id: 'stable-operating-range',
    title: 'Stable Operating Range',
    body: 'Providing a bypass line on the descale system allows the pump to cycle without operating at dangerously low flows that cause fluid instability and reliability issues.',
    x: 10,
    y: 48,
  },
  {
    id: 'optimizing-hydraulics',
    title: 'Optimizing Hydraulics',
    body: 'Analyzing the design operating range and optimizing hydraulics significantly increases reliability while also providing considerable energy savings.',
    x: 26,
    y: 74,
  },
  {
    id: 'field-service',
    title: 'Field Service',
    body: 'Descale pumps require precise assembly and maintenance. Hydro’s Field Service team provides technical oversight and turnkey support to ensure issues are identified and avoided prior to startup.',
    x: 60,
    y: 16,
  },
  {
    id: 'field-testing-analysis',
    title: 'Field Testing & Analysis',
    body: 'Poor inlet flow conditions can lead to recirculation and unbalanced flow. Field testing and computational fluid dynamics identify system-induced problems and provide solutions.',
    x: 76,
    y: 40,
  },
  {
    id: 'condition-monitoring-centaur',
    title: 'Condition Monitoring (CENTAUR)',
    body: 'Continuous monitoring is critical in applications with frequent starts and stops. CENTAUR wirelessly collects data for cloud-based analysis, enabling early detection and remote engineering support.',
    x: 80,
    y: 59,
  },
  {
    id: 'direct-laser-deposition',
    title: 'Direct Laser Deposition',
    body: 'Using Direct Laser Deposition to create harder wear components reduces galling, slows wear rates, maintains efficiency, and increases rotor stiffness.',
    x: 68,
    y: 78,
  },
  {
    id: 'seal-system-optimization',
    title: 'Axial Rotor Centralization',
    body: 'Ensuring axial rotor centralization reduces hydraulically induced anomalies, axial thrust instability, and vibration. Hydro performs full dimensional analysis to ensure compatibility across stages.',
    x: 48,
    y: 62,
  },
];
