module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'rodrigorar',
          homepage: 'https://github.com/rodrigorar',
          icon: 'images/icon.png'
        }
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        icon: 'images/icon.icns'
      }
    }
  ],
};
