/* prefs.js
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

// See https://wiki.gnome.org/Projects/GnomeShell/Extensions/Writing#Preferences_Window

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Lib=Me.imports.lib;
const DEBUG = Lib.DEBUG;

const Config = imports.misc.config;

const PACKAGE_NAME = Config.PACKAGE_NAME;
const PACKAGE_VERSION = Config.PACKAGE_VERSION;


function init() {
    DEBUG(` ~-~-={ Initializing ${Me.metadata.name} Preferences }=-~-~ `);
    global.log('Sector Menu Prefs.js')
}

function buildPrefsWidget() {

    // settings, notebook container, and pages
    this.settings = Convenience.getSettings();

    // Create a parent widget that we'll return from this function
    let noteWidget = new Gtk.Notebook({
        visible: true
    });

    // tabs
    let aboutTab = new Gtk.Label({
        visible: true,
        label: 'About'
    })
    let sectorTab = new Gtk.Label({
        visible: true,
        label: 'Sector Menu Preferences'
    })
    let sectorWidget = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    })
    let frame = new Gtk.VBox({
        margin: 0,
        //column_spacing: 12,
        // row_spacing: 12,
        visible: true
    })

    let grid;
    noteWidget.append_page(frame, sectorTab)

    //some old stuff, keeping to re-use
    
        
    
    let toggleLabel = new Gtk.Label({
        label: 'Show Extension Indicator:',
        halign: Gtk.Align.START,
        visible: true
    });
    let toggle = new Gtk.Switch({
        active: this.settings.get_boolean('show-indicator'),
        halign: Gtk.Align.END,
        visible: true
    });
    this.settings.bind(
        'show-indicator',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    toggleLabel = new Gtk.Label({
        label: 'Show Favorites in menu ',
        visible: true
    });
    let favToggle = new Gtk.Switch({
        active: this.settings.get_boolean('show-favorites'),
        halign: Gtk.Align.END,
        visible: true
    })
    this.settings.bind(
        'show-favorites',
        favToggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Preference tab start:
    let hbox = new Gtk.HBox({margin_left: 18,visible: true});

    //Drawing prefs:
    let label = new Gtk.Label({
        label: '<b>Drawing preferences :</b>',
        margin: 2,
        use_markup: true,
        halign: Gtk.Align.START,
        visible: true,
    })
    frame.pack_start(label,false,false,0);

    // Reset defaults button
    hbox = new Gtk.HBox({ margin_left: 18, visible: true });
    let resetbuttonlabel = new Gtk.Label({
        label: 'Reset to defaults',
        halign: Gtk.Align.START,
        visible: true
    });
    let resetbutton = new Gtk.Button({
        label: 'Reset to Defaults',
        visible: true
    });
    resetbutton.connect('clicked', ()=>{
        this.settings.list_keys().forEach(key => {
            this.settings.reset(key)    
        })
    });
    hbox.pack_start(resetbuttonlabel, false, false, 0);
    hbox.pack_end(resetbutton, false, false, 0);
    // hbox.set_tooltip_text(
    //     this.settings.settings_schema.get_key('draw-guides').get_summary(),
    // );
    frame.pack_start(hbox, false, false, 0)
    
    //draw-guides:
    hbox = new Gtk.HBox({ margin_left: 18, visible: true });
    label = new Gtk.Label({
        label: 'Draw guidelines',
        use_markup: true,
        halign: Gtk.Align.START,
        visible: true,
    })
    toggle = new Gtk.Switch({
        active: this.settings.get_boolean('draw-guides'),
        halign: Gtk.Align.END,
        visible: true
    })
    this.settings.bind(
        'draw-guides',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    hbox.pack_start(label,false,false,0)
    hbox.pack_end(toggle,false,false,0)
    hbox.set_tooltip_text(
        this.settings.settings_schema.get_key('draw-guides').get_summary(),
    )
    frame.pack_start(hbox,false,false,0)

    //draw-at-mouse:
    hbox = new Gtk.HBox({margin_left: 18,visible: true});
    label = new Gtk.Label({
        label: 'Draw at mouse',
        use_markup: true,
        halign: Gtk.Align.START,
        visible: true,
        //font_size: 14,
    })
    toggle = new Gtk.Switch({
        active: this.settings.get_boolean('draw-at-mouse'),
        halign: Gtk.Align.END,
        valign: Gtk.Align.START,
        visible: true
    })
    this.settings.bind(
        'draw-at-mouse',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    hbox.pack_start(label,false,false,0)
    hbox.pack_end(toggle,false,false,0)
    hbox.set_tooltip_text(
        this.settings.settings_schema.get_key('draw-at-mouse').get_summary(),
    )
    frame.pack_start(hbox,false,false,0)

    hbox = new Gtk.HBox({margin_left: 18,visible: true});
    label = new Gtk.Label({
        label: 'Icon size :',
        use_markup: true,
        halign: Gtk.Align.START,
        visible: true,
    })
    let spin = new Gtk.SpinButton({
        halign: Gtk.Align.END,
        editable: true,
        visible: true,
    })
    spin.set_range(16,256);
    spin.set_increments(1,10);
    spin.set_value(this.settings.get_int('icon-size'))
    spin.connect(
        'changed',
        (a) => {
            this.settings.set_int('icon-size', a.get_value())
        })
    hbox.pack_start(label,false,false,0)
    hbox.pack_end(spin,false,false,0)
    hbox.set_tooltip_text(
        this.settings.settings_schema.get_key('icon-size').get_summary(),
    )
    frame.pack_start(hbox,false,false,0)

    //radius:
    hbox = new Gtk.HBox({margin_left: 18,visible: true});
    label = new Gtk.Label({
        label: 'Radius :',
        use_markup: true,
        halign: Gtk.Align.START,
        visible: true,
    })
    spin = new Gtk.SpinButton({
        //value: this.settings.get_value('radius'),
        halign: Gtk.Align.END,
        editable: true,
        visible: true,
    })
    spin.set_range(16,512);
    spin.set_value(this.settings.get_int('radius'))
    spin.set_increments(1,20);
    spin.connect(
        'changed',
        (a) => {
            this.settings.set_int('radius', a.get_value())
        })
    hbox.pack_start(label,false,false,0)
    hbox.pack_end(spin,false,false,0)
    hbox.set_tooltip_text(
        this.settings.settings_schema.get_key('radius').get_summary(),
    )
    frame.pack_start(hbox,false,false,0)

    //sectors:
    hbox = new Gtk.HBox({margin_left: 18,visible: true});
    label = new Gtk.Label({
        label: 'Number of sectors :',
        use_markup: true,
        halign: Gtk.Align.START,
        visible: true,
    })
    spin = new Gtk.SpinButton({
        //value: this.settings.get_value('radius'),
        halign: Gtk.Align.END,
        editable: true,
        visible: true,
    })
    spin.set_range(3,16);
    spin.set_value(this.settings.get_int('sectors'))
    spin.set_increments(1,2);
    spin.connect(
        'changed',
        (a) => {
            this.settings.set_int('sectors', a.get_value())
        })
    hbox.pack_start(label,false,false,0)
    hbox.pack_end(spin,false,false,0)
    hbox.set_tooltip_text(
        this.settings.settings_schema.get_key('sectors').get_summary(),
    )
    frame.pack_start(hbox,false,false,0)

    // custom shortcuts:  TODO: fixme.
    frame.pack_start(
        new Gtk.Label({
        label: '<b>Custom shortcuts : </b>',
        //style: 'label',
        use_markup: true,
        halign: Gtk.Align.START,
        margin: 12,
        visible: true,
    }),false,false,0)

    let menus = this.settings.get_value('menu-entries').deep_unpack();
    let name1 = new Gtk.Entry({
        //active: true,
        halign: Gtk.Align.END,
        visible: true,
        text: menus[0][0]
    })
    let cmd1 = new Gtk.Entry({
        //active: true,
        halign: Gtk.Align.END,
        visible: true,
        text: menus[0][1]
    })
    hbox = new Gtk.HBox({margin_left: 18,visible: true});
    hbox.pack_start(name1,false,false,0)
    hbox.pack_end(cmd1,false,false,0)
    frame.pack_start(hbox,false,false,0)

    //keyboard shortcut
    let key_label = new Gtk.Label({
        label: '<b>Keyboard : </b>',
        halign: Gtk.Align.START,
        use_markup : true,
        visible: true
    })
    // sectorWidget.attach(key_label, 0, 4, 1, 1);
    frame.pack_start(key_label,false,false,0);
/* ++++++++++++++++++++++++++++++++++++ Keyboard accelerator +++++
        swiped from HideTopBar prefs.js@148
        */
        {
            hbox = new Gtk.HBox({margin_left: 18,visible: true});
            let model = new Gtk.ListStore();

            model.set_column_types([
                GObject.TYPE_INT,
                GObject.TYPE_INT
            ]);
            let model_row = model.append();
            let binding = settings.get_strv('toggle-sector-menu')[0];
            let binding_key, binding_mods;
            if (binding) {
                [binding_key, binding_mods] = Gtk.accelerator_parse(binding);
            } else {
                let [binding_key, binding_mods] = [0, 0];
            }
            model.set(model_row, [0, 1], [binding_mods, binding_key]);

            let treeview = new Gtk.TreeView({ 'expand': false, 'model': model });
            let cellrend = new Gtk.CellRendererAccel({
                'editable': true,
                'accel-mode': Gtk.CellRendererAccelMode.GTK
            });

            cellrend.connect('accel-edited', function(rend, iter, binding_key, binding_mods) {
                let value = Gtk.accelerator_name(binding_key, binding_mods);
                let [succ, iterator] = model.get_iter_from_string(iter);

                if (!succ) {
                    throw new Error("Error updating keybinding");
                }

                model.set(iterator, [0, 1], [binding_mods, binding_key]);
                settings.set_strv('toggle-sector-menu', [value]);
            });

            cellrend.connect('accel-cleared', function(rend, iter, binding_key, binding_mods) {
                let [succ, iterator] = model.get_iter_from_string(iter);

                if (!succ) {
                    throw new Error("Error clearing keybinding");
                }

                model.set(iterator, [0, 1], [0, 0]);
                settings.set_strv('toggle-sector-menu', []);
            });

            let treeview_col = new Gtk.TreeViewColumn({ min_width: 200 });
            treeview_col.pack_end(cellrend, false);
            treeview_col.add_attribute(cellrend, 'accel-mods', 0);
            treeview_col.add_attribute(cellrend, 'accel-key', 1);
            treeview.append_column(treeview_col);
            treeview.set_headers_visible(false);

            hbox.pack_start(new Gtk.Label({
                label: "Key that triggers the sectors to be shown.",
                use_markup: true,
                xalign: 0
            }), true, true, 0);
            hbox.pack_end(treeview, false, true, 0);

            settings.connect('changed::toggle-sector-menu', function(k, b) {
                let model_row = model.get(0);
                model.set(model_row, [0, 1], settings.get_strv(b));
            });

            //settings_vbox.pack_start(settings_hbox, false, false, 3);
            hbox.show_all();
            // sectorWidget.attach(settings_hbox, 0, 5, 1, 1);
            frame.pack_start(hbox,false,false,0)
            frame.show_all();
        }

