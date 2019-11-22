# Notes

I got the idea for this extension on the playstation. But also, I often have my left hand on the keyboard, and the right hand on the mouse (unless I'm writing like now), but I wanted a fast way to navigate the Shell. The existing overview is pretty amazing and fast, but it is just a teeny bit annoying to move my right hand off the mouse to type the name of an app or file or something in the overview search bar. (But I can bring it up very quickly with the windows key with my left hand). So I wanted to improve on that.
The idea is to hit the windows key (or some other left-handed combo), then be able to use the mouse to navigate a series of menus on the screen to quickly do useful things.

I hvae never written an extension before, so a lot of the work here is slow going and I'm learning as I go. (I have programmed before)

### Some useful links I've Found
A lot of these are in the code at the moment for references, but they will at some point be removed, so I wanted to keep them around.
* https://wiki.gnome.org/Projects/GnomeShell/Extensions/StepByStepTutorial This one really is the one that got me going on this thing. It seems a bit out-dated, but it was a great springboard
* https://wiki.gnome.org/Projects/GnomeShell/Extensions/Writing Another good oveerview
* https://wiki.gnome.org/Projects/GnomeShell/Extensions Reference material
* https://gitlab.gnome.org/GNOME/gnome-shell/blob/master/js/misc/extensionUtils.js This is something I ran across that taught me a new syntax for imports. I like it better as it is more concise.
```JavaScript
const { Gio, GLib } = imports.gi;
```
vs.
```JavaScript
const Gio =  imports.gi.Gio;
const GLib = imports.gi.GLib;
```

### Working on some new stuff
- I've had quite a bit of learning to do. I've started using `git` and reading a lot of other extension code to help with developing ideas and understanding.
- I now know what a snippet is (and how to use them in atom)
- I got a couple of nice packages for atom, and I'm still working on (thinking about) developing my own.
- [fold-navigator][https://atom.io/packages/fold-navigator]
- fold-navigator [^1][https://atom.io/packages/fold-navigator]
    - Would like for it to be less distracting as it changes width from file to file.

### A new command tool I learned to utilize
`bluetoothctl` is nice to connect to saved devices automatically. Already working on some scripts.
`amp` connects to the amp via bluetooth with the simple command `
bluetoothctl connect  3C:91:80:11:AF:2D` The only hard thing to remember is the address.

## ToDo for Sector menu
- [x] Get a keybinding [11-22](#getting-a-keybinding)
- [ ] Get a full screen window
- [ ] Learn how to draw on the window
- [ ] learn tweener
- [ ] save preferences so we can make our own menus
- [ ] start working with glade to make the prefs menu more accessible
- [ ] icons for menus?
- [ ] Make up some default stuff for myself, ssh commands, hue commands, getCurrentExtension
- [ ] load favorites from gnome ?
- [ ] Use logger.js (perhasp rather than my own?)


### Getting a keybinding
I used hidetopbar as a model to discover the Main.wm.addkeybinding method
