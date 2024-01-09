/*

    Creates the windows

*/

const { app, BrowserWindow, ipcMain } = require('electron');
const browserPreferences = {
    initialWindow: { 
        height: 250, width: 250, resizable: false, maximizable: false, 
        webPreferences: { 
            devTools: false, nodeIntegration: true, contextIsolation: false
        }
    }
}

function createWindow(file, opts) {

    const win = new BrowserWindow(opts);

    win.menuBarVisible = false;

    win.loadFile(file)
}

app.whenReady().then(() => {
    createWindow("html/index.html", browserPreferences['initialWindow']);

    console.log('loaded!')
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow("html/index.html", browserPreferences['initialWindow']);
        }
      });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});