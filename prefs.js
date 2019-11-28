// Preferences for my extension. Example from  example
// https://wiki.gnome.org/Projects/GnomeShell/Extensions/Writing#Preferences_Window

'use strict'; // Is this really neccessary?

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ME = Me.metadata.name;
const Convenience = Me.imports.convenience;

// Like `extension.js` this is used for any one-time setup like translations.
function init() {
    log(`initializing ${Me.metadata.name} Preferences`);
}

// This function is called when the preferences window is first created to build
// and return a Gtk widget. As an example we'll create and return a GtkLabel.
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
    let aboutWidget = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    })
    let sectorWidget = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    })

    noteWidget.append_page(sectorWidget, sectorTab)
    noteWidget.append_page(prefsWidget, prefsTab)
    noteWidget.append_page(aboutWidget, aboutTab)

    // Reset Button
    {
        // let title = new Gtk.Label({
        //     // As described in "Extension Translations", the following template
        //     // lit
        //     // prefs.js:88: warning: RegExp literal terminated too early
        //     //label: `<b>${Me.metadata.name} Extension Preferences</b>`,
        //     label: '<b>' + ME + ' Preferences</b>',
        //     halign: Gtk.Align.START,
        //     use_markup: true,
        //     visible: true
        // });
        // prefsWidget.attach(title, 0, 0, 2, 1);

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
        let menuLabel = new Gtk.Label({
            label: 'Menu Items:',
            halign: Gtk.Align.START,
            visible: true
        })
        sectorWidget.attach(menuLabel, 0, 0, 2, 1)

        //Create a label for 1 entry with text boxes to adjust the entry
        ////////////////////////////////////////////////////////////////////
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
        sectorWidget.attach(name1, 0, 1, 1, 1);
        sectorWidget.attach(cmd1, 1, 1, 1, 1);


        /////////////////////////////////////////////////////////////////////
        // For testing purposes,
        // And we will see how the entries are saved in our schema.
        ////////////////////////////////////////////////////////////////////
        let name2 = new Gtk.Entry({
            //active: true,
            halign: Gtk.Align.END,
            visible: true,
        })
        let cmd2 = new Gtk.Entry({
            //active: true,
            halign: Gtk.Align.END,
            visible: true,
        })
        sectorWidget.attach(name2, 0, 2, 1, 1);
        sectorWidget.attach(cmd2, 1, 2, 1, 1);

        // Bind the text of the gtk entries to our settings. Does this "save" the settings?

        ////////////////////////////////////////////////////////////////////////////
        // Keybinding . man I want to figure this out!
        ////////////////////////////////////////////////////////////////////////////
        let key_label = new Gtk.Label({
            label: 'keybinding to run menuitem 1:',
            halign: Gtk.Align.START,
            visible: true
        })
        let key_entry = new Gtk.Entry({
            //active: true,
            halign: Gtk.Align.END,
            visible: true,
        })
        sectorWidget.attach(key_label, 0, 4, 1, 1);
        sectorWidget.attach(key_entry, 1, 4, 1, 1);
        // bind the text of the keyboard shortcut to the schema 'keybinding' key
        this.settings.bind(
            'keybinding',
            key_entry,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
    // Return our widget which will be added to the window
    return noteWidget;
}
