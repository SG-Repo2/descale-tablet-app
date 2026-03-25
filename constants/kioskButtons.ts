import type { ImageSourcePropType } from 'react-native';

export type KioskButtonSide = 'left' | 'right';
export type KioskButtonActionType = 'modal' | 'external' | 'screen';

export type KioskModalContent = {
  eyebrow: string;
  title: string;
  body: string;
  hint?: string;
};

type KioskButtonBase = {
  id: string;
  label: string;
  imageSource?: ImageSourcePropType;
  iconName?: string;
  side: KioskButtonSide;
  order: number;
  eyebrow: string;
  supportingText: string;
};

export type KioskModalButton = KioskButtonBase & {
  actionType: 'modal';
  modalContent: KioskModalContent;
  externalUrl?: never;
  screenId?: never;
  fallbackModalContent?: never;
};

export type KioskExternalButton = KioskButtonBase & {
  actionType: 'external';
  externalUrl: string;
  modalContent?: never;
  screenId?: never;
  fallbackModalContent?: never;
};

export type KioskScreenButton = KioskButtonBase & {
  actionType: 'screen';
  screenId: string;
  fallbackModalContent?: KioskModalContent;
  modalContent?: never;
  externalUrl?: never;
};

export type KioskSideButtonDefinition =
  | KioskModalButton
  | KioskExternalButton
  | KioskScreenButton;

/**
 * Central kiosk navigation model.
 *
 * Buttons are intentionally split across left/right columns so content can be
 * updated later without touching the screen layout code.
 */
export const KIOSK_SIDE_BUTTONS: KioskSideButtonDefinition[] = [
  {
    id: 'knowledge-library',
    label: 'Knowledge\nLibrary',
    iconName: 'bookshelf',
    side: 'left',
    order: 1,
    eyebrow: '',
    supportingText: '',
    actionType: 'external',
    externalUrl: 'https://marketing.hydroinc.com/casestudy_steel',
  },
  {
    id: 'impel',
    label: 'IMPEL',
    imageSource: require('../assets/images/impelLogo.png'),
    side: 'left',
    order: 2,
    eyebrow: '',
    supportingText: '',
    actionType: 'external',
    externalUrl: 'https://example.com/impel',
  },
  {
    id: 'hydro-university',
    label: 'Hydro\nUniversity',
    imageSource: require('../assets/images/hydroUBlue.png'),
    side: 'left',
    order: 3,
    eyebrow: '',
    supportingText: '',
    actionType: 'external',
    externalUrl: 'https://external.university.hydroinc.com/',
  },
  {
    id: 'centaur',
    label: 'CENTAUR',
    imageSource: require('../assets/images/centaurLogo.png'),
    side: 'right',
    order: 1,
    eyebrow: '',
    supportingText: '',
    actionType: 'external',
    externalUrl: 'https://marketing.hydroinc.com/centaur_library',
  },
  {
    id: 'careers',
    label: 'Careers',
    imageSource: require('../assets/images/careers.png'),
    side: 'right',
    order: 2,
    eyebrow: '',
    supportingText: '',
    actionType: 'external',
    externalUrl: 'https://www.hydroinc.com/careers',
  },
  {
    id: 'hydro-energy-edge',
    label: 'Energy Edge',
    imageSource: require('../assets/images/energyLogo.png'),
    side: 'right',
    order: 3,
    eyebrow: '',
    supportingText: '',
    actionType: 'external',
    externalUrl: 'https://example.com/hydro-energy-edge',
  },
];
