const { contextBridge, ipcRenderer } = require('electron');

// logger

contextBridge.exposeInMainWorld('logger', {
    trace: (message) => ipcRenderer.send('log:trace', message),
    info: (message) => ipcRenderer.send('log:info', message),
    warn: (message, error = undefined) => ipcRenderer.send('log:warn', message, error),
    error: (error) => ipcRenderer.send('log:error', error)
});