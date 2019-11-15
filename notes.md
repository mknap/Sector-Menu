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
* https://gjs-docs.gnome.org/ This might be very handy as I move forward
