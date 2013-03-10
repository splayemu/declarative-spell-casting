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
	Syn_node = function (lex_name, lex_info) {
		this.lex_name = lex_name;
		this.lex_info = lex_info;
		this.children = new Array();
	};

	Syn_node.prototype.adopt = function(child_node) {
		// log(this.lex_name + " adopting: " + child_node.get_lex_name());
		this.children.push(child_node);
	};
	
	/* Copies a node and its children */
	Syn_node.prototype.copy = function() {
		var copy = new Syn_node (this.get_lex_name(), this.get_lex_info());
		var orig_children = this.get_children();
		for(var i = 0; i < orig_children.length; i++) {
			copy.adopt(orig_children[i].copy())
		}
		return copy;
	};
	
	Syn_node.prototype.adopt_array = function(array) {
		for(var i = 0; i < array.length; i++) {
			this.adopt(array[i]);
		}
	};

	// disown - returns the node removed
	Syn_node.prototype.disown = function(child_node) {
		// log(this.lex_name + " disowning: " + child_node.get_lex_name());
		for(var i = 0; i < this.children.length; i++) {
			if(child_node === this.children[i]) {
				return this.children.splice(i, 1);
			}
		}
	};
	
	// shift_child - returns the node removed
	Syn_node.prototype.shift_child = function() {
		if(this.children.length != 0) {
			child = this.children.shift();
			// log(this.lex_name + " removing: " + child.get_lex_name());
			return child;
		}
		else {
			// throw an error
			log(this.lex_name + " has no children.");
		}
	};

	// unshift_child - returns the node removed
	Syn_node.prototype.unshift_children = function(child_array) {
		for(var i = child_array.length - 1; i >= 0; i--) {
			this.children.unshift(child_array[i]);
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
	
	Syn_node.prototype.set_lex_name = function(lex_name) {
		this.lex_name = lex_name;
	};

	Syn_node.prototype.set_lex_info = function(lex_info) {
		this.lex_info = lex_info;
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
	/* keywords needed to parse expressions
				Algebraic Binary Operators
				+
				-
				*
				/
				%

				Boolean Binary Operators
				==
				!=
				>
				>=
				<
				<=
				and
				or

				Extra operators:
				sqrt
				^
				!

				Extra keywords:
				pi
				cursor
	*/

	var operator_list = {};

	// binary operators 
	operator_list[/(\+|-|\*|\/|%|==|!=|>|<|>=|<=)/] = 'bops';

	// other keywords
	//operator_list['TOK_CURSOR'] 	= /cursor/;
	//operator_list['TOK_FIRE'] 	= /fire/;


	/* scan - scans the string into tokens
	 * Input: A string
	 * Output: an array of tokens

	*/
	scan = function(spell) {
		var found_tok_list = new Array();
		// cur_tok maintains the token in the making
		var cur_tok = '';
		var cur_operator = '';
		spell = spell + ' ';
		for (var i = 0; i < spell.length; i++) {
			cur_tok = cur_tok + spell[i];
			var tokens_to_add = new Array();
	
			//log("Looking at: " + cur_tok);	
			
			// grammar punctuation - these need to break up the words to detect for identifiers
			// for example - if a comma, paren, or whitespace has arrived but the token has not been identified,
			//  then if it is a VALID ident or number, make it so
			var tok_comma_m = cur_tok.search(/,/);
			var tok_lp_m = cur_tok.search(/\(/);
			var tok_rp_m = cur_tok.search(/\)/);
			var tok_ws_m = cur_tok.search(/\s/);
			var operator_pattern = /(\+|-|\*|\/|%|==|!=|>|<|>=|<=)/;
			var tok_operator_m = cur_tok.search(operator_pattern);
			/* 
				NOTE: Sketchy implementation of the operators

				Code Flow:
				If there is an operator
					deal with it
				else if there is punctuation
					deal with it
				else // an identifier or a number is being built
					continue
			*/ 
			/*
				If cur_tok matches an operator and finds an operator character, 
					split cur_tok between the previous value and the operator
			*/
			if (tok_operator_m != -1 && spell[i].match(/[+*-\/%><!=]/)) {

				cur_operator = cur_tok.slice(tok_operator_m);
				cur_tok = cur_tok.slice(0,tok_operator_m);
				log("Splitting token: " + cur_tok + " and operator: " + cur_operator);
			}
			/*	Else If there is an operator
					check if the operator + the new character is a valid operator
					if it is valid
						operator = new_operator
					else
						redo the character after this round

					cur_operator = cur_tok = ''
					push the operator_tok
			*/		
			else if (cur_operator.length > 0) { // and it does not match an operator character
				log("Operator " + cur_operator + " with possible addition of " + spell[i]);
				var test_new_operator = cur_operator + spell[i];
				var test_operator_m = test_new_operator.search(/(\+|-|\*|\/|%|==|!=|>|<|>=|<=)$/);
				if(test_operator_m != -1) {
					cur_operator = test_new_operator;
				}
				else {
					// if it is not a valid operator character, have the scanner move over the character again
					i--;			
				}
				log("Matched bops: " + cur_operator);
				tokens_to_add.push(new Syn_node ('TOK_OPERATOR', cur_operator));
				cur_operator = '';
				cur_tok = '';
			}
			else if (tok_comma_m != -1) {
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
				log("whitespace found with cur_tok: " + cur_tok);
				//new_word = true;
			}	
			else {continue;}
			
			// indentifiers and numbers
			var tok_ident_m = cur_tok.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
			if (tok_ident_m != null) {
				//if(new_word) 
				//log("Found ident");
				var new_node = new Syn_node ('TOK_IDENTIFIER', tok_ident_m[0])
				//log('tok[new_node]: ' + new_node.get_lex_name());		
				tokens_to_add.unshift(new_node);
				cur_tok = '';
			}	
			var tok_number_m = cur_tok.match(/^-?[0-9.]+$/);
			if (tok_number_m != null) {
				var new_node = new Syn_node ('TOK_NUMBER', tok_number_m[0])
				log('adding number ' + cur_tok);	
				//found_tok_list.splice(found_tok_list.length - 1, 0, new_node);
				tokens_to_add.unshift(new_node);
				cur_tok = '';
			}		
			// catch alls
			var err_catch_all_m = cur_tok.match(/[^\0]+/);
			if (err_catch_all_m != null) {
				tokens_to_add.unshift(new Syn_node ('ERR_TOKEN, ' + err_catch_all_m[0]));
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
	
	spell 			::= identifier arguments

	arguments		::= expr
					| arguments expr
			
	expr			::= ident
					| number
					| (spell)	
					| (expr Op expr)
	
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
			log("Parse: looking at " + token_list[i]); 
			var tok_eos_m    = token_list[i].get_lex_name().match(/TOK_EOS/);
			if(tok_eos_m == null)	
				i += parse_spell_with_arguments(token_list, i, current_parent, 0);		
		}
		return root;
	};	

	/* parse_spell_with_arguments - takes in a token_list and looks for an ident and arguments 
		Output - returns how far it traversed the token list
	*/
	parse_spell_with_arguments = function(token_list, index, current_parent, paren_layer) {
		var counter = 0;
		// The first token must be an identifier or a library spell
		//var tok_shape_m = token_list[i].get_lex_name().match(/TOK_SHAPE/);
		var tok_ident_m = token_list[index + counter].get_lex_name().match(/TOK_IDENT/);
		//if (tok_shape_m != null) {
		//	current_cast.push(token_list[i]);
		//}
		log("Parse_spell_with_arguments: trying to add spell cast of name: " + token_list[index + counter].get_lex_info());
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
		/* Argument detecter goes until a ',' or eos is found 
			- Each argument is an expr
				expr	::= ident
					| number
					| (spell)	
					| (expr Op expr)
					
			- Upon reaching an open paren
				contains_operators?
				if it contains an operator
					counter += parse_operator_expression
				else
					counter += parse_spell_with_arguments
		*/
		for(; (index + counter) < token_list.length; counter++) {
			log("parse_spell_with_arguments: looking at " + token_list[index + counter]);
			var tok_ident_m  = token_list[index + counter].get_lex_name().match(/TOK_IDENT/);
			var tok_number_m = token_list[index + counter].get_lex_name().match(/TOK_NUMBER/);
			var tok_comma_m  = token_list[index + counter].get_lex_name().match(/,/);		
			var tok_eos_m    = token_list[index + counter].get_lex_name().match(/TOK_EOS/);	
			var tok_lp_m     = token_list[index + counter].get_lex_name().match(/\(/);	
			var tok_rp_m     = token_list[index + counter].get_lex_name().match(/\)/);
			//if (tok_shape_m != null) {
			//	current_cast.push(token_list[i]);
			//}

			if (tok_ident_m != null) {
				current_parent.adopt(token_list[index + counter]);
			} 
			else if (tok_number_m != null) {
				current_parent.adopt(token_list[index + counter]);
			}
			/* recur on left paranthesis
				Things to think about:
					How can you differentiate between a (expr Op expr) and a (spell arguments)
				needs to increment the counter, change the current parent, and increment the paren_layer
			*/
			else if (tok_lp_m != null) {
				paren_layer++;
				counter++;
				if(contains_operators(token_list, index + counter)) {
					log("Recurring on parse_operator_expression starting at: " + token_list[index + counter]);
					counter += parse_operator_expression(token_list, index + counter, current_parent);
				}
				else {
					log("Recurring on parse_spell_with_arguments with " + token_list[index + counter - 1].get_lex_name());
					counter += parse_spell_with_arguments(token_list, index + counter, current_parent, paren_layer);
				}
			} 
			else if (tok_rp_m != null) {
				log("Paren layer = " + paren_layer);
				if(paren_layer <= 0) {
					log("Parse Error: Unbalanced Parens");
					return;				
				}
				paren_layer--;
				break;
			} 	
			else if (tok_comma_m != null || tok_eos_m != null) {
				log("parse_spell_with_arguments: found comma or eof.");
				break;
			}			
			else { // throw an error
				log("Parse Error: Arguments must be numbers, parameters, or spells.");
				return;
			}

		}
		return counter;
	}
	var contains_operators = function(token_list, index) {
		var paren_layer = 1;
		for(;index < token_list.length; index++) {
			var tok_operator_m  = token_list[index].get_lex_name().match(/TOK_OPERATOR/);
			var tok_comma_m 	= token_list[index].get_lex_name().match(/,/);		
			var tok_eos_m    	= token_list[index].get_lex_name().match(/TOK_EOS/);	
			var tok_lp_m     	= token_list[index].get_lex_name().match(/\(/);	
			var tok_rp_m     	= token_list[index].get_lex_name().match(/\)/);	

			if (tok_operator_m != null) {
				//log("contains_operators: Found an operator");
				return true;
			}
			else if (tok_lp_m != null) {
				paren_layer++;
				//log("contains_operators: Found a left paren");
			} 
			else if (tok_rp_m != null) {
				//log("contains_operators: Paren layer = " + paren_layer);
				if(paren_layer <= 0) {
					//log("contains_operators: Found ending paren");
					return false;				
				}
				paren_layer--;
			} 	
			else if (tok_comma_m != null || tok_eos_m != null) {
				//log("contains_operators: Found some weird shit");
				return false;
			}						
		}
	}
	
	/* parse_operater_expression - looks at operator expression and creates a parse tree
		
		Inputs: 
			token_list		- the list of tokens
			index			- the list pointer
			current_parent	- the parent of the tree to be made
			
		Outputs: 
			counter 		- amount of the token_list incremented
	*/
	var parse_operator_expression = function(token_list, index, current_parent) {
		var counter = 0;
		var paren_layer = 1;
		var operator_node = new Syn_node ('TOK_OPERATOR', '');
		
		// look at LHS of the operator expression
		log("parse_operator_expression: LHS looking at " + token_list[index + counter].get_lex_name());
		var tok_lp_m = token_list[index + counter].get_lex_name().match(/\(/);
		// recursively look at the LHS if it is surrounded by parenthesis
		if(tok_lp_m != null) {
			paren_layer++;
			counter++;
			if(contains_operators(token_list, index + counter)) {
				log("Recurring on parse_operator_expression starting at: " + token_list[index + counter]);
				counter += parse_operator_expression(token_list, index + counter, operator_node);
			}
			else {
				log("Recurring on parse_spell_with_arguments with " + token_list[index + counter].get_lex_name());
				counter += parse_spell_with_arguments(token_list, index + counter, operator_node, paren_layer);
			}			
		}
		// otherwise add the single token and increment the counter
		else {
			log("parse_operator_expression: LHS: not a lp");
			var tok_ident_m  = token_list[index + counter].get_lex_name().match(/TOK_IDENT/);
			var tok_number_m = token_list[index + counter].get_lex_name().match(/TOK_NUMBER/);
			// check if its an ident or a number
			if(tok_ident_m == null && tok_number_m == null) {
				log("Parse Error: Expressions are in this format: (expr Op expr)");
				return token_list.length;
			}
			operator_node.adopt(token_list[index + counter]);
			counter++;
		}

		// look at the operator
		log("parse_operator_expression: OP looking at " + token_list[index + counter].get_lex_name());
		var tok_operator_m  = token_list[index + counter].get_lex_name().match(/TOK_OPERATOR/);
		if(tok_operator_m != null) {
			operator_node.set_lex_info(token_list[index + counter].get_lex_info());
			counter++;
		}
		else {
			log("Parse Error: Expressions are in this format: (expr Op expr)");
			return token_list.length;
		}
		
		// look at RHS of the operator expression
		log("parse_operator_expression: RHS looking at " + token_list[index + counter].get_lex_name());
		tok_lp_m = token_list[index + counter].get_lex_name().match(/\(/);
		// recursively look at the LHS if it is surrounded by parenthesis
		if(tok_lp_m != null) {
			paren_layer++;
			counter++;
			if(contains_operators(token_list, index + counter)) {
				log("Recurring on parse_operator_expression starting at: " + token_list[index + counter]);
				counter += parse_operator_expression(token_list, index + counter, operator_node);
			}
			else {
				log("Recurring on parse_spell_with_arguments with " + token_list[index + counter].get_lex_name());
				counter += parse_spell_with_arguments(token_list, index + counter, operator_node, paren_layer);
			}			
		}
		// otherwise add the single token and increment the counter
		else {
			log("parse_operator_expression: RHS: not a lp");
			tok_ident_m  = token_list[index + counter].get_lex_name().match(/TOK_IDENT/);
			tok_number_m = token_list[index + counter].get_lex_name().match(/TOK_NUMBER/);
			// check if its an ident or a number
			if(tok_ident_m == null && tok_number_m == null) {
				log("Parse Error: Expressions are in this format: (expr Op expr)");
				return token_list.length;
			}
			operator_node.adopt(token_list[index + counter]);
			counter++;
		}		
		
		// check that the next token is a right paren
		log("parse_operator_expression: Looking for a rp: " + token_list[index + counter].get_lex_name());
		var tok_rp_m = token_list[index + counter].get_lex_name().match(/\)/);	
		if(tok_rp_m == null) {
			log("Parse Error: Expressions are in this format: (expr Op expr)");
			return token_list.length;		
		}
		//counter++;
		current_parent.adopt(operator_node);
		
		log("parse_operator_expression: sucessfully parsed the operator expression.");
		return counter;
	}
});
