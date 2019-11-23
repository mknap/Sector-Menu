/* fullscreen.js
 Based upon fullscreen.js from gnome-shell/extensions/timepp@zagortenay333

 I am commenting all that I don't need (until I need them) to help me leann the neccessary parts of displaying a fullscreen window.

*/

// const Clutter   = imports.gi.Clutter;
// const Gtk       = imports.gi.Gtk;
const St        = imports.gi.St;
// const Pango     = imports.gi.Pango;
//
const Layout    = imports.ui.layout;
const Main      = imports.ui.main;
// const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils =imports.misc.extensionUtils;

//const Signals   = imports.signals;

//const ME = imports.misc.extensionUtils.getCurrentExtension();
const Me = ExtensionUtils.getCurrentExtension()
const Convenience = Me.imports.convenience;
const DEBUG=Convenience.DEBUG;

var Fullscreen = class Fullscreen{

    constructor(monitor){
        DEBUG(`fullscreen.constructor(${monitor})`)
        this.is_open = false;
        this.monitor = monitor;
        this.monitor_constraint= new Layout.MonitorConstraint();
        this.display=global.display;   //bypassing the wrapper, VER>=3.34

        // container
        this.actor = new St.BoxLayout(
            { reactive: true,
            style_class: '.sectormenu-fullscreen' }
        )
        this.actor.add_constraint(this.monitor_constraint);
    }

    destroy(){
        DEBUG('fullscreen.destroy()')
    }

    close(){
        if (! this.is_open) return;
        this.is_open = false;
        Main.layoutManager.removeChrome(this.actor);
        DEBUG('fullscreen.close()')
        //this.emit('closed');
    }

    open(){
        DEBUG('fullscreen.open()')
        if (this.is_open) {
            this.actor.grab_key_focus();
            this.actor.raise_top();
            return;
        }
        this.is_open = true;
        Main.layoutManager.addChrome(this.actor);
        this.actor.grab_key_focus();
        this.actor.raise_top();

        //this.emit('opened');

    }

}
