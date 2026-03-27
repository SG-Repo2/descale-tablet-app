import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { KioskButtonSide, KioskSideButtonDefinition } from '@/constants/kioskButtons';
import { KIOSK_CONFIG } from '@/constants/kioskConfig';

import { KioskNavButton } from './KioskNavButton';

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function KioskNavColumn(props: {
  side: KioskButtonSide;
  items: KioskSideButtonDefinition[];
  buttonSize: number;
  activeId?: string | null;
  isDimmed?: boolean;
  onPress: (item: KioskSideButtonDefinition) => void;
}) {
  const { side, items, buttonSize, activeId = null, isDimmed = false, onPress } = props;
  const columnWidth = buttonSize + Math.round(clamp(buttonSize * 0.26, 42, 58));
  const shellPaddingHorizontal = Math.round(clamp(buttonSize * 0.08, 12, 18));
  const shellPaddingTop = Math.round(clamp(buttonSize * 0.09, 14, 20));
  const shellPaddingBottom = Math.round(clamp(buttonSize * 0.08, 12, 18));
  const accentInset = Math.round(clamp(buttonSize * 0.045, 8, 12));
  const accentWidth = Math.max(3, Math.round(buttonSize * 0.016));
  const headerPaddingHorizontal = Math.round(clamp(buttonSize * 0.055, 8, 12));
  const headerPaddingBottom = Math.round(clamp(buttonSize * 0.075, 10, 15));
  const headerEyebrowSize = buttonSize >= 210 ? 12 : 11;
  const headerTitleSize = buttonSize >= 210 ? 15 : 14;
  const stackPaddingVertical = Math.round(clamp(buttonSize * 0.04, 4, 8));

  return (
    <View style={[styles.column, { width: columnWidth }]}>
      <View
        style={[
          styles.shell,
          {
            paddingHorizontal: shellPaddingHorizontal,
            paddingTop: shellPaddingTop,
            paddingBottom: shellPaddingBottom,
          },
        ]}>
        <View
          style={[
            styles.shellAccent,
            {
              top: shellPaddingTop + 2,
              bottom: shellPaddingBottom + 2,
              width: accentWidth,
            },
            side === 'left' ? { left: accentInset } : { right: accentInset },
          ]}
        />

        <View
          style={[
            styles.header,
            {
              paddingHorizontal: headerPaddingHorizontal,
              paddingBottom: headerPaddingBottom,
            },
          ]}>
          <Text style={[styles.headerEyebrow, { fontSize: headerEyebrowSize }]}>
            {side === 'left' ? 'Explore' : 'Connect'}
          </Text>
          <Text
            style={[
              styles.headerTitle,
              {
                fontSize: headerTitleSize,
                lineHeight: headerTitleSize + 5,
              },
            ]}>
            {side === 'left' ? 'Local stories and resources' : 'Hydro platforms and paths'}
          </Text>
        </View>

        <View style={[styles.stack, { paddingVertical: stackPaddingVertical }]}>
          {items.map((item) => (
            <KioskNavButton
              key={item.id}
              isActive={activeId === item.id}
              isDimmed={isDimmed}
              item={item}
              onPress={onPress}
              size={buttonSize}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignSelf: 'stretch',
  },
  shell: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: KIOSK_CONFIG.colors.border,
    backgroundColor: KIOSK_CONFIG.colors.panel,
    overflow: 'hidden',
  },
  shellAccent: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: KIOSK_CONFIG.colors.brandBlue,
    opacity: 0.88,
  },
  header: {
    gap: 4,
  },
  headerEyebrow: {
    color: KIOSK_CONFIG.colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: KIOSK_CONFIG.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
});
