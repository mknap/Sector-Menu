/* fullscreen.js
 Based upon fullscreen.js from gnome-shell/extensions/timepp@zagortenay333

 I am commenting all that I don't need (until I need them) to help me leann the neccessary parts of displaying a fullscreen window.

*/

const Clutter   = imports.gi.Clutter;
// const Gtk       = imports.gi.Gtk;
const Meta      = imports.gi.Meta;
const St        = imports.gi.St;
// const Pango     = imports.gi.Pango;


const AppFavorites = imports.ui.appFavorites;
const AppDisplay = imports.ui.appDisplay;
const Layout    = imports.ui.layout;
const Main      = imports.ui.main;
// const PopupMenu = imports.ui.popupMenu;
const ShellEntry = imports.ui.shellEntry;


const ExtensionUtils =imports.misc.extensionUtils;
//const Signals   = imports.signals;
const Util = imports.misc.util;

//const ME = imports.misc.extensionUtils.getCurrentExtension();
const Me = ExtensionUtils.getCurrentExtension()
const Convenience = Me.imports.convenience;
const DEBUG=Convenience.DEBUG;

/** Some constants for clutter colors: */

const WHITE = new Clutter.Color( {'red':255, 'blue':255, 'green':255, 'alpha':255} );
const BLACK = new Clutter.Color( {'red':0, 'blue':0, 'green':0, 'alpha':255} );
const RED   = new Clutter.Color( {'red':255, 'blue':0, 'green':0, 'alpha':255} );
const TRANS = new Clutter.Color( {'red':255, 'blue':255, 'green':255, 'alpha':0} );
const SEMITRANS = new Clutter.Color( {'red':0, 'blue':0, 'green':0, 'alpha':200} );
const GRAY  = new Clutter.Color( {'red':127, 'blue':127, 'green':127, 'alpha':127} );

const SECTORS=7;
const X=1920;
const Y=1080



