// Copyright 2014 Ryan Marcus
// This file is part of dirty-json.
//
// dirty-json is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// dirty-json is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with dJSON.  If not, see <http://www.gnu.org/licenses/>.


var assert = require("assert");
var dJSON = require("../dirty-json");


function compareResults(json) {
	var res = dJSON.parse(json);
	jeq(res, JSON.parse(json));
}

function compareResultsToValid(invalid, valid) {
	// confirm that the invalid json is invalid
	try {
		var j = JSON.parse(invalid);
		// it didn't fail!
		done("json was valid!");
	} catch (e) {
		var res = dJSON.parse(invalid);
		jeq(res, JSON.parse(valid));
	}

}

function jeq(obj1, obj2) {
	assert.equal(JSON.stringify(obj1), JSON.stringify(obj2));
}

describe("parser", function () {
	describe("parse() on valid JSON", function () {
		it('should handle an empty object', function () {
			compareResults("{}");
		});

		it('should handle an empty list', function () {
			compareResults("[]");
		});

		it('should handle an single-item list', function () {
			compareResults("[4]");
		});

		it('should handle an single-item object', function () {
			compareResults("{ \"test\": 4 }");
		});

		it('should handle a list of numbers', function () {
			compareResults("[3, 4, -2, 5.5, 0.5, 0.32]");
		});

		it('should handle a list of numbers and strings', function () {
			compareResults("[3, 4, -2, \"5.5\", 0.5, 0.32]");
		});

		it('should handle a list of numbers, strings, and booleans', function () {
			compareResults("[3, 4, -2, \"5.5\", 0.5, false]");
		});

		it('should handle a list of numbers, strings, and booleans', function () {
			compareResults('["some text", 4, "some more text", "text"]');
		});

		it('should handle a list of numbers, strings, and booleans', function () {
			compareResults('["[],4,5", "false", ","]');
		});

		it('should handle an object with mixed values', function () {
			compareResults('{ "test": 56, "test2": "hello!", "test3": false }');
		});

		it('should handle an object with list values', function () {
			compareResults('{ "test": [3, "str", false, 0.5], "test2": [1, 2, "str2"] }');
		});

		it('should handle embedded objects', function () {
			compareResults('{ "test": { "test": [1, 2, 3] } }');
		});

		it('should handle embedded lists', function () {
			compareResults('[1, 2, [3, 4], 5]');
		});

		it('should handle embedded lists when the first item is a list', function () {
			compareResults('[[1, false], 2, [3, 4], 5]');
		});


		it('should handle objects embedded in lists', function () {
			compareResults('[2, {"test": "str"}]');
		});

		it('should handle objects embedded in lists', function () {
			compareResults('[{"test": "str"}, 2, [3, {"test2": "str2"}], 5]');
		});


		it('should handle a complex JSON structure', function () {
			compareResults('[{"test": "str"}, [2, false, 0.4], [3, {"test2": ["str2", 6]}], 5]');
		});

		it('should handle a complex JSON structure', function () {
			compareResults('[{"test": "str"}, [2, false, ",", 0.4, "[val]"], [3, {"test2": ["str2", 6]}], 5]');
		});

		it('should handle nulls in lists', function () {
			compareResults("[null]");
		});

		it('should handle nulls in objects', function () {
			compareResults("{ \"test\": null}");
		});

		it('should handle nulls in objects and lists', function () {
			compareResults("{ \"test\": null, \"test2\": [4, null] }");
		});

		it('should handle arbitrary whitespace', function () {
			compareResults("{      \"test\": null,      \"test2\": [4,      null] }");
		});


	});

	describe("parse() on invalid JSON", function () {
		it('should handle non-quoted object keys', function() {
			compareResultsToValid('{test: 5}', '{"test": 5}');
		});

		it('should handle single-quoted object keys', function() {
			compareResultsToValid('{\'test\': 5}', '{"test": 5}');
		});


		it('should handle single-quoted object values', function() {
			compareResultsToValid('{\'test\': \'5\'}', '{"test": "5"}');
		});

		it('should handle quotes-in-quotes (list)', function() {
			compareResultsToValid('["some "quoted" text"]', '["some \\"quoted\\" text"]');
		});

		it('should handle quotes-in-quotes (list)', function() {
			compareResultsToValid('[3, "some "quoted" text", 2]', '[3, "some \\"quoted\\" text", 2]');
		});

		it('should handle quotes-in-quotes (object)', function() {
			compareResultsToValid('{"test": "some "quoted" text"}', '{"test": "some \\"quoted\\" text"}');
		});

		it('should handle quotes-in-quotes (object)', function() {
			compareResultsToValid('{"test0": false, "test": "some "quoted" text", "test1": 5}', '{"test0": false, "test": "some \\"quoted\\" text", "test1": 5}');
		});


		describe("with new lines", function() {
			it ('should handle a newline in a string in object', function() {
				var r = dJSON.parse('{ "test0": "a '+"\n"+'string" }');
				assert.equal(r.test0, 'a '+"\n"+'string');
			});

			it ('should handle a newline in a string in a list', function() {
				var r = dJSON.parse('["a '+"\n"+'string"]');
				assert.equal(r[0], 'a '+"\n"+'string');
			});

			it('should handle newline in misquoted string in object', function() {
				var str = 'this\n"quote"\ntext';
				var r = dJSON.parse('{ "test0": "' + str + '"}');
				assert.equal(r.test0, str);
			});

			it('should handle newline in misquoted string in object', function() {
				var str = 'this\n"quote"\ntext';
				var r = dJSON.parse('{ "test1": false, "test0": "' + str + '", test2: 5.5}');
				assert.equal(r.test0, str);
				assert.equal(r.test1, false);
				assert.equal(r.test2, 5.5);
			});

			it('should handle newline in misquoted string in list', function() {
				var str = 'this\n"quote"\ntext';
				var r = dJSON.parse('["' + str + '"]');
				assert.equal(r[0], str);
			});


			it('should handle newline in misquoted string in list', function() {
				var str = 'this\n"quote"\ntext';
				var r = dJSON.parse('[5, 6, "' + str + '", "test"]');
				assert.equal(r[2], str);
				assert.equal(r[0], 5);
				assert.equal(r[1], 6);
				assert.equal(r[3], "test");
			});
		});


		describe("with embedded HTML", function() {
			it('should handle an embedded DIV tag', function() {
				var r = dJSON.parse('["<div class="class">some text</div>"]');
				assert.equal(r[0], '<div class="class">some text</div>');
				assert.equal(r.length, 1);
			});

			it('should handle an embedded span tag', function() {
				var r = dJSON.parse('["<span class="class">some text</span>"]');
				assert.equal(r[0], '<span class="class">some text</span>');
				assert.equal(r.length, 1);
			});


			it('should handle an embedded span tag in a div tag', function() {
				var r = dJSON.parse('["<div class="divclass"><span class="class">some text</span></div>"]');
				assert.equal(r[0], '<div class="divclass"><span class="class">some text</span></div>');
				assert.equal(r.length, 1);
			});
		});



	});
});
