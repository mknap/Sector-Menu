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

// Always have this as the first line of your file. Google for an explanation.
'use strict'; //Is this still really neccessary?

// gi Imports
const { Gio, GLib, GObject, St} = imports.gi;
// ui Imports
const {main, panelMenu} = imports.ui;
// misc imports and some constants
const {extensionUtils, config, util} = imports.misc ;

const PopupMenu = imports.ui.popupMenu;
const Me = extensionUtils.getCurrentExtension();
const ME = Me.metadata.name;

const SHELL_MINOR = parseInt(config.PACKAGE_VERSION.split('.')[1]);
// SectorMenu Imports
const SectorMenu = Me.imports;

const myLog = (message) => log(`${ME} : ${message}`)

var SectorMenuIndicator = class SectorMenuIndicator extends panelMenu.Button {

    _init() {

        myLog(' ~-~--={ Starting Sector Menu }=-~-~ ')
        myLog(`Gnome Shell minor version ${SHELL_MINOR}`);
        myLog('Package Name is ',config.PACKAGE_NAME);
        myLog('Package Version is ',config.PACKAGE_VERSION);
        myLog("SectorMenuIndicator._init")

        super._init(0.0, `${Me.metadata.name} Indicator`, false);

        // Pick and add an icon
        let icon = new St.Icon({
            //gicon: new Gio.ThemedIcon({name: 'face-laugh-symbolic'}),
            gicon: Gio.icon_new_for_string(`${Me.path}/icons/sector-icon.svg`),
            style_class: 'system-status-icon'
        });
        this.add_child(icon);

        // Get the GSchema source so we can lookup our settings
        let gschema = Gio.SettingsSchemaSource.new_from_directory(
            Me.dir.get_child('schemas').get_path(),
            Gio.SettingsSchemaSource.get_default(),
            false
        );

        this.settings = new Gio.Settings({
            settings_schema: gschema.lookup('org.gnome.shell.extensions.sectormenu', true)
        });

        /* Bind our indicator visibility to the GSettings value

           NOTE: Binding properties only works with GProperties (properties
           registered on a GObject class), not native JavaScript properties
        */
        this.settings.bind(
            'show-indicator',
            this.actor,
            'visible',
            Gio.SettingsBindFlags.DEFAULT
        );

        // Watch the settings for changes
        this._onPanelStatesChangedId = this.settings.connect(
            'changed::panel-states',
            this._onPanelStatesChanged.bind(this)
        );

        // Here, bind the keyboard shortcut to the GSettings values
        // this.settings.bind(
        //     'keybinding',
        //     KEYBOARD SHORTCUT,
        // )



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
        for (let name in main.panel.statusArea) {
            // Remember this item's original visibility
            this.states[name] = main.panel.statusArea[name].actor.visible;

            // Restore our settings
            if (name in this.saved) {
                myLog(`Restoring state of ${name}`);
                main.panel.statusArea[name].actor.visible = this.saved[name];
            }

            this.menu.addAction(
                `Toggle "${name}"`,
                this.togglePanelItem.bind(this, name),
                null
            );
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())

        // Add a menu for each menu-entry in the settings
        myLog("building menu from saved list.")
        let menus=this.settings.get_value('menu-entries').deep_unpack();

        for (let i = 0; i < menus.length; i++){
            myLog(`Creating menuitem: ${menus[0][0]} --> ${menus[0][1]}`)
             this.menu.addAction(
                 menus[i][0],
                 this.spawnCL.bind(this,menus[i][1]),
                 // The above call gave me such a hard time. Learn more here.
                 null
             );
        }

         myLog("Done building entries. ")
        //old single menu item to call sectormenu(). This will be used for development and testing (hopefully in the near future)
        this.menu.addAction(
            'SectorTest',
            this.menuAction.bind(this),
            null);
        myLog("_init done.")

        /*/home/mknap/.local/share/gnome-shell/extensions/hidetopbar@mathieu.bidon.ca/panelVisibilityManager.js @380
        */
        // Main.wm.addKeybinding("shortcut-keybind",
        //     this._settings, Meta.KeyBindingFlags.NONE,
        //     ShellActionMode.NORMAL,
        //     Lang.bind(this, this._handleShortcut)
        // );

        main.notify('Sector Menu', 'Loaded .')
    }

    _onPanelStatesChanged(settings, key) {
        // Read the new settings
        this.saved = this.settings.get_value('panel-states').deep_unpack();
        // Restore or reset the panel items
        for (let name in this.states) {
            // If we have a saved state, set that
            if (name in this.saved) {
                main.panel.statusArea[name].actor.visible = this.saved[name];
            // Otherwise restore the original state
            } else {
                main.panel.statusArea[name].actor.visible = this.states[name];
            }
        }
    }

    menuAction() {
        //util.spawnCommandLine("xterm");
        //0SectorMenu.show();
        //view.show();
        this._myLog('SectorMenu:  Menu item activated');
    }

    spawnCL(input){
        myLog(ME, input);
        util.spawnCommandLine(input);
    };


    /**
     * togglePanelItem:
     * @param {string} name - name of the panel item
     *
     * Don't be a jerk to your future self; document your code!
     */
    togglePanelItem(name) {
        myLog(`SectorMenu: ${name} menu item toggled`);
        this._myLog('test')
        let statusItem = main.panel.statusArea[name];
        statusItem.actor.visible = !statusItem.actor.visible;

        // Store our saved state
        this.saved[name] = statusItem.actor.visible;

        /* From a previous example :
        try {
            let statusItem = main.panel.statusArea[name];

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
        this.settings.disconnect(this._onSettingsChangedId);

        // Store the panel settings in GSettings
        this.settings.set_value(
            'panel-states',
            new GLib.Variant('a{sb}', this.saved)
        );

        // Restore the visibility of the panel items
        for (let [name, visibility] of Object.entries(this.states)) {
            main.panel.statusArea[name].actor.visible = visibility;
        }

        // Chain-up to the super-class after we've done our own cleanup
        super.destroy();
    }
}

if (SHELL_MINOR > 30) {
    // Compatibility with gnome-shell >= 3.32
    SectorMenuIndicator = GObject.registerClass(
        {GTypeName: 'SectorMenuIndicator'},
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

    // The `main` import is an example of file that is mostly live instances of
    // objects, rather than reusable code. `Main.panel` is the actual panel you
    // see at the top of the screen.
    main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator);
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
