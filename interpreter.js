/* This file contains the scanner and parser for the langauge 

 All in all, the functions take in a string, and output an abstract syntax tree */


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
$(document).ready(function() {
	function log(msg) {
		setTimeout(function() {
			throw new Error(msg);
		}, 0);
	}
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
	function scan(spell) {
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

/*
	function parse(token_list) {
		// create the root node
		var root = new Syn_node ('TOK_ROOT', '');
		// read through the token list
		var saved_tok = '';
		for(var i = 0; i < token_list.length; i++) {
			// if the token is an identifier or a keyword, cache it for later
			var tok_cursor_m = token_list[i].get_lex_name().match(/TOK_CURSOR/);
			if (tok_cursor_m != null) {
				saved_tok = token_list[i];
			}
			var tok_move_m = token_list[i].get_lex_name().match(/TOK_MOVE/);
			if (tok_move_m != null) {
				saved_tok = token_list[i];
				continue;
			} 
			var tok_shape_m = token_list[i].get_lex_name().match(/TOK_SHAPE/);
			if (tok_shape_m != null) {
				saved_tok = token_list[i];
				continue;
			}
			var tok_fire_m = token_list[i].get_lex_name().match(/TOK_FIRE/);
			if (tok_fire_m != null) {
				saved_tok = token_list[i];
				continue;
			}
			var tok_ident_m = token_list[i].get_lex_name().match(/TOK_IDENT/);
			if (tok_ident_m != null) {
				saved_tok = token_list[i];
				continue;
			} 
			// if the token is a left PAREN
			if(token_list[i].get_lex_name() == ',') {
				// adopt the the previous name
				//log("Found '(' and adopted: " + saved_tok.get_lex_name());
				saved_tok.adopt(token_list[i]);
				// grab the rest until a ')'
				i++;
				for(; i < token_list.length; i++) {
					//log("Adopting " + token_list[i].get_lex_name());
					// if it finds the ')', adopt the token and break
					if(token_list[i].get_lex_name() == ')') {
						saved_tok.adopt(token_list[i]);
						break;
					}
					
					// otherwise adopt the token

					saved_tok.adopt(token_list[i]);
					
				}
				root.adopt(saved_tok);
				continue;
			} 
			// throw an error if nothing picks up the token
		}
		return root;
	}; */
	
	
	
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
	function parse(token_list) {
		// create the root node
		var root = new Syn_node ('TOK_ROOT', '');
		var current_parent = root;
		// read through the token list
		var current_cast = new Array();
		for(var i = 0; i < token_list.length; i++) {
		
			var tok_error_m = token_list[i].get_lex_name().match(/ERR_TOKEN/);
			if (tok_error_m != null) {
				log("Error. Quiting.");
				break;
			} 		
			
			var tok_ident_m = token_list[i].get_lex_name().match(/TOK_IDENT/);
			if (tok_ident_m != null) {
				current_cast.push(token_list[i]);
				continue;
			} 		
			
			/*var tok_shape_m = token_list[i].get_lex_name().match(/TOK_SHAPE/);
			if (tok_shape_m != null) {
				current_cast.push(token_list[i]);
				continue;
			} */
			
			/*var tok_fire_m = token_list[i].get_lex_name().match(/TOK_FIRE/);
			if (tok_fire_m != null) {
				current_cast.push(token_list[i]);
				continue;
			} */	
			
			var tok_comma_m = token_list[i].get_lex_name().match(/,/);		
			if (tok_comma_m != null) {
				current_parent.adopt(token_list[i]);
				current_parent = token_list[i];
				current_parent.adopt_array(current_cast);
				while(current_cast.length != 0) {
					current_cast.pop();
				}
				continue;
			}			
			var tok_eos_m = token_list[i].get_lex_name().match(/TOK_EOS/);			
			if (tok_eos_m != null) {
				current_parent.adopt_array(current_cast);
				while(current_cast.length != 0) {
					current_cast.pop();
				}
				continue;
			}			
		}
		return root;
	};	

	/* parse_spell_with_arguments - takes in a token_list and looks for an ident and arguments 
		Output - will output a token list
	*/
	function parse_spell_with_arguments(token_list, current_parent) {
		// The first token must be an identifier or a library spell
		//var tok_shape_m = token_list[i].get_lex_name().match(/TOK_SHAPE/);
		var tok_ident_m = token_list[i].get_lex_name().match(/TOK_IDENT/);
		//if (tok_shape_m != null) {
		//	current_cast.push(token_list[i]);
		//}
		if (tok_ident_m != null) {
			current_cast.push(token_list[i]);
		} 	
		else { // throw an error
			log("Error. casting a spell must start with a library spell or a declared spell.");
			return;
		}
		// Arguments must be numbers
		for(var i = 1; i < token_list.length; i++) {
			
		}
	}
		
	function rec_traverse_grammar_tree(spell_root, component_list) {
		// it will be a recursive function that switches on the lex_name
		// each lex_name will have a different effect
		// for example:
			// for the lex_name '('
			// the first child must be an identifier or a keyword
			// that first child
		
		switch(spell_root.get_lex_name())
		{
		// TOK_ROOT - TOK_ROOT is the only name
			// may have 1+ children
			// children may be spells (for right now)
			// error: Please check your syntax
		case 'TOK_ROOT':
			var children = spell_root.get_children();
			for(var i = 0; i < children.length; i++) {
				// need to check to make sure it is a spell (hash of the valid spells)
				rec_traverse_grammar_tree(children[i]);
			}
			break;
			
		// Spells - (identifier or keywork) 
			// may have 2+ children
			// first child must be '(', last child must be ')', other children can be numbers, identifiers, or keywords
			// error: spell dependent, but invalid arguments
		
		// Shape - TOK_SHAPE
			// must contain ( ELEMENT ) as the children
		case 'TOK_SHAPE':
			var children = spell_root.get_children();		
			if(children[0].get_lex_name != '(' || children[children.length - 1].get_lex_name != ')') {

				log("Invalid Arguments");
			}	
			//component_list.push({'Projectile': ['lewl']});
			// create a storage system for all the variables
			// array of projectiles each with their own component hash
				// {component : necessary data}
			// deal with element
			switch(children[1].get_lex_name)
			{
			case 'TOK_FIRE':
			//	component_list.push({'Color':['rgb(255,10,10)']});
				break;
				
			default:
				// output error (INVALID ELEMENT)
				break;
			}
			mousepos_x = getMouseX();
			mousepos_y = getMouseY();
			my_x = getMyX();
			my_y = getMyY();
			var speed = 3;
			var direction = Math.atan2(mousepos_x - my_x, mousepos_y - my_y );
			Crafty.e("2D, DOM, Collision, Projectile, Color, Spell")
				.projectile(8, my_x, my_y , direction, speed)
				.color('rgb(255,10,10)')
				.spell('Fireball', player1)
			break;
			
		// Move - TOK_MOVE
			// must contain ( DIRECTION, VELOCITY ) as the children
		case 'TOK_MOVE':
			var children = spell_root.get_children();		
			if(children[0].get_lex_name != '(' || children[children.length - 1].get_lex_name != ')') {
				// output error (INVALID ARGUMENTS)
			}		
		
			break;
		
		
		
		default:
			log('FAIL');
			return -1;
		}
		return 0;
	};

	// this function needs to traverse the spell_tree and create the corrrect entities
	// Output - a storage system for holding all the entities and their data
	function traverse_grammar_tree(spell_root) {
		//var generated_entities = new entity_storage();
		
		rec_traverse_grammar_tree(spell_root);
		
		return;// generated_entities;
	};

	//function init() {
	//	Crafty.init(600, 300);
	//	Crafty.background('rgb(127,127,127)');	
		
	var spells_toks = new Array();
	spell = 'shape, accelerate (calc 5 0) 10';

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
	traverse_grammar_tree(root_node);

			
	//};

	//init();
});
