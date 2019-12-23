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
// // var debug = Me.imports.lib.debug;
// // const DEBUG = Me.imports.lib.DEBUG;

// const RED = new Clutter.Color({
// 	'red': 255,
// 	'blue': 0,
// 	'green': 0,
// 	'alpha': 128
// });

// var debug=true;

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
		//this.tips = [];
		this.panels = [];
		this.previews = [];;
		
		this.cx=this.monitor.width/2;
		this.cy=this.monitor.height/2;
		if (this.settings.get_boolean('draw-at-mouse'))
			[this.cx, this.cy] = global.get_pointer();
		
		this.N=this.settings.get_int('sectors')
		this.R=this.settings.get_int('radius')
		this.iconSize = this.settings.get_int('icon-size');
		this.angle=360/this.N;
		this.color = new Clutter.Color().init(255,0,0,255) //red 

		this.SMactor = new Clutter.Actor({
			name: 'SMactor',
			width: this.monitor.width,
			height: this.monitor.height,
			visible: true,
			reactive: true,
			// z_position: 0,
		})
		this.SMactor.hide();
		
		// * some playing around with matrices for future work
		// #region matrix!
		let M=[];
		M[0] = new Cogl.Matrix;
		M[0].init_identity();
		
		M[1] = new Cogl.Matrix;
		M[1].init_identity();
		M[1].scale(2,1,1)
		
		M[2] = new Cogl.Matrix;
		M[2].init_identity();
		M[2].look_at(-this.cx, -this.cy, 2,-this.cx, -this.cy, 0, 0, 1, 0	);
		
		M[3] = new Cogl.Matrix;
		M[3].init_identity();
		M[3].look_at(-this.cx, -this.cy, 10,0, 0, 0, 0, 1, 0);
		this.M=M
		
		// commented for release, uncomment for debug
		this.SMactor.connect(
			"button-press-event",
			this._onButtonPressEvent.bind(this)
		);

		// #endregion
		DEBUG('SectorMenu.constructor() Done.')
	}
	
	close(){
		DEBUG('SectorMenu.close()')
		if (this.isOpen){
			this.isOpen=false;
			let kids = this.SMactor.get_children();
			kids.forEach( function (k) {
				try {
					//this.FSMenu.remove_actor(kid);
					k.destroy();
				} catch (e) {
					DEBUG(e);
				}
			});
			this.quickFunction =()=>{};
			this.quickFunction.displayName=null
			this.caller.close(); 
		}
		};

	show(){
		DEBUG('sectormenu.show()');
		this.isOpen=true;
		if (this.settings.get_boolean('draw-at-mouse'))
			[this.cx, this.cy] = global.get_pointer();
		//reload from settings:
		this.N = this.settings.get_int('sectors');
		this.R = this.settings.get_int('radius');
		this.iconSize = this.settings.get_int('icon-size');
		this.angle = 360 / this.N;
		this.isOpen=true;
		//this._drawTests();
		this._drawGuides();
		//this._drawGrid();
		this._drawCenter();
		this._drawPanels();
		this._drawApps();
		this._drawPreviews();
		//this._drawSectors();
		this.SMactor.show();
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
		this.caller.close();
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
					background_color: this.color,
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
	}

	_drawPanels(){
		DEBUG('sectormenu._drawPanels()')
		let tweenParams;
		let R=this.R;
		let N=this.N;
		for (let n = 0; n < N; n++) {
			this.panels[n] = new Clutter.Texture({
				filename: Me.path + "/ui/sector-gradient-512.svg",
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
				opacity: 128,
				// pivot_point: p,
				rotation_angle_x: 0,
				rotation_angle_y: 60,
				rotation_angle_z: n * 360 / N - 180 / N,
				z_position: -2,
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
		// A lot of this code from extension UUID
		// CoverFlowAltTab@palatis.blogspot.com
		
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
				
				for (let i in metawin) {
					DEBUG(typeof i)
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
						DEBUG('adding preview:', n)
						DEBUG(width,height)
						let clonebox=new Clutter.Actor({
							name: 'Clonebox'+n.toString()+'-'+i.toString(),
							background_color: new Clutter.Color().init(255, 0, 0, 0),
							opacity: 255,
							//source: texture.get_size ? texture : compositor,
							//source : compositor,
							reactive: true,
							//anchor_gravity: Clutter.Gravity.CENTER,
							pivot_point: p,
							width: this.monitor.width * PREVIEW_SCALE,
							height: this.monitor.height * PREVIEW_SCALE,
							//x_align: 1,
							//y_align: 1,
							x: (3+Number(i)) * R * CosTheta + this.cx,
							y: (3+Number(i)) * R * SinTheta + this.cy,
							translation_x: scale * -width / 2 * (CosTheta + 1),
							translation_y: scale * -height / 2 * (SinTheta + 1),
							rotation_angle_x: 0 * SinTheta,
							rotation_angle_y: -30 * CosTheta,
							//z_position: -.5,
						})
						let clone = new Clutter.Clone({
							name: 'preview'+n.toString()+'-'+i.toString(),
							background_color:new Clutter.Color().init(255,0,0,0),
							opacity: 255,
							source: texture.get_size ? texture : compositor,
							//source : compositor,
							reactive: true,
							//anchor_gravity: Clutter.Gravity.CENTER,
							pivot_point: p,
							width: this.monitor.width * PREVIEW_SCALE,
							height: this.monitor.height * PREVIEW_SCALE,
							//x_align: 1,
							//y_align: 1,
							//x: 3 * R * CosTheta + this.cx,
							//y: 3 * R * SinTheta + this.cy,
							// translation_x: scale*-width/2  * (CosTheta + 1),
							// translation_y: scale*-height/2 * (SinTheta + 1),
							// rotation_angle_x: 0 * SinTheta,
							// rotation_angle_y: -30 * CosTheta,
							// z_position: -.5,
						});
						clonebox.add_actor(clone)
						// DEBUG('position')
						// DEBUG(clone.x, clone.y)
						// DEBUG('translation')
						// DEBUG(clone.translation_x, clone.translation_y)
						
						// clone.target_width = Math.round(width * scale);
						// clone.target_height = Math.round(height * scale);
						// clone.target_width_side = clone.target_width * 2 / 3;
						// clone.target_height_side = clone.target_height; 
						this.SMactor.add_child(clonebox);

						clonebox.Fcn= () => Main.activateWindow(metawin[i])
						clonebox.Fcn.displayName = 'Activate the preview'

						DEBUG('connecting events to previews')
						clonebox.connect(
							'button-press-event',
							() => {
								clonebox.Fcn();
								this.close();
							}
						)
						
						clonebox.connect(
							'leave-event',
							this._onMouseLeave.bind(this, clonebox, n)
						)
						clonebox.connect(
							'enter-event',
							this._onMouseEnter.bind(this, clonebox,n)
						)
					}
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
			filename: Me.path + "/ui/sector-gradientb-512.svg",
			pivot_point: p,
			pivot_point_z: -10,
			width: w,
			height: h,
			opacity: 255,
			reactive: true,
			x: this.cx,
			y: this.cy,
			// z_position: 10,
			translation_x: 0,
			// translation_y: -p.y*h,
			rotation_angle_x:0,
			rotation_angle_y:45
			,
			rotation_angle_z:0,
		})
		this.SMactor.add_actor(panel);
		
		// stepTween(panel,{
		// 	rotation_angle_z : angle,
		// 	rotation_angle_y : 90,
		// 	translation_z : 10
		// })
		
		
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

	_drawGrid(){
		let pts=[];
		let color = new Clutter.Color().init(255,0,0,255);
		let p= new Clutter.Point().init(.5,.5);
		DEBUG(p.x,p.y)
		for (var i=0; i<10; i++){
			pts[i]=[];
			for (var j=0; j<6; j++){
				pts[i][j] = new Clutter.Text({
					text:'X',
					x:200*i,
					y: 200*j,
					width: 1,
					height: 1,
					background_color: color.init(255,0,0,255),
					pivot_point: p,
					anchor_x: .5,
					anchor_y: .5,
					// anchor_gravity: Clutter.Gravity.CENTER,
					translation_x: -.5,
					translation_y: -.5,
					visible: true,
					color: color,
				})
				
				this.SMactor.add_actor(pts[i][j])
			} 
		}
		let C=new Clutter.Text({
			text: 'X',
			x:1920/2,
			y:1080/2,
			width: 10,
			height: 20,
			pivot_point: p,
			color: color.init(255,255,0,255),
			translation_x:-5,
			translation_y: -10,
			visible: true,
		})
		this.SMactor.add_actor(C)
	}

	_cycleTransformMatrix(){
		DEBUG('cycle transform matrices')
		let M=this.M;
		DEBUG('Setting child transform to :')
		Cogl.debug_matrix_print(M[0])
		this.SMactor.set_transform(M[0]);
		M.unshift(M.pop());
		this.M=M
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
						// x: this.cx,
						// y: this.cy,
				})
			}
		)
		this.cx=x,this.cy=y
		//let M=this.panels[0].get_transformation_matrix();
		//Cogl.debug_matrix_print(M)
		//logMatrix(M)
		//M.look_at(x,y,1,x,y,0,0,1,0)
	}
	
	// #region Helper methods	
	_getPreviews(){
		DEBUG('sectormenu._getPreviews()')
	}
	
	// #endregion Helper methods
	
	
	// #region event handlers
	_onMouseEnter(actor,n){
		DEBUG('sectormenu._onMouseEnter()', actor)
		Tweener.addTween(actor, {
			time: 1,
			//transition: 'easeInOutSine',
			transition: 'easeOutExpo',
			//transition: 'EaseInSine',
			scale_x: 2,
			scale_y: 2,
			translation_z: 5
		})
		//actor.raise_top();
		if(actor.Fcn) {
			DEBUG('Attaching a quickFunction');
			this.quickFunction = actor.Fcn;
			this.caller.qFcnText.set_text(actor.Fcn.displayName);
		}
	}
	
	_onMouseLeave(actor,n){
		DEBUG('sectormenu._onMouseLeave()', actor)
		Tweener.addTween(actor, {
			time: 1,
			scale_x: 1,
			scale_y: 1,
			translation_z: 0,
			//transition: 'easeOutBounce',
		})
		//actor.lower_bottom();
	}
	

	_onButtonPressEvent(cactor,event) {
		DEBUG('sectormenu._onButtonPressEvent() ');
		DEBUG(global.get_pointer(), event )
		DEBUG(event.get_button())
		switch( event.get_button() ){
			case 1:
				
				break;
			case 2:
				this._cycleTransformMatrix();
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
