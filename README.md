Tabular.js
==========

A small Javascript library for playing with CSVs.

by Tony Boyles<AABoyles@gmail.com>

Licensed under the GNU GPL 3 or later

USE
---

To Use Tabular.js, just source the library however you prefer:

    <script src="tabular.js"></script>

And then access the power of tabular.js by calling the global object it creates (creatively called "tabular"):

    console.log(tabular);

Try putting your tab-delimited data in an element you can select using Javascript:

    var container = document.getElementById("csv");
    var tabbedData = container.innerHTML;
    var tableHTML = tabular.csv2Table(tabbedData);
    container.innerHTML = tableHTML;

If you use the jQuery plugin, you can cut that whole block to a single line:

    $("#csv").csv2Table();

Full Documentation coming soon, but for now, here's what's implemented:

    tabular = {
        table2Array: function(table){}, //Given a table element, return a 2-dimensional array
        table2Object: function(table){}, //Given a table element, return an array of objects mapping the first row (presumably titles) to the given row's corresponding value
        table2CSV: function(table){}, //Given a table Element, return a CSV string
        table2CSVURL: function(table){}, //Given a table Element, return a URL-encoded version of the CSV string representation to allow downloading of the data direct from the browser (no server required)
        csv2Table: function(csv, delim, headers){}, //Given a CSV string, a delimiter string, and a boolean indicating the presence of headers in the CSV string, return an HTML table string
        csv2Array: function(csv, delim){}, //Not yet implemented
        csv2Object: function(csv, delim){} //Not yet implemented
    }

And here's what's currently available with the jQuery Plugin:

    $ = {
        csv2Table: function(delim, headers){}, //Transforms the element upon which it was called into a table
        table2CSV: function(delim){}, //Returns an array of each element selected, tables' contents CSV-encoded
        downloadTable: function(format, send){} // Returns an array of URL-encoded CSV Strings for use in downloadable links.
    }

LICENSE
-------
    This program is free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by the Free
    Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
    FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
    more details <http://www.gnu.org/licenses/>.
