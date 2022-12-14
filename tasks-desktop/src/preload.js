const { contextBridge, ipcRenderer } = require('electron');

// logger

contextBridge.exposeInMainWorld('logger', {
    trace: (message) => ipcRenderer.send('log:trace', message),
    info: (message) => ipcRenderer.send('log:info', message),
    warn: (message, error = undefined) => ipcRenderer.send('log:warn', message, error),
    error: (error) => ipcRenderer.send('log:error', error)
});

// utils

contextBridge.exposeInMainWorld('utils', {
    generateId: () => ipcRenderer.invoke('utils:id:generate')
});

// tasks

contextBridge.exposeInMainWorld('tasks', {
    updateTitle: (taskId, newTitle) => ipcRenderer.send('tasks:title:update', taskId, newTitle)
})