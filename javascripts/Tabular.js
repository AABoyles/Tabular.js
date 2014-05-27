window.tabular = {};

tabular.table2Array = function(table) {
  var i = 0;
  var rowEls = table.getElementsByTagName("tr");
  var rows = [];
  var rawcells = rowEls[0].getElementsByTagName("th");
  if (rawcells.length > 0) {
    var row = [];
    for (var j = 0; j < rawcells.length; j++) {
      row.push(rawcells[j].innerHTML.trim());
    }
    rows.push(row);
    i++;
  }
  for (i; i < rowEls.length; i++) {
    var row = [];
    rawcells = rowEls[i].getElementsByTagName("td");
    for (var j = 0; j < rawcells.length; j++) {
      row.push(rawcells[j].innerHTML.trim());
    }
    rows.push(row);
  }
  return rows;
};

tabular.table2Object = function(table) {
  var rowEls = table.getElementsByTagName("tr");
  var rawcells = rowEls[0].getElementsByTagName("th");
  var titles = [];
  if (rawcells.length > 0) {
    for (var j = 0; j < rawcells.length; j++) {
      titles.push(rawcells[j].innerHTML.trim());
    }
  }
  var rows = [];
  for (var i = 1; i < rowEls.length; i++) {
    var row = {};
    rawcells = rowEls[i].getElementsByTagName("td");
    for (var j = 0; j < rawcells.length; j++) {
      row[titles[j]] = rawcells[j].innerHTML.trim();
    }
    rows.push(row);
  }
  return rows;
};

/*
 * table2CSV
 * 	Given a table element, returns a CSV-formatted string.
 *
 * 	Optionally, you can also pass a string to be used as a delimiter between the
 * 	cells in the output. Any instances of this string will be removed from the
 * 	cells to allow a spreadsheet program to parse it properly, but it may cause
 * 	some degradation in the data. For example, if the parameter is excluded, all
 * 	commas will be removed which may cause some loss of grammatical correctness,
 * 	large numeral readability, etc.
 */
tabular.table2CSV = function(table, delim) {
  delim = (typeof delim == "undefined") ? "," : delim;
  var array = tabular.table2Array(table);
  var csv = "";
  array.forEach(function(row){
  	csv += row.join(delim) + "\n";
  });
  return csv.slice(0,-1);
};

/*
 * table2CSVURL
 * 	Given a table element, returns a CSV-formatted, URI-encoded string.
 */
tabular.table2CSVURL = function(table, delim) {
  return "data:application/csv;charset=utf-8," + encodeURI(tabular.table2CSV(table, delim));
};

/*
 * csv2Array
 * 	Given a CSV String, Return a parsed array of Arrays.
 * 	Arguments:
 * 		csv - a CSV String
 * 		[OPTIONAL] delim - a Delimiter String, defaults to comma (,)
 */
tabular.csv2Array = function(csv, delim) {
	COMMA = (typeof delim != "undefined") ? delim : ",";
	return tabular.parse(csv);
};

tabular.csv2ObjectArray = function(csv, delim) {
	var data = tabular.parse(csv, delim);
	return data.slice(1).map(function(row, i){
		var temp = {};
		for(j = 0; j < row.length; j++){
			temp[data[0][j]] = row[j];
		}
		return temp;
	});
};

/*
 * csv2Table
 * 	Given a CSV String, Return an HTML Table String.
 * 	Arguments:
 * 		csv - a CSV String
 * 		[OPTIONAL] delim - a Delimiter String, defaults to comma (,)
 * 		[OPTIONAL] headers - Does this CSV String include a row of headers?
 */
tabular.csv2Table = function(csv, delim, headers) {
  var tableArray = tabular.csv2Array(csv);
  if (headers !== false) {
    headers = true;
  }
  var table = "<table><thead>";
  var i = 0;
  if (headers) {
    table += "<tr><th>" + tableArray[i++].join("</th><th>") + "</th></tr>";
  }
  table += "</thead><tbody>";
  for (i; i < tableArray.length; i++) {
    table += "<tr><td>" + tableArray[i].join("</td><td>") + "</td></tr>";
  }
  return table += "</tbody><tfoot></tfoot></table>";
};

tabular.RELAXED = true;
tabular.IGNORE_RECORD_LENGTH = false;
tabular.IGNORE_QUOTES = false;
tabular.LINE_FEED_OK = true;
tabular.CARRIAGE_RETURN_OK = true;
tabular.DETECT_TYPES = true;
tabular.IGNORE_QUOTE_WHITESPACE = true;
tabular.DEBUG = false;
tabular.ERROR_EOF = "UNEXPECTED_END_OF_FILE";
tabular.ERROR_CHAR = "UNEXPECTED_CHARACTER";
tabular.ERROR_EOL = "UNEXPECTED_END_OF_RECORD";
tabular.WARN_SPACE = "UNEXPECTED_WHITESPACE";

var QUOTE = "\"", CR = "\r", LF = "\n", COMMA = ",", SPACE = " ", TAB = "\t";

// states
var PRE_TOKEN = 0, MID_TOKEN = 1, POST_TOKEN = 2, POST_RECORD = 4;

/**
 * @name tabular.parse
 * @function
 * @description rfc4180 standard csv parse
 * with options for strictness and data type conversion
 * By default, will automatically type-cast numeric an boolean values.
 * @param {String} str A csv string
 * @return {Array} An array records, each of which is an array of scalar values.
 * @example
 * // simple
 * var rows = tabular.parse("one,two,three\nfour,five,six")
 * // rows equals [["one","two","three"],["four","five","six"]]
 * @see http://www.ietf.org/rfc/rfc4180.txt
 */
