$(document).ready(function() {
	// quick fix to log messages
	function log(msg) {
		setTimeout(function() {
			throw new Error(msg);
		}, 0);
	}
	
	// Game constants
	var background_width = 600;
	var background_height = 400;
	var playable_width = 600;
	var playable_height = 400;
	var canvas_top = 175; //px
	var canvas_left = 50; //px
	
	
	//var canvasPosition = $('#cr-stage').offset();
	
	//log("canvasPosition y: " + canvasPosition.top  + " x: " + canvasPosition.left);
	
	
	player_spells	= {};
	library_spells	= {};
	
	// Generic object size
	Object.size = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};


	/* activate_player_spell	- looks up the player created spell and adds it to the spell tree
		Inputs:	name		- the name of the spell
			arguments	- the arguments of the spell

		Desire behavior:	If it is executing in the spell layer (e.g. spell args, spell args, ...)
						add the spell root to be executed before any other spells (similar to a stack push)
					If it is a spell executed as an argument to another spell
						the spell root needs to be added to place to be executed
						create a temporary variable, call it return_val, to store the return value
						return_val = spell	
	*/

	/* insert_player_spell 	- is a function that creates the spell object and adds it to the player_spells dictionary
		Inputs:	name 		- the string containing the name of the spell
			parameters	- a dictionary of the arguments and their types
			spell_text	- the string containing the text of the spell

	*/
	insert_player_spell = function (name, params, spell_text) {
		var spells_toks = scan(spell_text);	
	/*	log("Starting SCAN");	
		for(var i = 0; i < spells_toks.length;i++) {
			log('tok[' + i + ']: ' + spells_toks[i].get_lex_name());
		}
		log("Ending SCAN\n"); */
		
		//log("Starting PARSE");
		var root_node = parse(spells_toks);
		//log("Ending PARSE\n");
		var spell_info = {'params':params, 'funct':root_node, 'spell_text':spell_text};

		player_spells[name] = spell_info;
		log("Inserting player spell " + name + " paired with " + spell_info.toString());		
	}

	/* game components */
	/* PlayerManager - Holds the required entities and values to run a player
		
		Values:
			Current_mana
			Maximum_mana
			Mana_regen
			active_spells - dictionary holding every spell the player has cast
			
		Entities:
			Player
			Manabar
			SpellMenu
			
		Methods:
			destroySpells - destroys all the spells
			incrementMana
			decrementMana
			
			
	*/
	Crafty.c("PlayerManager", {
		init: function() {
			this.bind('EnterFrame', function () {
				/* Game tick for player 
					- Increment Mana
					- evaluate/calc manacost (RTSI) for each spell
					- total_manacost = add up the mana cost of the current spells
					- Decrement Mana with total_manacost
					- If cost of executing spells > 0, all spells are destroyed
				
				*/
				// increment mana
				this.incrementMana(this.mana_regen);

				// make sure that 
				if(this.mana <= 0 && Object.size(this.active_spells) != 0) {
					log("Destroying spells");
					//for(spell_id in this.active_spells) {
						Crafty("Spell").each(function() { this.destroy() } );
					//}
				}
			});
			/* Cast - Will be functionized. Casts a spell
				Preconditions: player.mana - spell.manacost > 0
				Postconditions: spell is cast
			*/
			this.bind('Cast', function(spell_name_and_arguments) {
				
				var spell_name 		= spell_name_and_arguments[0];
				var spell_arguments = spell_name_and_arguments[1];
				
				var spell_info = player_spells[spell_name];
				if(spell_info == undefined) {
					log(spell_name + " is not a spell");
					return;
				}
				//var params = spell_info['params'];
				var params = {};
				var params_list = spell_info['params'].split(" ");
				// verify arguments == params
				for(index in params_list) {
					log("Adding argument value: " + spell_arguments[index] + " to parameter: " + params_list[index]);
					params[params_list[index]] = spell_arguments[index];
				}
				
				var spell_root = spell_info['funct'].copy();

				//var my_x = getMyX();
				//var my_y = getMyY();
				/* general cast - this looks up the spell in the player spell dict and initializes a Spell entity
				
				
				*/ 
				log("Cast called with player_id: " + this[0] + " spell_name: " + spell_name);
				var spell = Crafty.e("Spell")
					.spell(this[0], spell_name, spell_root, params);	
						
				
				this.active_spells[spell[0]] = spell.getName();
				
				// determine manacost of spell and decrement it
				this.decrementMana(10);
				//log("Player casts: " + spell[0] + " at the manacost: " + spell.getManaCost());
				
			});
		},
		
		// constructor for the player
		// Mana - the player will have a static amount of mana that is used to cast spells. 
		//	      When mana reaches 0, all of his/her spells disappear
		// Mana Regen - how much mana will regen per game tick
		// active_spells - all the active spells this player has cast
		// spell_book - symbol table for spells
		// Actions - a queue for storing the spells a player has to cast
		playermanager: function(maximum_mana, mana_regen, manabar) {
			this.maximum_mana = maximum_mana;
			this.mana = 0;
			this.mana_regen = mana_regen;
			this.manabar = manabar;
			this.active_spells = {};
			log("Mana " + this.mana);
			return this;
		},
		incrementMana: function(amount) {
			this.mana += amount;
			if(this.mana + amount > this.maximum_mana) {
				this.mana = this.maximum_mana;
			}
			// log("Current Mana: " + this.mana);
			// update manabar
			this.manabar.trigger("ChangeMana", this.mana);
		},
		decrementMana: function(mana_cost) {
			this.mana -= mana_cost;
			// update manabar
			//log("Decrementing mana to: " + this.mana + " with the amount of " + mana_cost);
			this.manabar.trigger("ChangeMana", this.mana);
		}

	});

	Crafty.c("Collidable", {
		init: function() {
		},
		
		// constructor for the projectile
		collidable: function() {
			return this;
		},		
	});
	
	Crafty.c("PhysicalSpell", {
		init: function() {
			this.requires('2D');
			this.requires('Collision');
			this.requires('Color');
		},
		
		// constructor for the projectile
		physicalspell: function(size, xStartingPos, yStartingPos, color) {
			this.attr({ x: xStartingPos, y: yStartingPos, w: size, h: size, dX: 0, dY: 0 })
			.color(color)
			.bind('EnterFrame', function () {
				//hit floor or roof
				if (this.y <= 0 || this.y >= (playable_height - 10))
					this.destroy();

				if (this.x <= 0 || this.x >= (playable_width - 10))
					this.destroy();

				this.x += this.dX;
				this.y += this.dY;
			})
			return this;
		},
		accelerate: function(direction, speed) {
				direction = direction * Math.PI / 180;
				var additionaldX = Math.sin(direction) * speed;
				var additionaldY = Math.cos(direction) * speed;
				log("Accelerating dX: " + additionaldX + " dY: " + additionaldY);
				this.attr({ dX: this.dX + additionaldX, dY: this.dY + additionaldY });
		},
		selfDestruct: function() {
			this.destroy();
		}

	});
	
	/* 
	Spell - Runs each spell by executing one step of the RTSI per frame
		Values:
			name		- holds the spell name (later will be generated from the caster's name)
			parent		- the caster of the spell
			spell_ast	- the abstract syntax tree of the spell
			
		Methods:
			shape 		- makes the spell physical
			realTimeSpellInterpreter 	- 
				This guy will work as a small step interpreter. It will evaluate one spell cast at a time 
				(separated by the commas).
				
				Inputs: One spell_root
				
				Psuedo Code:
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

			activate_player_spell_spell	- looks up the player created spell and adds it to the spell tree
				Inputs:	name		- the name of the spell
					arguments	- the arguments of the spell

				Desired behavior:	If it is executing in the spell layer (e.g. spell args, spell args, ...)
								add the spell root to be executed before any other spells 
								(similar to a stack push)

			activate_player_spell_argument	- looks up the player created spell and 
				Inputs: name
					arguments

				Desired behavior:	If it is a spell executed as an argument to another spell
								the spell root needs to be added to place to be executed
								create a temporary variable, call it return_val, to store the return value
								return_val = spell
	
	*/
	Crafty.c("Spell", {
		init: function() {

			this.bind('EnterFrame', function () {
				// update the cursor variable
				this.variables['cursor'] = getCursorDirection(this._x, this._y);
				//log("Parent_id = " + this.parent_id);
				if(this.spell_ast.get_children().length != 0) {
					this.realTimeSpellInterpreter(this.spell_ast.shift_child());
				}				
			});
		},
		
		// constructor for spell
		spell: function(player_id, spell_name, spell_ast, parameters) {
			this.name = spell_name;
			this.parent_id = player_id;
			this.spell_ast = spell_ast;
			this.variables = parameters;
			log(this.name + " initialized with player_id: " + this.parent_id);
			return this;
		},
		
		/* Things to consider 
				- What happens when two shapes are cast in the same spell?
				- What happens when shape is called during a recur?	
		*/
		shape: function (size) {
			log("Shaping a spell of size " + size);
			//log("player_id: " + player_id);
			//log("size: " + size);

			this.addComponent("2D, Canvas, Collision, PhysicalSpell").physicalspell(size, getMyX(), getMyY(), 'rgb(255,10,10)');
		},
		getName: function() {
			return this.name; 
		},
		/* Preconditions - spell_root != undefined */
		realTimeSpellInterpreter: function(spell_root) {	
			var children = spell_root.get_children();
			//for(var i = 0; i < children.length; i++) {
			//	log("children[" + i + "]:" + children[i].get_lex_info());
			//}
			var spell_name = children[0].get_lex_info();
			var arguments = children.slice(1);
			// look at the arguments of the spell and call the evaluate_expression on any operator
			for(var i = 0; i < arguments.length; i++) {
				if(arguments[i].get_lex_name() == 'TOK_OPERATOR') {
					arguments[i] = this.evaluate_expression(arguments[i]);
				}
				else if(arguments[i].get_lex_name() == 'TOK_IDENTIFIER') {
					var ident_lookup = this.variables[arguments[i].get_lex_info()];
					if(ident_lookup == undefined) {
						log("Interpreter Error: " + arguments[i].get_lex_info() + " needs to be a parameter with a value.");
						return;
					}
					arguments[i] = ident_lookup;
				}
				else if(arguments[i].get_lex_name() == 'TOK_NUMBER') {
					arguments[i] = arguments[i].get_lex_info();
				}
				else {
					log("Interpreter Error: " + arguments[i].get_lex_name() + " should not be here.");
					return;					
				}
			}
			//var parameters = [this].concat(arguments);
			var spell_success = activate_library_spell(this, this.parent_id, spell_name, arguments);
			if(!spell_success) {
				log("Trying the player spell library");
				this.activate_player_spell_spell(spell_name, arguments);
			}
			//log("Player_id: " + this.parent_id);
			Crafty(this.parent_id).decrementMana(1);
		},
		activate_player_spell_spell: function(name, spell_arguments) {
			log("Trying to cast " + name);
			var spell_info = player_spells[name];
			if(spell_info == undefined) {
				log(name + " is not a spell");
				return;
			}
			var params = {};
			var params_list = spell_info['params'].split(" ");
			// verify arguments == params
			for(index in params_list) {
				log("Adding argument value: " + spell_arguments[index] + " to parameter: " + params_list[index]);
				this.variables[params_list[index]] = spell_arguments[index];
			}
			var spell_root = spell_info['funct'].copy();
			log("Adding " + name + "'s root " + spell_root);
			var spell_children = spell_root.get_children();
			this.spell_ast.unshift_children(spell_children);
		},
		/* evaluate_expression - takes in an expression tree and returns a number or a bool */
		/* should probably do some type checking */
		evaluate_expression: function(expression_root) {
			if(expression_root == undefined) {
				return undefined;
			}			
			var node_name 	= expression_root.get_lex_name();
			var children 	= expression_root.get_children();
			/*log("Length of the children " + children.length);
			for(var i = 0; i < children.length; i++) {
					log("children[" + i + "]:" + children[i].get_lex_info());
				} */
			if (node_name == 'TOK_OPERATOR') {
				if(children.length != 2) {
					log("Interpreter Error: Binary Operators need two arguments.");
					return undefined;
				}
				var left_child_value		= this.evaluate_expression(children[0]);
				var right_child_value		= this.evaluate_expression(children[1]);
				if(left_child_value == undefined || right_child_value == undefined) {
					return undefined;
				}
				// this is the grossest thing I have ever done
				log("The operator " + expression_root.get_lex_info());
				log("The string to call eval with " + left_child_value.toString() + expression_root.get_lex_info() + right_child_value.toString());
				return eval(left_child_value + expression_root.get_lex_info() + right_child_value);
			}
			else if(node_name == 'TOK_NUMBER') {
				return expression_root.get_lex_info();
			}
			else if(node_name == 'TOK_IDENTIFIER') {
				var variable = this.variables[expression_root.get_lex_info()];
				if(variable == undefined) {
					return undefined;
				}
				return variable;
			}
		},
	}); 
	/* end game components */


	/* general purpose global functions */
	// need getters for the mouse position and player position
	function getMouseX() {
		var mousepos = Crafty("MousePos");
		return mousepos._x;
	}

	function getMouseY() {
		var mousepos = Crafty("MousePos");
		return mousepos._y;
	}

	getMyX = function() {
		var player1 = Crafty("Player1");
		return player1._x;
	}

	getMyY = function() {
		var player1 = Crafty("Player1");
		return player1._y;
	}
	/* end general purpose global functions */

	var getCursorDirection = function (myX, myY) {
		// tan((mouseX - playerX)/(mouseY - playerY))
		//log("xMe: " + getMyX() + " xCursor: " + getMouseX() + " yMe: " + getMyY() + " yCursor: " + getMouseY()); 
		var yDifference = getMouseY() - (myY + canvas_top);
		var xDifference = getMouseX() - (myX + canvas_left);
		//log("xDifference: " + xDifference + " yDifference: " + yDifference);
		//log("hypDist: " + hypDist);
		//log("Angle: " + Math.atan2(xDifference, yDifference) * (180 / Math.PI));
		return Math.atan2(xDifference, yDifference) * (180 / Math.PI);
	}
	
	
	function init() {
		Crafty.init(background_width, background_height);
		Crafty.background('rgb(127,127,127)');	
		
		// test insert
		insert_player_spell('fireball', '', 'shape 6, accelerate cursor 2');  
		insert_player_spell('space_bar_to_cast', '', 'fireball');

		var spell = 'shape ((0 - 1) * 2)';

		var spells_toks = scan(spell);
		
		/*log("Starting SCAN");	
		for(var i = 0; i < spells_toks.length;i++) {
			log('tok[' + i + ']: ' + spells_toks[i].get_lex_name());
		}
		log("Ending SCAN\n"); */
		
		log("Starting PARSE");
		var root_node = parse(spells_toks);
		log("Ending PARSE\n");

		log('traversal : ' + root_node.toString());
		// depth first traversal of the grammar tree

		
		var mousepos = Crafty.e("MousePos, Canvas, 2D, Text")
			.attr({ x: 20, y: 20, w: 100, h: 20 })
			//.text("(0,0)");
		
		/* Manabar - should move to a component probably
			- The event to change the mana is 'ChangeMana' which accepts an int */
		Crafty.e("ManabarBack, Canvas, 2D, Color")
			.attr({ x: 5, y: 5, w: 102, h: 10, dX: 0, dY: 0})
			.color('rgb(0,0,0)')

		var manabar = Crafty.e("Manabar, DOM, 2D, Color")
			.attr({ x: 6, y: 6, w: 100, h: 8, dX: 0, dY: 0})
			.color('rgb(0,0,255)')
			.bind("ChangeMana", function(current_mana) {
				//log("Mana will be changed to " + current_mana );
				if(current_mana < 0) {
					this.w = 0;
				}
				else this.w = current_mana;
			})
			
		//Main character
		var player1 = Crafty.e("Player1, PlayerManager, 2D, Canvas, Color, Keyboard, Multiway")
			.playermanager(100,1, manabar)
			.color('rgb(0,255,0)')
			.attr({ x: 150, y: 150, w: 25, h: 25 })
			.multiway(4, {W: -90, S: 90, D: 0, A: 180})
			.bind("KeyDown", function(e) {
				var spell_name = 'space_bar_to_cast';
				if (this.isDown('SPACE')) {
					this.trigger("Cast", [spell_name, []]);
				}
			})
	
	
		//Target Dummy
		/*var targetDummy = Crafty.e("TargetDummy, 2D, Canvas, Color")
			.color('rgb(0,155,255)')
			.attr({ x: 400, y: 250, w: 15, h: 15 }) */
	
		// this event somehow keeps the mousepos entity up to date with the correct coordinates
		Crafty.addEvent(this, "mousemove", function(e) {
			//log("MouseX " + e.clientX + " MouseY: " + e.clientY);
			mousepos.attr({ x: e.clientX , y: e.clientY, w: 100, h: 20 }); 
		});
	};

	init()
});
