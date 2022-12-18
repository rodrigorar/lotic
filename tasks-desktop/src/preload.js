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
    createTask: (data) => ipcRenderer.send('tasks:create', data),
    updateTask: (taskId, data) => ipcRenderer.send('tasks:update', taskId, data),
    completeTask: (taskId) => ipcRenderer.send('tasks:complete', taskId),
    listTasks: () => ipcRenderer.invoke('tasks:list')
})