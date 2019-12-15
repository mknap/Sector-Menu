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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
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
class SectorMenu {
	
    constructor(){
		DEBUG('SectorMenu.constructor() ...')
				
		this.is_open = false;
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
	};

	show(){
		DEBUG('sectormenu.show()');
		if(this.settings.get_boolean('draw-at-mouse'))
			[this.cx, this.cy] = global.get_pointer();
		else
			[this.cx, this.cy] = this.monitor.width/2, this.monitor.length/2;
		
		
	/* 	DEBUG(this.SMactor.get_child_transform())
		DEBUG(this.SMactor.get_transformed_position())
		let cz=-0;
		this.SMactor.set_translation(0,0,cz)
		DEBUG(this.SMactor.get_transformed_position()) */
		
		DEBUG(this.SMactor);


		this._drawGuides();
		//this._drawTests();
		
		this._drawPanels();
		// this._drawApps();
		// this._drawSectors();
		
		this.SMactor.show();
			
	}

    destroy(){
		DEBUG('sectormenu.close()')
		this.close()
		this.SMactor.destroy;
    }

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

	_drawPanels(){
		DEBUG('sectormenu._drawPanels()')
		let tweenParams;
		let R=this.R;
		let N=this.N;
		for (let n = 0; n < N; n++) {
			this.panels[n] = new Clutter.Texture({
				filename: Me.path + "/ui/sector-gradientb-512.svg",
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

	_drawApps(){

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
	_get_previews(){}

	_onMouseEnter(cactor,n){
		DEBUG('sectormenu._onMouseEnter()',n)
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
		/* Tweener.addTween(this.items[n], {
			time: .1,
			transition: 'easeInExpo',
			scale_x: 1.5,
			scale_y: 1.5,
			// rotation_x:0,
		}) */
	
	
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
	
	_onMouseLeave(cactor,n){
		DEBUG('sectormenu._onMouseLeave()',n)
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
		/* Tweener.addTween(this.items[n], {
			time: .5,
			transition: 'easeOutExpo',
			scale_x: 1,
			scale_y: 1,
			// rotation_x: 0,
		}) */
		cactor.lower_bottom();
		
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