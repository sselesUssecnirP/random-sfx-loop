# random-sfx-loop
 This program will play random sfx nonstop at random intervals

# How to change settings
 In the settings, there are the following options:
 - Change Sounds Directory
  - Locate your desired sounds location in your filesystem, then copy the absolute path and paste it.
 - Ignore Directory Folders
  - When finding sounds, the program will recursively search every directory. If there are directories you wish it to ignore relative to the chosen top-level directory, paste them in a comma-separated list here. 

 If you have a folder like clips/edited that matches audio/edited for some reason, then include the previous folder in the list. i.e "clips/edited,audio/edited,videos,notes" would ignore BOTH folders labelled "edited" plus the other two folders mentioned.

# How To Add Sound Files
 Navigate to "%USERPROFILE%\Music\random-sfx" (i.e "C:\Users\%username%\Music\random-sfx"). Here you can you drop in any .mp3, .ogg, or .wav files and the program will load them every time it opens. If you want to reload the files, re-open the program.