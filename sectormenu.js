/* sectormenu.js
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
 * MERCHANTABILITY o_r FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const Clutter = imports.gi.Clutter;

const St = imports.gi.St;

const AppFavorites = imports.ui.appFavorites;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension()
const Convenience = Me.imports.convenience;

const System = imports.system; // * For debugging ? 
DEBUG = function (message, message2) {
	// Enable for debugging purposes.
	// TODO : make this more versatile with options, info, warn, etc. 
	if (!message2) message2 = ""
	else message2 = ", " + message2;
	if (true) global.log("[" + Me.metadata.name + "] " + message + message2);
}

const RED = new Clutter.Color({
	'red': 255,
	'blue': 0,
	'green': 0,
	'alpha': 128
});

var SectorMenu = class SectorMenu {
	
    constructor(){
		DEBUG('SectorMenu.constructor() ...')
				
		this.isOpen = false;
		this.monitor = Main.layoutManager.currentMonitor;
		this.favs = AppFavorites.getAppFavorites().getFavorites();
		this.settings = Convenience.getSettings();
		this.guidelines = [];
		this.items = [];
		this.tips = [];
		this.panels = [];
		this.previews = [];;
		this.cx=this.monitor.width/2;
		this.cy=this.monitor.length/2;

		this.N=this.settings.get_int('sectors')
		this.R=this.settings.get_int('radius')
		this.iconSize = this.settings.get_int('icon-size');
		this.angle=360/this.N;

		// A few different ways to create the main widget:
		this.SMactorSTWidget = new St.Widget({
			name: "SectorMenu",
			visible: true,
			reactive: true,
			//style_class: 'sector-debug',
		})
		this.SMactorClutter = new Clutter.Actor({
			width: this.monitor.width,
			height: this.monitor.height,
			visible: true,
			reactive: true,
			z_position: 0,
			//background_color: //TODO
			//ontent_gravity: Clutter.ContentGravity.LEFT,
		})
		
		this.SMactor = this.SMactorClutter; 
		this.SMactor.hide();
		
		// Connections
		this.SMactor.connect(
			"button-press-event",
			this._onButtonPressEvent.bind(this)
		);
				
		DEBUG('SectorMenu.constructor() Done.')
	}
	
	close(){
		DEBUG('SectorMenu.destroy()')
		let kids = this.SMactor.get_children();
		kids.forEach( function (k) {
			try {
				//this.FSMenu.remove_actor(kid);
				k.destroy();
			} catch (e) {
				DEBUG(e);
			}
		});
		this.isOpen=false;
	};

	show(){
		DEBUG('sectormenu.show()');
		if(this.settings.get_boolean('draw-at-mouse'))
			[this.cx, this.cy] = global.get_pointer();
		else
			[this.cx, this.cy] = this.monitor.width/2, this.monitor.length/2;
		
		DEBUG(this.SMactor);
		this.N=this.settings.get_int('sectors')
		this.R=this.settings.get_int('radius')
		this.iconSize=this.settings.get_int('icon-size')
		
		this._drawGuides();
		//this._drawTests();
		
		this._drawPanels();
		this._drawApps();
		this._drawCenter();
		this._drawPreviews();

		// this._drawSectors();
		
		this.SMactor.show();
		this.isOpen=true;
	}
	toggle(){
		DEBUG('sectormenu.toggle()');
		if (this.isOpen == true)
			this.close();
		else if (this.isOpen == false)
			this.open();
	}

    destroy(){
		DEBUG('sectormenu.close()')
		this.close()
		this.SMactor.destroy;
    }

	// * Drawing methods
	_drawGuides(){
		DEBUG('SectorMenu._drawGuides()')
		if (this.settings.get_boolean('draw-guides')) {
			let R = this.settings.get_int('radius');
			let N=this.N;

			for (let n = 0; n < N; n++){
				this.guidelines[n] = new Clutter.Actor({
					background_color: RED,
					width: 3 * R,
					height: 1,
					x: this.cx,
					y: this.cy,
					//rotation_angle_z: n * 360 / N + .5 * 350 / N,
					//transition: 'easeOutCubic',
				});
			Tweener.addTween(this.guidelines[n], {
				time: 1,
				rotation_angle_z: n * 360 / N + .5 * 360 / N,
			})
			this.SMactor.add_actor(this.guidelines[n])
		
			}
		}

	}
	
	_defineSectors(){

	}

	_drawCenter(){
		
		DEBUG('sectormenu._drawCenter()')
		let center = new Clutter.Texture({
			filename: Me.path + '/ui/icons/sector-icon.svg',
			reactive: true,
			opacity: 50,
			width: this.iconSize,
			height: this.iconSize,
			//pivot_point: p,
			rotation_angle_x: 0,
			rotation_angle_y: 0,
			// rotation_angle_z: 360/N + 3* 180/N,
			rotation_angle_z: 0,
			anchor_gravity: Clutter.Gravity.CENTER,
			x: this.cx,
			y: this.cy,
		}) ;
		this.SMactor.add_actor(center);
		//center.lower_bottom();
		let base={
			onStartParams: [],
			count: 2,
			time: 1,
			transition: 'linear',
			scale_x: 1,
			scale_y: 1,
			opacity: 128,
			// ? not sure how theese work yet
			//onCompleteParams: [],
			//onComplete: Tweener.addTween(this, pulseParams),
			//onCompleteScope: this
		}
		Tweener.addTween(center,{
			//base: base,
			delay: .1,
			count: 3,
			time: 3,
			color: 0xffdd33 ,
			transition: 'linear',
			scale_x: 3,
			scale_y: 3,
			opacity: 255,
			//autoreverse: true,
			//loop: true,
			// ? not sure how theese work yet
			//nCompleteParams: [],
			//onComplete: Tweener.addTween(this, pulseParams),
			//onCompleteScope: this,
		})
	}

	_drawPanels(){
		DEBUG('sectormenu._drawPanels()')
		let tweenParams;
		let R=this.R;
		let N=this.N;
		for (let n = 0; n < N; n++) {
			this.panels[n] = new Clutter.Texture({
				filename: Me.path + "/ui/sector-gradient-512.svg",
				// border_color: RED,
				reactive: true,
				opacity: 0,
				width: .5 * R,
				height: .5 * R,
				//pivot_point: p,
				rotation_angle_x: 0,
				rotation_angle_y: 0,
				// rotation_angle_z: 360/N + 3* 180/N,
				rotation_angle_z: 0,
				// anchor_gravity: Clutter.Gravity.CENTER,
				x: this.cx,
				y: this.cy,
			});
			this.SMactor.add_actor(this.panels[n]);
			this.panels[n].lower_bottom();
			this.panels[n].connect(
				'enter-event',
				this._onMouseEnter.bind(this, this.panels[n], n)
			);
			this.panels[n].connect(
				'leave-event',
				this._onMouseLeave.bind(this, this.panels[n], n)
			);
			tweenParams = {
				time: 1,
				transition: 'easeOutExpo',
				opacity: 255,
				width: 10 * R,
				height: 3 * R,
				opacity: 64,
				// pivot_point: p,
				rotation_angle_x: 0,
				rotation_angle_y: 60,
				rotation_angle_z: n * 360 / N - 180 / N,
				// translate_x: 0 ,
				// translate_y: 0 ,
				// translate_z: 0,
			}
			Tweener.addTween(this.panels[n], tweenParams);
		}
	}

	_drawPreviews(){
		DEBUG("sectormenu._drawPreviews()")
		for( let n=0; n < this.N; n++){
			let app=[];
			app[n] = this.favs[n];
			let p = new Clutter.Point({
				x:.5,
				y:.5
			})
			let R=this.R;

			if (this.items[n].state) {
				let Theta = n * 2 * Math.PI / this.N;
				let CosTheta = Math.cos(Theta);
				let SinTheta = Math.sin(Theta);
				let x = R * CosTheta + this.cx;
				let y = R * SinTheta + this.cy;
				
				
				let metawin = app[n].get_windows();
				// let compositor = metawin.get_compositor_private();
				DEBUG('~-=-~-=-~-=-~')
				// DEBUG(app[n].get_name());
				// DEBUG(app[n].get_app_info());
				// DEBUG(metawin)
				// DEBUG(metawin.length)
				for (let i in metawin) {
					let compositor = metawin[i].get_compositor_private();
					if (compositor) {
						let texture = compositor.get_texture();
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
							opacity: 255,
							source: texture.get_size ? texture : compositor,
							reactive: true,
							anchor_gravity: Clutter.Gravity.CENTER,
							pivot_point: p,
							width: this.monitor.width * PREVIEW_SCALE,
							height: this.monitor.height * PREVIEW_SCALE,
							//x_align: 1,
							//y_align: 1,
							x: 1.5 * R * CosTheta + this.cx,
							y: 1.5 * R * SinTheta + this.cy,
							rotation_angle_x: 0 * SinTheta,
							rotation_angle_y: -30 * CosTheta,
						});
						/* clone.target_width = Math.round(width * scale);
						clone.target_height = Math.round(height * scale);
						clone.target_width_side = clone.target_width * 2 / 3;
						clone.target_height_side = clone.target_height; */
						this.SMactor.add_child(clone);
						Tweener.addTween(clone, {
							translation_x: this.iconSize * CosTheta,
							translation_y: 10,
						})
						//clone.delegate=this;
					}
					//this.previews[n] = get.texture

					// this.SMactor.add_actor(this.previews[n]);
					//this.previews[n].hide();
				}

			}
	
		}
	}

	_drawApps(){
		DEBUG("sectormenu._drawApps()")
		let tweenParams;
		let R = this.R;
		let N = this.N;
		let iconSize = this.iconSize;
		let app=[];
		let p
		
		for (let n = 0; n < N; n++) {
			//positioning 
			let Theta = n * 2 * Math.PI / N;
			let CosTheta = Math.cos(Theta);
			let SinTheta = Math.sin(Theta)
			let x = R * CosTheta + this.cx;
			let y = R * SinTheta + this.cy;
			
			
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
					//pivot_point: p,
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
					//pivot_point: p,
					// x:x-dx/2,
					// y:y-dx/2,
					//track_hover: true,
				});
				this.items[n].set_child(icon);
				this.items[n].connect(
					'clicked',
					() => {
						app[n].open_new_window(-1);
						this.toggle();
					});

				this.SMactor.add_actor(this.items[n])
				this.items[n].state = app[n].state;  // * for the previews
			}
		}
	}

	_drawTests(){
		DEBUG('sectormenu._drawTests()')
		let tweenParams;
		let R = this.R;
		let N = this.N;
		let angle = this.angle;

		let h = 2*R*Math.sqrt(1+Math.pow(Math.cos(.5*angle),2))  ;
		DEBUG(h);
		let w = 512

		// So the angle between each guide is 360/N.
		// we want to center at half that.
		let p=new Clutter.Point({
			x:0,
			y:.5,
		})
		DEBUG(p)
		DEBUG(p.x,p.y)

		let panel = new Clutter.Texture({
			filename: Me.path + "/ui/sector-gradientc-512.svg",
			pivot_point: p,
			pivot_point_z: -10,
			width: w,
			height: h,
			opacity: 255,
			reactive: true,
			x: this.cx,
			y: this.cy,
			z_position: 10,
			translation_x: 0,
			translation_y: -p.y*h,
			rotation_angle_x:0,
			rotation_angle_y:0,
			rotation_angle_z:0,
		})
		this.SMactor.add_actor(panel);
		
		stepTween(panel,{
			rotation_angle_z : angle,
			rotation_angle_y : 90,
			translation_z : 10
		})
		
		
		// Tweener.addTween(panel,{
		// 	delay: 1,
		// 	time:3,
		// 	rotation_angle_z: angle,
		// })

		// Tweener.addTween(panel,{
		// 	time: 3,
		// 	delay: 3,
		// 	rotation_angle_y: -60,
		// 	//translation_z:10,
		// })

		/* for (let n = 0; n < N; n++) {
			this.panels[n] = new Clutter.Texture({
				filename: Me.path + "/ui/sector-gradienta-512.svg",
				// border_color: RED,
				reactive: true,
				opacity: 0,
				width: .5 * R,
				height: .5 * R,
				//pivot_point: p,
				rotation_angle_x: 0,
				rotation_angle_y: 0,
				// rotation_angle_z: 360/N + 3* 180/N,
				rotation_angle_z: 0,
				// anchor_gravity: Clutter.Gravity.CENTER,
				x: this.cx,
				y: this.cy,
			});
			this.SMactor.add_actor(this.panels[n]);
			this.panels[n].lower_bottom();
			this.panels[n].connect(
				'enter-event',
				this._onMouseEnter.bind(this, this.panels[n], n)
			);
			this.panels[n].connect(
				'leave-event',
				this._onMouseLeave.bind(this, this.panels[n], n)
			);
			tweenParams = {
				time: 1,
				transition: 'easeOutExpo',
				opacity: 255,
				width: 10 * R,
				height: 3 * R,
				opacity: 64,
				// pivot_point: p,
				rotation_angle_x: 0,
				rotation_angle_y: 0,
				rotation_angle_z: n * 360 / N - 180 / N,
				// translate_x: 0 ,
				// translate_y: 0 ,
				// transl ate_z: 0,
			}
			Tweener.addTween(this.panels[n], tweenParams);
		}*/
	}
	_moveSectors(x,y){
		DEBUG('sectormenu._moveSectors()')
		this.SMactor.get_children().forEach(
			function (k) {
				Tweener.addTween(k,{
					time: 1,
						transition: 'linear',
						x: x,
						y: y,
				})
			}
		)
		
	}
	
	// * Helper methods	
	_get_previews(){}
	
	
	// * event handlers
	_onMouseEnter(cactor,n){
		//DEBUG('sectormenu._onMouseEnter()',n)
		Tweener.addTween(cactor, {
			time: .1,
			transition: 'easeOutExpo',
			//transition: 'easeOutExpo',
			//transition: 'EaseInSine',
			scale_x: 1.5,
			scale_y: 1.5,
			// rotation_angle_x: 40,
			// rotation_angle_y: 40,
			//rotation_angle_z:180,
			// translation_x: 50,
			//translation_z: 100,
			// pivot_point_z: 50,
			//transform
			opacity: 255,
		})
		cactor.lower_bottom();
			if(n) {
				Tweener.addTween(this.items[n], {
				time: .1,
				transition: 'easeInExpo',
				scale_x: 1.5,
				scale_y: 1.5,
				// rotation_x:0,
			})
		} 
	}
	
	
	_onMouseLeave(cactor,n){
		//DEBUG('sectormenu._onMouseLeave()',n)
		Tweener.addTween(cactor, {
			time: 1,
			scale_x: 1,
			scale_y: 1,
			transition: 'easeOutBounce',
			// rotation_angle_x: 0,
			// rotation_angle_y: 0,
			//rotation_angle_z:0,
			//translation_x: 0,
			translation_x: 0,
			pivot_point_z: 0,
			opacity: 64,
		})
		cactor.lower_bottom();
			if (n) {
				Tweener.addTween(this.items[n], {
				time: .5,
				transition: 'easeOutExpo',
				scale_x: 1,
				scale_y: 1,
				// rotation_x: 0,
			}) 
		}
	}

	_onButtonPressEvent(cactor,event) {
		DEBUG('sectormenu._onButtonPressEvent() ');
		DEBUG(global.get_pointer(), event )
		DEBUG(event.get_button())
		switch( event.get_button() ){
			case 1:
				break;
			case 2:
				Tweener.addTween(cactor,{
					time: 2,
					transition: 'linear',
					scale_z: -.1})
				break;
			case 3:
				let [x,y]=global.get_pointer();
				this._moveSectors(x,y);
			break;
		}
	}
}
	
function stepTween(actor, params) {
	 
	// for (let n=0; n < Object.keys(params).length; n++) {
	// 	DEBUG( params[key[n]] )

	// }}
	for(let key in params) {
		let stepparams={time:2,delay:1}
		DEBUG(key, params[key])
		stepparams[key] = params[key];
		DEBUG(stepparams)
		Tweener.addTween(actor, stepparams)
	}	
}