# On quick mode

The idea for quick mode is to simply press and hold the key shortcut. (I use the single <super_l> key in development, and I will have to try out a masked shortcut). While the key(s) are held, the menu shows and the user can move the mouse to any actor on the stage. When they key is released, the specified function or action will be executed depending upon the actor.

So for example, the user may highlight the vscode appicon, and upon key release, a new instance of vscode is started. Similarly, the user may highlight the currently running preview window of atom, to activate that window.

This should provide extremely quick and efficient navigation among the user's tasks to focus currently running applications, to start new applications, to activate application menus (if available), and to start bash commands (both from a history and to type new ones) .

## TODO

- finish coding with previews and clean everything up
- make a video
- explore other solutions
- fix a few bugs ie some actors dont have quickfunctions.

## The technical bit

    So currently, the way this is functionality is implemented is by storing the associated action for the currenly highlighed actor in an accessible variable (SectorMenu.quickFunction). 
    The keyrelease handler calls this action when quick mode is enabled and the key conditions are met.
