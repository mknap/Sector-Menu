# Sector menu

A gnome shell extension which provides quick access to a configurable set of applications and shortcuts. The extension also provides quick access to a command line and developer tool shortcuts.

![Sector Menu Icon](icons/sector-icon.svg)

This extension is currently in early development.

## Usage
The default accelerator to show the extension is `<super>-z`.

#### The sectors
Currently, the extension only shows a list of favorite apps in the sectors around the mouse pointer. If these are changed, or re-ordered, by a third party (dash-to-dock, workspace-to-dock, or many other various ways), the changes will be reflected here. The extension simply gets a list of favorites from gnome-shell, and displays what is there.

#### The text entry
The text entry box is *not* like the dash text entry box. This box will try to run the entered text as if it were typed on the command line. A `<Tab>` press will close the extension and switch to the default overview. `<Esc>` clears the text box; a second `<Esc>` press will close the extension.

## Ideas coming up :
* command history
* pretty stuff
* monitoring and other info in background
* quick access to overview mode
* multiple sectors
* app menus inside sectors
* custom list of apps (also perhaps on a per-sector basis )
* custom typing shortcuts for the text entry box

## A handy hack
It is possible to set the keyboard shortcut to the single '<Win>' or `<Super_L>` key with `dconf-editor`. This makes for a very quick way to access the favorites and a quick command line.  
