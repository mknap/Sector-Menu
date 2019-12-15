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

const SectorMenu = Me.imports.sectormenu;

DEBUG = function (message, message2) {
	// Enable for debugging purposes.
	// TODO : make this more versatile with options, info, warn, etc. 
	if (!message2) message2 = ""
	else message2 = ", " + message2;
	if (true) global.log("[" + Me.metadata.name + "] " + message + message2);
}

// const WHITE = new Clutter.Color({
// 	'red': 255,
// 	'blue': 255,
// 	'green': 255,
// 	'alpha': 255
// 	});
// const BLACK = new Clutter.Color({
// 	'red': 0,
// 	'blue': 0,
// 	'green': 0,
// 	'alpha': 255
// 	});
// const RED = new Clutter.Color({
// 	'red': 255,
// 	'blue': 0,
// 	'green': 0,
// 	'alpha': 255
// 	});
// const TRANS = new Clutter.Color({
// 	'red': 255,
// 	'blue': 255,
// 	'green': 255,
// 	'alpha': 0
// 	});
// const SEMITRANS = new Clutter.Color({
// 	'red': 0,
// 	'blue': 0,
// 	'green': 0,
// 	'alpha': 200
// 	});
// const GRAY = new Clutter.Color({
// 	'red': 127,
// 	'blue': 127,
// 	'green': 127,
// 	'alpha': 127
// });

