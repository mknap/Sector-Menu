/* fullscreen.js
 Based upon fullscreen.js from gnome-shell/extensions/timepp@zagortenay333

 I am commenting all that I don't need (until I need them) to help me leann the neccessary parts of displaying a fullscreen window.

*/

// const Clutter   = imports.gi.Clutter;
// const Gtk       = imports.gi.Gtk;
const Meta      = imports.gi.Meta;
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

    constructor(){
        DEBUG(`fullscreen.constructor()...`)
        this.is_open = false;

        let monitor = Main.layoutManager.currentMonitor;
        DEBUG(monitor.width)
        // this.actor=new St.Widget(
        //     { visible: true,
        //     reactive: true,
        //     style_class: 'sectormenu-fullscreen'
        //     }
        // );

        /** initBackground from coverflow platform.js */
        {
            let Background = imports.ui.background;

	    	this._backgroundGroup = new Meta.BackgroundGroup();
        Main.layoutManager.uiGroup.add_child(this._backgroundGroup);
        this._backgroundGroup.lower_bottom();
        this._backgroundGroup.hide();
        for (let i = 0; i < Main.layoutManager.monitors.length; i++) {
            new Background.BackgroundManager({
                container: this._backgroundGroup,
                monitorIndex: i,
                vignette: true });
            }
        }

        /** container for widgets from coverflow switcher.js */
        {
            this.actor = new St.BoxLayout({
                visible: true,
                reactive: true,
                style_class: 'sectormenu-fullscreen'
            });
            this.actor.set_position(monitor.x, monitor.y);
            this.actor.set_size(monitor.width, monitor.height);
            this.content_box = new St.BoxLayout({
                vertical: true,
                //x_expand: true,
                //y_expand: true,
                style_class: 'content'
            });
            this.actor.add_actor(this.content_box);
            Main.uiGroup.add_actor(this.actor);
        }
        // this.monitor = monitor;
        // this.monitor_constraint= new Layout.MonitorConstraint();
        // this.display=global.display;   //bypassing the wrapper, VER>=3.34
        //
        // Tyring my own ideas here, not sure if they will work.
        // Sort of works. brings up the window, but crashes upon close.
        // Clutter.init(null);
        // this.stage = new Clutter.Stage();
        // this.stage.connect("destroy", Clutter.main_quit);
        // // Put some title
        // this.stage.title = "this.stage.title is Test";
        // // this.stage.set_fullscreen (True);
        // // Set a color to the stage to show that it is working
        // this.stage.set_use_alpha(true);
        // // Set a color to the stage to show that it is working
        // this.stage.set_background_color(new Clutter.Color({
        //     red : 150,
        //     blue : 0,
        //     green : 0,
        //     alpha : 128
        // }));


        // container (ST methods from timepp extenion)
        //
        // this.actor = new St.BoxLayout(
        //     { reactive: true,
        //     style_class: 'sectormenu-fullscreen' }
        // )
        // this.actor.add_constraint(this.monitor_constraint);
        // this.content_box = new St.BoxLayout(
        //     { vertical: true,
        //     x_expand: true,
        //     y_expand: true,
        //     style_class: 'content' }
        // );
        // this.actor.add_actor(this.content_box);






        DEBUG('fullscreen.constructor DONE.')
    }

    destroy(){
        DEBUG('fullscreen.destroy()')

    }

    close(){
        DEBUG('fullscreen.close()')
        this.is_open = false;
        global.window_group.show();
        this.actor.hide();
    }

    open(){
        DEBUG('fullscreen.open()')

        if (this.is_open) {
            this.actor.grab_key_focus();
            this.actor.raise_top();
            return;
        }
        this.is_open = true;
        //global.window_group.hide();
        this.actor.show();
        this.actor.grab_key_focus();
        this.actor.raise_top();
    }

    toggle(){
        DEBUG('fullscreen.toggle()')
        if (this.is_open){
            DEBUG('open -> closed')
            this.close();
        }
        else {
            DEBUG('closed -> open')
            this.open();
        }
    }
}
