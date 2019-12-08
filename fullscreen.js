/* fullscreen.js
 *
 * Copyright (c) Mike Knap 2019
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */


const Clutter = imports.gi.Clutter;
const Meta = imports.gi.Meta;
const St = imports.gi.St;
const Gdk = imports.gi.Gdk;
const Signals = imports.signals;

const AppFavorites = imports.ui.appFavorites;
const AppDisplay = imports.ui.appDisplay;
const Layout = imports.ui.layout;
const Main = imports.ui.main;

const ShellEntry = imports.ui.shellEntry;
const Tweener = imports.ui.tweener;

const ExtensionUtils = imports.misc.extensionUtils;
const Util = imports.misc.util;

const Me = ExtensionUtils.getCurrentExtension()
const Convenience = Me.imports.convenience;

const DEBUG = function(message) {
    // Enable for debugging purposes.
    //if(true) global.log(Date().substr(16,8) + Me.metadata.name + message);

    //TODO : make this more versatile with options, info, warn, etc.
    if (true) global.log("[" + Me.metadata.name + "] " + message);
}

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

var Fullscreen = class Fullscreen {

        constructor(settings) {
            DEBUG(`fullscreen.constructor()...`)
            this.is_open = false;
            this.monitor = Main.layoutManager.currentMonitor;
            this.favs = AppFavorites.getAppFavorites().getFavorites();
            this.settings = Convenience.getSettings();
            this.guidelines = [];
            this.items = [];
            this.tips = [];
            // /** initBackground from coverflow platform.js */
            // {
            //     let Background = imports.ui.background;
            //
            //     this._backgroundGroup = new Meta.BackgroundGroup();
            //     Main.layoutManager.uiGroup.add_child(this._backgroundGroup);
            //     this._backgroundGroup.lower_bottom();
            //     this._backgroundGroup.hide();
            //     for (let i = 0; i < Main.layoutManager.monitors.length; i++) {
            //         new Background.BackgroundManager({
            //             container: this._backgroundGroup,
            //             monitorIndex: i,
            //             vignette: true
            //         });
            //     }
            // }
            // this.FSMenu = this._backgroundGroup;

            this.FSMenu = new St.Widget({
                visible: true,
                reactive: true,
                style_class: 'sectormenu-fullscreen',
                //vignette: true,
            });
            this.FSMenu.set_size(this.monitor.width, this.monitor.height);

            this.FSMenu.connect(
                'key-release-event',
                this._onKeyReleaseEvent.bind(this)
            );
            this.FSMenu.connect(
                'scroll-event',
                this._onScrollEvent.bind(this)
            );

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

            let info = new St.Label({
                visible: true,
                reactive: false,
                style_class: 'info',
            })
            info.set_text(
                Me.metadata['name'] +
                ' Version ' +
                Me.metadata['version']
            );
            this.FSMenu.add_actor(info)

            this.FSMenu.connect(
                'scroll-event',
                this._onScrollEvent.bind(this)
            )

            //Main.layoutManager.uiGroup.add_actor(this.FSMenu);
            Main.layoutManager.addChrome(this.FSMenu);
            DEBUG('fullscreen.constructor DONE.')
        }

        destroy() {
            DEBUG('fullscreen.destroy()')
            //this.FSMenu.destroy();

        }

        close() {
            DEBUG('fullscreen.close()')
            this.is_open = false;
            global.window_group.show();
            let N = this.settings.get_int('sectors');
            for (let n = 0; n < N; n++) {
                if (this.items[n] != null) {
                    this.FSMenu.remove_actor(this.items[n]);
                    this.FSMenu.remove_actor(this.tips[n]);
                }

                if (this.settings.get_boolean('draw-guides')) {
                    this.FSMenu.remove_actor(this.guidelines[n])
                    //DEBUG(`${n} of ${N}`)
                }
                this.FSMenu.remove_actor(this.texture);
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
            this._drawSectors(this.settings.get_int('sectors'));
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

        /** @_drawSectors
        Draws N sectors
        @param N the number of sectors to calculate and drawing
        */
        _drawSectors(N) {
            DEBUG('fullscreen._drawSectors()');

            let R = this.settings.get_int('radius');
            let X = this.monitor.width;
            let Y = this.monitor.height;

            if (this.settings.get_boolean('draw-at-mouse')) {
                var [x0, y0, mask] = global.get_pointer();
            } else {
                var [x0,y0] = [X/2, Y/2]
            }


            for (let n = 0; n < N; n++) {
                //positioning
                let x = (R * Math.cos(n * 2 * Math.PI / (N)) + x0);
                let y = (R * Math.sin(n * 2 * Math.PI / (N)) + y0);


                let app = this.favs[n];
                if (app) {
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
                        //icon-size: this.settings.get_int('icon-size'),
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


                    let [dx, dy] = [128, 128];
                    // DEBUG(`dx: ${dx}, dy:${dy}`)
                    this.items[n].set_position(x - dx / 2, y - dy / 2)
                    this.items[n].opacity = 175;
                    // playing around with Tweener
                    Tweener.addTween(this.items[n], {
                        opacity: 255,
                        time: .85,
                        transition: 'easeOutQuad',
                    });


                    this.FSMenu.add_actor(this.items[n])
                    let [tx, ty] = this.tips[n].get_size();
                    // DEBUG(`tx: ${tx}, ty:${ty}`)
                    this.FSMenu.add_actor(this.tips[n])
                    this.tips[n].set_position(x - (tx / 2), y + dy / 2 + 5)
                }
                //guidelines :
                if (this.settings.get_boolean('draw-guides')) {
                    this.guidelines[n] = new Clutter.Actor({
                        //"style": "guidelines",   //FIXME: can we do a clutter style?
                        background_color: RED,
                        width: 3*R,
                        height: 1,
                        x: x0,
                        y: y0,
                        rotation_angle_z: n * 360 / N + .5 * 350 / N,
                        //transition: 'easeOutCubic',
                    });

                    this.FSMenu.add_actor(this.guidelines[n])
                }
            }
            let p = new Clutter.Point({
                x:0.5,
                y:0.5,
            });
            DEBUG(p);

            // DEBUG(M);

            this.texture = new Clutter.Texture({
                filename: Me.path+ "/ui/sector-gradient-512.svg",
                reactive: true,
                width: 3*R,
                height: 3*R,
                // pivot_point: p,
                rotation_angle_x: 0,
                rotation_angle_y: 0,
                // rotation_angle_z: 360/N + 3* 180/N,
                rotation_angle_z: 0,
                x: x0,
                y: y0-R,
                // transition:  'easeOutCubic',
            });
            let tweenParams = {
                time: 15    ,
                //transition: 'easeOutCubic',
                width: 3*R,
                height: 3*R,
                // pivot_point: p,
                rotation_angle_x: 45,
                rotation_angle_y: 45,
                // rotation_angle_z: 360/N + 3* 180/N,
                rotation_angle_z: 0,
                x: x0,
                y: y0-R,
            }
            this.FSMenu.add_actor(this.texture)
            this.texture.lower_bottom();
            Tweener.addTween(this.texture,tweenParams);

        }


        _onScrollEvent(actor, event) {
            DEBUG('_onScrollEvent()')
            this.emit('scroll-event', event);
            return Clutter.EVENT_PROPAGATE;
        }

        _onKeyReleaseEvent(actor, event) {
            DEBUG('_onKeyReleaseEvent()')
            let symbol = event.get_key_symbol();
            DEBUG(actor);
            DEBUG(symbol);
            // if (symbol === Clutter.Key_Super) {
            //     this.close();
            // }
            return Clutter.EVENT_PROPAGATE;
        }

        _entryKeyPressEvent(actor, event) { //TODO: why is this params (a,e)?
            let symbol = event.get_key_symbol();
            DEBUG(actor)
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

            //TODO: turn these into configurable settings
            if (command == 'r') {
                this._restart();
            } else if (command == 'w') {
                Util.trySpawnCommandLine('wakeup');
                // this.close();
            } else if (command == 'b') {
                Util.trySpawnCommandLine('bedtime');
                // this.close();
            } else if (command === 'p') {
                Util.trySpawnCommandLine('gnome-extensions prefs ${Me}');
                // this.close();
            } else {
                Util.trySpawnCommandLine(command);
                // this.close();
            }
            this.close();
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
            actor.opacity = actor.hover ? 255 : 200;
            actor.tip.opacity = actor.hover ? 255 : 0;
            actor.raise_top();
            actor.tip.raise_top();
        }
}

// TODO : I am gathering that this adds methods to handle signals like emit() ?
Signals.addSignalMethods(Fullscreen.prototype)
