import type { ForgeConfig } from '@electron-forge/shared-types';

import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerFlatpak } from '@electron-forge/maker-flatpak';
import { MakerSnap } from '@electron-forge/maker-snap';
import { PublisherGithub } from '@electron-forge/publisher-github';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
// @ts-expect-error
import { FuseV1Options, FuseVersion } from '@electron/fuses';

export const createForgeConfig = (opts: { mode: `installers` | `zip` }) => {
  const makers = [];

  if (opts.mode === `installers`) {
    makers.push(
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
      )/*,
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
      }, ['linux'])*/
      // Flatpack and Snap packages will be built, but only released via GitHub for now for manual installation. 
      // Flathub and Snapcraft.io support may come in the future, so I've opted to leave these here as a reminder.
    )
  } else if (opts.mode === 'zip') {
    makers.push(new MakerZIP({}, ['darwin', 'win32', 'linux']))
  }

  const forge: ForgeConfig = {
    packagerConfig: {
      asar: true,
      ignore: [
        `copyDir.js`,
        `forge.base.js`,
        `forge.config.js`,
        `zip.config.js`
      ]
    },

    rebuildConfig: {},

    makers: makers,

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
      })
    ],

    publishers: [
      new PublisherGithub({
        repository: {
          owner: 'sselesUssecnirP',
          name: 'random-sfx-loop'
        },
        draft: true,
        generateReleaseNotes: true
      })
    ]
  }

  return forge;
}