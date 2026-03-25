import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image as RNImage,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Hotspot } from '@/components/Hotspot';
import { HOTSPOTS } from '@/constants/hotspots';
import { KIOSK_CONFIG } from '@/constants/kioskConfig';

const POSTER_SOURCE = require('@/assets/descale-bg.png');

type PosterBounds = {
  renderedW: number;
  renderedH: number;
  offsetX: number;
  offsetY: number;
};

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

export default function KioskScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const posterMeta = useMemo(() => RNImage.resolveAssetSource(POSTER_SOURCE), []);

  const [posterBounds, setPosterBounds] = useState<PosterBounds | null>(null);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLargeDisplay = width >= 1280;
  const framePadding = isLargeDisplay ? 24 : 14;
  const posterPaddingX = isLargeDisplay ? 32 : 18;
  const posterPaddingY = height >= 850 ? 28 : 18;
  const modalWidth = Math.min(width - Math.max(insets.left, insets.right) * 2 - 64, KIOSK_CONFIG.modal.maxWidth);
  const modalTitleSize = isLargeDisplay ? 38 : 32;
  const modalBodySize = isLargeDisplay ? 23 : 19;

  const activeHotspot = useMemo(
    () => HOTSPOTS.find((hotspot) => hotspot.id === activeHotspotId) ?? null,
    [activeHotspotId]
  );

  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []);

  const closeActiveHotspot = useCallback(() => {
    setActiveHotspotId(null);
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimeout();
    idleTimeoutRef.current = setTimeout(() => {
      idleTimeoutRef.current = null;
      closeActiveHotspot();
    }, KIOSK_CONFIG.idleTimeoutMs);
  }, [clearIdleTimeout, closeActiveHotspot]);

  const registerInteraction = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  const handleCloseModal = useCallback(() => {
    registerInteraction();
    closeActiveHotspot();
  }, [closeActiveHotspot, registerInteraction]);

  const handleSelectHotspot = useCallback(
    (hotspotId: string) => {
      registerInteraction();
      setActiveHotspotId(hotspotId);
    },
    [registerInteraction]
  );

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
      <View style={[styles.frame, { padding: framePadding }]}>
        <View style={styles.stageFrame}>
          <RNImage source={POSTER_SOURCE} resizeMode="cover" style={styles.stageBackground} />
          <View style={styles.stageTint} />

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
                        const centerX = posterBounds.offsetX + posterBounds.renderedW * (hotspot.x / 100);
                        const centerY = posterBounds.offsetY + posterBounds.renderedH * (hotspot.y / 100);

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
        </View>
      </View>

      <Modal
        transparent
        hardwareAccelerated
        statusBarTranslucent
        animationType="fade"
        visible={Boolean(activeHotspot)}
        onRequestClose={handleCloseModal}>
        <View
          style={[
            styles.modalOverlay,
            {
              paddingTop: Math.max(insets.top, 24),
              paddingBottom: Math.max(insets.bottom, 24),
              paddingLeft: Math.max(insets.left, 24),
              paddingRight: Math.max(insets.right, 24),
            },
          ]}
          onTouchStart={registerInteraction}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseModal} />

          <View style={styles.modalContent} pointerEvents="box-none">
            <View
              accessibilityViewIsModal
              style={[
                styles.modalCard,
                {
                  width: modalWidth,
                  paddingHorizontal: isLargeDisplay ? 36 : 28,
                  paddingVertical: isLargeDisplay ? 34 : 26,
                },
              ]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalEyebrowRow}>
                  <View style={styles.modalEyebrowAccent} />
                  <Text style={styles.modalEyebrow}>{KIOSK_CONFIG.modal.eyebrow}</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close technical detail panel"
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
                {activeHotspot?.title ?? ''}
              </Text>

              <Text
                style={[
                  styles.modalBody,
                  {
                    fontSize: modalBodySize,
                    lineHeight: modalBodySize + 12,
                  },
                ]}>
                {activeHotspot?.body ?? ''}
              </Text>

              <View style={styles.modalFooter}>
                <Text style={styles.modalHint}>Tap outside the panel to return to the poster view.</Text>
              </View>
            </View>
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
  posterCanvas: {
    ...StyleSheet.absoluteFillObject,
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
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
  modalBody: {
    marginTop: 16,
    color: KIOSK_CONFIG.colors.textSecondary,
    fontWeight: '500',
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
});
