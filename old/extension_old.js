/* extension.js
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

const Lang = imports.lang;

const {
    Gio,
    GLib,
    GObject,
    Meta,
    Shell,
    St
} = imports.gi;

const AppFavorites = imports.ui.appFavorites;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;

const Me = ExtensionUtils.getCurrentExtension()
const ME = Me.metadata.name

const Convenience = Me.imports.convenience;
const Fullscreen = Me.imports.fullscreen;
const ShellActionMode = (Shell.ActionMode) ? Shell.ActionMode : Shell.KeyBindingMode;

const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);
const DEBUG = Convenience.DEBUG
const myLog = Convenience.DEBUG
//const myLog = (message) => log(`${ME} : ${message}`)

const SHELL_KEYBINDINGS_SCHEMA = 'org.gnome.shell.keybindings';

var SectorMenuIndicator = class SectorMenuIndicator
extends PanelMenu.Button {

    _init() {

        myLog(' ~-~--={ Starting Sector Menu }=-~-~ ')
        myLog("SectorMenuIndicator._init")

        super._init(0.0, `${Me.metadata.name} Indicator`, false);

        // Pick and add an icon
        let icon = new St.Icon({
            //gicon: new Gio.ThemedIcon({name: 'face-laugh-symbolic'}),
            gicon: Gio.icon_new_for_string(`${Me.path}/icons/sector-icon.svg`),
            style_class: 'system-status-icon'
        });
        this.add_child(icon);

        // load settings. TODO: study more
        this.settings = Convenience.getSettings();

        /* Bind our indicator visibility to the GSettings value

           NOTE: Binding properties only works with GProperties (properties
           registered on a GObject class), not native JavaScript properties
        */
        this.settings.bind(
            'show-indicator',
            this,
            'visible',
            Gio.SettingsBindFlags.DEFAULT
        )
        // Watch the settings for changes
        this._onPanelStatesChangedId = this.settings.connect(
            'changed::panel-states',
            this._onPanelStatesChanged.bind(this)
        );
        this._onKeybindingChangedId = this.settings.connect(
            'changed::keybinding',
            this._onKeybindingChanged.bind(this)
        );


        // original extension example, toggling panel items
        {
            // Keep record of the original state of each item
            this.states = {};
            // Read the saved states
            let variant = this.settings.get_value('panel-states');
            /* Unpack the GSettings GVariant

            NOTE: `GSettings.get_value()` returns a GVariant, which is a
            multi-type container for packed values. GJS has two helper functions:

             * `GVariant.unpack()`
                This function will do a shallow unpacking of any variant type,
                useful for simple types like "s" (string) or "u" (uint32/Number).

             * `GVariant.deep_unpack()`
                A deep, but non-recursive unpacking, such that our variant type
                "a{sb}" will be unpacked to a JS Object of `{ string: boolean }`.
                `GVariant.unpack()` would return `{ string: GVariant }`.
            */
            this.saved = variant.deep_unpack();
            // Add a menu item for each item in the panel
            for (let name in Main.panel.statusArea) {
                // Remember this item's original visibility
                this.states[name] = Main.panel.statusArea[name].visible;

                // Restore our settings
                if (name in this.saved) {
                    myLog(`Restoring state of ${name}`);
                    Main.panel.statusArea[name].actor.visible = this.saved[name];
                }

                this.menu.addAction(
                    `Toggle "${name}"`,
                    this.togglePanelItem.bind(this, name),
                    null
                );
            }
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())

        // add shortcuts from settings. Incomplete
        {
            // Add a menu for each menu-entry in the settings
            myLog("building menu from saved list.")
            let menus = this.settings.get_value('menu-entries').deep_unpack();

            for (let i = 0; i < menus.length; i++) {
                myLog(`Creating menuitem: ${menus[0][0]} --> ${menus[0][1]}`)
                this.menu.addAction(
                    menus[i][0],
                    this.spawnCL.bind(this, menus[i][1]),
                    // The above call gave me such a hard time. Learn more here.
                    null
                );


            }

            myLog("Done building entries. ")
        }
        // keyboard shortcut stuff
        {
            /* Here I am working on binding a keyboard shortcut.
            the settings name is "keybinding"
            */
            // let kShortcut = this.settings.get_value('keybinding').deep_unpack();
            // myLog(` Setting shortcut to ${kShortcut}`)
            /* From hidetopbar/panelVisibilityManager@380 :

            Main.wm.addKeybinding("shortcut-keybind",
            this._settings, Meta.KeyBindingFlags.NONE,
            ShellActionMode.NORMAL,
            Lang.bind(this, this._handleShortcut)
        );
        */

            /* BIG NOTE
            from https://unix.stackexchange.com/questions/388238/how-to-set-super-windows-key-to-show-all-applications-menu-in-gnome-de

            Running
                settings set org.gnome.mutter overlay-key ''
            removes the hard keybind of the win key. This can be undone with
                 gsettings set org.gnome.mutter overlay-key "['Super_L']"
            And this should be able to be done within the javascript.

            One problem that occurs is that other key combinations are then usurped. We should be able to wirte a pass-thru function ?
            */

            Main.wm.addKeybinding(
                "keybinding",
                this.settings,
                Meta.KeyBindingFlags.NONE,
                ShellActionMode.NORMAL |
                ShellActionMode.OVERVIEW,
                /** See https://gitlab.gnome.org/GNOME/gjs/blob/master/doc/Modules.md */
                //Lang.bind(this, this._keyAction)
                this._keyAction.bind(this)
            );

            Main.wm.allowKeybinding('toggle-overview', Shell.ActionMode.ALL);
            Main.wm.setCustomKeybindingHandler(
                'toggle-overview',
                ShellActionMode.ALL,
                this._keyAction.bind(this)
            )
            // Main.wm.allowKeybinding('toggle-application-view',  Shell.ActionMode.ALL);
            // Main.wm.setCustomKeybindingHandler(
            //     'toggle-application-view',
            //     ShellActionMode.ALL,
            //     this._keyAction.bind(this)
            // )

            //this is from viewSelector.js@221 and @228
            // doesn't seem to usurp the key though
            // Main.wm.addKeybinding('toggle-application-view',
            //     new Gio.Settings({
            //         schema_id: SHELL_KEYBINDINGS_SCHEMA
            //     }),
            //     Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            //     Shell.ActionMode.NORMAL |
            //     Shell.ActionMode.OVERVIEW,
            //     this._keyAction.bind(this)
            // );
        }
        // Get the favorites list
        DEBUG('Show Favorites?')
        DEBUG(this.settings.get_boolean('show-favorites'));

        if(this.settings.get_boolean('show-favorites'))
        {
            let favs = AppFavorites.getAppFavorites().getFavorites();
            myLog(`There are ${favs.length} favorites`);
            for (let i = 0; i < favs.length; i++) {
                this.menu.addAction(
                    favs[i].get_name(),
                    //favs[i].open_new_window(-1),
                    null
                )

            }
        }
        myLog("_init done.")
        Main.notify(`${ME}`, 'Loaded .')
    }

    _onPanelStatesChanged(settings, key) {
        // Read the new settings
        this.saved = this.settings.get_value('panel-states').deep_unpack();
        // Restore or reset the panel items
        for (let name in this.states) {
            // If we have a saved state, set that
            if (name in this.saved) {
                Main.panel.statusArea[name].visible = this.saved[name];
                // Otherwise restore the original state
            } else {
                Main.panel.statusArea[name].visible = this.states[name];
            }
        }
    }

    _onKeybindingChanged(settings, key){
        DEBUG(`_onKeybindingChanged() ${key}`);

        Main.wm.addKeybinding(
            "keybinding",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            ShellActionMode.NORMAL |
            ShellActionMode.OVERVIEW,
            /** See https://gitlab.gnome.org/GNOME/gjs/blob/master/doc/Modules.md */
            //Lang.bind(this, this._keyAction)
            this._keyAction.bind(this)
        );
    }

    _keyAction() {
        //Toggle the fullscreen sector menu
        DEBUG('_keyAction()')
        if (!this.fullscreen) {
            this.fullscreen = new Fullscreen.Fullscreen(0); //FIXME: monitor 0 temp
        }
        this.fullscreen.toggle();
    }

    spawnCL(input) {
        myLog('spawnCL..');
        Util.spawnCommandLine(input);
    };

    /**
     * togglePanelItem:
     * @param {string} name - name of the panel item
     *
     * Don't be a jerk to your future self; document your code!
     */
    togglePanelItem(name) {
        myLog(`SectorMenu: ${name} menu item toggled`);
        DEBUG('test')
        let statusItem = Main.panel.statusArea[name];
        statusItem.actor.visible = !statusItem.actor.visible;

        // Store our saved state
        this.saved[name] = statusItem.actor.visible;

        /** From a previous example :
        try {
            let statusItem = Main.panel.statusArea[name];

            // Many classes in GNOME Shell are actually native classes (non-GObject)
            // with a ClutterActor (GObject) as the property `actor`. St is an
            // extension of Clutter so these may also be StWidgets.
            statusItem.actor.visible = !statusItem.actor.visible;
        } catch (e) {
            myLogError(e, 'togglePanelItem');
        }
        */
    }

    // We'll override the destroy() function to revert any changes we make
    destroy() {
        // Stop watching the settings for changes

        // this.settings.disconnect(this._onSettingsChangedId);

        // Store the panel settings in GSettings
        this.settings.set_value(
            'panel-states',
            new GLib.Variant('a{sb}', this.saved)
        );

        // Restore the visibility of the panel items
        for (let [name, visibility] of Object.entries(this.states)) {
            Main.panel.statusArea[name].visible = visibility;
        }
        Main.wm.removeKeybinding('keybinding')

        // Chain-up to the super-class after we've done our own cleanup
        this.fullscreen.destroy();
        super.destroy();
    }
}


