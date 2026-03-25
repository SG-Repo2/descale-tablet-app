import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native';

import type { KioskSideButtonDefinition } from '@/constants/kioskButtons';
import { KIOSK_CONFIG } from '@/constants/kioskConfig';

const ACTION_META = {
  modal: {
    label: 'Open details',
    icon: 'arrow-expand-all',
  },
  external: {
    label: 'View site',
    icon: 'open-in-new',
  },
  screen: {
    label: 'Open screen',
    icon: 'arrow-right-circle-outline',
  },
} as const;

function getIconColor(isActive: boolean) {
  return isActive ? KIOSK_CONFIG.colors.accent : KIOSK_CONFIG.colors.textPrimary;
}

function renderButtonGraphic(
  imageSource: ImageSourcePropType | undefined,
  iconName: string | undefined,
  size: number,
  isActive: boolean
) {
  if (imageSource) {
    return <Image source={imageSource} resizeMode="contain" style={{ width: size, height: size }} />;
  }

  return (
    <MaterialCommunityIcons
      color={getIconColor(isActive)}
      name={(iconName ?? 'circle-outline') as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
      size={size}
    />
  );
}

export function KioskNavButton(props: {
  item: KioskSideButtonDefinition;
  size: number;
  isActive?: boolean;
  isDimmed?: boolean;
  onPress: (item: KioskSideButtonDefinition) => void;
}) {
  const { item, size, isActive = false, isDimmed = false, onPress } = props;
  const actionMeta = ACTION_META[item.actionType];
  const hasLogoImage = Boolean(item.imageSource);
  const sanitizedLabel = item.label.replace(/\n/g, ' ');
  const iconWellSize = Math.round(size * (hasLogoImage ? 0.36 : 0.3));
  const contentPadding = Math.max(20, Math.round(size * 0.125));
  const labelSize = size >= 235 ? 26 : size >= 205 ? 23 : 21;
  const supportingSize = size >= 235 ? 14 : 13;
  const imageGraphicSize = iconWellSize * 0.72;
  const iconGraphicSize = iconWellSize * 0.54;
  const actionChipStyle: ViewStyle = {
    paddingHorizontal: Math.max(12, Math.round(size * 0.07)),
    minHeight: Math.max(28, Math.round(size * 0.15)),
  };

  return (
    <Pressable
      accessibilityHint={actionMeta.label}
      accessibilityLabel={sanitizedLabel}
      accessibilityRole="button"
      android_ripple={{
        color: KIOSK_CONFIG.colors.accentSoft,
        radius: Math.round(size / 2),
      }}
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: isDimmed && !isActive ? 0.66 : 1,
          transform: [{ scale: pressed ? 0.98 : isActive ? 1.02 : 1 }],
          backgroundColor: isActive
            ? KIOSK_CONFIG.colors.buttonSurfaceActive
            : KIOSK_CONFIG.colors.buttonSurface,
          borderColor: isActive
            ? KIOSK_CONFIG.colors.buttonBorderActive
            : KIOSK_CONFIG.colors.buttonBorder,
        },
      ]}>
      <View
        style={[
          styles.innerRing,
          {
            top: Math.max(10, Math.round(size * 0.06)),
            left: Math.max(10, Math.round(size * 0.06)),
            right: Math.max(10, Math.round(size * 0.06)),
            bottom: Math.max(10, Math.round(size * 0.06)),
            borderRadius: size / 2,
            borderColor: isActive
              ? 'rgba(255,255,255,0.20)'
              : 'rgba(255,255,255,0.08)',
          },
        ]}
      />

      <View
        style={[
          styles.accentStrip,
          {
            width: size * 0.3,
            backgroundColor: isActive
              ? KIOSK_CONFIG.colors.accent
              : KIOSK_CONFIG.colors.brandBlue,
          },
        ]}
      />

      <View style={[styles.content, { paddingHorizontal: contentPadding, paddingVertical: contentPadding }]}>
        <Text style={styles.eyebrow}>{item.eyebrow}</Text>

        <View
          style={[
            styles.iconWell,
            {
              width: iconWellSize,
              height: iconWellSize,
              borderRadius: iconWellSize / 2,
              marginBottom: Math.round(size * 0.08),
              backgroundColor: hasLogoImage
                ? '#FFFFFF'
                : isActive
                  ? 'rgba(255,216,74,0.12)'
                  : KIOSK_CONFIG.colors.brandBlueSoft,
              borderColor: hasLogoImage
                ? 'rgba(7, 15, 23, 0.12)'
                : 'rgba(255,255,255,0.08)',
              elevation: hasLogoImage ? 4 : 0,
              ...(hasLogoImage
                ? {
                    shadowOpacity: 0.14,
                    shadowRadius: 10,
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                  }
                : null),
            },
          ]}>
          {renderButtonGraphic(
            item.imageSource,
            item.iconName,
            hasLogoImage ? imageGraphicSize : iconGraphicSize,
            isActive
          )}
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.label,
            {
              fontSize: labelSize,
              lineHeight: labelSize + 5,
              marginVertical: Math.round(size * 0.06),
            },
          ]}>
          {item.label}
        </Text>

        <Text
          numberOfLines={2}
          style={[
            styles.supportingText,
            {
              fontSize: supportingSize,
              lineHeight: supportingSize + 5,
            },
          ]}>
          {item.supportingText}
        </Text>

        <View style={[styles.actionChip, actionChipStyle]}>
          <MaterialCommunityIcons
            color={KIOSK_CONFIG.colors.textSecondary}
            name={actionMeta.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
            size={Math.max(14, Math.round(size * 0.08))}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 14,
  },
  innerRing: {
    position: 'absolute',
    borderWidth: 1,
  },
  accentStrip: {
    position: 'absolute',
    top: 20,
    height: 5,
    borderRadius: 999,
    opacity: 0.92,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  eyebrow: {
    color: KIOSK_CONFIG.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  iconWell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    color: KIOSK_CONFIG.colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  supportingText: {
    color: KIOSK_CONFIG.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  actionChipText: {
    color: KIOSK_CONFIG.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
