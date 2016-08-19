/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(5);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright 2015, 2014 Ryan Marcus
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
	// along with dirty-json.  If not, see <http://www.gnu.org/licenses/>.

	var parser = __webpack_require__(2);

	module.exports.parse = parse;
	function parse(text) {
		return parser.parse(text);
	}

	/*parse('{ "this": that, "another": "maybe" }').then(function (res) {
	 	console.log(res);
	});*/


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright 2016, 2015, 2014 Ryan Marcus
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
	// along with dirty-json.  If not, see <http://www.gnu.org/licenses/>.

	//var fs = require('fs');
	//var Stream = require('stream');
	var lexer = __webpack_require__(3);


	// terminals
	const LEX_KV = 0;
	const LEX_KVLIST = 1;
	const LEX_VLIST = 2;
	const LEX_BOOLEAN = 3;
	const LEX_COVALUE = 4;
	const LEX_CVALUE = 5;
	const LEX_FLOAT = 6;
	const LEX_INT = 7;
	const LEX_KEY = 8;
	const LEX_LIST = 9;
	const LEX_OBJ = 10;
	const LEX_QUOTE = 11;
	const LEX_RB = 12;
	const LEX_RCB = 13;
	const LEX_TOKEN = 14;
	const LEX_VALUE = 15;
	const LEX_HEXLITERAL = 16;
	const LEX_HEXNUM = 17;

	// non-terminals
	const LEX_COLON = -1;
	const LEX_COMMA = -2;
	const LEX_LCB = -3;
	const LEX_LB = -4;
	const LEX_DOT = -5;


	function peek(arr) {
		return arr[arr.length - 1];
	}

	function last(arr, i) {
		return arr[arr.length - (1 + i)];
	}


	function is(obj, prop) {
		return (obj && obj.hasOwnProperty("type") && obj.type == prop);
	}

	function log(str) {
		//console.log(str);
	}



	module.exports.parse = parse;
	function parse(text) {

		var stack = [];

		var tokens = [];
		var tokens = lexer.lexString(text);

		for (var i = 0; i < tokens.length; i++) {
			log("Shifting " + tokens[i].type);
			stack.push(tokens[i]);
			log(stack);
			log("Reducing...");
			while (reduce(stack)) {
				log(stack);
				log("Reducing...");
			}
		}

		return compileOST(stack[0]);

	}





	function reduce(stack) {
		var next = stack.pop();

		switch(next.type) {

		case LEX_KEY:
			if (next.value == "true") {
				log("Rule 5");
				stack.push({'type': LEX_BOOLEAN, 'value': "true"});
				return true;
			}

			if (next.value == "false") {
				log("Rule 6");
				stack.push({'type': LEX_BOOLEAN, 'value': "false"});
				return true;
			}

			if (next.value == "null") {
				log("Rule 7");
				stack.push({'type': LEX_VALUE, 'value': null});
				return true;
			}
			break;

		case LEX_TOKEN:
			if (is(peek(stack), LEX_KEY)) {
				log("Rule 11a");
				peek(stack).value += next.value;
				return true;
			}

			log("Rule 11c");
			stack.push({type: LEX_KEY, value: [ next.value ] });
			return true;


		case LEX_INT:
			if (is(next, LEX_INT) && is(peek(stack), LEX_KEY)) {
				log("Rule 11b");
				peek(stack).value += next.value;
				return true;
			}

			log("Rule 11f");
			next.type = LEX_VALUE;
			stack.push(next);
			return true;


		case LEX_HEXNUM:
			//log("Rule 11g");
			next.type = LEX_VALUE;
			stack.push(next);
			return true;

		case LEX_HEXLITERAL:
			//log("Rule 11g");
			next.type = LEX_VALUE;
			stack.push(next);
			return true;


		case LEX_QUOTE:
			log("Rule 11d");
			next.type = LEX_VALUE;
			next.value = next.value;
			stack.push(next);
			return true;


		case LEX_BOOLEAN:
			log("Rule 11e");
			next.type = LEX_VALUE;

			if (next.value == "true") {
				next.value = true;
			} else {
				next.value = false;
			}

			stack.push(next);
			return true;


		case LEX_FLOAT:
			log("Rule 11g");
			next.type = LEX_VALUE;
			stack.push(next);
			return true;


		case LEX_VALUE:
			if (is(peek(stack), LEX_COMMA)) {
				log("Rule 12");
				next.type = LEX_CVALUE;
				stack.pop();
				stack.push(next);
				return true;
			}

			if (is(peek(stack), LEX_COLON)) {
				log("Rule 13");
				next.type = LEX_COVALUE;
				stack.pop();
				stack.push(next);
				return true;
			}

			if (is(peek(stack), LEX_KEY) && is(last(stack, 1), LEX_VALUE)) {
				log("Error rule 1");
				var middleVal = stack.pop();
				peek(stack).value += '"' + middleVal.value + '"';
				peek(stack).value += next.value;
				return true;
			}

			if (is(peek(stack), LEX_KEY) && is(last(stack, 1), LEX_VLIST)) {
				log("Error rule 2");
				var middleVal = stack.pop();
				var oldLastVal = peek(stack).value.pop();
				oldLastVal +=  '"' + middleVal.value + '"';
				oldLastVal += next.value;

				peek(stack).value.push(oldLastVal);

				return true;
			}

			if (is(peek(stack), LEX_KEY) && is(last(stack, 1), LEX_KVLIST)) {
				log("Error rule 3");
				var middleVal = stack.pop();
				var oldLastVal = peek(stack).value.pop();
				oldLastVal.value +=  '"' + middleVal.value + '"';
				oldLastVal.value += next.value;

				peek(stack).value.push(oldLastVal);

				return true;
			}
			break;

		case LEX_LIST:
			if (is(next, LEX_LIST) && is(peek(stack), LEX_COMMA)) {
				log("Rule 12a");
				next.type = LEX_CVALUE;
				stack.pop();
				stack.push(next);
				return true;
			}

			if (is(peek(stack), LEX_COLON)) {
				log("Rule 13a");
				next.type = LEX_COVALUE;
				stack.pop();
				stack.push(next);
				return true;
			}
			break;

		case LEX_OBJ:
			if (is(peek(stack), LEX_COMMA)) {
				log("Rule 12b");
				var toPush = {'type': LEX_CVALUE, 'value': next};
				stack.pop();
				stack.push(toPush);
				return true;
			}

			if (is(peek(stack), LEX_COLON)) {
				log("Rule 13b");
				var toPush = {'type': LEX_COVALUE, 'value': next};
				stack.pop();
				stack.push(toPush);
				return true;
			}
			break;

		case LEX_CVALUE:
			if (is(peek(stack), LEX_VLIST)) {
				log("Rule 14");
				peek(stack).value.push(next.value);
				return true;
			}

			log("Rule 15");
			stack.push({'type': LEX_VLIST, 'value': [next.value]});
			return true;

		case LEX_VLIST:
			if (is(peek(stack), LEX_VALUE)) {
				log("Rule 15a");
				next.value.unshift(peek(stack).value);
				stack.pop();
				stack.push(next);
				return true;
			}

			if (is(peek(stack), LEX_LIST)) {
				log("Rule 15b");
				next.value.unshift(peek(stack).value);
				stack.pop();
				stack.push(next);
				return true;
			}

			if (is(peek(stack), LEX_OBJ)) {
				log("Rule 15c");
				next.value.unshift(peek(stack));
				stack.pop();
				stack.push(next);
				return true;
			}

			if (is(peek(stack), LEX_KEY) && (last(stack, 1), LEX_COMMA)) {
				log("Error rule 7");
				var l = stack.pop();
				//stack.pop();
				stack.push({type: LEX_VALUE, 'value': l.value});
				log("Start subreduce... (" + l.value + ")");
				while(reduce(stack));
				log("End subreduce");
				stack.push(next);

				return true;
			}

			if (is(peek(stack), LEX_VLIST)) {
				log("Error rule 8");
				peek(stack).value.push(next.value[0]);
				return true;
			}
			break;

		case LEX_COVALUE:

			if (is(peek(stack), LEX_KEY) || is(peek(stack), LEX_VALUE) || is(peek(stack), LEX_VLIST)) {
				log("Rule 16");
				var key = stack.pop();
				stack.push({'type': LEX_KV, 'key': key.value, 'value': next.value});
				return true;
			}

			throw new Error("Got a :value that can't be handled");


		case LEX_KV:
			if (is(last(stack, 0), LEX_COMMA) && is(last(stack, 1), LEX_KVLIST)) {
				log("Rule 17");
				last(stack, 1).value.push(next);
				stack.pop();
				return true;
			}

			log("Rule 18");
			stack.push({'type': LEX_KVLIST, 'value': [next]});
			return true;


		case LEX_KVLIST:
			if (is(peek(stack), LEX_KVLIST)) {
				log("Rule 17a");
				next.value.forEach(function (i) {
					peek(stack).value.push(i);
				});

				return true;
			}

			if (is(peek(stack), LEX_KEY) && (last(stack, 1), LEX_COLON)) {
				log("Error rule 5");
				var l = stack.pop();
				//stack.pop();
				stack.push({type: LEX_VALUE, 'value': l.value});
				log("Start subreduce... (" + l.value + ")");
				while(reduce(stack));
				log("End subreduce");
				stack.push(next);
				return true;
			}
			break;

		case LEX_RB:
			if (is(peek(stack), LEX_VLIST) && is(last(stack, 1), LEX_LB)) {
				log("Rule 19");
				var l = stack.pop();
				stack.pop();
				stack.push({'type': LEX_LIST, 'value': l.value});
				return true;
			}

			if (is(peek(stack), LEX_LB)) {
				log("Rule 22");
				stack.pop();
				stack.push({type: LEX_LIST, 'value': []});
				return true;
			}

			if (is(peek(stack), LEX_VALUE) && is(last(stack, 1), LEX_LB)) {
				log("Rule 23");
				var val = stack.pop().value;
				stack.pop();
				stack.push({type: LEX_LIST, 'value': [val]});
				return true;
			}

			if (is(peek(stack), LEX_KEY) && (last(stack, 1), LEX_COMMA)) {
				log("Error rule 5");
				var l = stack.pop();
				//stack.pop();
				stack.push({type: LEX_VALUE, 'value': l.value});
				log("Start subreduce... (" + l.value + ")");
				while(reduce(stack));
				log("End subreduce");
				stack.push({type: LEX_RB});
				return true;
			}

			break;

		case LEX_RCB:
			if (is(peek(stack), LEX_KVLIST) && (last(stack, 1), LEX_LCB)) {
				log("Rule 20");
				var l = stack.pop();
				stack.pop();
				stack.push({'type': LEX_OBJ, 'value': l.value});
				return true;
			}

			if (is(peek(stack), LEX_LCB)) {
				log("Rule 21");
				stack.pop();
				stack.push({type: LEX_OBJ, 'value': null});
				return true;
			}

			if (is(peek(stack), LEX_KEY) && (last(stack, 1), LEX_COLON)) {
				log("Error rule 4");
				var l = stack.pop();
				//stack.pop();
				stack.push({type: LEX_VALUE, 'value': l.value});
				log("Start subreduce... (" + l.value + ")");
				while(reduce(stack));
				log("End subreduce");
				stack.push({type: LEX_RCB});
				return true;
			}

			throw new Error("Found } that I can't handle.");
		}


		stack.push(next);
		return false;
	}




	/*

	obj = '{', KVList, '}'
	    | '{' '}'

	list = '[' VList ']'
	     | '[' ']'
	     | '[' value ']'

	KVList = KVList ',' KV
	       | KV
	       | KVList KVList

	KV = key covalue
	   | value covalue
	   | VList covalue

	key = key token
	    | key int
	    | token

	covalue = colon value
	        | colon list
	        | colon obj

	VList = value VList
	      | VList cvalue
	      | cvalue
	      | list VList
	      | obj VList

	cvalue = comma value
	       | comma list
	       | comma obj

	value = quote
	      | boolean
	      | int
	      | float
	      | 'n' 'u' 'l' 'l'

	boolean = true
	        | false



	SPECIAL ERROR CASES, only do these reductions if no other reductions worked

	 -- for the case of ["some "text" here"]
	value = value key value

	-- for the case of [3, "some "text" here", 4]
	VList = VList key value

	-- for the case of {"t": "some "text" here"}
	KVList = KVList key value

	-- for the case of {"this": that}
	When last in RCB,
	value = COLON key (re-reduce)

	-- for the case of {"this": that, "another": "maybe"}
	When last is KVList,
	value = COLON key (re-reduce)

	-- for the case of ["this", that]
	when last is a RB,
	value = COMMA key (re-reduce)

	-- for the case of ["this", that, "another"]
	When last is a VList,
	value = COMMA key (re-reduce)

	AND

	VList = VList VList

	*/



	function compileOST(tree) {
		var rawTypes = ["boolean", "number", "string"];

		if (rawTypes.indexOf((typeof tree)) != -1)
			return tree;

		if (tree == null)
			return null;

		if (Array.isArray(tree)) {
			var toR = [];
			while (tree.length != 0)
				toR.unshift(compileOST(tree.pop()));
			return toR;
		}

		if (is(tree, LEX_OBJ)) {
			var toR = {};
			if (tree.value == null)
				return {};
			tree.value.forEach(function (i) {
				toR[i.key] = compileOST(i.value);
			});
			return toR;
		}

		if (is(tree, LEX_LIST)) {
			return compileOST(tree.value);
		}

		throw new Error("Uncaught type in compile: " + JSON.stringify(tree));
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright 2016, 2015, 2014 Ryan Marcus
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
	// along with dirty-json.  If not, see <http://www.gnu.org/licenses/>.

	"use strict";


	let Lexer = __webpack_require__(4);


	// terminals
	const LEX_KV = 0;
	const LEX_KVLIST = 1;
	const LEX_VLIST = 2;
	const LEX_BOOLEAN = 3;
	const LEX_COVALUE = 4;
	const LEX_CVALUE = 5;
	const LEX_FLOAT = 6;
	const LEX_INT = 7;
	const LEX_KEY = 8;
	const LEX_LIST = 9;
	const LEX_OBJ = 10;
	const LEX_QUOTE = 11;
	const LEX_RB = 12;
	const LEX_RCB = 13;
	const LEX_TOKEN = 14;
	const LEX_VALUE = 15;
	const LEX_HEXLITERAL = 16;
	const LEX_HEXNUM = 17;

	// non-terminals
	const LEX_COLON = -1;
	const LEX_COMMA = -2;
	const LEX_LCB = -3;
	const LEX_LB = -4;
	const LEX_DOT = -5;


	var lexMap = {
		":": {type: LEX_COLON},
		",": {type: LEX_COMMA},
		"{": {type: LEX_LCB},
		"}": {type: LEX_RCB},
		"[": {type: LEX_LB},
		"]": {type: LEX_RB},
		".": {type: LEX_DOT} // TODO: remove?
	};

	var lexSpc = [
		[/:/, LEX_COLON],
		[/,/, LEX_COMMA],
		[/{/, LEX_LCB],
		[/}/, LEX_RCB],
		[/\[/, LEX_LB],
		[/\]/, LEX_RB],
		[/\./, LEX_DOT] // TODO: remove?
	];

	function getLexer(string) {
		let lexer = new Lexer();
		lexer.addRule(/"([\s\S]*?)("|$)/, (lexeme, txt) => {
			return {type: LEX_QUOTE, value: txt};
		});

		lexer.addRule(/'([\s\S]*?)('|$)/, (lexeme, txt) => {
			return {type: LEX_QUOTE, value: txt};
		});

		lexer.addRule(/[\-0-9]*\.[0-9]+/, lexeme => {
			return {type: LEX_FLOAT, value: parseFloat(lexeme)};
		});

		lexer.addRule(/[\-0-9]+/, lexeme => {
			return {type: LEX_INT, value: parseInt(lexeme)};
		});

		lexer.addRule(/0[xX][a-fA-F0-9]+/, lexeme => {
			let hex_num = parseInt(lexeme, 16);
			return {type: LEX_HEXNUM, value: hex_num};
		});

		lexer.addRule(/hex:"([a-fA-F0-9]+)"/, lexeme => {
			// return TypedArray of uint8
			let hex = lexeme.slice(5).slice(0,-1);
			let bytes = [];
			for (let c = 0; c < hex.length; c += 2)
	    	bytes.push(parseInt(hex.substr(c, 2), 16));

			return {type: LEX_HEXLITERAL, value: bytes};
		});

		lexSpc.forEach(item => {
			lexer.addRule(item[0], lexeme => {
				return {type: item[1], value: lexeme};
			});
		});

		lexer.addRule(/\s/, lexeme => {
			// chomp whitespace...
		});

		lexer.addRule(/./, lexeme => {
			let lt = LEX_TOKEN;
			let val = lexeme;
		  return {type: lt, value: val};
		});

		lexer.setInput(string);

		return lexer;
	}



	module.exports.lexString = lexString;
	function lexString(str, emit) {
		let lex = getLexer(str);

		var arr = [];
		let token = "";
		while ((token = lex.lex())) {
			arr.push(token);
		}

		return arr;
	}


	module.exports.getAllTokens = getAllTokens;
	function getAllTokens(str) {
		return lexString(str);
	}




	/*getAllTokens('{ "test0": "a '+"\n"+'string" }').then(function(res) {
	 	console.log(res);
	});*/


