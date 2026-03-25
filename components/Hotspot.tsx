import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { KIOSK_CONFIG } from '@/constants/kioskConfig';

/**
 * A tappable poster hotspot.
 *
 * Uses:
 * - A visible pulsing dot.
 * - A larger invisible press target for finger usability.
 * - Absolute positioning provided by the parent screen.
 */
export function Hotspot(props: {
  title: string;
  centerX: number;
  centerY: number;
  isActive?: boolean;
  isMuted?: boolean;
  attractMode?: boolean;
  onPress: () => void;
}) {
  const { title, centerX, centerY, isActive = false, isMuted = false, attractMode = true, onPress } = props;

  const pulseProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle repeating pulse. This stays fully local/offline and keeps the targets
    // readable from a distance without turning into a flashy booth animation.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseProgress, {
          toValue: 1,
          duration: KIOSK_CONFIG.hotspot.pulseDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(pulseProgress, {
          toValue: 0,
          duration: KIOSK_CONFIG.hotspot.pulseDurationMs,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseProgress]);

  const animatedStyle = useMemo(() => {
    const scale = pulseProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [KIOSK_CONFIG.hotspot.pulseScaleFrom, KIOSK_CONFIG.hotspot.pulseScaleTo],
    });
    const opacity = pulseProgress.interpolate({
      inputRange: [0, 1],
      outputRange: isActive
        ? [KIOSK_CONFIG.hotspot.activePulseOpacityFrom, KIOSK_CONFIG.hotspot.activePulseOpacityTo]
        : attractMode
          ? [KIOSK_CONFIG.hotspot.pulseOpacityFrom, KIOSK_CONFIG.hotspot.pulseOpacityTo]
          : [0.08, 0.2],
    });
    return { transform: [{ scale }], opacity };
  }, [attractMode, isActive, pulseProgress]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      hitSlop={KIOSK_CONFIG.hotspot.hitSlop}
      android_ripple={{
        color: KIOSK_CONFIG.colors.accentSoft,
        borderless: true,
        radius: Math.round(KIOSK_CONFIG.hotspot.pressSize / 2),
      }}
      // Provide a larger invisible tap target that remains tied to the poster bounds.
      style={({ pressed }) => [
        styles.pressTarget,
        {
          left: centerX - KIOSK_CONFIG.hotspot.pressSize / 2,
          top: centerY - KIOSK_CONFIG.hotspot.pressSize / 2,
          width: KIOSK_CONFIG.hotspot.pressSize,
          height: KIOSK_CONFIG.hotspot.pressSize,
          opacity: isMuted && !isActive ? KIOSK_CONFIG.hotspot.mutedOpacity : 1,
          transform: [{ scale: pressed ? 0.96 : isActive ? 1.04 : 1 }],
        },
      ]}>
      <Animated.View
        style={[
          styles.halo,
          animatedStyle,
          {
            width: KIOSK_CONFIG.hotspot.haloSize,
            height: KIOSK_CONFIG.hotspot.haloSize,
            backgroundColor: KIOSK_CONFIG.colors.accentSoft,
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: KIOSK_CONFIG.hotspot.ringSize,
            height: KIOSK_CONFIG.hotspot.ringSize,
            borderColor: isActive ? KIOSK_CONFIG.hotspot.color : 'rgba(255,255,255,0.18)',
            backgroundColor: isActive ? 'rgba(255,216,74,0.12)' : 'rgba(4,8,12,0.74)',
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: KIOSK_CONFIG.hotspot.dotSize,
            height: KIOSK_CONFIG.hotspot.dotSize,
            backgroundColor: KIOSK_CONFIG.hotspot.color,
            borderColor: isActive ? 'rgba(255,248,214,0.92)' : 'rgba(23,29,37,0.64)',
            borderWidth: 2,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressTarget: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    borderRadius: 999,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
  },
});
