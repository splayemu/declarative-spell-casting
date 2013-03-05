$(document).ready(function() {
	// quick fix to log messages
	function log(msg) {
		setTimeout(function() {
			throw new Error(msg);
		}, 0);
	}
	
	// Game constants
	background_width = 600;
	background_height = 400;
	playable_width = 600;
	playable_height = 400;
	
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
			this.bind('Cast', function(params) {
				//manabar = params[0];
				var spell_name = params[0];
				var spell_ast = params[1];
				var my_x = getMyX();
				var my_y = getMyY();
				/* general cast - this will
				
				
				*/ 
				log("Cast called with player_id: " + this[0] + " spell_name: " + spell_name);
				var spell = Crafty.e("Spell")
					.spell(this[0], "_" + spell_name, spell_ast);	
						
				//this.mana -= mana_cost;
				//manabar.trigger("ChangeMana", this.mana);
				//var spell = shape("fire", 8);
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


	/* game components */
	
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
				var additionaldX = Math.sin(direction) * speed;
				var additionaldY = Math.cos(direction) * speed;
				//log("Accelerating dX: " + additionaldX + " dY: " + additionaldY);
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
				//log("Parent_id = " + this.parent_id);
				if(this.spell_ast.get_children().length != 0) {
					this.realTimeSpellInterpreter(this.spell_ast.shift_child());
				}				
			});
		},
		
		// constructor for spell
		spell: function(player_id, spell_name, spell_ast) {
			this.name = spell_name;
			this.parent_id = player_id;
			this.spell_ast = spell_ast;
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
			//var parameters = [this].concat(arguments);
			var spell_success = activate_library_spell(this, this.parent_id, spell_name, arguments);
			if(!spell_success) {
				log("Trying the player spell library");
				this.activate_player_spell_spell(spell_name, arguments);
			}
			//log("Player_id: " + this.parent_id);
			Crafty(this.parent_id).decrementMana(1);
		},
		activate_player_spell_spell: function(name, arguments) {
			log("Trying to cast " + name);
			var spell_info = player_spells[name];
			if(spell_info == undefined) {
				log(name + " is not a spell");
				return;
			}
			var params = spell_info['params'];
			// verify arguments == params
			var spell_root = spell_info['funct'].copy();
			log("Adding " + name + "'s root " + spell_root);
			var spell_children = spell_root.get_children();
			this.spell_ast.unshift_children(spell_children);
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


	
	function init() {
		Crafty.init(background_width, background_height);
		Crafty.background('rgb(127,127,127)');	
		
		// test insert
		insert_player_spell('fireball', {}, 'shape 10, accelerate 3 2');
		//insert_player_spell('speedup', {}, 'accelerate 3 2, speedup');  
		var spell = 'fireball';

		var spells_toks = scan(spell);
		
		log("Starting SCAN");	
		for(var i = 0; i < spells_toks.length;i++) {
			log('tok[' + i + ']: ' + spells_toks[i].get_lex_name());
		}
		log("Ending SCAN\n");
		
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
			.attr({ x: 300, y: 150, w: 25, h: 25 })
			.multiway(4, {W: -90, S: 90, D: 0, A: 180})
			.bind("KeyDown", function(e) {
				if (this.isDown('SPACE')) {
					spell_root = root_node.copy();
					// find player id
					var params = ["block", spell_root];
					this.trigger("Cast", params);
					//tree_str = root_node.toString();
					//log('traversal : ' + tree_str);
				}
			})
	
		// this event somehow keeps the mousepos entity up to date with the correct coordinates
		Crafty.addEvent(this, "mousemove", function(e) {
			mousepos.attr({ x: e.clientX , y: e.clientY, w: 100, h: 20 }); 
		});
	};

	init()
});