/***/ },
/* 4 */
/***/ function(module, exports) {

	if (typeof module === "object" && typeof module.exports === "object") module.exports = Lexer;

	Lexer.defunct = function (chr) {
	    throw new Error("Unexpected character at index " + (this.index - 1) + ": " + chr);
	};

	function Lexer(defunct) {
	    if (typeof defunct !== "function") defunct = Lexer.defunct;

	    var tokens = [];
	    var rules = [];
	    var remove = 0;
	    this.state = 0;
	    this.index = 0;
	    this.input = "";

	    this.addRule = function (pattern, action, start) {
	        var global = pattern.global;

	        if (!global) {
	            var flags = "g";
	            if (pattern.multiline) flags += "m";
	            if (pattern.ignoreCase) flags += "i";
	            pattern = new RegExp(pattern.source, flags);
	        }

	        if (Object.prototype.toString.call(start) !== "[object Array]") start = [0];

	        rules.push({
	            pattern: pattern,
	            global: global,
	            action: action,
	            start: start
	        });

	        return this;
	    };

	    this.setInput = function (input) {
	        remove = 0;
	        this.state = 0;
	        this.index = 0;
	        tokens.length = 0;
	        this.input = input;
	        return this;
	    };

	    this.lex = function () {
	        if (tokens.length) return tokens.shift();

	        this.reject = true;

	        while (this.index <= this.input.length) {
	            var matches = scan.call(this).splice(remove);
	            var index = this.index;

	            while (matches.length) {
	                if (this.reject) {
	                    var match = matches.shift();
	                    var result = match.result;
	                    var length = match.length;
	                    this.index += length;
	                    this.reject = false;
	                    remove++;

	                    var token = match.action.apply(this, result);
	                    if (this.reject) this.index = result.index;
	                    else if (typeof token !== "undefined") {
	                        switch (Object.prototype.toString.call(token)) {
	                        case "[object Array]":
	                            tokens = token.slice(1);
	                            token = token[0];
	                        default:
	                            if (length) remove = 0;
	                            return token;
	                        }
	                    }
	                } else break;
	            }

	            var input = this.input;

	            if (index < input.length) {
	                if (this.reject) {
	                    remove = 0;
	                    var token = defunct.call(this, input.charAt(this.index++));
	                    if (typeof token !== "undefined") {
	                        if (Object.prototype.toString.call(token) === "[object Array]") {
	                            tokens = token.slice(1);
	                            return token[0];
	                        } else return token;
	                    }
	                } else {
	                    if (this.index !== index) remove = 0;
	                    this.reject = true;
	                }
	            } else if (matches.length)
	                this.reject = true;
	            else break;
	        }
	    };

	    function scan() {
	        var matches = [];
	        var index = 0;

	        var state = this.state;
	        var lastIndex = this.index;
	        var input = this.input;

	        for (var i = 0, length = rules.length; i < length; i++) {
	            var rule = rules[i];
	            var start = rule.start;
	            var states = start.length;

	            if ((!states || start.indexOf(state) >= 0) ||
	                (state % 2 && states === 1 && !start[0])) {
	                var pattern = rule.pattern;
	                pattern.lastIndex = lastIndex;
	                var result = pattern.exec(input);

	                if (result && result.index === lastIndex) {
	                    var j = matches.push({
	                        result: result,
	                        action: rule.action,
	                        length: result[0].length
	                    });

	                    if (rule.global) index = j;

	                    while (--j > index) {
	                        var k = j - 1;

	                        if (matches[j].length > matches[k].length) {
	                            var temple = matches[j];
	                            matches[j] = matches[k];
	                            matches[k] = temple;
	                        }
	                    }
	                }
	            }
	        }

	        return matches;
	    }
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	angular.module('djson', []).controller('DemoCtrl', ['$scope', function($scope) {
		$scope.valid = false;



		$scope.examples = [
			{"name": "Invalid JSON: embedded HTML", "content": '{ "key": "<div class="coolCSS">some text</div>" }'},
			{"name": "Valid JSON: Simple", "content": '{ "key": "value" }'},
			{"name": "Invalid JSON: Simple", "content": "{ key: 'value' }"},
			{"name": "Valid JSON: Complex Object", "content": '{ "key": ["value", 0.5, \n\t{ "test": 56, \n\t"test2": [true, null] }\n\t]\n}'},
			{"name": "Invalid JSON: Complex Object", "content": '{ key: ["value", .5, \n\t{ "test": 56, \n\t\'test2\': [true, null] }\n\t]\n}'},
			{"name": "Invalid JSON: With newlines", "content": '{ "key": "a string\nwith a newline" }'},
			{"name": "Invalid JSON: Floats", "content": '{ "no leading zero": .13452 }'},
			{"name": "Invalid JSON: Non-quoted keys", "content": '{ "test": here, "another": test }'}
		];



		$scope.selectedExample = $scope.examples[0];

		$scope.input = $scope.selectedExample.content;

		$scope.doParse = function() {
			var dJSON = __webpack_require__(1);

			try {
				var dirtyParsed = dJSON.parse($scope.input);
				$scope.output = JSON.stringify(dirtyParsed, null, 4);
				JSON.parse($scope.input);
				$scope.valid = true;
			}
			catch (e) {
				$scope.valid = false;
			}

		};


		$scope.doSelection = function () {
			$scope.input = $scope.selectedExample.content;
			$scope.doParse();
		};

		$scope.doParse();
	}]);


/***/ }
/******/ ]);