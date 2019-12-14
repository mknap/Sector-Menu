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
		this.previews = [];
		
		this.N=this.settings.get_int('sectors')
		

		this.SMactor = new St.Widget({
			name: "SectorMenu",
			visible: true,
			reactive: true,
			style_class: 'sector-debug',
		})
		this.SMactor.hide();
		
				
		DEBUG('SectorMenu.constructor() Done.')
	}
	
	destroy(){
		DEBUG('SectorMenu.destroy()')
		let kids = this.SMactor.get_children();
		kids.foreach( function (k) {
			try {
				//this.FSMenu.remove_actor(kid);
				k.destroy();
			} catch (e) {
				DEBUG(e);
			}
		});
	};

	show(){
		this.SMactor.show();
		this._drawGuides();

    }

    hide(){
		this.SMactor.hide();
    }

	_drawGuides(){
		DEBUG('SectorMenu._drawGuides()')
		
	}

	_drawSectors(){

	}

	_drawApps(){

	}

	_get_previews(){}

}