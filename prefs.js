// Preferences for my extension. Example from  example
// https://wiki.gnome.org/Projects/GnomeShell/Extensions/Writing#Preferences_Window

'use strict';  // Is this really neccessary?

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ME = Me.metadata.name;

// Like `extension.js` this is used for any one-time setup like translations.
function init() {
    log(`initializing ${Me.metadata.name} Preferences`);
}

// This function is called when the preferences window is first created to build
// and return a Gtk widget. As an example we'll create and return a GtkLabel.
function buildPrefsWidget() {
    // This could be any GtkWidget subclass, although usually you would choose
    // something like a GtkGrid, GtkBox or GtkNotebook
    // let prefsWidget = new Gtk.Label({
    //     label: `${Me.metadata.name} version ${Me.metadata.version}`,
    //     visible: true
    // });

    // Copy the same GSettings code from `extension.js`
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );
    this.settings = new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.sectormenu', true)
    });

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });

    // Add a simple title and add it to the prefsWidget
    let title = new Gtk.Label({
        // As described in "Extension Translations", the following template
        // lit
        // prefs.js:88: warning: RegExp literal terminated too early
        //label: `<b>${Me.metadata.name} Extension Preferences</b>`,
        label: '<b>' + ME + ' Preferences</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(title, 0, 0, 2, 1);

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

    // Create a label & switch for `show-indicator`
    let toggleLabel = new Gtk.Label({
        label: 'Show Extension Indicator:',
        halign: Gtk.Align.START,
        visible: true
    });
    prefsWidget.attach(toggleLabel, 0, 2, 1, 1);

    let toggle = new Gtk.Switch({
        active: this.settings.get_boolean ('show-indicator'),
        halign: Gtk.Align.END,
        visible: true
    });
    prefsWidget.attach(toggle, 1, 2, 1, 1);

    // Create a label for Menu Items
    let menuLabel = new Gtk.Label({
        label: 'Menu Items:',
        halign: Gtk.Align.START,
        visible: true
    })
    prefsWidget.attach(menuLabel,0,3,1,1)

    //Create a label for 1 entry with text boxes to adjust the entry
    ////////////////////////////////////////////////////////////////////
    let menus=this.settings.get_value('menu-entries').deep_unpack();
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
    prefsWidget.attach(name1, 1, 3, 1, 1);
    prefsWidget.attach(cmd1, 2, 3, 1, 1);


    /////////////////////////////////////////////////////////////////////
    // For testing purposes,
    //Create a label for ANOTHER entry with text boxes to adjust the entry
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
    prefsWidget.attach(name2, 1, 4, 1, 1);
    prefsWidget.attach(cmd2, 2, 4, 1, 1);

    // Bind the text of the gtk entries to our settings. Does this "save" the settings?


    // Bind the switch to the `show-indicator` key
    this.settings.bind(
        'show-indicator',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Return our widget which will be added to the window
    return prefsWidget;
}
