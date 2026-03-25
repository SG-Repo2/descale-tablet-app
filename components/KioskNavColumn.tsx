import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { KioskButtonSide, KioskSideButtonDefinition } from '@/constants/kioskButtons';
import { KIOSK_CONFIG } from '@/constants/kioskConfig';

import { KioskNavButton } from './KioskNavButton';

export function KioskNavColumn(props: {
  side: KioskButtonSide;
  items: KioskSideButtonDefinition[];
  buttonSize: number;
  activeId?: string | null;
  isDimmed?: boolean;
  onPress: (item: KioskSideButtonDefinition) => void;
}) {
  const { side, items, buttonSize, activeId = null, isDimmed = false, onPress } = props;
  const columnWidth = buttonSize + 88;

  return (
    <View style={[styles.column, { width: columnWidth }]}>
      <View style={styles.shell}>
        <View
          style={[
            styles.shellAccent,
            side === 'left' ? styles.shellAccentLeft : styles.shellAccentRight,
          ]}
        />

        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>{side === 'left' ? 'Explore' : 'Connect'}</Text>
          <Text style={styles.headerTitle}>
            {side === 'left' ? 'Local stories and resources' : 'Hydro platforms and paths'}
          </Text>
        </View>

        <View style={styles.stack}>
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
    top: 22,
    bottom: 22,
    width: 3,
    borderRadius: 999,
    backgroundColor: KIOSK_CONFIG.colors.brandBlue,
    opacity: 0.88,
  },
  shellAccentLeft: {
    left: 10,
  },
  shellAccentRight: {
    right: 10,
  },
  header: {
    gap: 4,
    paddingHorizontal: 12,
    paddingBottom: 16,
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
