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
  ],
};
