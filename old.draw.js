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