tabular.parse = function(str) {
  var result = tabular.result = [];
  tabular.offset = 0;
  tabular.str = str;
  tabular.record_begin();
  tabular.debug("parse()", str);

  var c;
  while (1) {
    // pull char
    c = str[tabular.offset++];
    tabular.debug("c", c);

    // detect eof
    if (c == null) {
      if (tabular.escaped)
        tabular.error(tabular.ERROR_EOF);

      if (tabular.record) {
        tabular.token_end();
        tabular.record_end();
      }

      tabular.debug("...bail", c, tabular.state, tabular.record);
      tabular.reset();
      break;
    }

    if (tabular.record == null) {
      // if relaxed mode, ignore blank lines
      if (tabular.RELAXED && (c == LF || c == CR && str[tabular.offset + 1] == LF)) {
        continue;
      }
      tabular.record_begin();
    }

    // pre-token: look for start of escape sequence
    if (tabular.state == PRE_TOKEN) {

      if ((c === SPACE || c === TAB) && tabular.next_nonspace() == QUOTE) {
        if (tabular.RELAXED || tabular.IGNORE_QUOTE_WHITESPACE) {
          continue;
        } else {
          // not technically an error, but ambiguous and hard to debug otherwise
          tabular.warn(tabular.WARN_SPACE);
        }
      }

      if (c == QUOTE && !tabular.IGNORE_QUOTES) {
        tabular.debug("...escaped start", c);
        tabular.escaped = true;
        tabular.state = MID_TOKEN;
        continue;
      }
      tabular.state = MID_TOKEN;
    }

    // mid-token and escaped, look for sequences and end quote
    if (tabular.state == MID_TOKEN && tabular.escaped) {
      if (c == QUOTE) {
        if (str[tabular.offset] == QUOTE) {
          tabular.debug("...escaped quote", c);
          tabular.token += QUOTE;
          tabular.offset++;
        } else {
          tabular.debug("...escaped end", c);
          tabular.escaped = false;
          tabular.state = POST_TOKEN;
        }
      } else {
        tabular.token += c;
        tabular.debug("...escaped add", c, tabular.token);
      }
      continue;
    }

    // fall-through: mid-token or post-token, not escaped
    if (c == CR) {
      if (str[tabular.offset] == LF)
        tabular.offset++;
      else if (!tabular.CARRIAGE_RETURN_OK)
        tabular.error(tabular.ERROR_CHAR);
      tabular.token_end();
      tabular.record_end();
    } else if (c == LF) {
      if (!(tabular.LINE_FEED_OK || tabular.RELAXED))
        tabular.error(tabular.ERROR_CHAR);
      tabular.token_end();
      tabular.record_end();
    } else if (c == COMMA) {
      tabular.token_end();
    } else if (tabular.state == MID_TOKEN) {
      tabular.token += c;
      tabular.debug("...add", c, tabular.token);
    } else if (c === SPACE || c === TAB) {
      if (!tabular.IGNORE_QUOTE_WHITESPACE)
        tabular.error(tabular.WARN_SPACE);
    } else if (!tabular.RELAXED) {
      tabular.error(tabular.ERROR_CHAR);
    }
  }
  return result;
};

tabular.reset = function() {
  tabular.state = null;
  tabular.token = null;
  tabular.escaped = null;
  tabular.record = null;
  tabular.offset = null;
  tabular.result = null;
  tabular.str = null;
};

tabular.next_nonspace = function() {
  var i = tabular.offset;
  var c;
  while (i < tabular.str.length) {
    c = tabular.str[i++];
    if (!(c == SPACE || c === TAB )) {
      return c;
    }
  }
  return null;
};

tabular.record_begin = function() {
  tabular.escaped = false;
  tabular.record = [];
  tabular.token_begin();
  tabular.debug("record_begin");
};

tabular.record_end = function() {
  tabular.state = POST_RECORD;
  if (!(tabular.IGNORE_RECORD_LENGTH || tabular.RELAXED) && tabular.result.length > 0 && tabular.record.length != tabular.result[0].length) {
    tabular.error(tabular.ERROR_EOL);
  }
  tabular.result.push(tabular.record);
  tabular.debug("record end", tabular.record);
  tabular.record = null;
};

tabular.resolve_type = function(token) {
  if (token.match(/^\d+(\.\d+)?$/)) {
    token = parseFloat(token);
  } else if (token.match(/^true|false$/i)) {
    token = Boolean(token.match(/true/i));
  } else if (token === "undefined") {
    token = undefined;
  } else if (token === "null") {
    token = null;
  }
  return token;
};

tabular.token_begin = function() {
  tabular.state = PRE_TOKEN;
  tabular.token = "";
};

tabular.token_end = function() {
  if (tabular.DETECT_TYPES) {
    tabular.token = tabular.resolve_type(tabular.token);
  }
  tabular.record.push(tabular.token);
  tabular.debug("token end", tabular.token);
  tabular.token_begin();
};

tabular.debug = function() {
  if (tabular.DEBUG)
    console.log(arguments);
};

tabular.dump = function(msg) {
  return [msg, "at char", tabular.offset, ":", tabular.str.substr(tabular.offset - 50, 50).replace(/\r/mg, "\\r").replace(/\n/mg, "\\n").replace(/\t/mg, "\\t")].join(" ");
};

tabular.error = function(err) {
  var msg = tabular.dump(err);
  tabular.reset();
  throw msg;
};

tabular.warn = function(err) {
  var msg = tabular.dump(err);
  try {
    console.warn(msg);
    return;
  } catch (e) {
  }
  try {
    console.log(msg);
  } catch (e) {
  }
};
