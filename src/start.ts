/*

    Creates the windows

*/

import { updateElectronApp, UpdateSourceType } from 'update-electron-app';
updateElectronApp({
  updateSource: {
    type: UpdateSourceType.ElectronPublicUpdateService,
    repo: 'sselesUssecnirP/random-sfx-loop'
  },
  updateInterval: '1 hour'
})

import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'node:path';
const windows: Array<[string, number]> = [];
const isDev = !app.isPackaged;
console.log(isDev)
const html = "./dist/html/index.html"
const browserPreferences = {
    initialWindow: { 
        height: 900, width: 240, resizable: false, maximizable: false,
        webPreferences: { 
            devTools: isDev, nodeIntegration: false, contextIsolation: true, sandbox: false, preload: `${path.join(__dirname, 'preload.js')}`
        }
    }
}

if (require('electron-squirrel-startup')) app.quit();

function createWindow(name: string, file: string, opts: object) {

    const win = new BrowserWindow(opts);

    win.menuBarVisible = false;

    win.loadFile(file);

    windows.push([name, win.id]);

    return win;
}

app.whenReady().then(() => {
    const primaryDisplay = screen.getPrimaryDisplay();

    browserPreferences['initialWindow'].height = primaryDisplay.workAreaSize.height / 2.5;
    browserPreferences['initialWindow'].width = primaryDisplay.workAreaSize.width / 3;

    createWindow('main', html, browserPreferences['initialWindow']);

    console.log('loaded!')
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow('main', html, browserPreferences['initialWindow']);
        }
      });

    console.log(windows)

    if (isDev) {
        let win: BrowserWindow = BrowserWindow.getAllWindows().filter(e => e.id === windows.filter(f => f[0] === 'main')[0][1])[0]
        win.webContents.openDevTools()
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});

ipcMain.addListener('reload', (event, name: string) => {
    console.log(BrowserWindow.getAllWindows().filter(e => e.id === windows.filter(f => f[0] === 'main')[0][1])[0])

    let win: BrowserWindow = BrowserWindow.getAllWindows().filter(e => e.id === windows.filter(f => f[0] === name)[0][1])[0]

    win.reload();
});

ipcMain.handle('isDev', () => {
    return isDev;
})