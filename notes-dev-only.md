# Notes

In the last few weeks( since the initial commit of this project ), I have used this work to propel my study and use of
- [x] `javascript` and `gjs`, a gnome javascript interpreter for the gnome shell
- [x] `git` and [https://github.com] to track this code Projects
- [x] `atom` and many packages the text editor
- [x] `Clutter`, `St`, and `Gtk` -- various APIs and components to interact with gnome-shell and this extensions
## ToDo for Sector menu
- [x] [11-22](#getting-a-keybinding) Get a keybinding
- [X] [11-23,11-24](#got-fullscreen)Get a full screen window
- [X] Learn how to draw on the window [11-26] See the commit.
- [x] [11-22](ui.appFavorites.js)load favorites from gnome ?
- [X] [11-30 - 12-2] save preferences so we can make our own menus
- [ ] ~start working with glade to make the prefs menu more accessible~
- [X] [11-30](sortof)icons for menus?
- [ ] Make up some default stuff for myself, ssh commands, hue commands, getCurrentExtension
- [ ] learn tweener
- [ ] Use logger.js (perhaps rather than my own?)

### Some useful links I've Found
A lot of these are in the code at the moment for references, but they will at some point be removed, so I wanted to keep them around.
* https://wiki.gnome.org/Projects/GnomeShell/Extensions/StepByStepTutorial This one really is the one that got me going on this thing. It seems a bit out-dated, but it was a great springboard
* https://wiki.gnome.org/Projects/GnomeShell/Extensions/Writing Another good oveerview
* https://wiki.gnome.org/Projects/GnomeShell/Extensions Reference material
* https://gitlab.gnome.org/GNOME/gnome-shell/blob/master/js/misc/extensionUtils.js This is something I ran across that taught me a new syntax for imports. I like it better as it is more concise.
<details>
```JavaScript
const { Gio, GLib } = imports.gi;
```
vs.
```JavaScript
const Gio =  imports.gi.Gio;
const GLib = imports.gi.GLib;
```
</details>
* [https://iacopodeenosee.wordpress.com/2013/03/10/simple-guide-to-improve-your-own-extension-on-gnome-shell/] [Simple ] Hnady list of other links.

### Working on some new stuff
- I've had quite a bit of learning to do. I've started using `git` and reading a lot of other extension code to help with developing ideas and understanding.
- I now know what a snippet is (and how to use them in atom)
- I got a couple of nice packages for atom, and I'm still working on (thinking about) developing my own.
- [fold-navigator][https:   //atom.io/packages/fold-navigator]
- fold-navigator [^1][https://atom.io/packages/fold-navigator]
    - Would like for it to be less distracting as it changes width from file to file.

### A new command tool I learned to utilize
`bluetoothctl` is nice to connect to saved devices automatically. Already working on some scripts.
`amp` connects to the amp via bluetooth with the simple command `
bluetoothctl connect  3C:91:80:11:AF:2D` The only hard thing to remember is the address.



### Getting a keybinding
I used hidetopbar as a model to discover the Main.wm.addkeybinding method

### ui.appFavorites.js
Able to get a list of favorite apps from gnome shell. Now working on how to run one from the list. Using the extension Panel_Favorites for help here.

### Got Fullscreen
###### Finally
It seems that the key I was missing was `Main.uiGroup.add_actor()` to display the content I was trying to create. (Now I get to try to make my content). Also, after reading more source, it seems that it really should be `Main.layoutManager.uiGroup.add_actor()`


## Using the `<Super>` key alone
I stumbled across [https://unix.stackexchange.com/questions/388238/how-to-set-super-windows-key-to-show-all-applications-menu-in-gnome-de]

And with few a more tweaks, I can now bind the shortcut to the lone `<Super_L>` key! I have a few more questions, like why `gsettings set|get ` doesn't see the extensions path `org.gnome.shell.extensions.*` where all the extensions schemas are held. There is a little hack, though:  I can't specifically set my extension to the `<Super_L>` key, but I can set
``` gsettings set org.gnome.shell.keybindings toggle-overview "['Super_L']" ```
Then, inside the extension code, we can use
```js
setCustomKeybindingHandler(
    'toggle-overview',
    ShellActionMode.ALL,
    this._keyAction.bind(this))
```
to set the key handler to our own extension code.

More to come.
