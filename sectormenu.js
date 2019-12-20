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
const Cogl = imports.gi.Cogl;
const St = imports.gi.St;

const AppFavorites = imports.ui.appFavorites;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension()
const Convenience = Me.imports.convenience;
const Lib = Me.imports.lib;
const System = imports.system; // * For debugging ? 

const DEBUG=Lib.DEBUG;
// var debug = Me.imports.lib.debug;
// const DEBUG = Me.imports.lib.DEBUG;

const RED = new Clutter.Color({
	'red': 255,
	'blue': 0,
	'green': 0,
	'alpha': 128
});

var debug=true;

var SectorMenu = class SectorMenu {
	
    constructor(caller){
		DEBUG('SectorMenu.constructor() ...')
		this.caller=caller;		
		this.quickFunction = function() {return Clutter.EVENT_STOP};
		
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
		this.cy=this.monitor.height/2;
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
			name: 'SMactor',
			width: this.monitor.width,
			height: this.monitor.height,
			visible: true,
			reactive: true,
			// z_position: 0,
			
		})
		
		this.SMactor = this.SMactorClutter; 
		this.SMactor.hide();
		
		// Connections
		this.SMactor.connect(
			"button-press-event",
			this._onButtonPressEvent.bind(this)
		);
		
		// ! Some mtarix stuff, want to set the perspective on SMactor.
		let M = new Cogl.Matrix;
		M.init_identity();

		DEBUG(' -={ T transform (should be id)  }=-');
		DEBUG('-={ M identity }=-');
		Cogl.debug_matrix_print(M);
		DEBUG(M);


		let T = this.SMactor.get_transform();
		Cogl.debug_matrix_print(T);
		DEBUG(T);


		M.look_at(this.cx, this.cy, 1, this.cx, this.cy, -1, 0, 1, 0);
		DEBUG('-={ M after look_at()  }=-');
		Cogl.debug_matrix_print(M);
		DEBUG(M);


		DEBUG(' -={ Setting transform matrix }=- ');
		//this.SMactor.set_transform(M);