var Fullscreen = class Fullscreen {

	constructor() {
		DEBUG(`fullscreen.constructor()...`)

		this.is_open = false;
		this.monitor = Main.layoutManager.currentMonitor;
		this.favs = AppFavorites.getAppFavorites().getFavorites();
		this.settings = Convenience.getSettings();
		this.guidelines = [];
		this.items = [];
		this.tips = [];
		this.previews = [];
		
		// TODO: Ways to get a container to draw in.  Make a setting for this?
		if(false){ // * works ok but doesn't seem to do mouse-wheel events, and text color is off
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
		} else if (false) { // * this would make our screen a clutter stage (not exactly what we want)
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
		} else if (true) {   // * this is the approach I've had the best results
			this.FSMenu = new St.Widget({
				name: 'FSMenu',
				visible: true,
				reactive: true,
				style_class: 'sectormenu-fullscreen',
				//gravity: Clutter.Gravity.CENTER,
				//vignette: true,
			});
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
		// this.FSMenu.connect(
		// 	"button-press-event",
		// 	this._onButtonPressEvent.bind(this)
		// );
			
			
		//bash entry box
		this.entry_box = new St.Entry({
			style_class: 'entry-box',
			hint_text: 'Type a command to run. Tab to overview. Esc to quit',
			track_hover: true,
			can_focus: true,
			x: 100,
			y: 100,
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
			
					
		// TODO: Add a todo,notes,snippets
		let notes = new St.Entry({
			style_class: 'STscrollview',
			text: 'Notes, TODO, snips can go here.',
			x: Math.round(this.monitor.width *.6),
			y:100,
			height: 500,
			width: this.monitor.width /2,
			reactive: true,
			
		})
		this.FSMenu.add_actor(notes)
			
			
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
				
		// Make another widget just for our sectormenu
		
		//TODO 
		this.SectorMenu=new SectorMenu.SectorMenu();
		/* this.SectorMenu=new St.Widget({
			name: "SectorMenu",
			visible: true,
			reactive: true,
			style_class: 'sector-debug',

		}) */
		this.FSMenu.add_actor(this.SectorMenu.SMactor);
		
		// Add the screen to the uiGroup
		this.FSMenu.hide();
		Main.layoutManager.addChrome(this.FSMenu);
		//Main.uiGroup.add_actor(this.FSMenu)
		
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

		
		DEBUG('fullscreen.constructor DONE.')
	}
			
	destroy() {
		DEBUG('fullscreen.destroy()')
		this.SectorMenu.destroy();
		
		// thanks andyholmes
		Main.layoutManager.removeChrome(this.FSMenu)
		this.FSMenu.destroy();
	}
	
	close() {
		DEBUG('fullscreen.close()')
		this.is_open = false;
		global.window_group.show();
		//let N = this.settings.get_int('sectors');
		/* for (let n = 0; n < N; n++) {
			if (this.items[n] != null) {
				this.FSMenu.remove_actor(this.items[n]);
				this.FSMenu.remove_actor(this.tips[n]);
				this.FSMenu.remove_actor(this.texture[n]);
			}
			
			if (this.settings.get_boolean('draw-guides')) {
			this.FSMenu.remove_actor(this.guidelines[n])
			//DEBUG(`${n} of ${N}`)
		}
		//this.FSMenu.remove_actor(this.texture[n]);
		} */
		/* f */
		this.FSMenu.hide();
		this.SectorMenu.close();
		this.entry_box.set_text('')
	
	}

	open() {
		DEBUG('fullscreen.open()')
		/* if (this.is_open) {
			this.FSMenu.raise_top();
	
		} */
		this.is_open = true;
		//global.window_group.hide(); //makes screen fade
		// * this._drawSectors(this.settings.get_int('sectors'));
		//this._drawApps(this.settings.get_int('sectors'))
		this.FSMenu.show();
		this.FSMenu.raise_top();
		this.entry_box.grab_key_focus();
		this.entry_box.raise_top();
		
		this.SectorMenu.show();
		
	}

	toggle() {
		if (this.is_open)
			this.close();
		else
			this.open();
	}

	// TODO: move this code to separate file/class
	/** @_drawSectors
	Draws N sectors
	@param N the number of sectors to calculate and drawing
	*/
	_drawSectors(N) {
		DEBUG('fullscreen._drawSectors()');
		DEBUG(this.SectorMenu.x,this.SectorMenu.y)

		let R = this.settings.get_int('radius');
		let X = this.monitor.width;
		let Y = this.monitor.height;
		let iconSize = this.settings.get_int('icon-size');
		let app=[];
		let x,y,x0,y0,angle
		let [dx, dy] = [iconSize, iconSize];
		let p = new Clutter.Point({
			x:.5,
			y:.5,
		})
		DEBUG(p)
		DEBUG(p.x,p.y) 

		if (this.settings.get_boolean('draw-at-mouse'))
			[x0, y0] = global.get_pointer();
		else [x0,y0] = [X/2, Y/2]

		//this.SectorMenu.set_x(x0);
		//this.SectorMenu.set_y(y0);
		//fav apps
		for (let n = 0; n < N; n++) {
			//positioning 
			let Theta = n*2* Math.PI / N;
			let CosTheta=Math.cos(Theta);
			let SinTheta=Math.sin(Theta)
			
			x = R*CosTheta + x0;
			y = R*SinTheta + y0;

			app[n] = this.favs[n];
			if (app[n] != null) {
				this.items[n] = new St.Button({
					// style_class: 'panel-button',
					//label: app[n].get_name(),
					reactive: true,
					visible: true,
					opacity: 255,
					x_fill: true,
					y_fill: true,
					height: iconSize,
					width: iconSize,
					pivot_point: p,
					// x: x - dx/2,
					// y: y - dy/2,
					x: x,
					y: y,
					anchor_gravity: Clutter.Gravity.CENTER, // FIXME pivot_point doesn't seem to work for ST.Widgets 
				});
				let gicon = app[n].app_info.get_icon();
				
				let icon = new St.Icon({
					gicon: gicon,
					style_class: 'launcher-icon',
					//reactive: true,
					icon_size: 512,
					visible: true,
					opacity: 255,
					pivot_point: p,
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
				
				this.SectorMenu.add_actor(this.items[n])
				//this.items[n].delegate = this;
				// If app is running, show a preview 

				/* this.cl_items[n]=new Clutter.Texture({
					//filename: gicon.path,
					// border_color: RED,
					reactive: true,
					opacity: 255,
					width: .5 * R,
					height: .5 * R,
					pivot_point: p,
					rotation_angle_x: 0,
					rotation_angle_y: 0,
					// rotation_angle_z: 360/N + 3* 180/N,
					rotation_angle_z: 0,
					//anchor_gravity: Clutter.Gravity.CENTER,
					x: x0,
					y: y0,
				}) */
				this.items[n].state = app[n].state;
				
				//TODO Here is where we do the previews for now
				DEBUG('   +drawing preview')
				if (this.items[n].state){
					let metawin = app[n].get_windows();
					// let compositor = metawin.get_compositor_private();
					// DEBUG('~-=-~-=-~-=-~')
					// DEBUG(app[n].get_name());
					// DEBUG(app[n].get_app_info());
					// DEBUG(metawin)
					// DEBUG(metawin.length)
					for (let i in metawin) {
						let compositor=metawin[i].get_compositor_private();
						if(compositor){
							let texture=compositor.get_texture();
							let width, height
							if (texture.get_size) {
								[width, height] = texture.get_size()
							} else {
								let preferred_size_ok
								[preferred_size_ok, width, height] = texture.get_preferred_size();
							}

							let scale = 1.0;
							const PREVIEW_SCALE = .1;
							let previewWidth = this.monitor.width * PREVIEW_SCALE;
							let previewHeight = this.monitor.height * PREVIEW_SCALE;
							if (width > previewWidth || height > previewHeight)
								scale = Math.min(previewWidth / width, previewHeight / height);
							
							//this.SectorMenu.set_x_align(1)
							//this.SectorMenu.set_y_align(.5)


							let clone = new Clutter.Clone({
								opacity:255,
								source: texture.get_size ? texture : compositor,
								reactive: true,
								anchor_gravity: Clutter.Gravity.CENTER,
								pivot_point: p,
								width: this.monitor.width * PREVIEW_SCALE,
								height: this.monitor.height * PREVIEW_SCALE,
								//x_align: 1,
								//y_align: 1,
								x: 1.5 * R*CosTheta + x0 ,
								y: 1.5 * R*SinTheta + y0 ,
								rotation_angle_x: 0*SinTheta,
								rotation_angle_y: -30*CosTheta,
							});
							/* clone.target_width = Math.round(width * scale);
							clone.target_height = Math.round(height * scale);
							clone.target_width_side = clone.target_width * 2 / 3;
							clone.target_height_side = clone.target_height; */
							this.SectorMenu.add_child(clone);
							Tweener.addTween(clone,{
								translation_x: iconSize*CosTheta,
								translation_y: 10,
							})
							//clone.delegate=this;
						}
						
					
					

					//this.previews[n] = get.texture

					//this.SectorMenu.add_actor(this.previews[n]);
					//this.previews[n].hide();
					}
				
				}
				// tooltips
				let text = app[n].get_name();
				if (app[n].get_description()) {
					text += '\n' + app[n].get_description();
				}
				this.tips[n] = new St.Label({
					style_class: 'tooltip',
					theme: null,
					opacity: 0,
					x: x0,
					y: y0
				});
				this.tips[n].set_text(text);
				//this.tips[n].delegate=this;
				//this.tips[n].hide();
				this.items[n].tip = this.tips[n];
				let [tx, ty] = this.tips[n].get_size();
				//FIXME: some kind of offset bug here
				// this.tips[n].set_position(x - (tx / 2), y + dy / 2 + 5)
				this.tips[n].set_position(x, y + dy / 2 )
				this.SectorMenu.add_actor(this.tips[n])
				}
			}
		
		//sector panels:
		this.texture=[];
		let tweenParams;
		
		for (let n = 0; n < N; n++) {
			p.init(0,0);
			//sector panels are clutter textures:
			this.texture[n] = new Clutter.Texture({
				filename: Me.path+ "/ui/sector-gradientb-512.svg",
				// border_color: RED,
				reactive: true,
				opacity: 0,
				width: .5*R,
				height: .5*R,
				pivot_point: p,
				rotation_angle_x: 0,
				rotation_angle_y: 0,
				// rotation_angle_z: 360/N + 3* 180/N,
				rotation_angle_z: 0,
				// anchor_gravity: Clutter.Gravity.CENTER,
				x: x0,
				y: y0,
			});
			this.SectorMenu.add_actor(this.texture[n])
			this.texture[n].lower_bottom();
			//this.texture[n].delegate=this;
			this.texture[n].connect(
				'enter-event',
				this._onMouseEnter.bind(this, this.texture[n], n)
			);
			this.texture[n].connect(
				'leave-event',
				this._onMouseLeave.bind(this, this.texture[n], n)
			);
			tweenParams = {
				time: 1  ,
				transition: 'easeOutExpo',
				opacity: 228,
				width: 10*R,
				height: 3*R,
				// pivot_point: p,
				rotation_angle_x: 60,
				rotation_angle_y: 60,
				rotation_angle_z: n*360/N -180/N ,
				// translate_x: 0 ,
				// translate_y: 0 ,
				// translate_z: 0,
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
				this.SectorMenu.add_actor(this.guidelines[n])
			}
		}
	}

	_entryKeyPressEvent(actor, event) { 

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

	_entryRun(actor) { 

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
			Util.spawn(["gnome-shell-extension-prefs", Me.metadata.uuid]);
			//Util.trySpawnCommandLine('gnome-shell-extension-prefs ${Me.metatdata["uuid"]}');
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
		DEBUG(actor);
		DEBUG(symbol);
		if (symbol == 65515) {
		    //this.close();
		}
		//return Clutter.EVENT_PROPAGATE;
	}

	_onKeyPressEvent(actor, event) {
		// DEBUG('fullscreen._onKeyPressEvent()')
		let symbol = event.get_key_symbol();
		// DEBUG(actor.name)
		// DEBUG(symbol);
		if (symbol === Clutter.KEY_Escape) {
			if (actor.get_text()) {    //fixme: check for focus instead?
				actor.set_text('');
				return Clutter.EVENT_STOP;
			} else {
				this.close();
			}
		} else if (symbol == Clutter.KEY_Tab){
			this.close();
			Main.overview.toggle();
		} else {
			this.entry_box.grab_key_focus();
			//return Clutter.EVENT_PROPAGATE;
		}
	}

	_onHoverChanged(actor) {
		// DEBUG(`_onHoverChanged( ${actor} )`)
		// DEBUG(actor.anchor_x)
		// DEBUG(actor.anchor_y)
		let iconSize = this.settings.get_int('icon-size');
		Tweener.addTween(actor, {
			// gravity: Clutter.Gravity.CENTER,
			opacity: actor.hover ? 255 : 225,
			height: actor.hover ? iconSize*1.5 : iconSize,
			width: actor.hover ? iconSize*1.5 : iconSize,
			time: .1,
			transition: 'easeOutExpo',
		})
		actor.tip.opacity = actor.hover ? 255 : 0;
		actor.raise_top();
		actor.tip.raise_top();
		// return Clutter.EVENT_PROPOGATE;
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

	// _onMouseEnter(cactor, n) {
	// 	// DEBUG('_onMouseEnter()')
	// 	// DEBUG(cactor)
	// 	// DEBUG(n)

	// 	Tweener.addTween(cactor, {
	// 		time : .1,
	// 		transition: 'linear',
	// 		//transition: 'easeOutExpo',
	// 		//transition: 'EaseInSine',
	// 		scale_x : 1.5,
	// 		scale_y : 1.5,
	// 		// rotation_angle_x: 40,
	// 		// rotation_angle_y: 40,
	// 		//rotation_angle_z:180,
	// 		// translation_x: 50,
	// 		//translation_z: 100,
	// 		// pivot_point_z: 50,
	// 		//transform
	// 		opacity: 255,
	// 	})
	// 	Tweener.addTween(this.items[n],{
	// 		time:.1,
	// 		transition: 'easeInExpo',
	// 		scale_x: 1.5,
	// 		scale_y:1.5,
	// 		// rotation_x:0,
	// 	})
	// 	//cactor.lower_bottom();
	// }

	// _onMouseLeave(cactor, n) {
	// 	// DEBUG('_onMouseLeave()')
	// 	// let m = new ClutterMatrix();
	// 	// DEBUG(n);
	// 	Tweener.addTween(cactor,{
	// 		time: 1,
	// 		scale_x: 1,
	// 		scale_y: 1,
	// 		transition: 'easeOutBounce',
	// 		// rotation_angle_x: 0,
	// 		// rotation_angle_y: 0,
	// 		//rotation_angle_z:0,
	// 		//translation_x: 0,
	// 		translation_x: 0,
	// 		pivot_point_z: 0,
	// 		opacity: 84,
	// 	})
	// 	Tweener.addTween(this.items[n], {
	// 		time: .5,
	// 		transition: 'easeOutExpo',
	// 		scale_x: 1,
	// 		scale_y: 1,
	// 		// rotation_x: 0,
	// 	})
	// 	cactor.lower_bottom();
	// }

	_onButtonPressEvent(cactor){
		DEBUG('_onButtonPressEvent() ');
		DEBUG(global.get_pointer())
	}
}

// * I am gathering that this adds methods to handle signals like emit() ?
Signals.addSignalMethods(Fullscreen.prototype)