var Fullscreen = class Fullscreen{

    constructor(){
        DEBUG(`fullscreen.constructor()...`)
        this.is_open = false;
        this.draw_at_mouse=true;
        this.draw_guides=true;

        this.monitor = Main.layoutManager.currentMonitor;
        this.guidelines=[];
        this.favs = AppFavorites.getAppFavorites().getFavorites();
        this.items=[];

        /** initBackground from coverflow platform.js */
        {
        //     let Background = imports.ui.background;
        //
	    // 	this._backgroundGroup = new Meta.BackgroundGroup();
        // Main.layoutManager.uiGroup.add_child(this._backgroundGroup);
        // this._backgroundGroup.lower_bottom();
        // this._backgroundGroup.hide();
        // for (let i = 0; i < Main.layoutManager.monitors.length; i++) {
        //     new Background.BackgroundManager({
        //         container: this._backgroundGroup,
        //         monitorIndex: i,
        //         vignette: true });
        //     }
        }

        this.FSMenu = new St.Widget({
            visible: true,
            reactive: true,
            style_class: 'sectormenu-fullscreen'
        });
        this.FSMenu.set_size(this.monitor.width, this.monitor.height);
        this.entry_box = new St.Entry({
            style_class: 'entry-box',
            hint_text: 'Run command',
            track_hover: true,
            can_focus: true,
            x: 108,
            y: 100,
            width: this.monitor.width/5,
        })
        //ShellEntry.addContextMenu(this.entry_box)     //TODO: what does this do
        this.entry_text=this.entry_box.clutter_text;
        this.entry_text.connect(
            'activate',
            this._entryRun.bind(this)
        )
        this.entry_text.connect(
            'key-press-event',
            this._entryKeyPressEvent.bind(this)
        );
        this.FSMenu.add_actor(this.entry_box)
        Main.layoutManager.uiGroup.add_actor(this.FSMenu);
        DEBUG('fullscreen.constructor DONE.')
    }

    _entryKeyPressEvent(actor,event){         //TODO: why is this params (a,e)?
        let symbol=event.get_key_symbol();
        DEBUG(symbol);
        if (symbol === Clutter.KEY_Escape) {
            if (actor.get_text()) {
                actor.set_text('');
                return Clutter.EVENT_STOP;
            } else {
                this.close();
            }
            }
        return Clutter.EVENT_PROPAGATE;
    }

    _entryRun(actor){                       //TODO: and this params just (a)?

        DEBUG(`_entryRun().  ${actor}` );
        //this.popModal();
        let command=actor.get_text();
        DEBUG(command)

        if(command=='r'){
            this._restart();
        }
        else{
            Util.trySpawnCommandLine(command);
            this.close();
        }
    }

    /** @_drawSectors
    Draws N sectors
    @param N the number of sectors to calculate and drawing
    */
    _drawSectors(N){

        if(this.draw_at_mouse) {
            var [x0, y0, mask] = global.get_pointer();
        } else {
            var [x0, y0] = [ X/2 , Y/2 ];
        }
        for (let n = 0; n < N ; n++)
        {
            let x = (100*Math.cos(n*2*Math.PI/(N)) + x0); //FIXME no hard code sizes
            let y = (100*Math.sin(n*2*Math.PI/(N)) + y0);

           //Labels; were my first attempt:
             // this.items[n] = new Clutter.Text({
            //     "text": "Item " + n.toString(),
            //     "color":WHITE
            // });

            //from Panel_favorites extension.js@31
        {   let app = this.favs[n];
            this.items[n] = new St.Button({
                //style_class: 'panel-button',
                reactive: true,
                visible: true,
            });
            let gicon = app.app_info.get_icon();
            let icon = new St.Icon({
                gicon: gicon,
                //style_class: 'panel-launcher-icon',
                visible: true,
            });
            this.items[n].set_child(icon);
            this.items[n]._delegate = this;
            let text = app.get_name();
            if ( app.get_description() ) {
                text += '\n' + app.get_description();
            }

            let label = new St.Label({
                //style_class: 'panel-launcher-label'
            });
            label.set_text(text);
            //Main.layoutManager.addChrome(label);
            //this.label.hide();
            this.items[n].label_actor = label;

            //this._app = app;
            //this._menu = null;
            //this._menuManager = new PopupMenu.PopupMenuManager(this.actor);

            this.items[n].connect('clicked', () => {
                app.open_new_window(-1);
                if ( Main.overview.visible ) {
                    Main.overview.hide();
                }
                this.toggle();
            });

        }
            // this.items[n].connect('notify::hover',
            //         this._onHoverChanged.bind(this));
            // this.items[n].connect('button-press-event',
            //         this._onButtonPress.bind(this));

            this.items[n].set_size(64,64)
            let [dx,dy]=this.items[n].get_size();
            DEBUG(`x: ${dx}, y:${dy}`)// //print (dx,dy)
            //let [dx,dy] = [64,64];
            this.items[n].set_position(x-dx/2,y-dy/2)
            this.items[n].opacity = 207;
            this.FSMenu.add_actor(this.items[n])

            //guidelines :
            this.guidelines[n] = new Clutter.Actor ({
                //"style": "guidelines",   //FIXME: can we do a clutter style?
                "background_color":RED,
                "width":300,
                "height":1,
                "x":x0,
                "y":y0,
                "rotation-angle-z": n*360/N +.5*350/N
            });
            //print(guideline.get_pivot_point());
            //guideline.set_rotation_angle(2, ( ( Math.PI ) / SECTORS) );
            this.FSMenu.add_actor(this.guidelines[n])
            //print(n, ": ", x,y)
        }

    }

    destroy(){
        DEBUG('fullscreen.destroy()')

    }

    close(){
        DEBUG('fullscreen.close()')
        this.is_open = false;
        global.window_group.show();
        for (let n =0; n < this.items.length; n++) {
            this.FSMenu.remove_actor(this.items[n]);
            this.FSMenu.remove_actor(this.guidelines[n])
        }
        this.entry_box.set_text('')
        this.FSMenu.hide();
    }

    open(){
        DEBUG('fullscreen.open()')

        if (this.is_open) {
            this.FSMenu.grab_key_focus();
            this.FSMenu.raise_top();
            return;
        }
        this.is_open = true;
        //global.window_group.hide(); //makes screen fade
        this._drawSectors(SECTORS);
        this.FSMenu.show();
        this.entry_box.grab_key_focus();
        // this.actor.grab_mouse_focus()
        this.FSMenu.raise_top();
    }

    toggle(){
        if (this.is_open)
            this.close();
        else
            this.open();
    }

    _restart() {
        DEBUG('_restart()')
        if (Meta.is_wayland_compositor()) {
            //this._showError(_("Restart is not available on Wayland"));
            return;
        }
        //this._shouldFadeOut = false;
        this.close();
        Meta.restart(_("Restarting…"));
    }
}
