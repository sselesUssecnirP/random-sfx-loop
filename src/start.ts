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
import path from 'path';

const windows: Array<[string, BrowserWindow]> = []

const html = "./dist/html/index.html"
const browserPreferences = {
    initialWindow: { 
        height: 900, width: 240, resizable: false, maximizable: false, 
        webPreferences: { 
            devTools: true, nodeIntegration: false, contextIsolation: true, sandbox: false, preload: `${path.join(__dirname, 'preload.js')}`
        }
    }
}

if (require('electron-squirrel-startup')) app.quit();

function createWindow(file: string, opts: object) {

    const win = new BrowserWindow(opts);

    win.menuBarVisible = false;

    win.loadFile(file)

    return win;
}

app.whenReady().then(() => {
    const primaryDisplay = screen.getPrimaryDisplay();

    browserPreferences['initialWindow'].height = primaryDisplay.workAreaSize.height / 2.5;
    browserPreferences['initialWindow'].width = primaryDisplay.workAreaSize.width / 3;

    windows.push(['main', createWindow(html, browserPreferences['initialWindow'])]);

    console.log('loaded!')
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            windows.push(['main', createWindow(html, browserPreferences['initialWindow'])]);
        }
      });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});

ipcMain.addListener('reload', (name: string) => {
    if (windows.filter(element => element[0] == name)) {
        let win: BrowserWindow = windows.filter(element => element[0] == name)[0][1];

        win.reload()
    }
})