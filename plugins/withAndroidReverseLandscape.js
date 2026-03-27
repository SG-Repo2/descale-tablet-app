const {
  AndroidConfig,
  createRunOncePlugin,
  withAndroidManifest,
} = require('@expo/config-plugins');

const pkg = require('../package.json');

const PLUGIN_NAME = 'with-android-reverse-landscape';
const SCREEN_ORIENTATION_ATTRIBUTE = 'android:screenOrientation';
const ORIENTATION = 'reverseLandscape';

const withAndroidReverseLandscape = (config) =>
  withAndroidManifest(config, (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(
      config.modResults
    );

    mainActivity.$[SCREEN_ORIENTATION_ATTRIBUTE] = ORIENTATION;

    return config;
  });

module.exports = createRunOncePlugin(
  withAndroidReverseLandscape,
  PLUGIN_NAME,
  pkg.version
);