if (SHELL_MINOR > 30) {
    // Compatibility with gnome-shell >= 3.32
    SectorMenuIndicator = GObject.registerClass({
            GTypeName: 'SectorMenuIndicator'
        },
        SectorMenuIndicator
    );
}

// We're going to declare `indicator` in the scope of the whole script so it can be accessed in both `enable()` and `disable()`
var indicator = null;

function init() {
    /* This function is called once when your extension is loaded, not enabled.
This is a good time to setup translations or anything else you only do once.
You MUST NOT make any changes to GNOME Shell, connect any signals or add any
MainLoop sources here.
*/
    myLog(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
}

function enable() {
    /* This function could be called after your extension is enabled, which could
// be done from GNOME Tweaks, when you myLog in or when the screen is unlocked.
//
// This is when you setup any UI for your extension, change existing widgets,
// connect signals or modify GNOME Shell's behaviour.
*/
    myLog(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
    indicator = new SectorMenuIndicator();

    // The `Main` import is an example of file that is mostly live instances of
    // objects, rather than reusable code. `Main.panel` is the actual panel you
    // see at the top of the screen.
    Main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator);
}

function disable() {
    /* This function could be called after your extension is uninstalled,
    disabled in GNOME Tweaks, when you myLog out or when the screen locks.
    Anything you created, modifed or setup in enable() MUST be undone here. Not
    doing so is the most common reason extensions are rejected during review!
    */
    myLog(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);

    // REMINDER: It's required for extensions to clean up after themselves when
    // they are disabled. This is required for approval during review!
    if (indicator !== null) {
        indicator.destroy();
        indicator = null;
    }
}