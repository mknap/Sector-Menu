/* lib.js
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
 * MERCHANTABILITY o_r FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension()

/* debug level enumeration
 * mostly for me to learn

Least log content
o : no logging - silence,only errors
1 : warnings - and explicit log statements
2 : informational- entering methods for example
3 : verbose - events, signals
Most log content

*/


var debug = true;

var DEBUG = function (message1,message2,level) {
    // Enable for debugging purposes.
    // TODO : make this more versatile with options, info, warn, etc.
    if(debug) {
        if(!message2) message2=""
        else message2= ", " + message2;
        global.log( "[" + Me.metadata.name + "] " + message1 + message2) ;
    }
}
