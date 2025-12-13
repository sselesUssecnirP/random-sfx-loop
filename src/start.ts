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

import pkg from '../package.json';
import bot from './bot/bot'
import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'fs'
import { ExtendedConfig } from './bot/types/bot';
const zipDir = path.join(path.dirname(app.getPath('exe')), 'config');
process.env.RSL_CONFIG_PATH = pkg.isBuildZip ? path.join(zipDir) : path.join(app.getPath('userData'));
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

const config = JSON.parse(fs.readFileSync(path.join(process.env.RSL_CONFIG_PATH, 'config.json')).toString()) as config;

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

    // Consider hosting a discord bot myself
    // and allow users to generate an API key
    // in order to avoid the need for the user
    // to create a new discord bot themselves

    let botConfig: Partial<ExtendedConfig> = config

    botConfig.windows = windows
    botConfig.maxRandomInterval = 60

    if (config.useDiscordBot) {

        bot.run(botConfig as ExtendedConfig)
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
});