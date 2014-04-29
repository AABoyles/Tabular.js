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
  table = tabular.table2Array();
  if (!delim) {
    delim = ",";
  }
  var regex = new RegExp(delim, "g");
  var csv = "";
  for (var i = 0; i < table.length; i++) {
    for (var j = 0; j < table[i].length; j++) {
      textcells[j] = table[i][j].replace(regex, "");
    }
    csv += textcells.join(delim) + "\n";
  }
  return csv;
};

/*
 * table2CSVURL
 * 	Given a table element, returns a CSV-formatted, URI-encoded string.
 */
tabular.table2CSVURL = function(table, format) {
  if (!format) {
    format = "csv";
  }
  var url = "data:";
  switch (format) {
    case "csv":
    default:
      url += "application/csv;charset=utf-8," + encodeURI(tabular.table2CSV(table));
      break;
  }
  return url;
};

/*
 * csv2Table
 * 	Given a CSV String, Return an HTML Table String.
 * 	Arguments:
 * 		csv - a CSV String
 * 		[OPTIONAL] delim - a Delimiter String, defaults to comma (,)
 * 		[OPTIONAL] headers - Does this CSV String include a row of headers?
 */
tabular.csv2Array = function(csv, delim, headers) {
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

tabular.csv2Object = function(csv) {

};

tabular.parser = {};
tabular.parser.RELAXED = true;
tabular.parser.IGNORE_RECORD_LENGTH = false;
tabular.parser.IGNORE_QUOTES = false;
tabular.parser.LINE_FEED_OK = true;
tabular.parser.CARRIAGE_RETURN_OK = true;
tabular.parser.DETECT_TYPES = true;
tabular.parser.IGNORE_QUOTE_WHITESPACE = true;
tabular.parser.DEBUG = false;
tabular.parser.ERROR_EOF = "UNEXPECTED_END_OF_FILE";
tabular.parser.ERROR_CHAR = "UNEXPECTED_CHARACTER";
tabular.parser.ERROR_EOL = "UNEXPECTED_END_OF_RECORD";
tabular.parser.WARN_SPACE = "UNEXPECTED_WHITESPACE";

var QUOTE = "\"", CR = "\r", LF = "\n", COMMA = ",", SPACE = " ", TAB = "\t";

// states
var PRE_TOKEN = 0, MID_TOKEN = 1, POST_TOKEN = 2, POST_RECORD = 4;

/**
 * @name tabular.parser.parse
 * @function
 * @description rfc4180 standard csv parse
 * with options for strictness and data type conversion
 * By default, will automatically type-cast numeric an boolean values.
 * @param {String} str A csv string
 * @return {Array} An array records, each of which is an array of scalar values.
 * @example
 * // simple
 * var rows = tabular.parser.parse("one,two,three\nfour,five,six")
 * // rows equals [["one","two","three"],["four","five","six"]]
 * @see http://www.ietf.org/rfc/rfc4180.txt
 */
tabular.parser.parse = function(str) {
  var result = tabular.parser.result = [];
  tabular.parser.offset = 0;
  tabular.parser.str = str;
  tabular.parser.record_begin();

  tabular.parser.debug("parse()", str);

  var c;
  while (1) {
    // pull char
    c = str[tabular.parser.offset++];
    tabular.parser.debug("c", c);

    // detect eof
    if (c == null) {
      if (tabular.parser.escaped)
        tabular.parser.error(tabular.parser.ERROR_EOF);

      if (tabular.parser.record) {
        tabular.parser.token_end();
        tabular.parser.record_end();
      }

      tabular.parser.debug("...bail", c, tabular.parser.state, tabular.parser.record);
      tabular.parser.reset();
      break;
    }

    if (tabular.parser.record == null) {
      // if relaxed mode, ignore blank lines
      if (tabular.parser.RELAXED && (c == LF || c == CR && str[tabular.parser.offset + 1] == LF)) {
        continue;
      }
      tabular.parser.record_begin();
    }

    // pre-token: look for start of escape sequence
    if (tabular.parser.state == PRE_TOKEN) {

      if ((c === SPACE || c === TAB) && tabular.parser.next_nonspace() == QUOTE) {
        if (tabular.parser.RELAXED || tabular.parser.IGNORE_QUOTE_WHITESPACE) {
          continue;
        } else {
          // not technically an error, but ambiguous and hard to debug otherwise
          tabular.parser.warn(tabular.parser.WARN_SPACE);
        }
      }

      if (c == QUOTE && !tabular.parser.IGNORE_QUOTES) {
        tabular.parser.debug("...escaped start", c);
        tabular.parser.escaped = true;
        tabular.parser.state = MID_TOKEN;
        continue;
      }
      tabular.parser.state = MID_TOKEN;
    }

    // mid-token and escaped, look for sequences and end quote
    if (tabular.parser.state == MID_TOKEN && tabular.parser.escaped) {
      if (c == QUOTE) {
        if (str[tabular.parser.offset] == QUOTE) {
          tabular.parser.debug("...escaped quote", c);
          tabular.parser.token += QUOTE;
          tabular.parser.offset++;
        } else {
          tabular.parser.debug("...escaped end", c);
          tabular.parser.escaped = false;
          tabular.parser.state = POST_TOKEN;
        }
      } else {
        tabular.parser.token += c;
        tabular.parser.debug("...escaped add", c, tabular.parser.token);
      }
      continue;
    }

    // fall-through: mid-token or post-token, not escaped
    if (c == CR) {
      if (str[tabular.parser.offset] == LF)
        tabular.parser.offset++;
      else if (!tabular.parser.CARRIAGE_RETURN_OK)
        tabular.parser.error(tabular.parser.ERROR_CHAR);
      tabular.parser.token_end();
      tabular.parser.record_end();
    } else if (c == LF) {
      if (!(tabular.parser.LINE_FEED_OK || tabular.parser.RELAXED))
        tabular.parser.error(tabular.parser.ERROR_CHAR);
      tabular.parser.token_end();
      tabular.parser.record_end();
    } else if (c == COMMA) {
      tabular.parser.token_end();
    } else if (tabular.parser.state == MID_TOKEN) {
      tabular.parser.token += c;
      tabular.parser.debug("...add", c, tabular.parser.token);
    } else if (c === SPACE || c === TAB) {
      if (!tabular.parser.IGNORE_QUOTE_WHITESPACE)
        tabular.parser.error(tabular.parser.WARN_SPACE);
    } else if (!tabular.parser.RELAXED) {
      tabular.parser.error(tabular.parser.ERROR_CHAR);
    }
  }
  return result;
};

tabular.parser.reset = function() {
  tabular.parser.state = null;
  tabular.parser.token = null;
  tabular.parser.escaped = null;
  tabular.parser.record = null;
  tabular.parser.offset = null;
  tabular.parser.result = null;
  tabular.parser.str = null;
};

tabular.parser.next_nonspace = function() {
  var i = tabular.parser.offset;
  var c;
  while (i < tabular.parser.str.length) {
    c = tabular.parser.str[i++];
    if (!(c == SPACE || c === TAB )) {
      return c;
    }
  }
  return null;
};

tabular.parser.record_begin = function() {
  tabular.parser.escaped = false;
  tabular.parser.record = [];
  tabular.parser.token_begin();
  tabular.parser.debug("record_begin");
};

tabular.parser.record_end = function() {
  tabular.parser.state = POST_RECORD;
  if (!(tabular.parser.IGNORE_RECORD_LENGTH || tabular.parser.RELAXED) && tabular.parser.result.length > 0 && tabular.parser.record.length != tabular.parser.result[0].length) {
    tabular.parser.error(tabular.parser.ERROR_EOL);
  }
  tabular.parser.result.push(tabular.parser.record);
  tabular.parser.debug("record end", tabular.parser.record);
  tabular.parser.record = null;
};

tabular.parser.resolve_type = function(token) {
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

tabular.parser.token_begin = function() {
  tabular.parser.state = PRE_TOKEN;
  tabular.parser.token = "";
};

tabular.parser.token_end = function() {
  if (tabular.parser.DETECT_TYPES) {
    tabular.parser.token = tabular.parser.resolve_type(tabular.parser.token);
  }
  tabular.parser.record.push(tabular.parser.token);
  tabular.parser.debug("token end", tabular.parser.token);
  tabular.parser.token_begin();
};

tabular.parser.debug = function() {
  if (tabular.parser.DEBUG)
    console.log(arguments);
};

tabular.parser.dump = function(msg) {
  return [msg, "at char", tabular.parser.offset, ":", tabular.parser.str.substr(tabular.parser.offset - 50, 50).replace(/\r/mg, "\\r").replace(/\n/mg, "\\n").replace(/\t/mg, "\\t")].join(" ");
};

tabular.parser.error = function(err) {
  var msg = tabular.parser.dump(err);
  tabular.parser.reset();
  throw msg;
};

tabular.parser.warn = function(err) {
  var msg = tabular.parser.dump(err);
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

tabular.csv2Array = tabular.parser.parse;
tabular.parseCSV = tabular.parser.parse;
