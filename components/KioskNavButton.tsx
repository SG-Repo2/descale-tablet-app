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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

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
  const hasEyebrow = item.eyebrow.trim().length > 0;
  const hasSupportingText = item.supportingText.trim().length > 0;
  const hasSecondaryCopy = hasEyebrow || hasSupportingText;
  const sanitizedLabel = item.label.replace(/\n/g, ' ');
  const iconWellSize = Math.round(size * (hasLogoImage ? 0.33 : 0.29));
  const contentPadding = Math.max(14, Math.round(size * 0.09));
  const contentGap = Math.max(6, Math.round(size * 0.032));
  const labelSize = size >= 220 ? 24 : size >= 190 ? 21 : 19;
  const supportingSize = size >= 220 ? 14 : 12;
  const eyebrowSize = size >= 210 ? 12 : 11;
  const imageGraphicSize = iconWellSize * 0.7;
  const iconGraphicSize = iconWellSize * 0.52;
  const contentStyle: ViewStyle = {
    paddingHorizontal: contentPadding,
    paddingTop: Math.max(12, Math.round(size * 0.08)),
    paddingBottom: Math.max(12, Math.round(size * 0.08)),
    justifyContent: hasSecondaryCopy ? 'space-between' : 'center',
    gap: hasSecondaryCopy ? Math.max(4, Math.round(size * 0.025)) : contentGap,
  };
  const actionChipStyle: ViewStyle = {
    paddingHorizontal: Math.max(10, Math.round(size * 0.06)),
    minHeight: Math.max(26, Math.round(size * 0.135)),
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
            top: Math.max(14, Math.round(size * 0.08)),
            width: size * 0.28,
            height: Math.max(4, Math.round(size * 0.024)),
            backgroundColor: isActive
              ? KIOSK_CONFIG.colors.accent
              : KIOSK_CONFIG.colors.brandBlue,
          },
        ]}
      />

      <View style={[styles.content, contentStyle]}>
        {hasEyebrow ? (
          <Text style={[styles.eyebrow, { fontSize: eyebrowSize }]}>{item.eyebrow}</Text>
        ) : null}

        <View
          style={[
            styles.iconWell,
            {
              width: iconWellSize,
              height: iconWellSize,
              borderRadius: iconWellSize / 2,
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
              lineHeight: labelSize + 4,
            },
          ]}>
          {item.label}
        </Text>

        {hasSupportingText ? (
          <Text
            numberOfLines={2}
            style={[
              styles.supportingText,
              {
                fontSize: supportingSize,
                lineHeight: supportingSize + 4,
              },
            ]}>
            {item.supportingText}
          </Text>
        ) : null}

        <View
          style={[
            styles.actionChip,
            actionChipStyle,
            {
              marginTop: hasSecondaryCopy ? 0 : clamp(size * 0.01, 2, 4),
            },
          ]}>
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
