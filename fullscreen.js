/* fullscreen.js
 Based upon fullscreen.js from gnome-shell/extensions/timepp@zagortenay333

 I am commenting all that I don't need (until I need them) to help me leann the neccessary parts of displaying a fullscreen window.

*/

const Clutter = imports.gi.Clutter;
// const Gtk       = imports.gi.Gtk;
const Meta = imports.gi.Meta;
const St = imports.gi.St;
// const Pango     = imports.gi.Pango;

const Signals = imports.signals;

const AppFavorites = imports.ui.appFavorites;
const AppDisplay = imports.ui.appDisplay;
const Layout = imports.ui.layout;
const Main = imports.ui.main;
// const PopupMenu = imports.ui.popupMenu;
const ShellEntry = imports.ui.shellEntry;
const Tweener =imports.ui.tweener;

const ExtensionUtils = imports.misc.extensionUtils;
//const Signals   = imports.signals;
const Util = imports.misc.util;

//const ME = imports.misc.extensionUtils.getCurrentExtension();
const Me = ExtensionUtils.getCurrentExtension()
const Convenience = Me.imports.convenience;
const DEBUG = Convenience.DEBUG;

/** Some constants for clutter colors: */

const WHITE = new Clutter.Color({
    'red': 255,
    'blue': 255,
    'green': 255,
    'alpha': 255
});
const BLACK = new Clutter.Color({
    'red': 0,
    'blue': 0,
    'green': 0,
    'alpha': 255
});
const RED = new Clutter.Color({
    'red': 255,
    'blue': 0,
    'green': 0,
    'alpha': 255
});
const TRANS = new Clutter.Color({
    'red': 255,
    'blue': 255,
    'green': 255,
    'alpha': 0
});
const SEMITRANS = new Clutter.Color({
    'red': 0,
    'blue': 0,
    'green': 0,
    'alpha': 200
});
const GRAY = new Clutter.Color({
    'red': 127,
    'blue': 127,
    'green': 127,
    'alpha': 127
});

const SECTORS = 7;
const R = 220;
const X = 1920;
const Y = 1080;



