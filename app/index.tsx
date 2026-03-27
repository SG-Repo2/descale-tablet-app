import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  Image as RNImage,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { Hotspot } from '@/components/Hotspot';
import { KioskNavColumn } from '@/components/KioskNavColumn';
import { HOTSPOTS } from '@/constants/hotspots';
import {
  KIOSK_SIDE_BUTTONS,
  type KioskExternalButton,
  type KioskModalContent,
  type KioskScreenButton,
  type KioskSideButtonDefinition,
} from '@/constants/kioskButtons';
import { KIOSK_CONFIG } from '@/constants/kioskConfig';

const POSTER_SOURCE = require('@/assets/descale-bg.png');
const DEFAULT_MODAL_HINT = 'Tap outside the panel to return to the kiosk home screen.';

type PosterBounds = {
  renderedW: number;
  renderedH: number;
  offsetX: number;
  offsetY: number;
};

type ModalSource = 'hotspot' | 'side-button' | 'system';

type ActiveTextModalState = KioskModalContent & {
  kind: 'text';
  id: string;
  source: ModalSource;
};

type ActiveWebModalState = {
  kind: 'web';
  id: string;
  source: 'side-button';
  eyebrow: string;
  title: string;
  url: string;
  hint: string;
};

type ActiveModalState = ActiveTextModalState | ActiveWebModalState;

