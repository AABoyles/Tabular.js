$(function() {
	jQuery.fn.extend({
		/*
		 * csv2Table jQuery Plugin
		 * 	If selected jQuery elements contain CSV Strings, transforms elements into HTML Tables.
		 * 	Arguments:
		 * 		[OPTIONAL] delim - A delimiter String
		 * 		[OPTIONAL] headers - Boolean: Does this CSV String include a row of headers?
		 */

		csv2Table : function(delim, headers) {
			return this.each(function() {
				$this = jQuery(this);
				$this.html(tabular.csv2Table($this.text(), delim, headers));
			});
		},

		/*
		 * table2CSV jQuery Plugin
		 *
		 */
		table2CSV : function(delim) {
			var ret = [];
			this.each(function() {
				ret.push(tabular.table2CSV(this, delim));
			});
			return ret;
		},

		downloadTable : function(format, send) {
			var ret = [];
			this.each(function() {
				ret.push(tabular.downloadTable(this, format, send));
			});
			return ret;
		}
	});
});
