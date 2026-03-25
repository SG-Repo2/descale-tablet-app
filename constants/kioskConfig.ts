/**
 * Kiosk configuration constants.
 * Keep these values centralized so UI behavior stays consistent.
 */
export const KIOSK_CONFIG = {
  /**
   * Return the kiosk to its poster-first attract state after 45s without interaction.
   */
  idleTimeoutMs: 45_000,

  colors: {
    background: '#040608',
    frame: '#091017',
    frameTint: 'rgba(4, 8, 12, 0.64)',
    border: 'rgba(255,255,255,0.10)',
    textPrimary: '#F4F7FA',
    textSecondary: 'rgba(231,237,243,0.80)',
    accent: '#FFD84A',
    accentSoft: 'rgba(255,216,74,0.18)',
    modalSurface: 'rgba(10, 14, 19, 0.96)',
    modalSurfaceRaised: 'rgba(17, 23, 31, 0.94)',
  },

  hotspot: {
    /**
     * Visible dot diameter (the "indicator" shown over the poster).
     */
    dotSize: 18,

    /**
     * Visible outer ring around the indicator.
     */
    ringSize: 34,

    /**
     * Animated halo used to keep the hotspot visible from a distance.
     */
    haloSize: 58,

    /**
     * Touchable diameter (invisible press target) for finger usability.
     */
    pressSize: 78,

    /**
     * Extra forgiveness around the hotspot for quick trade-show taps.
     */
    hitSlop: 8,

    /**
     * Hydro-like industrial yellow for hotspot indicator.
     */
    color: '#FFD84A',

    /**
     * Dim non-selected hotspots when a modal is open.
     */
    mutedOpacity: 0.34,

    /**
     * Subtle pulse animation settings.
     */
    pulseDurationMs: 1500,
    pulseScaleFrom: 0.9,
    pulseScaleTo: 1.18,
    pulseOpacityFrom: 0.14,
    pulseOpacityTo: 0.42,
    activePulseOpacityFrom: 0.22,
    activePulseOpacityTo: 0.58,
  },

  stage: {
    frameRadius: 30,
  },

  modal: {
    maxWidth: 1080,
    dimBackground: 'rgba(3, 5, 8, 0.82)',
    eyebrow: 'Engineering highlight',
  },
} as const;
