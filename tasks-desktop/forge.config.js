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
    },
    {
      name: '@electron-forge/maker-wix',
      config: {
        manufacturer: 'rodrigorar',
        name: 'Tasks',
        description: 'Todo and daily planner app',
        icon: 'images/icon.ico',
        setupIcon: 'images/icon.ico',
        exe: 'Tasks-5.0.0 Setup'
      },
    }
  ],
};
