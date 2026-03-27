import React from 'react';
import { StyleSheet, View } from 'react-native';

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
  const shellPaddingVertical = Math.round(clamp(buttonSize * 0.08, 12, 18));
  const stackPaddingVertical = Math.round(clamp(buttonSize * 0.04, 4, 8));

  return (
    <View style={[styles.column, { width: columnWidth }]}>
      <View
        style={[
          styles.shell,
          {
            paddingHorizontal: shellPaddingHorizontal,
            paddingVertical: shellPaddingVertical,
          },
        ]}>
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
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
});
