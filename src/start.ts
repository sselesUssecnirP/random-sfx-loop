/*

    Creates the windows

*/
// @ts-expect-error | this does not cause a conflict in the program when running
const { app, BrowserWindow, screen, ipcMain } = require('electron');

const isTesting = true;
const html = "./dist/html/index.html"
const browserPreferences = {
    initialWindow: { 
        height: 900, width: 240, resizable: false, maximizable: false, 
        webPreferences: { 
            devTools: false, nodeIntegration: true, contextIsolation: false
        }
    }
}

function createWindow(file: string, opts: object) {

    const win = new BrowserWindow(opts);

    win.menuBarVisible = false;

    win.loadFile(file)
}

app.whenReady().then(() => {
    // @ts-expect-error | im gonna test this; if it works fuck you ts (it worked, time to change my css all over again to work with a new area size :\)
    const primaryDisplay = screen.getPrimaryDisplay();

    browserPreferences['initialWindow'].height = primaryDisplay.workAreaSize.height / 2.5;
    browserPreferences['initialWindow'].width = primaryDisplay.workAreaSize.width / 3;

    createWindow(html, browserPreferences['initialWindow']);

    console.log('loaded!')
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(html, browserPreferences['initialWindow']);
        }
      });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});