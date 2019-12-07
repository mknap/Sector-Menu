/* extension.js
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

 const {
     Gio,
     Meta,
     Shell,
     St
 } = imports.gi;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Convenience = Me.imports.convenience;
const Fullscreen = Me.imports.fullscreen;

const DEBUG = function (message) {
    // Enable for debugging purposes.
    //TODO : make this more versatile with options, info, warn, etc.
   if(true) global.log( "[" + Me.metadata.name + "] " + message);
}
const ShellActionMode = (Shell.ActionMode) ? Shell.ActionMode : Shell.KeyBindingMode;


class Extension {
    constructor() {
        DEBUG(' ~-~--={ Starting Sector Menu }=-~-~ ')
        DEBUG('constructor() begin...')

        DEBUG(' + getting settings')
        this.settings = Convenience.getSettings();

        DEBUG('constructor() Done.')
        Main.notify(Me.metadata.name + " loaded.")
    }

    enable() {
        DEBUG('enable() begin...')

        /* BIG NOTE
        from https://unix.stackexchange.com/questions/388238/how-to-set-super-windows-key-to-show-all-applications-menu-in-gnome-de

        Running
            settings set org.gnome.mutter overlay-key ''
        removes the hard keybind of the win key. This can be undone with
             gsettings set org.gnome.mutter overlay-key "['Super_L']"
        And this should be able to be done within the javascript.

        One problem that occurs is that other key combinations are then usurped. We should be able to wirte a pass-thru function ?
        */
        DEBUG(' + setting keybinding')
        Main.wm.addKeybinding(
            "toggle-sector-menu",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            ShellActionMode.NORMAL |
            ShellActionMode.OVERVIEW,
            /** See https://gitlab.gnome.org/GNOME/gjs/blob/master/doc/Modules.md */
            //Lang.bind(this, this._keyAction)
            this._keyAction.bind(this)
        );
        //Main.wm.allowKeybinding('toggle-overview', Shell.ActionMode.ALL);
        // Create a setting for the Handler takeover

        //TODO: create a setting for this:
        // Main.wm.setCustomKeybindingHandler(
        //     'toggle-overview',
        //     ShellActionMode.ALL,
        //     this._keyAction.bind(this)
        // )

        DEBUG(' + constructing icon and panel indicator')
        this.gicon = Gio.icon_new_for_string(Me.path + '/icons/sector-icon.svg');
        this.indicator = new PanelMenu.Button(0.0, Me.metadata.name, false);
        this.indicator.add_actor(
            new St.Icon({
                gicon: this.gicon,
                style_class: 'system-status-icon'
            })
        );
        let pos = Main.sessionMode.panel.left.indexOf('appMenu');
        if ('apps-menu' in Main.panel.statusArea)
            pos++;
        Main.panel.addToStatusArea(Me.metadata.name, this.indicator,pos, 'left');

        DEBUG(' + binding our settings and watching for changes')
        this.settings.bind(
            'show-indicator',
            this.indicator,
            'visible',
            Gio.SettingsBindFlags.DEFAULT
        )

        DEBUG('enable() Done.')
    }

    disable() {
        DEBUG('disable() begin...')

        DEBUG(' + destroying')
        if (this.indicator!== null) {
            this.indicator.destroy();
            this.indicator=null;
        }
        if (this.fullscreen!== null) {
            this.fullscreen.destroy();
            this.fullscreen=null;
        }

        DEBUG(' + resetting keybindings')
        Main.wm.removeKeybinding('toggle-sector-menu') //TODO: needed ?
        //If we took over the <super> key, give it back
        // from viewselector@228
        // Main.wm.setCustomKeybindingHandler(
        //     'toggle-overview',
        //     ShellActionMode.ALL,
        //     Main.overview.toggle.bind(Main.overview)
        // )

        DEBUG('disable() Done.')
    }

    _keyAction() {
        DEBUG('_keyAction()')
        if (!this.fullscreen) {
            this.fullscreen = new Fullscreen.Fullscreen(this.settings); //FIXME: monitor 0 temp
        }
        this.fullscreen.toggle();
    }


}

function init() {
    return new Extension();
}