/* ++++++++++++++++++++++++++++++++++++ End: Keyboard accelerator +++++ */


    //aboutWidget :
    grid = new Gtk.Grid({
        visible: true,
        row_spacing : 6,
        column_spacing : 8,
    });
    let name, icon, meta, desc;
    name = new Gtk.Label({
        name: "large-label",
        visible : true,
        margin : 12,
        label : "Sector Menu",
        single_line_mode : true,
        //font-size: 24,
        // font: "Sans Bold 40"
    })
    icon = new Gtk.Image({
        file: `${Me.path}/ui/icons/sector-icon.svg`,
        // style_class: 'system-status-icon',
        visible: true,
        pixel_size: 0,
        icon_size: 0,
        margin: 12,
        halign: Gtk.Align.START,
        valign: Gtk.Align.START,
    })
    meta = new Gtk.Label({
        name: 'meta-information',
        visible: true,
        margin: 12,
        label: 'name: ' + Me.metadata['name'] +
        '\n version: ' +
        Me.metadata['version'] +
        '\n' + PACKAGE_NAME +
        ' Version ' + PACKAGE_VERSION +
        '\n uuid: ' + Me.metadata['uuid'] +
        '\n setting-schema: ' + Me.metadata['settings-schema'] +
        '\n\n Copyright Mike Knap' +
        '\n url: '+ Me.metadata['url'],
        single_line_mode: false,

    })
    desc=new Gtk.Label({
        visible: true,
        margin: 32,
        label: Me.metadata['description'],
        wrap: true,
        use_markup: true,
    })




    // DEBUG(v)

    // grid.attach (widget,col,row,width,height)
    grid.attach(name,0,0,2,1);
    grid.attach(icon,0,1,1,1);
    grid.attach(meta,1,1,1,1);
    grid.attach(desc,0,2,2,1);

    noteWidget.append_page(grid, aboutTab)

    // Return our widget which will be added to the window
    return noteWidget;
}
