/* fullscreen.js
 Based upon fullscreen.js from gnome-shell/extensions/timepp@zagortenay333

 I am commenting all that I don't need (until I need them) to help me leann the neccessary parts of displaying a fullscreen window.

*/

const Clutter   = imports.gi.Clutter;
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
                x_expand: true,
                y_expand: true,
                style_class: 'content'
            });
            //this.content_box.set_position(100,100);
            //this.content_box.set_size(100,100)
            this.actor.add_actor(this.content_box);

            /// entry box
            this.entry_box = new St.Entry({
                style_class: 'entry-box',
                hint_text: 'Run command',
                track_hover: true,
                can_focus: true,
            })
            this.content_box.add_actor(this.entry_box)
            //this.entrybox.set_offscreen_redirect(Clutter.OffscreenRedirect.ALWAYS);


        }

        /** drawing guides with Clutter? */
    //     let RED   = new Clutter.Color( {'red':255, 'blue':0, 'green':0, 'alpha':255} );
    //     for (let n=0; n< 6; n++){
    //         let guideline = new Clutter.Actor ({
    //             "background_color": RED,
    //             "width":300,
    //             "height":1,
    //             "x":1920/2,
    //             "y":1080/2,
    //             "rotation-angle-z" : n*60 + 30
    //         })
    //         this.content_box.add_actor(guideline);
    //     }




        Main.layoutManager.uiGroup.add_actor(this.actor);
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
        //global.window_group.hide(); //makes screen fade
        this.actor.show();
        this.entry_box.grab_key_focus();
        // this.actor.grab_mouse_focus()
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
