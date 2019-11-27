/* fullscreen.js
 Based upon fullscreen.js from gnome-shell/extensions/timepp@zagortenay333

 I am commenting all that I don't need (until I need them) to help me leann the neccessary parts of displaying a fullscreen window.

*/

const Clutter   = imports.gi.Clutter;
// const Gtk       = imports.gi.Gtk;
const Meta      = imports.gi.Meta;
const St        = imports.gi.St;
// const Pango     = imports.gi.Pango;
const Layout    = imports.ui.layout;
const Main      = imports.ui.main;
// const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils =imports.misc.extensionUtils;
//const Signals   = imports.signals;

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
const X=1920;
const Y=1080



var Fullscreen = class Fullscreen{

    constructor(){
        DEBUG(`fullscreen.constructor()...`)
        this.is_open = false;

        let monitor = Main.layoutManager.currentMonitor;
        DEBUG(monitor.width)

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

        /** container for widgets from coverflow switcher.js */
        {
            this.FSMenu = new St.Widget({
                visible: true,
                reactive: true,
                style_class: 'sectormenu-fullscreen'
            });
            this.FSMenu.set_position(monitor.x, monitor.y);
            this.FSMenu.set_size(monitor.width, monitor.height);
            // this.content_box = new St.BoxLayout({
            //     vertical: true,
            //     x_expand: true,
            //     y_expand: true,
            //     style_class: 'content'
            // });
            // this.content_box.set_position(100,100);
            // this.content_box.set_size(100,100)
            // this.actor.add_actor(this.content_box);
            //
            // // Create a new actor
            // let actorRectangle = new Clutter.Actor();
            // // Make it like a rectangle
            // actorRectangle.set_size(100, 100);
            // actorRectangle.set_position(500, 100);
            // /*
            //  * Colors are made in RGBA http://en.wikipedia.org/wiki/RGBA_color_space
            //  * Basically, Red, Green, Blue, Alpha (transparency). Each is a value between 0 and 255
            //  */
            // actorRectangle.set_background_color(new Clutter.Color({
            //     red : 100,
            //     blue : 100,
            //     green : 100,
            //     alpha : 255
            // }));
            // this.content_box.add_actor(actorRectangle);
            //
            /// entry box
            this.entry_box = new St.Entry({
                style_class: 'entry-box',
                hint_text: 'Run command',
                track_hover: true,
                can_focus: true,
            })
            // this.content_box.add_actor(this.entry_box)
            // //this.entrybox.set_offscreen_redirect(Clutter.OffscreenRedirect.ALWAYS);
            //
            // // switched to FSMenu, so
            // this.FSMenu=this.actor

        }

        /** drawing guides with Clutter? */
        {
            // let RED   = new Clutter.Color( {'red':255, 'blue':0, 'green':0, 'alpha':255} );
            // for (let n=0; n< 6; n++){
            //     let guideline = new Clutter.Actor ({
            //         "background_color": RED,
            //         "width":300,
            //         "height":1,
            //         "x":1920/2,
            //         "y":1080/2,
            //         "rotation-angle-z" : n*60 + 30
            //     })
            //     this.content_box.add_actor(guideline);
            // }
        }


        /** Working on another approach */
        {
            // this.FSMenu = new Clutter.Stage();
            // DEBUG(this.FSMenu);
            // //this.FSMenu.set_use_fullscreen(true);
            // this.FSMenu.set_use_alpha(true);
            // this.FSMenu.set_background_color(new Clutter.Color({
            //     'red':150,
            //     'blue':0,
            //     'green':0,
            //     'alpha':10
            // }))
        }

        this._drawSectors(6);
        Main.layoutManager.uiGroup.add_actor(this.FSMenu);
        DEBUG('fullscreen.constructor DONE.')
    }

    /** @_drawSectors
    Draws N sectors

    @param N : the number of sectors to calculate and drawing
    */
    _drawSectors(N){
        for (let n = 0; n < N ; n++)
        {
            let x = (100*Math.cos(n*2*Math.PI/(N)) + X/2); //FIXME no hard code sizes
            let y = (100*Math.sin(n*2*Math.PI/(N)) + Y/2);
            //print(n, ": ", x,y)

            let menuItem = new Clutter.Text( {"text": "Item " + n.toString(),"color":WHITE } );
            let [dx,dy]=menuItem.get_size();
            //print (dx,dy)
            menuItem.set_position(x-dx/2,y-dy/2)
            menuItem.set_reactive(true)
            // menuItem.connect('button-press-event',
            //     Lang.bind(this, function(actor, event){
            //         this.stage.destroy();
            //     }
            //     )
            // );
            this.FSMenu.add_actor(menuItem)
        }
        // Draw guide lines between the menu menuitems
        for (let n =0; n <N; n++){
            //let x = (100*Math.cos(n*2*Math.PI/SECTORS + Math.PI/SECTORS) + SIZE_X/2);
            //let y = (100*Math.sin(n*2*Math.PI/(SECTORS) +Math.PI/SECTORS) + SIZE_Y/2);

            let guideline = new Clutter.Actor ({
                "background_color":RED,
                "width":300,
                "height":1,
                "x":X/2,
                "y":Y/2,
                "rotation-angle-z": n*360/N +.5*350/N
            });
            //print(guideline.get_pivot_point());
            //guideline.set_rotation_angle(2, ( ( Math.PI ) / SECTORS) );
            this.FSMenu.add_actor(guideline)
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
}
