
# Random SFX 🎵
**Random chaos, one sound at a time.**

**Random SFX** is a lightweight Electron app designed for unpredictable fun, jump scares, ambience, or just background chaos. It automatically finds audio files on your system and plays them at random intervals — sometimes layered, sometimes queued, always surprising.

By default, it will:
- Play sounds from `%USERPROFILE%\Music\random-sfx`
- Wait a random amount of time between 0 and *Max Interval* (in seconds)
- Keep going until you hit **Stop**

---

## 🎚 Features
- **Start / Stop button** to toggle playback  
- **Max Interval** – Set the maximum time (in seconds) between random sounds (default = 120)  
- **Master Volume** – Adjust all sounds with a global slider (saves automatically)  
- **File Tagging** – Use `[song]` or `[sfx]` in filenames for smarter playback  
  - `[song]` → always queued, no overlap  
  - `[sfx]` → can play anytime  
- **Ignore Untagged** – Optionally only play tagged audio  
- **Recursive Folder Search** – Finds sounds in all subfolders (with the ability to exclude specific ones)  

---

## ⚙️ Settings
- **Change Sounds Directory**  
  Point the app to your desired sound effects folder using an absolute path.  

- **Ignore Directory Folders**  
  Exclude folders from the recursive search by listing them, separated by commas.  
  Example: `clips/edited,audio/edited,videos,notes`  
  This skips any matching folder names under your chosen top-level directory.  

- **Max Running Sounds**  
  Controls how many sounds can actively start at once.  
  - If `ignoreUntagged` is **off**: sounds longer than `minQueueSong` seconds are treated as songs and queued automatically, while shorter sfx can play freely up to the running limit.  
  - If `ignoreUntagged` is **on**: only `[song]`-tagged files are queued, and the app will respect the running limit for those.  

- **Min Queue Song (seconds)**  
  Any sound longer than this threshold is considered a song and will always be queued (unless explicitly tagged `[sfx]`).  
  - Default: `60` seconds  
  - Set to `0` to force *all* sounds into the queue.  

- **Use Audio Tagging**  
  Toggle to respect `[song]` and `[sfx]` tags in filenames. Combine with **Ignore Untagged** for full control.  

- **Master Volume**  
  A global slider controlling overall output volume. Updates in real time and persists between sessions.  

---

## ➕ Adding Sounds
1. Navigate to `%USERPROFILE%\Music\random-sfx`  
   (e.g., `C:\Users\YourName\Music\random-sfx`)  
2. Drop in any `.mp3`, `.ogg`, or `.wav` files  
3. Restart the program to reload your sound library  

---

## 🎲 How It Works
1. Picks a random delay between **0** and your chosen **Max Interval**  
2. Waits that long  
3. Randomly selects a sound from your library  
4. Applies tagging / `minQueueSong` / overlap rules  
5. Plays or queues the sound depending on your settings  
6. Repeats until stopped  

You can keep it light with one sound at a time, allow overlapping chaos, or mix songs and sfx with tagging for a curated kind of randomness.  

---

**Random SFX v4.0**: chaotic, unpredictable, and now smarter with queues, tagging, and volume. 🎲🔊  
