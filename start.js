/*

    Creates the windows

*/

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const webPrefs = { devTools: true, nodeIntegration: true, contextIsolation: false }
const xindex = 250, 
          yindex = 180

function createWindow(file, opts) {

    const win = new BrowserWindow(opts);

    win.loadFile(file)
}

app.whenReady().then(() => {
    createWindow("app/html/index.html", { height: yindex, width: xindex, webPreferences: webPrefs, resizable: true, maximizable: false });

    console.log('loaded!')
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow("app/html/index.html", { height: xindex, width: yindex, webPreferences: webPrefs, resizable: true, maximizable: false });
        }
      });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});