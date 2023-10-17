const { contextBridge, ipcRenderer } = require('electron');

// logger

contextBridge.exposeInMainWorld('logger', {
    trace: (message) => ipcRenderer.send('log:trace', message)
    , info: (message) => ipcRenderer.send('log:info', message)
    , warn: (message, error = undefined) => ipcRenderer.send('log:warn', message, error)
    , error: (error) => ipcRenderer.send('log:error', error)
});

// utils

contextBridge.exposeInMainWorld('utils', {
    generateId: () => ipcRenderer.invoke('utils:id:generate')
});

// tasks

contextBridge.exposeInMainWorld('tasks', {
    createTask: (data) => ipcRenderer.send('tasks:create', data)
    , updateTask: (taskId, data) => ipcRenderer.send('tasks:update', taskId, data)
    , completeTask: (taskId) => ipcRenderer.send('tasks:complete', taskId)
    , listTasks: () => ipcRenderer.invoke('tasks:list')
    , repositionTasks: (targetTaskId, draggedTaskId) => ipcRenderer.send('tasks:reposition', targetTaskId, draggedTaskId)
    , refresh: () => ipcRenderer.send('tasks:refresh')
    , handleRefresh: (callback) => ipcRenderer.on('tasks:refresh', callback)
});

// accounts

contextBridge.exposeInMainWorld('accounts', {
    signup: (signUpData) => ipcRenderer.send('accounts:signup', signUpData)
    , handleSignUpFailure: (callback) => ipcRenderer.on('accounts:signup_failure', callback)
    , handleSignUpSuccess: (callback) => ipcRenderer.on('accounts:signup_success', callback)
})

// auth

contextBridge.exposeInMainWorld('auth', {
    signin: (signInData) => ipcRenderer.send('auth:signin', signInData)
    , logout: () => ipcRenderer.send('auth:logout')
    , isLoggedIn: () => ipcRenderer.invoke('auth:is_logged_in')
    , handleLoggedIn: (callback) => ipcRenderer.on('auth:logged_in', callback)
    , handleLoginFailure: (callback) => ipcRenderer.on('auth:login_failed', callback)
    , handleLoggedOut: (callback) => ipcRenderer.on('auth:logged_out', callback)
});

// ui management

contextBridge.exposeInMainWorld('ui', {
    handleLoadingStart: (callback) => ipcRenderer.on("ui:loading:start", callback)
    , handleLoadingEnd: (callback) => ipcRenderer.on("ui:loading:end", callback)
    , handleUIRefresh: (callback) => ipcRenderer.on("ui:refresh", callback)
})

// navigation

contextBridge.exposeInMainWorld('nav', {
    openLogin: () => ipcRenderer.send('nav:open:login')
    , openSignUp: () => ipcRenderer.send('nav:open:signup')
    , openAbout: () => ipcRenderer.send('nav:open:about')
    , openHome: () => ipcRenderer.send('nav:open:home')
});