// Maybe its projection ??





		DEBUG('SectorMenu.constructor() Done.')
	}
	
	close(){
		DEBUG('SectorMenu.close()')
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
		//this.delegate.toggle(); //? How to close the calling actor, FSMenu ?
		
		// ! I have some cleaning up to do here with open/close, show/hide, and destroy, and signals.
		// this.emit('sectormenu-closed');
		this.quickFunction = null;
		DEBUG(this.quickFunction)	
	};

	show(){
		DEBUG('sectormenu.show()');
		this.quickFunction= ()=> {return Clutter.EVENT_STOP};
		if(this.settings.get_boolean('draw-at-mouse') )
			[this.cx, this.cy] = global.get_pointer();
		// else
		// 	[this.cx, this.cy] = [this.monitor.width/2, this.monitor.length/2];
		
		//DEBUG(this.SMactor);
		this.N=this.settings.get_int('sectors')
		this.R=this.settings.get_int('radius')
		this.iconSize=this.settings.get_int('icon-size')
		
		//this._drawTests();
		
		//this._drawGuides();
		//this._drawCenter();
		
		//this._drawPanels();
		this._drawApps();
		this._drawPreviews();
		
		//this._drawSectors();
		
		this.SMactor.show();
		//this.SMactor.lower_bottom();
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
		DEBUG('sectormenu.destroy()')
		this.close()
		this.SMactor.destroy;
		//this.caller.close();
    }
	
	// * Drawing methods
	
	_defineSectors(){
		DEBUG('sectormenu._defineSectors()')
	}
	
	_drawGuides(){
		DEBUG('sectormenu._drawGuides()')
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
			z_position: 0,
		}) ;
		this.SMactor.add_actor(center);
		
		let startParams={
			time:.1,
			scale_x:1,
			scale_y:1,
			opacity:255
		}
		let pulseParams;
		pulseParams={
			time:1.5,
			scale_x: 3,
			scale_y: 3,
			opacity: 0,
			transition: 'easeOutSine',
			onComplete: function() {
				this.scale_x=1;
				this.scale_y=1;
				this.opacity=255;
				Tweener.addTween(this,pulseParams);
			}
		}
		// Tweener.addTween(center,startParams);
		Tweener.addTween(center,pulseParams);
		// // pulse 5 times
		
		// for (let n=0; n<5; n++){
			// 	Tweener.addTween(center,startParams);
			// 	//Tweener.removeTweens(center);
			// 	Tweener.addTween(center,pulseParams);
			// 	//Tweener.removeTweens(center);
			// 	DEBUG(n);
			// 	//Tweener.removeTweens(center)
			// }
			
			
			
		// Tweener.addCaller(center,{
		// 	//base: base,
		// 	delay: .1,
		// 	count: 10,
		// 	time: 1,
		// 	color: 0xffdd33 ,
		// 	transition: 'linear',
		// 	scale_x: 3,
		// 	scale_y: 3,
		// 	opacity: 255,
		// 	onUpdate: DEBUG('test'),
		// 	//autoreverse: true,
		// 	//loop: true,
		// 	// ? not sure how theese work yet
		// 	//nCompleteParams: [],
		// 	//onComplete: Tweener.addTween(this, pulseParams),
		// 	//onCompleteScope: this,
		// })
	}

	_drawPanels(){
		DEBUG('sectormenu._drawPanels()')
		let tweenParams;
		let R=this.R;
		let N=this.N;
		for (let n = 0; n < N; n++) {
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
				z_position: -1,
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
				z_position: -1,
				//scale_z: 0.
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
				// DEBUG('~-=-~-=-~-=-~')
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
						const PREVIEW_SCALE = .2;
						let previewWidth = this.monitor.width * PREVIEW_SCALE;
						let previewHeight = this.monitor.height * PREVIEW_SCALE;
						if (width > previewWidth || height > previewHeight)
							scale = Math.min(previewWidth / width, previewHeight / height);

						//this.SectorMenu.set_x_align(1)
						//this.SectorMenu.set_y_align(.5)

						// ! seems like the size of the texture is very small?
						
						let clone = new Clutter.Clone({
							name: 'preview'+n.toString()+'-'+i.toString(),
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
							z_position: -.5,
						});
						clone.target_width = Math.round(width * scale);
						clone.target_height = Math.round(height * scale);
						clone.target_width_side = clone.target_width * 2 / 3;
						clone.target_height_side = clone.target_height; 
						this.SMactor.add_child(clone);

						clone.Fcn= () => Main.activateWindow(metawin[i])
						clone.Fcn.displayName = 'Activate the preview'

						Tweener.addTween(clone, {
							translation_x: this.iconSize * CosTheta,
							translation_y: 10,
						})
						//clone.lower_bottom();
						
						this.items[n].raise_top();
						DEBUG('connecting events to previews')
						clone.connect(
							'button-press-event',
							this._onButtonPressEvent.bind(this, metawin)
						)
						
						clone.connect(
							'leave-event',
							this._onMouseLeave.bind(this, clone, n)
						)
						clone.connect(
							'enter-event',
							this._onMouseEnter2.bind(this, clone,n)
						)
						//clone.delegate=this;
					}
					//this.previews[n] = get.texture

					// this.SMactor.add_actor(this.previews[n]);
					//this.previews[n].hide();
				}

			}
	
		}
	DEBUG('sectormenu._drawPreviews() done.')
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
					z_position: .5,
					x: x,
					y: y,
					anchor_gravity: Clutter.Gravity.CENTER, 
					// ? pivot_point doesn't seem to work for ST.Widgets 
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
				// ! This is where I'm at. I need to emit a signal from here to close the FSmenu. ...
				this.items[n].connect(
					'clicked',
					() => {
						app[n].open_new_window(-1);
						this.caller.close();
					});
				// this.items[n].connect(
				// 	'notify::hover',
				// 	()=> {Tweener.addTween(
				// 			this.items[n],
				// 			{scale_x: this.items[n].hover ? 1.5 : 1,
				// 			scale_y: this.items[n].hover ? 1.5 : 1,
				// 			}
				// 		)	
				// 	}
				// )
				// this.items[n].connect(
				// 	'key-release-event',
				// 	this._onItemKeyRelease.bind(this)
				// )
				this.items[n].connect(
					'leave-event',
					this._onMouseLeave.bind(this,this.items[n],n)
				)
				this.items[n].connect(
					'enter-event',
					this._onMouseEnter.bind(this)
				)
					
				
				this.SMactor.add_actor(this.items[n])
				this.items[n].raise_top();
				this.items[n].state = app[n].state;  // * for the previews
				this.items[n].Fcn = () => app[n].open_new_window(-1);
				this.items[n].Fcn.displayName = 'Open New ' + app[n].get_name() + ' Window'
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
		let [dx,dy] = [this.cx -x, this.cy - y]

		this.SMactor.get_children().forEach(
			function (k) {
				Tweener.addTween(k,{
					time: 1,
						transition: 'easeInOutSine',
						x: k.x-dx,
						y: k.y-dy,
				})
			}
		)
		this.cx=x,this.cy=y
		let M=this.panels[0].get_transformation_matrix();
		Cogl.debug_matrix_print(M)
		logMatrix(M)
		M.look_at(x,y,1,x,y,0,0,1,0)
	}
	
	// #region Helper methods	
	_getPreviews(){
		DEBUG('sectormenu._getPreviews()')
	}
	
	// #endregion Helper methods
	
	
	// #region event handlers
	_onMouseEnter(actor,n){
		DEBUG('sectormenu._onMouseEnter()')
		DEBUG(actor,n)
		//cactor.grab_key_focus();
		actor.raise_top();
		Tweener.addTween(actor, {
			time: 1,
			//transition: 'easeInOutSine',
			transition: 'easeOutExpo',
			//transition: 'EaseInSine',
			scale_x: 2,
			scale_y: 2,
			scale_z: 2,
			//rotation_angle_y: 40,
			//rotation_angle_x: 40,
			//rotation_angle_z:180,
			//translation_x: 50,
			//translation_z: 100,
			//pivot_point_z: 50,
			//transform
			//opacity: 255,
		})
		if(actor.Fcn) {
			DEBUG('Attaching a quickFunction');
			this.quickFunction = actor.Fcn;
			this.caller.qFcnText.set_text(actor.Fcn.displayName);
			//this.close();
		}
		//cactor.lower_bottom();
		// if(n) {
		// 	Tweener.addTween(this.items[n], {
		// 		time: .1,
		// 		transition: 'easeInExpo',
		// 		scale_x: 1.5,
		// 		scale_y: 1.5,
		// 		// rotation_x:0,
		// 	})
		// } 
	}
	
	_onMouseEnter2(actor,n){
		DEBUG('sectormenu._onMouseEnter2(n) ')
		DEBUG(this.name)
		DEBUG(actor.name);
		DEBUG(n);
		
		Tweener.addTween(actor,{
			scale_x:2,
			scale_y:2
		})
		
		if (actor.Fcn) {
			DEBUG('Attaching a quickFunction');
			this.quickFunction = actor.Fcn;
			this.caller.qFcnText.set_text(actor.Fcn.displayName);
		}
	}

	_onMouseLeave(cactor,n){
		DEBUG('sectormenu._onMouseLeave()',n)
		DEBUG(cactor,n)
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
			//opacity: 0,
		})
		actor.lower_bottom();
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
					scale_z: 0})
				break;
			case 3:
				let [x,y]=global.get_pointer();
				this._moveSectors(x,y);
			break;
		}
	}

	_onKeyReleaseEvent(actor, event) {
		DEBUG('sectormenu._onKeyReleaseEvent()');
		
	}

	_onItemKeyRelease(actor, event) {
		DEBUG('_onItemKeyRelease(a,e');
		let symbol = event.get_key_symbol();
		DEBUG('key-press-event on app item[n], ', symbol);
}

	// #endregion event handlers
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

function logMatrix(M){
	global.log('[', M.xx,M.xy,M.xz,M.xw, '] ' +
	'[', M.yx,M.yy,M.yz,M.yw, '] \n' +
	'[', M.zx,M.zy,M.zz,M.zw, '] \n' +
	'[', M.wx,M.wy,M.wz,M.ww, ']')
}