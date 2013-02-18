/* This file contains the scanner and parser for the langauge 

 All in all, the functions take in a string, and output an abstract syntax tree */


$(document).ready(function() {
	function log(msg) {
		setTimeout(function() {
			throw new Error(msg);
		}, 0);
	}
	
	/* syn_node declaration 
	The fun that is a syn_node is a basic tree data structure. 
	
	Contains:
		- A name
		- lex_info - special info
		- children - an array of children nodes
		
	Methods:
		- adopt child_node 	- adds child_node as a child
		- getters			- returns information
		- toString			- returns the stringafied object

	*/
	function Syn_node (lex_name, lex_info) {
		this.lex_name = lex_name;
		this.lex_info = lex_info;
		this.children = new Array();
	};

	Syn_node.prototype.adopt = function(child_node) {
		log(this.lex_name + " adopting: " + child_node.get_lex_name());
		this.children.push(child_node);
	};
	
	Syn_node.prototype.adopt_array = function(array) {
		for(var i = 0; i < array.length; i++) {
			this.adopt(array[i]);
		}
	};

	// disown - returns the node removed
	Syn_node.prototype.disown = function(child_node) {
		log(this.lex_name + " disowning: " + child_node.get_lex_name());
		for(var i = 0; i < this.children.length; i++) {
			if(child_node === this.children[i]) {
				return this.children.splice(i, 1);
			}
		}
	};
	
	// pop_child - returns the node removed
	Syn_node.prototype.shift_child = function() {
		if(this.children.length != 0) {
			child = this.children.shift();
			log(this.lex_name + " removing: " + child.get_lex_name());
			return child;
		}
		else {
			// throw an error
			log(this.lex_name + " has no children.");
		}
	};
	
	Syn_node.prototype.get_lex_name = function() {
		return this.lex_name;
	};

	Syn_node.prototype.get_lex_info = function() {
		return this.lex_info;
	};

	Syn_node.prototype.get_children = function() {
		return this.children;
	};

	Syn_node.prototype.toString = function() {
		log('Node: ' + this.lex_name);
		var str = '';
		str += this.lex_name;

		//log('Node: ' + this.lex_name + ' has ' + this.children.length + ' children.');
		
		for(var i = 0; i < this.children.length; i++) {
			if(i == 0) str += '{';
			str += this.children[i].toString();
			if(i != this.children.length - 1) str += ' ';
			if(i == this.children.length - 1) str += '}';
		}

		return str;
	};
	/* end of syn_node */
	
	
	// TOKEN_LIST - this should be an ordered list of tuples token_names:pattern_match
	//   TOK_CURSOR - breaks down into the cursor_x and cursor_y
	//   TOK_FIRE	- breaks down into the fire element
	var tok_list = new Array();
	tok_list[0] = ['TOK_CURSOR',/cursor/];
	tok_list[1] = ['TOK_FIRE',/fire/];
	tok_list[1] = ['TOK_SHAPE',/shape/];
	tok_list[1] = ['TOK_MOVE',/move/];
	tok_list[2] = [')', /\)/];
	tok_list[3] = ['(', /\(/];
	tok_list[2] = [',', /,/];

	// SPELL I AM TRYING TO PARSE:
	//	shape fire, accelerate cursor 5

	/* scan - scans the string into tokens
	 * Input: A string
	 * Output: an array of tokens

	*/
	scan = function(spell) {
		var found_tok_list = new Array();
		// cur_tok maintains the token in the making
		var cur_tok = '';
		spell = spell + ' ';
		for (var i = 0; i < spell.length; i++) {
			cur_tok = cur_tok + spell[i];
			
			// keywords first - each of these refresh cur_tok when chosen
		/*
			var tok_cursor_m = cur_tok.match(/cursor/);
			if (tok_cursor_m != null) {
				found_tok_list.push(new Syn_node ('TOK_CURSOR', ''));
				cur_tok = '';
				continue;
			}
			var tok_fire_m = cur_tok.match(/fire/);
			if (tok_fire_m != null) {
				found_tok_list.push(new Syn_node ('TOK_FIRE', ''));
				cur_tok = '';
				continue;
			}
			var tok_shape_m = cur_tok.match(/shape/);
			if (tok_shape_m != null) {
				found_tok_list.push(new Syn_node ('TOK_SHAPE', ''));
				cur_tok = '';
				continue;
			} 
		*/
			//log("Looking at: " + cur_tok);
			var tokens_to_add = new Array();
			
			// grammar punctuation - these need to break up the words to detect for identifiers
			// for example - if a comma, paren, or whitespace has arrived but the token has not been identified,
			//  then if it is a VALID ident or number, make it so
			var tok_comma_m = cur_tok.search(/,/);
			var tok_lp_m = cur_tok.search(/\(/);
			var tok_rp_m = cur_tok.search(/\)/);
			var tok_ws_m = cur_tok.search(/\s/);
			if (tok_comma_m != -1) {
				//log("Found comma");
				tokens_to_add.push(new Syn_node (',', ''));
				cur_tok = cur_tok.slice(0,tok_comma_m);
			}	

			else if (tok_lp_m != -1) {
				tokens_to_add.push(new Syn_node ('(', ''));
				cur_tok = cur_tok.slice(0,tok_lp_m);
			}	

			else if (tok_rp_m != -1) {
				tokens_to_add.push(new Syn_node (')', ''));
				cur_tok = cur_tok.slice(0,tok_rp_m);
			}	
			// whitespace pushes no character
			// identifier identifier does not catch
			else if (tok_ws_m != -1) {
				cur_tok = cur_tok.slice(0,tok_ws_m);
				//new_word = true;
			}	
			else {continue;}
			
			// indentifiers and numbers
			var tok_ident_m = cur_tok.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
			if (tok_ident_m != null) {
				//if(new_word) 
				//log("Found ident");
				var new_node = new Syn_node ('TOK_IDENTIFIER', tok_ident_m[0])
				//log('tok[new_node]: ' + new_node.get_lex_name());		
				tokens_to_add.unshift(new_node);
				cur_tok = '';
			}	
			var tok_number_m = cur_tok.match(/-?[0-9 ]+/);
			if (tok_number_m != null) {
				var new_node = new Syn_node ('TOK_NUMBER', tok_number_m[0])
				//log('tok[new_node]: ' + new_node.get_lex_name());	
				//found_tok_list.splice(found_tok_list.length - 1, 0, new_node);
				tokens_to_add.unshift(new_node);
				cur_tok = '';
			}		
			// catch alls
			var err_catch_all_m = cur_tok.match(/[^\0]+/);
			if (err_catch_all_m != null) {
				tokens_to_add.unshift('ERR_TOKEN, ' + err_catch_all_m[0]);
				cur_tok = '';		
			}
			//log("Size of tokens to add: " + tokens_to_add.length);
			found_tok_list = found_tok_list.concat(tokens_to_add);
	
		}
		// Add an end of scan node
		found_tok_list.splice(found_tok_list.length, 0, new Syn_node ('TOK_EOS', 'end of spell'));
		return found_tok_list;
	}
	
	/* tree shape:
			  root
				=
	name argumentnames body
						|
						,
		name arguments     name arguments
	
	
	
	*/
	
	/* parse will parse a token list
	   INPUTS - token list
	   OUTUPTS - abstract syntax tree
	 */
	parse = function(token_list) {
		// create the root node
		var root = new Syn_node ('TOK_ROOT', '');
		var current_parent = root;
		// read through the token list
		var current_cast = new Array();
		for(var i = 0; i < token_list.length; i++) {
			i += parse_spell_with_arguments(token_list, i, current_parent);			
		}
		return root;
	};	

	/* parse_spell_with_arguments - takes in a token_list and looks for an ident and arguments 
		Output - will output a token list
		ident [argument ...]
	*/
	parse_spell_with_arguments = function(token_list, index, current_parent) {
		var counter = 0;
		// The first token must be an identifier or a library spell
		//var tok_shape_m = token_list[i].get_lex_name().match(/TOK_SHAPE/);
		var tok_ident_m = token_list[index + counter].get_lex_name().match(/TOK_IDENT/);
		//if (tok_shape_m != null) {
		//	current_cast.push(token_list[i]);
		//}
		if (tok_ident_m != null) {
			var spell_with_arguments = new Syn_node ('TOK_SPELL', 'spell_with_arguments');
			current_parent.adopt(spell_with_arguments);
			current_parent = spell_with_arguments;
				current_parent.adopt(token_list[index + counter]);
			counter++;
		} 	
		else { // throw an error
			log("Error. casting a spell must start with a library spell or a declared spell.");
			return;
		}
		/* Argument detecter goes until a ',' is found */
		for(; counter < token_list.length; counter++) {
			var tok_number_m = token_list[index + counter].get_lex_name().match(/TOK_NUMBER/);
			var tok_comma_m  = token_list[index + counter].get_lex_name().match(/,/);		
			var tok_eos_m    = token_list[index + counter].get_lex_name().match(/TOK_EOS/);	
			//if (tok_shape_m != null) {
			//	current_cast.push(token_list[i]);
			//}
			if (tok_number_m != null) {
				current_parent.adopt(token_list[index + counter]);
			} 	
			else if (tok_comma_m != null || tok_eos_m != null) {
				break;
			}			
			else { // throw an error
				log("Error. Arguments must be numbers.");
				return;
			}

		}
		return counter;
	}

	/* Real Time Spell Interpreter 
		Here is the big boy; the function of all functions. This is the intersection between interpreter and game.
		
		This guy will work with as a small step interpreter. It will evaluate one spell cast at a time (separated by the commas).
		
		Psuedo Code:
			During each step of the interpretation:
				Evaluate expressions in the arguments
					- if a spell is part of an expression, recur on the AST of the spell
				Call the base spell library lookup.
				if ! undefined
					mana -= manacost
					call function
				else
					call spell library lookup (returns a spell AST)
					if ! undefined
						mana -= trivial_manacost (costs trivial mana to recur)
						recur on the AST of the spell
					else
						throw an error "Invalid spell"
				If there is another spell,
					mana -= trivial_manacost
					recur on next spell in the AST
	
	*/


	//function init() {
	//	Crafty.init(600, 300);
	//	Crafty.background('rgb(127,127,127)');	
	/*	
	var spells_toks = new Array();
	spell = 'accelerate 10, shape 6 5 7, accelerate 10';

	spells_toks = scan(spell);
	
	log("Starting SCAN");	
	for(var i = 0; i < spells_toks.length;i++) {
		log('tok[' + i + ']: ' + spells_toks[i].get_lex_name());
	}
	log("Ending SCAN\n");
	
	log("Starting PARSE");
	var root_node = parse(spells_toks);
	log("Ending PARSE\n");
	
	tree_str = root_node.toString();
	log('traversal : ' + tree_str);
	// depth first traversal of the grammar tree
	real_time_si(root_node); */
	//tree_str = root_node.toString();
	//log('traversal : ' + tree_str);	
	//};

	//init();
});