var Fullscreen = class Fullscreen {

    constructor() {
        DEBUG(`fullscreen.constructor()...`)
        this.is_open = false;
        this.draw_at_mouse = true;
        this.draw_guides = true;

        this.monitor = Main.layoutManager.currentMonitor;
        this.favs = AppFavorites.getAppFavorites().getFavorites();

        this.guidelines = [];
        this.items = [];
        this.tips = [];
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
            x: 100,
            y: 100,
            width: this.monitor.width / 4,
        })
        //ShellEntry.addContextMenu(this.entry_box)     //TODO: what does this do
        this.entry_text = this.entry_box.clutter_text;
        this.entry_text.connect(
            'activate',
            this._entryRun.bind(this)
        )
        this.entry_text.connect(
            'key-press-event',
            this._entryKeyPressEvent.bind(this)
        );
        this.entry_box.set_offscreen_redirect(Clutter.OffscreenRedirect.ALWAYS); //TODO : What does this do?
        this.FSMenu.add_actor(this.entry_box)

        //Main.layoutManager.uiGroup.add_actor(this.FSMenu);
        this.FSMenu.connect(
            'scroll-event',
            this._onScrollEvent.bind(this)
        )

        Main.layoutManager.addChrome(this.FSMenu);
        DEBUG('fullscreen.constructor DONE.')
    }

    _onScrollEvent(actor, event) {
        this.emit('scroll-event', event);
        return Clutter.EVENT_PROPAGATE;
    }

    _entryKeyPressEvent(actor, event) { //TODO: why is this params (a,e)?
        let symbol = event.get_key_symbol();
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

    _entryRun(actor) { //TODO: and this params just (a)?

        DEBUG(`_entryRun().  ${actor}`);
        //this.popModal();
        let command = actor.get_text();
        DEBUG(command)

        if (command == 'r') {
            this._restart();
        } else {
            Util.trySpawnCommandLine(command);
            this.close();
        }
    }

    /** @_drawSectors
    Draws N sectors
    @param N the number of sectors to calculate and drawing
    */
    _drawSectors(N) {

        if (this.draw_at_mouse) {
            var [x0, y0, mask] = global.get_pointer();
        } else {
            var [x0, y0] = [X / 2, Y / 2];
        }
        for (let n = 0; n < N; n++) {
            let x = (R * Math.cos(n * 2 * Math.PI / (N)) + x0); //FIXME no hard code sizes
            let y = (R * Math.sin(n * 2 * Math.PI / (N)) + y0);

            //Labels; were my first attempt:
            { // this.items[n] = new Clutter.Text({
                //     "text": "Item " + n.toString(),
                //     "color":WHITE
                // });
            }
            //from Panel_favorites extension.js@31
            {
                let app = this.favs[n];
                this.items[n] = new St.Button({
                    style_class: 'panel-button',
                    reactive: true,
                    visible: true,
                    opacity: 255,
                });
                let gicon = app.app_info.get_icon();
                let icon = new St.Icon({
                    gicon: gicon,
                    style_class: 'launcher-icon',
                    visible: true,
                    opacity: 255,
                });
                this.items[n].set_child(icon);
                this.items[n]._delegate = this;

                let text = app.get_name();
                if (app.get_description()) {
                    text += '\n' + app.get_description();
                }

                this.tips[n] = new St.Label({
                    style_class: 'panel-launcher-label',
                    opacity: 0,
                });
                this.tips[n].set_text(text);
                //this.tips[n].hide();
                this.items[n].tip = this.tips[n];

                //this._app = app;
                //this._menu = null;
                //this._menuManager = new PopupMenu.PopupMenuManager(this.actor);

                this.items[n].connect('clicked', () => {
                    app.open_new_window(-1);
                    if (Main.overview.visible) {
                        Main.overview.hide();
                    }
                    this.toggle();
                });
                this.items[n].connect(
                    'notify::hover',
                    this._onHoverChanged.bind(this));
            }
            // this.items[n].connect('button-press-event',
            //         this._onButtonPress.bind(this));

            let [dx,dy] = [128,128];
            DEBUG(`dx: ${dx}, dy:${dy}`)
            this.items[n].set_position(x - dx / 2, y - dy / 2)
            this.items[n].opacity = 175;
            // playing around with Tweener
            Tweener.addTween(this.items[n],
                         { opacity: 255,
                           time: .85,
                           transition: 'easeOutQuad',
                         });

            this.FSMenu.add_actor(this.items[n])
            let [tx,ty] = this.tips[n].get_size();
            DEBUG(`tx: ${tx}, ty:${ty}`)
            this.FSMenu.add_actor(this.tips[n])
            this.tips[n].set_position(x-(tx/2),y+dy/2 + 5)
            //guidelines :
            if (this.draw_guides) {
                this.guidelines[n] = new Clutter.Actor({
                    //"style": "guidelines",   //FIXME: can we do a clutter style?
                    "background_color": RED,
                    "width": 300,
                    "height": 1,
                    "x": x0,
                    "y": y0,
                    "rotation-angle-z": n * 360 / N + .5 * 350 / N
                });
                //print(guideline.get_pivot_point());
                //guideline.set_rotation_angle(2, ( ( Math.PI ) / SECTORS) );
                this.FSMenu.add_actor(this.guidelines[n])
            }
        }

    }

    destroy() {
        DEBUG('fullscreen.destroy()')

    }

    close() {
        DEBUG('fullscreen.close()')
        this.is_open = false;
        global.window_group.show();
        for (let n = 0; n < this.items.length; n++) {
            this.FSMenu.remove_actor(this.items[n]);
            this.FSMenu.remove_actor(this.tips[n]);

            if (this.draw_guides) {
                this.FSMenu.remove_actor(this.guidelines[n])
            }
            this.entry_box.set_text('')
            this.FSMenu.hide();
        }
    }
    open() {
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

    toggle() {
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

    _onHoverChanged(actor) {
        actor.opacity = actor.hover ? 255 : 175;
        actor.tip.opacity = actor.hover ? 255 : 0;
        actor.raise_top();
        actor.tip.raise_top();
    }
}


// TODO : I am gathering that this adds methods to handle signals like emit() ?
Signals.addSignalMethods(Fullscreen.prototype)
