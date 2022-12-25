module.exports = {
  packagerConfig: {
    executableName: "tasks-desktop"
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'rodrigorar',
          homepage: 'https://ants.dev'
        }
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        //icon: `${iconPath}.icns`,
      },
    },
  ],
};
