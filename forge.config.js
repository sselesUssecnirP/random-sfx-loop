const { MakerSquirrel } = require('@electron-forge/maker-squirrel');
const { MakerZIP } = require('@electron-forge/maker-zip');
const { MakerDeb } = require('@electron-forge/maker-deb');
const { MakerRpm } = require('@electron-forge/maker-rpm');
const { MakerDMG } = require('@electron-forge/maker-dmg');
const { MakerFlatpak } = require('@electron-forge/maker-flatpak');
const { MakerSnap } = require('@electron-forge/maker-snap');
const { PublisherGithub } = require('@electron-forge/publisher-github');
const { AutoUnpackNativesPlugin } = require('@electron-forge/plugin-auto-unpack-natives');
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const config = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel(
      {
        name: 'RandomSFX',
        authors: 'sselesUssecnirP',
        description: 'An app built in electron to play random sfx on loop.',
        setupIcon: './assets/icon.ico',
        noMsi: true,
      },
      ['win32']
    ),

    new MakerZIP({}, ['darwin', 'win32', 'linux']),

    new MakerDMG({
      name: 'RandomSFX'
    }, ['darwin']),

    new MakerRpm(
      {
        options: {
          name: 'RandomSFX',
          description: 'An app built in electron to play random sfx on loop.',
          homepage: 'https://github.com/sselesUssecnirP/random-sfx-loop',
          icon: './assets/icon.png',
        },
      },
      ['linux']
    ),
    new MakerDeb(
      {
        options: {
          name: 'RandomSFX',
          maintainer: 'sselesUssecnirP',
          description: 'An app built in electron to play random sfx on loop.',
          homepage: 'https://github.com/sselesUssecnirP/random-sfx-loop',
        },
      },
      ['linux']
    ),
    new MakerFlatpak({
      options: {
        categories: ['Audio']
      }
    }, ['linux']),
    new MakerSnap({
      features: {
        audio: true,
        //mpris: 'com.sselesussecnirp.randomsfx'
      }
    }, ['linux'])
    // Flatpack and Snap packages will be built, but only released via GitHub for now for manual installation. 
    // Flathub and Snapcraft.io support may come in the future, so I've opted to leave these here as a reminder.
  ],

  plugins: [
    new AutoUnpackNativesPlugin({}),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'sselesUssecnirP',
        name: 'random-sfx-loop'
      }
    })
  ]
};

module.exports = config;
