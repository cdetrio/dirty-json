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


let Lexer = require("lex");


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
