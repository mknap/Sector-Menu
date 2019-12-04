// Preferences for my extension. Example from  example
// https://wiki.gnome.org/Projects/GnomeShell/Extensions/Writing#Preferences_Window

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ME = Me.metadata.name;
const Convenience = Me.imports.convenience;

function init() {
    log(`initializing ${Me.metadata.name} Preferences`);
}

function buildPrefsWidget() {

    // settings, notebook container, and pages
    this.settings = Convenience.getSettings();

    // Create a parent widget that we'll return from this function
    let noteWidget = new Gtk.Notebook({
        visible: true
    });

    let prefsTab = new Gtk.Label({
        visible: true,
        label: 'Panel Indicator Settings'
    })
    let aboutTab = new Gtk.Label({
        visible: true,
        label: 'About'
    })
    let sectorTab = new Gtk.Label({
        visible: true,
        label: 'Sector Menu Preferences'
    })

    let prefsWidget = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });
    // let aboutWidget = new Gtk.Grid({
    //     margin: 18,
    //     column_spacing: 12,
    //     row_spacing: 12,
    //     visible: true
    // })
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


    noteWidget.append_page(frame, sectorTab)
    noteWidget.append_page(prefsWidget, prefsTab)


    // prefsWidget:
    {
        // The Reset Button
        // Create a label to describe our button and add it to the prefsWidget
        let buttonLabel = new Gtk.Label({
            label: 'Reset Panel Items:',
            halign: Gtk.Align.START,
            visible: true
        });
        prefsWidget.attach(buttonLabel, 0, 1, 1, 1);

        // Create a 'Reset' button and add it to the prefsWidget
        let button = new Gtk.Button({
            label: 'Reset Panel',
            visible: true
        });
        prefsWidget.attach(button, 1, 1, 1, 1);

        // Connect the ::clicked signal to reset the stored settings
        button.connect('clicked', (button) => this.settings.reset('panel-states'));
    }
    // Toggle Switches to show the indicator, panel items, favorites, etc
    {
        let toggleLabel = new Gtk.Label({
            label: 'Show Extension Indicator:',
            halign: Gtk.Align.START,
            visible: true
        });
        prefsWidget.attach(toggleLabel, 0, 2, 1, 1);
        let toggle = new Gtk.Switch({
            active: this.settings.get_boolean('show-indicator'),
            halign: Gtk.Align.END,
            visible: true
        });
        prefsWidget.attach(toggle, 1, 2, 1, 1);
        // Bind the switch to the `show-indicator` key
        this.settings.bind(
            'show-indicator',
            toggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        // Made my own setting here for learning purposes.
        // the label seems to be able to be reused; it might just be better to do it inline on the .attach()
        // alignment was necessary for the switch to look correct
        // the schema had to be in place for the widget to show
        toggleLabel = new Gtk.Label({
            label: 'Show Favorites in menu ',
            visible: true
        });
        let favToggle = new Gtk.Switch({
            active: this.settings.get_boolean('show-favorites'),
            halign: Gtk.Align.END,
            visible: true
        })
        prefsWidget.attach(toggleLabel, 0, 3, 1, 1);
        prefsWidget.attach(favToggle, 1, 3, 1, 1);
        this.settings.bind(
            'show-favorites',
            favToggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

    }
    // Sector Prefereces tab
    {
        // let frame = new Gtk.VBox({}),
        //     lineitem,
        //     label;
        let hbox = new Gtk.HBox({margin: 18,visible: true});
        //Drawing prefs:
        let label = new Gtk.Label({
            label: '<b>Drawing preferences :</b>',
            use_markup: true,
            halign: Gtk.Align.START,
            visible: true,
        })
        frame.pack_start(label,false,false,0);

        //draw-guides:
        label = new Gtk.Label({
            label: 'Draw guidelines',
            use_markup: true,
            halign: Gtk.Align.START,
            visible: true,
        })
        let toggle = new Gtk.Switch({
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
        frame.pack_start(hbox,false,false,0)

        //draw-at-mouse:
        hbox = new Gtk.HBox();
        label = new Gtk.Label({
            label: 'Draw the sector menu at mouse',
            use_markup: true,
            halign: Gtk.Align.START,
            visible: true,
        })
        toggle = new Gtk.Switch({
            active: this.settings.get_boolean('draw-at-mouse'),
            halign: Gtk.Align.END,
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
        frame.pack_start(hbox,false,false,0)

        //TODO: Fix the iconsize in fullscreen.js
        //icon-size:
        hbox = new Gtk.HBox();
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
        spin.set_increments(2,16);
        spin.set_value(this.settings.get_int('icon-size'))
        spin.connect(
            'changed',
            (a) => {
                this.settings.set_int('icon-size', a.get_value())
            })
        hbox.pack_start(label,false,false,0)
        hbox.pack_end(spin,false,false,0)
        frame.pack_start(hbox,false,false,0)

        //radius:
        hbox = new Gtk.HBox();
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
        spin.set_increments(2,16);
        spin.connect(
            'changed',
            (a) => {
                this.settings.set_int('radius', a.get_value())
            })
        hbox.pack_start(label,false,false,0)
        hbox.pack_end(spin,false,false,0)
        frame.pack_start(hbox,false,false,0)

        //sectors:
        hbox = new Gtk.HBox();
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
        frame.pack_start(hbox,false,false,0)

    // sectorWidget.add(label);

    //     label = new Gtk.Label({
    //         //style_class: 'label',
    //         label: '<b>test</b>',
    //         use_markup: true,
    //         halign: Gtk.Align.START,
    //         visible: true,
    // })
    //     frame.pack_start(label,false,false,0);

        //Custom chortcuts:

        // let menuLabel = new Gtk.Label({
        //     label: "<b>Custom shortcuts:</b>",
        //     use_markup: true,
        //     halign: Gtk.Align.START,
        //     visible: true
        // })
        // sectorWidget.attach(menulabel, 0, 0, 2, 1)

        frame.pack_start(
            new Gtk.Label({
            label: '<b>Custom shortcuts : </b>',
            //style: 'label',
            use_markup: true,
            halign: Gtk.Align.START,
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
        hbox=new Gtk.HBox()
        hbox.pack_start(name1,false,false,0)
        hbox.pack_end(cmd1,false,false,0)
        frame.pack_start(hbox,false,false,0)

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
            let settings_hbox = new Gtk.HBox();
            let model = new Gtk.ListStore();

            model.set_column_types([
                GObject.TYPE_INT,
                GObject.TYPE_INT
            ]);
            let model_row = model.append();
            let binding = settings.get_strv('keybinding')[0];
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
                settings.set_strv('keybinding', [value]);
            });

            cellrend.connect('accel-cleared', function(rend, iter, binding_key, binding_mods) {
                let [succ, iterator] = model.get_iter_from_string(iter);

                if (!succ) {
                    throw new Error("Error clearing keybinding");
                }

                model.set(iterator, [0, 1], [0, 0]);
                settings.set_strv('keybinding', []);
            });

            let treeview_col = new Gtk.TreeViewColumn({ min_width: 200 });
            treeview_col.pack_end(cellrend, false);
            treeview_col.add_attribute(cellrend, 'accel-mods', 0);
            treeview_col.add_attribute(cellrend, 'accel-key', 1);
            treeview.append_column(treeview_col);
            treeview.set_headers_visible(false);

            settings_hbox.pack_start(new Gtk.Label({
                label: "Key that triggers the bar to be shown.",
                use_markup: true,
                xalign: 0
            }), true, true, 0);
            settings_hbox.pack_end(treeview, false, true, 0);

            settings.connect('changed::keybinding', function(k, b) {
                let model_row = model.get(0);
                model.set(model_row, [0, 1], settings.get_strv(b));
            });

            //settings_vbox.pack_start(settings_hbox, false, false, 3);
            settings_hbox.show_all();
            // sectorWidget.attach(settings_hbox, 0, 5, 1, 1);
            frame.pack_start(settings_hbox,false,false,0)
            frame.show_all();
        }

/* ++++++++++++++++++++++++++++++++++++ End: Keyboard accelerator +++++ */

    }

    //aboutWidget :
    let grid = new Gtk.Grid({
        visible: true,
        row_spacing : 6,
        column_spacing : 8,
    });
    let name, icon, meta, desc;
    name = new Gtk.Label({
        visible : true,
        margin : 12,
        label : "Sector Menu",
        single_line_mode : true,
        // font: "Sans Bold 40"
    })
    icon = new Gtk.Image({
        file: `${Me.path}/icons/sector-icon.svg`,
        style_class: 'system-status-icon',
        visible: true,
        pixel_size: 16,
        icon_size: 20,
        halign: Gtk.Align.START,
        valign: Gtk.Align.START,
    })
    desc=new Gtk.Label({
        visible: true,
        margin: 32,
        label: Me.metadata['description'],
        wrap: true,
        use_markup: true,
    })



    grid.attach(name,0,0,1,2);
    grid.attach(icon,0,1,1,1);

    grid.attach(desc,1,0,2,2)

    noteWidget.append_page(grid, aboutTab)
    // Return our widget which will be added to the window
    return noteWidget;
}