function getContainedPosterBounds(
  layoutWidth: number,
  layoutHeight: number,
  sourceWidth: number,
  sourceHeight: number
): PosterBounds {
  const scale = Math.min(layoutWidth / sourceWidth, layoutHeight / sourceHeight);
  const renderedW = sourceWidth * scale;
  const renderedH = sourceHeight * scale;

  return {
    renderedW,
    renderedH,
    offsetX: (layoutWidth - renderedW) / 2,
    offsetY: (layoutHeight - renderedH) / 2,
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function buildTextModalState(
  id: string,
  source: ModalSource,
  content: KioskModalContent
): ActiveTextModalState {
  return {
    kind: 'text',
    id,
    source,
    eyebrow: content.eyebrow,
    title: content.title,
    body: content.body,
    hint: content.hint ?? DEFAULT_MODAL_HINT,
  };
}

function buildWebModalState(button: KioskExternalButton): ActiveWebModalState {
  return {
    kind: 'web',
    id: button.id,
    source: 'side-button',
    eyebrow: button.eyebrow,
    title: button.label.replace(/\n/g, ' '),
    url: button.externalUrl,
    hint: 'Use Browser if the page needs to leave kiosk mode, or Close to return to the dashboard.',
  };
}

export default function KioskScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const shouldReverseLandscape = true;

  const posterMeta = useMemo(() => RNImage.resolveAssetSource(POSTER_SOURCE), []);

  const [posterBounds, setPosterBounds] = useState<PosterBounds | null>(null);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [activeNavButtonId, setActiveNavButtonId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModalState | null>(null);
  const [isWebViewLoading, setIsWebViewLoading] = useState(false);
  const [webViewError, setWebViewError] = useState<string | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);

  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayWidth = Math.max(width, height);
  const displayHeight = Math.min(width, height);
  const effectiveInsets = shouldReverseLandscape
    ? {
        top: insets.bottom,
        right: insets.left,
        bottom: insets.top,
        left: insets.right,
      }
    : insets;
  const maxHorizontalInset = Math.max(effectiveInsets.left, effectiveInsets.right);
  const maxVerticalInset = Math.max(effectiveInsets.top, effectiveInsets.bottom);
  const isLargeDisplay = displayWidth >= 1400 || displayHeight >= 900;
  const framePadding = clamp(displayHeight * 0.02, 12, 24);
  const posterPaddingX = clamp(displayWidth * 0.02, 18, 32);
  const posterPaddingY = clamp(displayHeight * 0.022, 14, 28);
  const modalHorizontalPadding = clamp(displayWidth * 0.028, 20, 36);
  const modalVerticalPadding = clamp(displayHeight * 0.028, 20, 30);
  const modalCardPaddingHorizontal = clamp(displayWidth * 0.024, 24, 36);
  const modalCardPaddingVertical = clamp(displayHeight * 0.036, 22, 34);
  const webModalCardPaddingHorizontal = clamp(displayWidth * 0.017, 20, 24);
  const webModalCardPaddingTop = clamp(displayHeight * 0.03, 20, 24);
  const webModalCardPaddingBottom = clamp(displayHeight * 0.022, 14, 18);
  const posterFooterPaddingX = clamp(displayWidth * 0.012, 14, 18);
  const posterFooterPaddingY = clamp(displayHeight * 0.012, 8, 12);
  const posterLegendDotSize = clamp(displayHeight * 0.014, 10, 14);
  const modalWidth = Math.min(
    displayWidth - maxHorizontalInset * 2 - modalHorizontalPadding * 2,
    KIOSK_CONFIG.modal.maxWidth
  );
  const webModalWidth = Math.min(
    displayWidth - maxHorizontalInset * 2 - clamp(displayWidth * 0.024, 18, 30) * 2,
    1320
  );
  const webModalHeight = Math.min(
    displayHeight - maxVerticalInset * 2 - modalVerticalPadding * 2,
    820
  );
  const modalTitleSize = isLargeDisplay ? 36 : 30;
  const modalBodySize = isLargeDisplay ? 21 : 18;
  const webModalTitleSize = isLargeDisplay ? 28 : 24;
  const stageHorizontalPadding = clamp(displayWidth * 0.015, 16, 28);
  const stageVerticalPadding = clamp(displayHeight * 0.02, 14, 24);
  const stageGap = clamp(displayHeight * 0.015, 10, 16);
  const contentGap = clamp(displayWidth * 0.009, 10, 18);
  const topRailGap = clamp(displayWidth * 0.012, 8, 18);
  const buttonSize = clamp(
    Math.min(displayWidth * 0.14, displayHeight * 0.235),
    160,
    isLargeDisplay ? 224 : 198
  );
  const stageTitleSize = clamp(displayWidth * 0.041, 52, 72);
  const stageTitleLineHeight = stageTitleSize + clamp(displayHeight * 0.012, 8, 12);

  const leftButtons = useMemo(
    () =>
      KIOSK_SIDE_BUTTONS.filter((button) => button.side === 'left').sort(
        (left, right) => left.order - right.order
      ),
    []
  );

  const rightButtons = useMemo(
    () =>
      KIOSK_SIDE_BUTTONS.filter((button) => button.side === 'right').sort(
        (left, right) => left.order - right.order
      ),
    []
  );

  const hasOverlayOpen = activeModal !== null;
  const activeTextModal = activeModal?.kind === 'text' ? activeModal : null;
  const activeWebModal = activeModal?.kind === 'web' ? activeModal : null;

  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []);

  const clearWebViewState = useCallback(() => {
    setIsWebViewLoading(false);
    setWebViewError(null);
  }, []);

  const resetToHome = useCallback(() => {
    setActiveHotspotId(null);
    setActiveNavButtonId(null);
    setActiveModal(null);
    clearWebViewState();
  }, [clearWebViewState]);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimeout();
    idleTimeoutRef.current = setTimeout(() => {
      idleTimeoutRef.current = null;
      resetToHome();
    }, KIOSK_CONFIG.idleTimeoutMs);
  }, [clearIdleTimeout, resetToHome]);

  const registerInteraction = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  const handleCloseModal = useCallback(() => {
    registerInteraction();
    resetToHome();
  }, [registerInteraction, resetToHome]);

  const handleSelectHotspot = useCallback(
    (hotspotId: string) => {
      const hotspot = HOTSPOTS.find((item) => item.id === hotspotId);
      if (!hotspot) {
        return;
      }

      registerInteraction();
      clearWebViewState();
      setActiveHotspotId(hotspotId);
      setActiveNavButtonId(null);
      setActiveModal(
        buildTextModalState(hotspot.id, 'hotspot', {
          eyebrow: KIOSK_CONFIG.modal.eyebrow,
          title: hotspot.title,
          body: hotspot.body,
          hint: 'Tap outside the panel to return to the poster view.',
        })
      );
    },
    [clearWebViewState, registerInteraction]
  );

  const openUnavailableLinkModal = useCallback((button: KioskSideButtonDefinition) => {
    clearWebViewState();
    setActiveNavButtonId(button.id);
    setActiveModal(
      buildTextModalState(button.id, 'system', {
        eyebrow: 'Link unavailable',
        title: button.label.replace(/\n/g, ' '),
        body: 'This external destination could not be opened on the device. Verify the kiosk has a browser available and replace the placeholder URL if needed.',
        hint: 'Close this panel to return to the kiosk dashboard.',
      })
    );
  }, [clearWebViewState]);

  const handleScreenButton = useCallback(
    (button: KioskScreenButton) => {
      clearWebViewState();
      setActiveHotspotId(null);
      setActiveNavButtonId(button.id);

      if (button.screenId === 'pump-home') {
        setActiveModal(null);
        return;
      }

      if (button.fallbackModalContent) {
        setActiveModal(buildTextModalState(button.id, 'side-button', button.fallbackModalContent));
        return;
      }

      setActiveModal(
        buildTextModalState(button.id, 'system', {
          eyebrow: 'Screen reserved',
          title: button.label.replace(/\n/g, ' '),
          body: 'This action type is wired for future in-app navigation. Add a local route later and reuse the same data model without changing the layout.',
        })
      );
    },
    [clearWebViewState]
  );

  const handleSelectSideButton = useCallback(
    async (button: KioskSideButtonDefinition) => {
      registerInteraction();

      if (button.actionType === 'modal') {
        clearWebViewState();
        setActiveHotspotId(null);
        setActiveNavButtonId(button.id);
        setActiveModal(buildTextModalState(button.id, 'side-button', button.modalContent));
        return;
      }

      if (button.actionType === 'screen') {
        handleScreenButton(button);
        return;
      }

      setActiveHotspotId(null);
      setActiveNavButtonId(button.id);
      clearWebViewState();

      try {
        const canOpen = await Linking.canOpenURL(button.externalUrl);

        if (!canOpen) {
          openUnavailableLinkModal(button);
          return;
        }

        setActiveModal(buildWebModalState(button));
        setIsWebViewLoading(true);
        setWebViewError(null);
        setWebViewKey((current) => current + 1);
      } catch {
        openUnavailableLinkModal(button);
      }
    },
    [clearWebViewState, handleScreenButton, openUnavailableLinkModal, registerInteraction]
  );

  const handleOpenWebModalInBrowser = useCallback(async () => {
    if (!activeWebModal) {
      return;
    }

    registerInteraction();

    try {
      const canOpen = await Linking.canOpenURL(activeWebModal.url);
      if (!canOpen) {
        setWebViewError('This device could not open the system browser for the current page.');
        return;
      }

      await Linking.openURL(activeWebModal.url);
    } catch {
      setWebViewError('This device could not open the system browser for the current page.');
    }
  }, [activeWebModal, registerInteraction]);

  const handleRetryWebView = useCallback(() => {
    registerInteraction();
    setWebViewError(null);
    setIsWebViewLoading(true);
    setWebViewKey((current) => current + 1);
  }, [registerInteraction]);

  const handlePosterLayout = useCallback(
    (layoutWidth: number, layoutHeight: number) => {
      if (!posterMeta.width || !posterMeta.height || layoutWidth <= 0 || layoutHeight <= 0) {
        return;
      }

      setPosterBounds(
        getContainedPosterBounds(layoutWidth, layoutHeight, posterMeta.width, posterMeta.height)
      );
    },
    [posterMeta.height, posterMeta.width]
  );

  useEffect(() => {
    resetIdleTimer();
    return () => clearIdleTimeout();
  }, [clearIdleTimeout, resetIdleTimer]);

  return (
    <View style={styles.root} onTouchStart={registerInteraction}>
      <View style={[styles.screenCanvas, shouldReverseLandscape && styles.reverseLandscape]}>
        <View style={styles.ambientLayer} pointerEvents="none">
          <View style={[styles.ambientOrb, styles.ambientOrbLeft]} />
          <View style={[styles.ambientOrb, styles.ambientOrbRight]} />
        </View>

        <View
          style={[
            styles.frame,
            {
              paddingTop: Math.max(effectiveInsets.top, framePadding),
              paddingBottom: Math.max(effectiveInsets.bottom, framePadding),
              paddingLeft: Math.max(effectiveInsets.left, framePadding),
              paddingRight: Math.max(effectiveInsets.right, framePadding),
            },
          ]}>
          <View style={styles.stageFrame}>
            <RNImage source={POSTER_SOURCE} resizeMode="cover" style={styles.stageBackground} />
            <View style={styles.stageTint} />
            <View style={styles.stageGlowLeft} />
            <View style={styles.stageGlowRight} />

            <View
              style={[
                styles.stageContent,
                {
                  gap: stageGap,
                  paddingHorizontal: stageHorizontalPadding,
                  paddingVertical: stageVerticalPadding,
                },
              ]}>
              <View style={[styles.topRail, { gap: topRailGap, justifyContent: 'center' }]}>
                <View style={[styles.brandBlock, { alignItems: 'center' }]}>
                  <Text
                    style={[
                      styles.brandTitle,
                      {
                        fontSize: stageTitleSize,
                        lineHeight: stageTitleLineHeight,
                      },
                    ]}>
                    Upscale your descale.
                  </Text>
                </View>
              </View>

              <View style={[styles.contentRow, { gap: contentGap }]}>
                <KioskNavColumn
                  activeId={activeNavButtonId}
                  buttonSize={buttonSize}
                  isDimmed={hasOverlayOpen}
                  items={leftButtons}
                  onPress={(button) => {
                    void handleSelectSideButton(button);
                  }}
                  side="left"
                />

                <View style={styles.centerColumn}>
                  <View style={styles.posterCard}>
                    <View style={styles.posterCardGlow} pointerEvents="none" />
                    <View style={styles.posterCanvas} pointerEvents="box-none">
                      <View
                        style={[
                          styles.posterCanvasInner,
                          {
                            paddingHorizontal: posterPaddingX,
                            paddingVertical: posterPaddingY,
                          },
                        ]}>
                        <View
                          style={styles.posterStage}
                          onLayout={(event) => {
                            const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
                            handlePosterLayout(layoutWidth, layoutHeight);
                          }}>
                          <RNImage source={POSTER_SOURCE} resizeMode="contain" style={styles.posterImage} />

                          <View style={styles.hotspotLayer} pointerEvents="box-none">
                            {posterBounds
                              ? HOTSPOTS.map((hotspot) => {
                                  const centerX =
                                    posterBounds.offsetX + posterBounds.renderedW * (hotspot.x / 100);
                                  const centerY =
                                    posterBounds.offsetY + posterBounds.renderedH * (hotspot.y / 100);

                                  return (
                                    <Hotspot
                                      key={hotspot.id}
                                      title={hotspot.title}
                                      centerX={centerX}
                                      centerY={centerY}
                                      isActive={hotspot.id === activeHotspotId}
                                      isMuted={activeHotspotId !== null && hotspot.id !== activeHotspotId}
                                      attractMode={activeHotspotId === null}
                                      onPress={() => handleSelectHotspot(hotspot.id)}
                                    />
                                  );
                                })
                              : null}
                          </View>
                        </View>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.posterFooter,
                        {
                          paddingHorizontal: posterFooterPaddingX,
                          paddingVertical: posterFooterPaddingY,
                        },
                      ]}>
                      <View style={styles.posterLegend}>
                        <View
                          style={[
                            styles.posterLegendDot,
                            {
                              width: posterLegendDotSize,
                              height: posterLegendDotSize,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <KioskNavColumn
                  activeId={activeNavButtonId}
                  buttonSize={buttonSize}
                  isDimmed={hasOverlayOpen}
                  items={rightButtons}
                  onPress={(button) => {
                    void handleSelectSideButton(button);
                  }}
                  side="right"
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <Modal
        transparent
        hardwareAccelerated
        statusBarTranslucent
        animationType="fade"
        visible={Boolean(activeModal)}
        onRequestClose={handleCloseModal}>
        <View
          style={[
            styles.modalOverlay,
            shouldReverseLandscape && styles.reverseLandscape,
            {
              paddingTop: Math.max(effectiveInsets.top, modalVerticalPadding),
              paddingBottom: Math.max(effectiveInsets.bottom, modalVerticalPadding),
              paddingLeft: Math.max(effectiveInsets.left, modalHorizontalPadding),
              paddingRight: Math.max(effectiveInsets.right, modalHorizontalPadding),
            },
          ]}
          onTouchStart={registerInteraction}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseModal} />

          <View style={styles.modalContent} pointerEvents="box-none">
            {activeWebModal ? (
              <View
                accessibilityViewIsModal
                style={[
                  styles.webModalCard,
                  {
                    width: webModalWidth,
                    height: webModalHeight,
                    paddingHorizontal: webModalCardPaddingHorizontal,
                    paddingTop: webModalCardPaddingTop,
                    paddingBottom: webModalCardPaddingBottom,
                  },
                ]}>
                <View style={styles.webModalHeader}>
                  <View style={styles.modalEyebrowRow}>
                    <View style={styles.modalEyebrowAccent} />
                    <Text style={styles.modalEyebrow}>{activeWebModal.eyebrow}</Text>
                  </View>

                  <View style={styles.webModalHeaderActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open current page in browser"
                      onPress={() => {
                        void handleOpenWebModalInBrowser();
                      }}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.secondaryButtonPressed,
                      ]}>
                      <Text style={styles.secondaryButtonText}>Browser</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Close kiosk web panel"
                      onPress={handleCloseModal}
                      style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                  </View>
                </View>

                <Text
                  style={[
                    styles.webModalTitle,
                    {
                      fontSize: webModalTitleSize,
                      lineHeight: webModalTitleSize + 6,
                    },
                  ]}>
                  {activeWebModal.title}
                </Text>

                <View style={styles.webUrlBar}>
                  <Text numberOfLines={1} style={styles.webUrlText}>
                    {activeWebModal.url}
                  </Text>
                </View>

                <View style={styles.webViewFrame}>
                  <WebView
                    key={`${activeWebModal.id}-${webViewKey}`}
                    originWhitelist={['http://*', 'https://*']}
                    source={{ uri: activeWebModal.url }}
                    setSupportMultipleWindows={false}
                    style={styles.webView}
                    onError={(event) => {
                      setIsWebViewLoading(false);
                      const errorMsg = event.nativeEvent.description || 'Unable to load the page in kiosk mode.';
                      // Check for SSL-related errors
                      if (errorMsg.toLowerCase().includes('ssl')) {
                        setWebViewError(`SSL Certificate Error: ${errorMsg}. Please verify your device's date/time is correct, or contact support.`);
                      } else {
                        setWebViewError(errorMsg);
                      }
                    }}
                    onHttpError={(event) => {
                      setIsWebViewLoading(false);
                      setWebViewError(`The site returned ${event.nativeEvent.statusCode}.`);
                    }}
                    onLoadEnd={() => {
                      setIsWebViewLoading(false);
                    }}
                    onLoadStart={() => {
                      setIsWebViewLoading(true);
                      setWebViewError(null);
                    }}
                  />

                  {isWebViewLoading ? (
                    <View style={styles.webStateOverlay}>
                      <ActivityIndicator color={KIOSK_CONFIG.colors.accent} size="large" />
                      <Text style={styles.webLoadingText}>Loading page…</Text>
                    </View>
                  ) : null}

                  {webViewError ? (
                    <View style={styles.webStateOverlay}>
                      <Text style={styles.webStateTitle}>Unable to load this page</Text>
                      <Text style={styles.webStateBody}>{webViewError}</Text>

                      <View style={styles.webStateActions}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Retry loading page"
                          onPress={handleRetryWebView}
                          style={({ pressed }) => [
                            styles.retryButton,
                            pressed && styles.retryButtonPressed,
                          ]}>
                          <Text style={styles.retryButtonText}>Retry</Text>
                        </Pressable>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Open page in browser"
                          onPress={() => {
                            void handleOpenWebModalInBrowser();
                          }}
                          style={({ pressed }) => [
                            styles.secondaryButton,
                            pressed && styles.secondaryButtonPressed,
                          ]}>
                          <Text style={styles.secondaryButtonText}>Browser</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                </View>

                <View style={styles.modalFooter}>
                  <Text style={styles.modalHint}>{activeWebModal.hint}</Text>
                </View>
              </View>
            ) : (
              <View
                accessibilityViewIsModal
                style={[
                  styles.modalCard,
                  {
                    width: modalWidth,
                    paddingHorizontal: modalCardPaddingHorizontal,
                    paddingVertical: modalCardPaddingVertical,
                  },
                ]}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalEyebrowRow}>
                    <View style={styles.modalEyebrowAccent} />
                    <Text style={styles.modalEyebrow}>
                      {activeTextModal?.eyebrow ?? KIOSK_CONFIG.modal.eyebrow}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close kiosk detail panel"
                    onPress={handleCloseModal}
                    style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>
                </View>

                <Text
                  style={[
                    styles.modalTitle,
                    {
                      fontSize: modalTitleSize,
                      lineHeight: modalTitleSize + 8,
                    },
                  ]}>
                  {activeTextModal?.title ?? ''}
                </Text>

                <Text
                  style={[
                    styles.modalBody,
                    {
                      fontSize: modalBodySize,
                      lineHeight: modalBodySize + 12,
                    },
                  ]}>
                  {activeTextModal?.body ?? ''}
                </Text>

                <View style={styles.modalFooter}>
                  <Text style={styles.modalHint}>{activeTextModal?.hint ?? DEFAULT_MODAL_HINT}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: KIOSK_CONFIG.colors.background,
  },
  screenCanvas: {
    flex: 1,
  },
  reverseLandscape: {
    transform: [{ rotate: '180deg' }],
  },
  ambientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  ambientOrb: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 999,
    opacity: 0.38,
  },
  ambientOrbLeft: {
    top: -160,
    left: -120,
    backgroundColor: KIOSK_CONFIG.colors.brandBlueSoft,
  },
  ambientOrbRight: {
    right: -120,
    bottom: -180,
    backgroundColor: 'rgba(255,216,74,0.08)',
  },
  frame: {
    flex: 1,
  },
  stageFrame: {
    flex: 1,
    borderRadius: KIOSK_CONFIG.stage.frameRadius,
    overflow: 'hidden',
    backgroundColor: KIOSK_CONFIG.colors.frame,
    borderWidth: 1,
    borderColor: KIOSK_CONFIG.colors.border,
  },
  stageBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.16,
  },
  stageTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: KIOSK_CONFIG.colors.frameTint,
  },
  stageGlowLeft: {
    position: 'absolute',
    top: '18%',
    left: -120,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: KIOSK_CONFIG.colors.brandBlueSoft,
  },
  stageGlowRight: {
    position: 'absolute',
    right: -100,
    bottom: 42,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(255,216,74,0.10)',
  },
  stageContent: {
    flex: 1,
  },
  topRail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBlock: {
    flexShrink: 1,
    gap: 4,
  },
  brandEyebrow: {
    color: KIOSK_CONFIG.colors.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  brandTitle: {
    color: KIOSK_CONFIG.colors.textPrimary,
    fontWeight: '700',
  },
  instructionPill: {
    maxWidth: 470,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: KIOSK_CONFIG.colors.border,
    backgroundColor: KIOSK_CONFIG.colors.panelRaised,
  },
  instructionDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: KIOSK_CONFIG.colors.accent,
  },
  instructionText: {
    flex: 1,
    color: KIOSK_CONFIG.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  contentRow: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
  },
  centerColumn: {
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  posterHeaderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 18,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: KIOSK_CONFIG.colors.border,
    backgroundColor: KIOSK_CONFIG.colors.panel,
  },
  posterHeaderCopy: {
    flexShrink: 1,
    gap: 4,
  },
  posterEyebrow: {
    color: KIOSK_CONFIG.colors.brandBlue,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  posterTitle: {
    color: KIOSK_CONFIG.colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 31,
  },
  posterSummary: {
    maxWidth: 410,
    flexShrink: 1,
    color: KIOSK_CONFIG.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  posterCard: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: KIOSK_CONFIG.colors.border,
    backgroundColor: KIOSK_CONFIG.colors.surface,
  },
  posterCardGlow: {
    position: 'absolute',
    top: 30,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: KIOSK_CONFIG.colors.brandBlueSoft,
  },
  posterCanvas: {
    flex: 1,
  },
  posterCanvasInner: {
    flex: 1,
  },
  posterStage: {
    flex: 1,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  hotspotLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  posterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  posterLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  posterLegendDot: {
    borderRadius: 999,
    backgroundColor: KIOSK_CONFIG.colors.accent,
  },
  posterLegendText: {
    color: KIOSK_CONFIG.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  posterFooterText: {
    color: KIOSK_CONFIG.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: KIOSK_CONFIG.modal.dimBackground,
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: KIOSK_CONFIG.colors.border,
    backgroundColor: KIOSK_CONFIG.colors.modalSurface,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 18,
  },
  webModalCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: KIOSK_CONFIG.colors.border,
    backgroundColor: KIOSK_CONFIG.colors.modalSurface,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 26,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  webModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  webModalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalEyebrowAccent: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: KIOSK_CONFIG.colors.accent,
  },
  modalEyebrow: {
    color: KIOSK_CONFIG.colors.accent,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalTitle: {
    marginTop: 18,
    color: KIOSK_CONFIG.colors.textPrimary,
    fontWeight: '700',
  },
  webModalTitle: {
    marginTop: 18,
    color: KIOSK_CONFIG.colors.textPrimary,
    fontWeight: '700',
  },
  modalBody: {
    marginTop: 16,
    color: KIOSK_CONFIG.colors.textSecondary,
    fontWeight: '500',
  },
  webUrlBar: {
    marginTop: 14,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: KIOSK_CONFIG.colors.surfaceRaised,
  },
  webUrlText: {
    color: KIOSK_CONFIG.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  webViewFrame: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webStateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(9,13,18,0.92)',
  },
  webLoadingText: {
    color: KIOSK_CONFIG.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  webStateTitle: {
    color: KIOSK_CONFIG.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  webStateBody: {
    maxWidth: 560,
    color: KIOSK_CONFIG.colors.textSecondary,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
  },
  webStateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  modalFooter: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  modalHint: {
    color: 'rgba(225,231,237,0.68)',
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    minWidth: 108,
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: KIOSK_CONFIG.colors.modalSurfaceRaised,
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  closeButtonText: {
    color: KIOSK_CONFIG.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    minWidth: 112,
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  secondaryButtonText: {
    color: KIOSK_CONFIG.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  retryButton: {
    minWidth: 112,
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,216,74,0.22)',
    backgroundColor: 'rgba(255,216,74,0.14)',
  },
  retryButtonPressed: {
    backgroundColor: 'rgba(255,216,74,0.22)',
  },
  retryButtonText: {
    color: KIOSK_CONFIG.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
});
