window.tabular = {
	/*
	 * table2CSV
	 * 	Given a table element (or jQuery-selected table), returns a string which can
	 * 	be used as download URL for the table in CSV format. No server required.
	 * 	Optionally, you can also pass a string to be used as a delimiter between the
	 * 	cells in the output. Any instances of this string will be removed from the
	 * 	cells to allow a spreadsheet program to parse it properly, but it may cause
	 * 	some degradation in the data. For example, if the parameter is excluded, all
	 * 	commas will be removed which may cause some loss of grammatical correctness,
	 * 	large numeral readability, etc.
	 */

	table2CSV : function(table, delim) {
		if (!delim) {
			delim = ",";
		}

		var tableHTML = table.innerHTML;
		var rows = tableHTML.split(/\s*<\s*\/tr[^>]*>\s*<\s*tr[^>]*>\s*/g);
		var csv = "";

		for (var i = 0; i < rows.length; i++) {
			var cells = rows[i].split(/\s*<\s*\/t[hd]{1}[^>]*>\s*<\s*t[hd]{1}[^>]*>\s*/g);
			for (var j = 0; j < cells.length; j++){
				cells[j] = cells[j].replace(new RegExp(delim, "g"), "");
			}
			csv += cells.join(delim) + "\n";
		}

		return csv.replace(/<[^>]*>/g, "");
	},

	downloadTable : function(table, format, send) {
		if(!format){
			format = "csv";
		}
		var url = "data:";
		switch (format){
			case "csv":
			default:
				url+="application/csv;charset=utf-8," + encodeURI(tabular.table2CSV(table));
			break;
		}
		if(send){
			window.open(url);	
		} else {
			return url;
		}
	},

	/*
	 * csv2Table
	 * 	Given a CSV String, Return an HTML Table String.
	 * 	Arguments:
	 * 		csv - a CSV String
	 * 		[OPTIONAL] delim - a Delimiter String, defaults to comma (,)
	 * 		[OPTIONAL] headers - Does this CSV String include a row of headers?
	 */

	csv2Table : function(csv, delim, headers) {
		if (!delim) {
			delim = ",";
		}
		if (headers !== false) {
			headers = true;
		}

		var table = "<table><thead>";
		var rows = csv.trim().split(/\n/);
		var d = new RegExp(delim, "g");
		var i = 0;

		if (headers) {
			table += "<tr><th>" + rows[0].replace(d, "</th><th>") + "</th></tr>";
			i++;
		}
		table += "</thead><tbody>";
		for (i; i < rows.length; i++) {
			table += "<tr><td>" + rows[i].replace(d, "</td><td>") + "</td></tr>";
		}

		return table += "</tbody><tfoot></tfoot></table>";
	}
};
