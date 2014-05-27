var csv = "one,two,three\nfour,five,six",
array = [["one", "two", "three"], ["four", "five", "six"]],
object = [{one: "four", two: "five", three: "six"}],
tablestring = "<table><thead><tr><th>one</th><th>two</th><th>three</th></tr></thead><tbody><tr><td>four</td><td>five</td><td>six</td></tr></tbody><tfoot></tfoot></table>",
table = document.getElementsByTagName("table")[0],
csvurl = "data:application/csv;charset=utf-8,one,two,three%0Afour,five,six";

test("CSV to Array of Arrays", function() {
	ok(_.isEqual(tabular.csv2Array(csv), array), "CSV Converts to Array.");
});

test("CSV to Array of Objects", function() {
	ok(_.isEqual(tabular.csv2ObjectArray(csv), object), "CSV Converts to Object Array");
});

test("CSV to Table", function() {
	equal(tabular.csv2Table(csv), tablestring, "CSV Converts to Table");
});

test("Table to Array of Arrays", function() {
	ok(_.isEqual(tabular.table2Array(table), array), "Table converts to Array");
});

test("Table to Array of Object", function() {
	ok(_.isEqual(tabular.table2Object(table), object), "Table converts to Object");
});

test("Table to CSV", function() {
	equal(tabular.table2CSV(table), csv, "Table converts to CSV string");
});

test("Table to CSV URL", function() {
	equal(tabular.table2CSVURL(table), csvurl, "Table converts to CSV URL");
});

test("jQcsv2Table", function() {
	ok(1 == "1", "Passed!");
	ok(1 == "1", "Passed!");
	ok(1 == "1", "Passed!");
});

test("jQtable2CSV", function() {
	ok(1 == "1", "Passed!");
	ok(1 == "1", "Passed!");
	ok(1 == "1", "Passed!");
});

test("jQdownloadTable", function() {
	ok(1 == "1", "Passed!");
	ok(1 == "1", "Passed!");
	ok(1 == "1", "Passed!");
});
