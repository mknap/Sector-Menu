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
const Config = imports.misc.config;

const PACKAGE_NAME = Config.PACKAGE_NAME;
const PACKAGE_VERSION = Config.PACKAGE_VERSION;

const Clutter = imports.gi.Clutter;
const Meta = imports.gi.Meta;
const St = imports.gi.St;
const Gdk = imports.gi.Gdk;
// const Signals = imports.signals;

// const AppFavorites = imports.ui.appFavorites;
const AppDisplay = imports.ui.appDisplay;
//const Layout = imports.ui.layout;
const Main = imports.ui.main;

const ShellEntry = imports.ui.shellEntry;
const Tweener = imports.ui.tweener;

const ExtensionUtils = imports.misc.extensionUtils;
const Util = imports.misc.util;

const Me = ExtensionUtils.getCurrentExtension()
const Convenience = Me.imports.convenience;
const Lib = Me.imports.lib;
const SectorMenu = Me.imports.sectormenu;

const DEBUG=Lib.DEBUG;

var Fullscreen = class Fullscreen {
<<<<<<< HEAD
	
	// #region mains
	constructor() {
		this.debug=true;
		DEBUG(`fullscreen.constructor()...`)
		this.SectorMenu=null;
		this.is_open = false;
		this.monitor = Main.layoutManager.currentMonitor;
		this.settings = Convenience.getSettings();
		// TODO might want to use these down the road
		// let fx1 = new Clutter.DesaturateEffect;
		// let fx2 = new Clutter.BlurEffect;
		// this.FSMenu.add_effect(fx2);
		let color1=new Clutter.Color().init(255,255,255,255); //white
		let color2=new Clutter.Color().init(0,0,0,0); //black
		let p = new Clutter.Point().init(.5,.5) // pt 
		

		// TODO: Ways to get a container to draw in.  Make a setting for this?
		if(false){ // * stage works ok but doesn't seem to do mouse-wheel events, and text color is off
			/** initBackground from coverflow platform.js */
		
			let Background = imports.ui.background;

			this._backgroundGroup = new Meta.BackgroundGroup();
			Main.layoutManager.uiGroup.add_child(this._backgroundGroup);
			this._backgroundGroup.lower_bottom();
			this._backgroundGroup.hide();
			for (let i = 0; i < Main.layoutManager.monitors.length; i++) {
				new Background.BackgroundManager({
					container: this._backgroundGroup,
					monitorIndex: i,
					vignette: true
				});
			}			
			this.FSMenu = this._backgroundGroup;
			
		} else if (false) { // * backgroundui this would make our screen a clutter stage (not exactly what we want)
			// Main screen Widget
			this.FSMenu = new Clutter.Stage({
				//  style_class: 'sectormenu-fullscreen',
					name: 'FSMenu-stage',
				//  fullscreen: true,
					color: TRANS,
					visible: true,
					reactive: true,
					use_alpha: true,
					//accept_focus: true,
					//perspective: 

				}); //does work, lots of tweak to do
				//this.FSMenu.activeate();
				//this.FSMenu.set_fullscreen(true);
		} else if (false) {   // * ST Widget this is the approach I've had the best results
			this.FSMenu = new St.Widget({
				name: 'FSMenu',
				visible: true,
				reactive: true,
				style_class: 'sectormenu-fullscreen',
				//gravity: Clutter.Gravity.CENTER,
				//vignette: true,
		});
		
		} else if (true) {    // ** clutter actor  (why didn't I use this before?)
			this.FSMenu = new Clutter.Actor({
				name: 'FSMenu (clutter)',
				width: 1920,
				height: 1080,
				visible: true,
				reactive: true,
				background_color: new Clutter.Color().init(0,0,0,128)
			})
		}
		this.FSMenu.set_size(this.monitor.width, this.monitor.height);

		this.FSMenu.connect(
			'key-release-event',
			this._onKeyReleaseEvent.bind(this)
		);
		this.FSMenu.connect(
			'key-press-event',
			this._onKeyPressEvent.bind(this)
		);
		this.FSMenu.connect(
			'scroll-event',
			this._onScrollEvent.bind(this)
		);
		this.FSMenu.connect(
			'motion-event',
			this._updatePointerText.bind(this)
		);
		
		// Make our SectorMenu actor 
		this.SectorMenu = new SectorMenu.SectorMenu(this);
		this.FSMenu.add_actor(this.SectorMenu.SMactor);

		// #region info
		let info = new Clutter.Text({
			visible: true,
			reactive: false,
			color: color1,
			background_color: color2,
		})
		info.set_text(
			Me.metadata['name'] +
			' Version ' +
			Me.metadata['version'] +
			'\n' + PACKAGE_NAME +
			' Version ' + PACKAGE_VERSION
		);
		this.FSMenu.add_actor(info);
		// #endregion info

		// #region bash entry box
		this.entry_box = new St.Entry({
			style_class: 'entry-box',
			hint_text: 'Type a command to run.  Esc to quit',
			track_hover: true,
			can_focus: true,
			x: .05*this.monitor.width,
			y: .1*this.monitor.height,
			width: this.monitor.width / 4,
		});
		ShellEntry.addContextMenu(this.entry_box)  ; 
		this.entry_text = this.entry_box.clutter_text;
		this.entry_text.connect(
			'activate',
			this._entryRun.bind(this)
		);
		this.entry_text.connect(
			'key-press-event',
			this._entryKeyPressEvent.bind(this)
		);
		this.entry_box.connect(
			'enter-event',
			() => {this.entry_box.grab_key_focus();
				this.SectorMenu.quickFunction = function(){displayName='entry'}
			}
		)
		//this.entry_box.set_offscreen_redirect(Clutter.OffscreenRedirect.ALWAYS); 
		
		//TODO : What does this do?
		this.FSMenu.add_actor(this.entry_box)
		// #endregion bssh	
		
		// #region history
		// TODO: Read imports.misc.history.HistoryManager`.
		let hist = new Clutter.Text({
			name : 'hist',
			//style_class: 'STLabel-history',
			color:color1,
			x: 100,
			y: 150,
			width: this.monitor.width /4,
			height: this.monitor.height /2,
			text:'bash history (coming soon)',
			
		})
		this.FSMenu.add_actor(hist) 
		// #endregion history

		// #region notes
		this.notes = new Clutter.Text({
			name: 'notesClutter',
			editable: true,
			selectable: true,
			cursor_visible: true,
			color: color1,
			text: this.settings.get_string('notes'),
			x: Math.round(this.monitor.width * .75),
			y: .1*this.monitor.height,
			height: 500,
			width: this.monitor.width / 4,
			reactive: true,
			//border_color: white,
		})
			
		//ShellEntry.addContextMenu(this.notes);
		this.FSMenu.add_actor(this.notes)
		this.notes.connect(
			'enter-event',
			() => {
				this.notes.raise_top();
				this.notes.grab_key_focus()
				this.SectorMenu.quickFunction=function(){}
				this.SectorMenu.quickFunction.displayName='Take notes;';
			}
		)
		this.notes.connect(
			'key-press-event',
			() => {
				DEBUG('notes key-press-event')
				// return Clutter.EVENT_STOP;
			}
		)
		// #endregion notes
		
		// #region quick
		this.qFcnText= new Clutter.Text({
			visible : true,
			pivot_point: p,
			x: this.monitor.width/2,
			y: .1 * this.monitor.height, 
			//y: this.monitor.height-15,
			color: color1,
			//background_color: color2,
		});
		// ! See why this isn't translating
		this.qFcnText.set_translation(Math.round(-this.qFcnText.width/2),0,0);
		this.FSMenu.add_actor(this.qFcnText);
		this.qFcnText.set_text(this.SectorMenu.quickFunction.toString());
		
		// #endregion quick
		
		// #region pointerText
		this.pointerText = new Clutter.Text({
			visible:true,
			text: global.get_pointer().toString(),
			color: color1,
			background_color: color2.init(0,0,0,255),
			pivot_point: p.init(0,1),
			x: 0,
			y: this.monitor.height
		})
		this.pointerText.set_translation(0,-this.pointerText.height,0)
		this.FSMenu.add_actor(this.pointerText);

		// #endregion pointerText
		
		// Add the screen to the uiGroup
		this.FSMenu.hide();
		Main.layoutManager.addChrome(this.FSMenu);
		//Main.uiGroup.add_actor(this.FSMenu)
		
		//#region old
		//Get the stage for the FSMenu, and see if we can tweak a few things
		/* this.stage = this.FSMenu.get_stage();
		DEBUG(this.stage)
		let oldperspective=this.stage.get_perspective();
		DEBUG(oldperspective.aspect, oldperspective.fovy);
		DEBUG(oldperspective.z_far, oldperspective.z_near);
		
		this.perspective=new Clutter.Perspective({
			aspect: 16/9,
			fovy: 40,
			z_far:  450,
			z_near: 1,
		})
		this.stage.set_perspective(this.perspective);
		oldperspective = this.stage.get_perspective();
		DEBUG(oldperspective.aspect, oldperspective.fovy);
		DEBUG(oldperspective.z_far, oldperspective.z_near); */
		//#endregion old
		
		DEBUG('fullscreen.constructor DONE.')
	}
			
	destroy() {
		DEBUG('fullscreen.destroy()')
		this.SectorMenu.destroy();
		
		// thanks andyholmes !
		Main.layoutManager.removeChrome(this.FSMenu)
		this.FSMenu.destroy();
	}
	
	close() {
		DEBUG('fullscreen.close()')
		this.is_open = false;
		this.settings.set_string('notes',this.notes.get_text());
		this.FSMenu.hide();
		this.SectorMenu.close();
		this.entry_box.set_text('')
		
	}

	open() {
		DEBUG('fullscreen.open()')
		this.is_open = true;
		let [x, y] = global.get_pointer();
		this.cx = x;
		this.cy = y;
		this.FSMenu.show();
		this.FSMenu.raise_top();
		this.entry_box.grab_key_focus(); // ! might be an issue
		this.entry_box.raise_top();
		this.SectorMenu.show();
		this.notes.raise_top();
	}

	toggle() {
		if (this.is_open)
			this.close();
		else
			this.open();
	}

	// #endregion mains
	
	_updateQuick(){
		this.qFcnText.set_text(this.SectorMenu.quickFunction.toString())
	}

	_updatePointerText(){
		this.pointerText.set_text(global.get_pointer().toString());
	}

	_entryKeyPressEvent(actor, event) { 
		DEBUG('_entryKeyPressEvent(a,e)')
		let symbol = event.get_key_symbol();
		DEBUG('actor.name: ',actor.name)
		DEBUG('symbol :', symbol);
		if (symbol === Clutter.KEY_Escape) {
			if (actor.get_text()) {
				DEBUG('clearing bash entry_text')
				actor.set_text('');
				return Clutter.EVENT_STOP;
			} else {
				this.close();
			}
		} else if (symbol == Clutter.KEY_Tab){
			DEBUG('TAB key -> show main.overview')
			this.close();
			Main.overview.show();
		}
		//return Clutter.EVENT_PROPAGATE;
	}

	_entryRun(actor) { 

		DEBUG(`_entryRun().  ${actor}`);
		//this.popModal();
		let command = actor.get_text();
		DEBUG(command)

		//TODO: turn these into configurable settings
		if (command == 'r' | "R") {
			this._restart();
		} else if (command == 'w') {
			Util.trySpawnCommandLine('wakeup');
			// this.close();
		} else if (command == 'b') {
			Util.trySpawnCommandLine('bedtime');
			// this.close();
		} else if (command == 'p') {
			Util.spawn(["gnome-shell-extension-prefs", Me.metadata.uuid]);
			//Util.trySpawnCommandLine('gnome-shell-extension-prefs ${Me.metatdata["uuid"]}');
			// this.close();
		} else if (command == 'lg') {
				Main.createLookingGlass().open()
		} else if (command == 'z') {
			DEBUG('resetting SectorMenu');
			this.SectorMenu.destroy();
			this.SectorMenu = new SectorMenu.SectorMenu(this);
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

	_onScrollEvent(actor, event) {
		// DEBUG('_onScrollEvent()')
		let direction;
		switch (event.get_scroll_direction()) {
		case Clutter.ScrollDirection.UP:
			if (this._isHorizontal && this._settings.get_boolean('horizontal-workspace-switching')) {
				direction = Meta.MotionDirection.LEFT;
			} else {
				direction = Meta.MotionDirection.UP;
			}
		break;
		case Clutter.ScrollDirection.DOWN:
			if (this._isHorizontal && this._settings.get_boolean('horizontal-workspace-switching')) {
				direction = Meta.MotionDirection.RIGHT;
			} else {
				direction = Meta.MotionDirection.DOWN;
			}
		break;
		case Clutter.ScrollDirection.LEFT:
			if (this._isHorizontal && this._settings.get_boolean('horizontal-workspace-switching')) {
				direction = Meta.MotionDirection.LEFT;
			}
		break;
		case Clutter.ScrollDirection.RIGHT:
			if (this._isHorizontal && this._settings.get_boolean('horizontal-workspace-switching')) {
				direction = Meta.MotionDirection.RIGHT;
			}
		break;
		}
		//TODO: add this setting to schema and prefs
		//if (this.settings.get_boolean('scroll-workspace')){
		if (true && direction ) {
			let activeWS = global.workspace_manager.get_active_workspace();
			let ws=activeWS.get_neighbor(direction)
			Main.wm.actionMoveWorkspace(ws)
		}
	}

	_onKeyReleaseEvent(actor, event) {
		DEBUG('fullscreen._onKeyReleaseEvent()')
		let symbol = event.get_key_symbol();
		DEBUG(actor, event);
		DEBUG('got symbol: ',symbol);
		DEBUG('		this.cx and this.cy : ')
		DEBUG(this.cx, this.cy)
		let [x, y, mask] = global.get_pointer();
		DEBUG('		x and y :')
		DEBUG(x, y);
		if (symbol == 65515 && this.settings.get_boolean('quick-mode')) {
			if (x != this.cx || y != this.cy){
				DEBUG(' ***quick-mode-command')
				// Here we act upon pointer location, current actor, etc
				//this.emit('clicked')
				// We can't do the click emulation, per
				// https://stackoverflow.com/questions/34947627/how-to-create-clutter-events-with-gjs
				
				//So a new idea here is to modify the release event to something the actor can handle
				
				//newevent=new Clutter.Event(Clutter.EventType.BUTTON_PRESS)
				
				event.set_key_symbol(Clutter.KEY_Pointer_Button1);
				DEBUG('set new symbol: ',event.get_key_symbol()) 
							
				//return event ;

				
				try {
					this.SectorMenu.quickFunction() 
				} catch (e) {
					throw(e);
				}
				this.close();
			}
		}
		//return Clutter.EVENT_PROPAGATE;
		DEBUG('fullscreen._onKeyReleaseEvent()  DONE.')
	}

	_onKeyPressEvent(actor, event) {
		DEBUG('fullscreen._onKeyPressEvent()')
		let symbol = event.get_key_symbol();
		DEBUG(actor)
		DEBUG(actor.name)
		DEBUG(symbol);
		if (symbol === Clutter.KEY_Escape) {
			if (this.entry_box.get_text()) {    
				DEBUG('clearing text in ', actor.name);
				this.entry_box.set_text('');
				return Clutter.EVENT_STOP;
			} else {
				this.close();
			}
		} else if (symbol == Clutter.KEY_Tab){
			//this.close();
			//Main.overview.show();
			//return Clutter.EVENT_PROPOGATE;
		} else {
			//this.entry_box.grab_key_focus();
			//return Clutter.EVENT_PROPAGATE;
		}
	}
=======

        constructor(settings) {
            DEBUG(`fullscreen.constructor()...`)

            this.is_open = false;
            this.monitor = Main.layoutManager.currentMonitor;
            this.favs = AppFavorites.getAppFavorites().getFavorites();
            this.settings = Convenience.getSettings();
            // const module = require('module');this.iconSize = this.settings.get_int('icon-size')
            this.guidelines = [];
            this.items = [];
            this.tips = [];
            /** initBackground from coverflow platform.js */
            /*
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
                        vignette: true
                    });
                }
            }
            this.FSMenu = this._backgroundGroup;
*/

            // Main screen Widget
            this.FSMenu = new St.Widget({
                name: 'FSMenu',
                visible: true,
                reactive: true,
                style_class: 'sectormenu-fullscreen',
                //gravity: Clutter.Gravity.CENTER,
                //vignette: true,
            });
            this.FSMenu.set_size(this.monitor.width, this.monitor.height);
            this.FSMenu.connect(
                'key-release-event',
                this._onKeyReleaseEvent.bind(this)
            );
            this.FSMenu.connect(
                'key-press-event',
                this._onKeyPressEvent.bind(this)
            );
            this.FSMenu.connect(
                'scroll-event',
                this._onScrollEvent.bind(this)
            );

            //bash entry box
            this.entry_box = new St.Entry({
                style_class: 'entry-box',
                hint_text: 'Type a command to run. Tab to overview. Esc to quit',
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
            //this.entry_box.set_offscreen_redirect(Clutter.OffscreenRedirect.ALWAYS); //TODO : What does this do?
            this.FSMenu.add_actor(this.entry_box)

            //bash history
            // TODO: Read imports.misc.history.HistoryManager`.
            let hist = new St.Label({
                style_class: 'STLabel-history',
                x: 100,
                y: 150,
                width: this.monitor.width /4,
                height: this.monitor.height /2,
                text:'bash history (coming soon)',

            })
            this.FSMenu.add_actor(hist)

            /*
TODO: Add a todo,notes,snippets
            let notes = new St.Entry({
                style_class: 'STscrollview',
                text: 'Notes, TODO, snips can go here.',
                x: Math.round(this.monitor.width *.6),
                y:100,
                height: 500,
                width: this.monitor.width /2,

            })
            this.FSMenu.add_actor(notes)

*/

            // info
            let info = new St.Label({
                visible: true,
                reactive: false,
                style_class: 'info',
            })
            info.set_text(
                Me.metadata['name'] +
                ' Version ' +
                Me.metadata['version'] +
                '\n' + PACKAGE_NAME +
                ' Version ' + PACKAGE_VERSION
            );
            this.FSMenu.add_actor(info)

            // Add the screen
            Main.layoutManager.addChrome(this.FSMenu);
            DEBUG('fullscreen.constructor DONE.')
        }

        destroy() {
            DEBUG('fullscreen.destroy()')
            this.FSMenu.destroy();

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
                    this.FSMenu.remove_actor(this.texture[n]);
                }

                if (this.settings.get_boolean('draw-guides')) {
                    this.FSMenu.remove_actor(this.guidelines[n])
                    //DEBUG(`${n} of ${N}`)
                }
                this.FSMenu.remove_actor(this.texture[n]);
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
            //this._drawApps(this.settings.get_int('sectors'))
            this.FSMenu.show();
            this.FSMenu.grab_key_focus();

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
            let iconSize = this.settings.get_int('icon-size');
            let app=[];
            let x,y,x0,y0
            let [dx, dy] = [iconSize, iconSize];

            if (this.settings.get_boolean('draw-at-mouse'))
                [x0, y0] = global.get_pointer();
            else [x0,y0] = [X/2, Y/2]

            //fav apps
            for (let n = 0; n < N; n++) {
                //positioning
                x = (R * Math.cos(n * 2 * Math.PI / (N)) + x0);
                y = (R * Math.sin(n * 2 * Math.PI / (N)) + y0);

                app[n] = this.favs[n];
                if (app[n] != null) {
                    this.items[n] = new St.Button({
                        style_class: 'panel-button',
                        label: app[n].get_name(),
                        reactive: true,
                        visible: true,
                        opacity: 255,
                        x_fill: true,
                        y_fill: true,
                        height: iconSize,
                        width: iconSize,
                        // x: x - dx/2,
                        // y: y - dy/2,
                        x: x,
                        y: y,
                        anchor_gravity: Clutter.Gravity.CENTER,
                    });
                    let gicon = app[n].app_info.get_icon();
                    let icon = new St.Icon({
                        gicon: gicon,
                        style_class: 'launcher-icon',
                        //reactive: true,
                        icon_size: 512,
                        visible: true,
                        opacity: 255,
                        // x:x-dx/2,
                        // y:y-dx/2,
                        //track_hover: true,
                    });
                    this.items[n].set_child(icon);
                    this.items[n]._delegate = this;
                    this.items[n].connect(
                        'notify::hover',
                        this._onHoverChanged.bind(this));
                    this.items[n].connect(
                            'clicked',
                            ()=>{
                                app[n].open_new_window(-1);
                                this.toggle();
                            });
                    this.FSMenu.add_actor(this.items[n])

                    // tooltips
                    let text = app[n].get_name();
                    if (app[n].get_description()) {
                        text += '\n' + app[n].get_description();
                    }
                    this.tips[n] = new St.Label({
                        style_class: 'panel-launcher-label',
                        opacity: 0,
                        x: x0,
                        y: y0
                    });
                    this.tips[n].set_text(text);
                    //this.tips[n].hide();
                    this.items[n].tip = this.tips[n];
                    let [tx, ty] = this.tips[n].get_size();
                    //FIXME: some kind of offset bug here
                    // this.tips[n].set_position(x - (tx / 2), y + dy / 2 + 5)
                    this.tips[n].set_position(x, y + dy / 2 )
                    this.FSMenu.add_actor(this.tips[n])
                    }
                }

           //sector panels:
            this.texture=[];
            let tweenParams;
            let p = new Clutter.Point({
                    x: 0.0,
                    y: 1.0,
                });

            for (let n = 0; n < N; n++) {
                //sector panels are clutter textures:
                this.texture[n] = new Clutter.Texture({
                    filename: Me.path+ "/ui/sector-gradient-512.svg",
                    // border_color: RED,
                    reactive: true,
                    opacity: 0,
                    width: .5*R,
                    height: .5*R,
                    // pivot_point: p,
                    rotation_angle_x: 0,
                    rotation_angle_y: 0,
                    // rotation_angle_z: 360/N + 3* 180/N,
                    rotation_angle_z: 0,
                    //anchor_gravity: Clutter.Gravity.CENTER,
                    x: x0,
                    y: y0,
                    // transition:  'easeOutCubic',
                });
                this.FSMenu.add_actor(this.texture[n])
                this.texture[n].lower_bottom();
                //  this.texture[n].delegate=this;
                this.texture[n].connect(
                    'enter-event',
                    this._onMouseEnter.bind(this)
                );
                this.texture[n].connect(
                    'leave-event',
                    this._onMouseLeave.bind(this)
                );
                tweenParams = {
                    time: 1  ,
                    transition: 'easeOutExpo',
                    opacity: 128,
                    width: 3*R,
                    height: 3*R,
                    // pivot_point: p,
                    rotation_angle_x: 0,
                    rotation_angle_y: 0,
                    rotation_angle_z: n*360/N +  180/N,
                    // rotation_angle_z: 90,
                }
                Tweener.addTween(this.texture[n],tweenParams);

                //guidelines :
                if (this.settings.get_boolean('draw-guides')) {
                    this.guidelines[n] = new Clutter.Actor({
                        //"style": "guidelines",   //FIXME: can we do a clutter style?
                        background_color: RED,
                        width: 3*R,
                        height: 1,
                        x: x0,
                        y: y0,
                        //rotation_angle_z: n * 360 / N + .5 * 350 / N,
                        //transition: 'easeOutCubic',
                    });
                    Tweener.addTween(this.guidelines[n],{
                        time: 1,
                        rotation_angle_z: n * 360 / N + .5 * 360 / N,
                    })
                    this.FSMenu.add_actor(this.guidelines[n])
                }
            }
        }

        /** @_drawApps
        Draws N sectors
        TODO
        @param N the number of sectors to calculate and drawing
        */
        _drawApps(N){

        }

        _entryKeyPressEvent(actor, event) { //TODO: why is this params (a,e)?

            let symbol = event.get_key_symbol();
            DEBUG(actor.name)
            DEBUG(symbol);
            if (symbol === Clutter.KEY_Escape) {
                if (actor.get_text()) {
                    actor.set_text('');
                    return Clutter.EVENT_STOP;
                } else {
                    this.close();
                }
            } else if (symbol == Clutter.KEY_Tab){
                this.close();
                Main.overview.toggle();
            }
            //return Clutter.EVENT_PROPAGATE;
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
            } else if (command == 'p') {
                Util.trySpawnCommandLine('gnome-extensions prefs ${Me.metatdata["path"]}');
                // this.close();
            } else if (command == 'lg') {
                 Main.createLookingGlass().open()
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

        _onScrollEvent(actor, event) {
            // DEBUG('_onScrollEvent()')
            this.emit('scroll-event', event);
            return Clutter.EVENT_PROPAGATE;
        }

        _onKeyReleaseEvent(actor, event) {
            // DEBUG('_onKeyReleaseEvent()')
            let symbol = event.get_key_symbol();
            // DEBUG(actor);
            // DEBUG(symbol);
            // if (symbol === Clutter.Key_Super) {
            //     this.close();
            // }
            // return Clutter.EVENT_PROPAGATE;
        }

        _onKeyPressEvent(actor, event) {
            // DEBUG('_onKeyPressEvent()')
            let symbol = event.get_key_symbol();
            // DEBUG(actor.name)
            // DEBUG(symbol);
            if (symbol === Clutter.KEY_Escape) {
                if (this.entry_box.get_text()) {    //fixme: check for focus instead?
                    this.entry_box.set_text('');
                    return Clutter.EVENT_STOP;
                } else {
                    this.close();
                }
            } else if (symbol == Clutter.KEY_Tab){
                this.close();
                Main.overview.toggle();
            } else {
                this.entry_box.grab_key_focus();
                return Clutter.EVENT_PROPAGATE;
            }
        }

        _onHoverChanged(actor) {
            // DEBUG(`_onHoverChanged( ${actor} )`)
            // DEBUG(actor.anchor_x)
            // DEBUG(actor.anchor_y)
            let iconSize = this.settings.get_int('icon-size');
            Tweener.addTween(actor, {
                gravity: Clutter.Gravity.CENTER,
                opacity: actor.hover ? 255 : 225,
                height: actor.hover ? iconSize*1.5 : iconSize,
                width: actor.hover ? iconSize*1.5 : iconSize,
                time: .1,
                transition: 'easeOutExpo',
            })
            actor.tip.opacity = actor.hover ? 255 : 0;
            actor.raise_top();
            actor.tip.raise_top();
            return Clutter.EVENT_PROPOGATE;
        }

        /*
    _onPanelHoverChanged(cactor) {
            DEBUG('_onPanelHoverChanged()')

            Tweener.addTween(cactor,{
                time: 1,
                transition: 'easeOutBounce',
                x:0,
                y:0,
                opacity: 255,
            })
            cactor.raise_top();
        }
*/

        _onMouseEnter(cactor) {
            // DEBUG('_onMouseMove()')

            Tweener.addTween(cactor,{
                time : .1,
                transition: 'easeOutExpo',
                scale_x : 1.5,
                scale_y : 1.5,
                opacity: 255,
            })
            cactor.lower_bottom();
        }

        _onMouseLeave(cactor) {
            // DEBUG('_onMouseLeave()')

            Tweener.addTween(cactor,{
                time: 1,
                scale_x: 1,
                scale_y: 1,
                transition: 'easeOutBounce',
                opacity: 84,
            })
            cactor.lower_bottom();
        }
>>>>>>> master
}
// * I am gathering that this adds methods to handle signals like emit() ?
// Signals.addSignalMethods(Fullscreen.prototype)
