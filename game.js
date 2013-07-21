/*	game.js	- file that contains all the craftyJs components and entities. Initializes the game world.

*/
$(document).ready(function() {
	// Sample log outprint code found on the internet
	function log(msg) {
		setTimeout(function() {
			throw new Error(msg);
		}, 0);
	}
	
	// canvas constants
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
	
	/* 	size - returns the size of the object
		
		Found somewhere on stackoverflow
	*/
	Object.size = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};

	/*	insertPlayerSpell 	- creates the spell object and adds it to the player_spells dictionary
		Inputs:	name 		- the string containing the name of the spell
				parameters	- a dictionary of the arguments and their types
				spell_text	- the string containing the text of the spell
	*/
	insertPlayerSpell = function (name, params, spell_text) {
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
		log("Inserting player spell " + name + " paired with " + root_node);		
	}

	/*	game components - components are used by the crafty engine to give methods and values to an entity */

	/*	Manabar - the values and methods useful for managing a manabar 

		Considering changing this component to an interface manager

	*/
	Crafty.c("Manabar", {
		init: function () {
		},
		manabar: function (xLocation, yLocation, width, maximum_mana) {
			this.back = Crafty.e("2D, Color, Canvas")
				.attr({ x: xLocation, y: yLocation, w: width + 2, h: 10, dX: 0, dY: 0})
				.color('rgb(0,0,0)');
			this.front = Crafty.e("2D, Color, Canvas")
				.attr({ x: xLocation + 1, y: yLocation + 1, w: width, h: 8, dX: 0, dY: 0})
				.color('rgb(0,0,255)');
			this.bind("ChangeMana", function(current_mana) {
					this.changeMana(current_mana);
				});
			this.maximum_width = width;
			this.maximum_mana = maximum_mana;
			this.width_per_mana = width / maximum_mana;
			log("Manabar construction with max_mana: " + maximum_mana + " and width " + width);
			return this;
			
		},
		setMaximumMana: function(maximum_mana) {
			this.maximum_mana = maximum_mana;
			this.width_per_mana = this.maximum_width / maximum_mana;			
		},
		setWidth: function(width) {
			this.maximum_width = width;
			this.width_per_mana = width / maximum_mana;			
		},
		changeMana: function(mana) {
			log("changeMana called with " + mana + " width_per_mana: " + this.width_per_mana);
			if(mana < 0) {
				this.front.w = 0;
			}
			else this.front.w = mana * this.width_per_mana;			
		}

	});
	/*	PlayerManager - gives the values and methods useful for managing a player
		
		Values:
			mana 			- Mana is used to keep track of the amount of spells a player has casted.
								All spells decrement mana upon casting.
								When mana reaches 0, all of the player's spells disappear.
			maximum_mana	- the greatest amount of mana a player can have
			mana_regen		- how much mana will regen per game tick
			manabar			- the id of the player's coresponding manabar entity (shows the player how much mana he/she has)
			active_spells 	- a dictionary holding all of the player's active spells
			
		Methods:
			destroySpells - destroys all the spells
			incrementMana
			decrementMana		
	*/
	Crafty.c("PlayerManager", {
		init: function() {
			/* EnterFrame - happens every tick of the game. The game tick of a player should:
				- Increment Mana
				- If mana <= 0, 
					destroy all spells
			*/
			this.bind('EnterFrame', function () {
				this.incrementMana(this.mana_regen);

				if(this.mana <= 0 && Object.size(this.active_spells) > 0) {
					//log("Destroying spells");
					Crafty("Spell").each(function() { this.destroy() } );
				}
			});

			this.bind('Cast', function(spell_name_and_arguments) {
				
				var spell_name 		= spell_name_and_arguments[0];
				var spell_arguments = spell_name_and_arguments[1];
				this.cast(spell_name, spell_arguments);
				
			});
		},
		
		/* 	playermanager - creates a playermanager entity
		*/
		playermanager: function(maximum_mana, mana_regen, manabar_x, manabar_y, manabar_width) {
			this.mana = 0;
			this.maximum_mana = maximum_mana;
			this.mana_regen = mana_regen;
			this.active_spells = {};
			
			this.back = Crafty.e("2D, Color, Canvas")
				.attr({ x: manabar_x, y: manabar_y, w: manabar_width + 2, h: 10, dX: 0, dY: 0})
				.color('rgb(0,0,0)');
			this.front = Crafty.e("2D, Color, Canvas")
				.attr({ x: manabar_x + 1, y: manabar_y + 1, w: manabar_width, h: 8, dX: 0, dY: 0})
				.color('rgb(0,0,255)');
			this.manabar_width = manabar_width;
			this.width_per_mana = manabar_width / maximum_mana;
			log("Manabar construction with max_mana: " + maximum_mana + " and width " + manabar_width);
			
			return this;
		},
		setMaximumMana: function(maximum_mana) {
			this.maximum_mana = maximum_mana;
			this.width_per_mana = this.manabar_width / maximum_mana;			
		},
		setManabarWidth: function(manabar_width) {
			this.manabar_width = manabar_width;
			this.width_per_mana = manabar_width / maximum_mana;			
		},
		changeMana: function(mana) {
			//log("changeMana called with " + mana + " width_per_mana: " + this.width_per_mana);
			if(mana < 0) {
				this.front.w = 0;
			}
			else this.front.w = mana * this.width_per_mana;			
		},
		
		/*	incrementMana - adds the amount to the player and updates the manabar
			Inputs:
				amount	- amount to add to the mana
		*/
		incrementMana: function(amount) {
			this.mana += amount;
			if(this.mana + amount > this.maximum_mana) {
				this.mana = this.maximum_mana;
			}
			// log("Current Mana: " + this.mana);
			// update manabar
			this.changeMana(this.mana);
		},
		/*	decrementMana - subtracts mana from the player and updates the manabar
			Inputs:
				amount	- amount to subtract from mana
		*/
		decrementMana: function(amount) {
			this.mana -= amount;
			// update manabar
			//log("Decrementing mana to: " + this.mana + " with the amount of " + amount);
			this.changeMana(this.mana);
		},
		/*	cast - this looks up the spell in the player spell dict and initializes a Spell entity
				
				
		*/ 
		cast: function(spell_name, spell_arguments) {
			var spell_info = player_spells[spell_name];
			if(spell_info == undefined) {
				log(spell_name + " is not a spell");
				return;
			}

			var params = {};
			var params_list = spell_info['params'].split(" ");
			// verify arguments == params
			// assign argument values to respective parameters
			for(index in params_list) {
				log("Adding argument value: " + spell_arguments[index] + " to parameter: " + params_list[index]);
				params[params_list[index]] = spell_arguments[index];
			}
				
			var spell_root = spell_info['funct'].copy();

			log("Cast called with player_id: " + this[0] + " spell_name: " + spell_name);
			var spell = Crafty.e("Spell")
				.spell(this[0], spell_name, spell_root, params);	
						
			this.active_spells[spell[0]] = spell.getName();
		},
	});

	/*	Collidable - gives the methods and values that allow objects to collide into each other
	
		Work in progress
	*/
	Crafty.c("Collidable", {
		init: function() {
		},
		
		// constructor for the projectile
		collidable: function() {
			return this;
		},		
	}); 
	
	/*	PhysicalSpell - component that gives physical 2d properties to a spell. Gives them color and acceleration.
	
		Values:
			size	- the length (in pixels) of each side of the entity
			x		- the x location of the entity
			y		- the y location of the entity
			color	- the color of the entity
		
		Methods:
			physicalspell
			accelerate
			selfDestruct
	*/
	Crafty.c("PhysicalSpell", {
		init: function() {
			this.requires('2D');
			//this.requires('Collision');
			this.requires('Color');
			this.bind('EnterFrame', function () {
				//hit floor or roof
				if (this.y <= 0 || this.y >= (playable_height - 10))
					this.destroy();

				if (this.x <= 0 || this.x >= (playable_width - 10))
					this.destroy();

				// check for colisions with colidable objects that aren't you
			/*	var collisions = this.hit("Collidable");
				if (collisions != false) {
					for(each_collision in collisions) {
						//if(each_collision["obj"] != Crafty(this.parent_id)) {
							log("Collided with " + each_collision + " and " + each_collision.obj);
							//this.destroy();				
						//}
					}
				} */
					
				this.x += this.dX;
				this.y += this.dY;
			});
		},
		
		/*	physicalspell - the constructor for the physicalspell component
		*/
		physicalspell: function(size, xStartingPos, yStartingPos, color) {
			this.attr({ x: xStartingPos, y: yStartingPos, w: size, h: size, dX: 0, dY: 0 })
				.color(color);

			return this;
		},
		/*	accelerate - adds an acceleration to a physical spell
		
			Inputs:
				direction	- the direction in degress of the acceleration
				amount		- the amount of acceleration to add
		*/
		accelerate: function(direction, amount) {
				direction = direction * Math.PI / 180;
				var additionaldX = Math.sin(direction) * amount;
				var additionaldY = Math.cos(direction) * amount;
				log("Accelerating dX: " + additionaldX + " dY: " + additionaldY);
				this.attr({ dX: this.dX + additionaldX, dY: this.dY + additionaldY });
		},
		/*	selfDestruct - calls the entities destroy method
		*/
		selfDestruct: function() {
			this.destroy();
		}

	});
	
	/* 	Spell - Runs each spell by executing one step of the RTSI per frame
		
		Values:
			name		- holds the spell name (later will be generated from the caster's name)
			parent		- the caster of the spell
			spell_ast	- the abstract syntax tree of the spell
			variables	- holds the current variables that the spell has access to. E.G. arguments passes into the spell
		
		Methods:
			spell
			getName
			shape
			realTimeSpellInterpreter
			activatePlayerSpellSpell
			evaluateExpression
			
		To Work On:
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
			this.variables["true"] = true;
			this.variables["false"] = false;			
			log(this.name + " initialized with player_id: " + this.parent_id);
			return this;
		},
		getName: function() {
			return this.name; 
		},
		
		/* 	shape - adds a physical component to a spell entity. Initializes the physical component with a length and width of size
		
			Things to consider 
					- What happens when two shapes are cast in the same spell?
					- What happens when shape is called during a recur?	
		*/
		shape: function (size) {
			log("Shaping a spell of size " + size);
			//log("player_id: " + player_id);
			//log("size: " + size);

			var parent = Crafty(this.parent_id);
			
			this.addComponent("2D, Canvas, PhysicalSpell").physicalspell(size, parent._x, parent._y, 'rgb(255,10,10)');
		},
		
		/* 	realTimeSpellInterpreter - function that traverses the spell parse tree, looks up and calls library spells, 
										and looks up and adds the parse tree of the player spell to the current parse tree
				
			Inputs: spell_root
				
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
		*/
		realTimeSpellInterpreter: function(spell_root) {	
			var children = spell_root.get_children();
			//for(var i = 0; i < children.length; i++) {
			//	log("children[" + i + "]:" + children[i].get_lex_info());
			//}
			var spell_name = children[0].get_lex_info();
			var arguments = children.slice(1);
			// look at the arguments of the spell and call the evaluateExpression on any operator
			for(var i = 0; i < arguments.length; i++) {
				if(arguments[i].get_lex_name() == 'TOK_OPERATOR') {
					arguments[i] = this.evaluateExpression(arguments[i]);
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
				else if(arguments[i].get_lex_name() == 'TOK_SPELL') {
					log("Found a spell as an argument");
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
				this.activatePlayerSpellSpell(spell_name, arguments);
			}
			//log("Player_id: " + this.parent_id);
			Crafty(this.parent_id).decrementMana(1);
		},
		/*	pushSpellAst - pushes a spell with arguments to be executed 
			Inputs: spell_root	- the root of the spell to be added to be executed
			
			Desired behavior:	add the spell root to be executed before any other spells 
								(similar to a stack push)
		
		pushSpellAst: function(spell_root) {
			log("Adding " + name + "'s root " + spell_root);
			this.spell_ast.unshift_children(spell_root);	
		},*/
		/*	activatePlayerSpellSpell	- looks up the player created spell and adds it to the spell tree
			Inputs:	name		- the name of the spell
					arguments	- the arguments of the spell

			Desired behavior:	If it is executing in the spell layer (e.g. spell args, spell args, ...)
								add the spell root to be executed before any other spells 
								(similar to a stack push)
		*/
		activatePlayerSpellSpell: function(name, spell_arguments) {
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
		
		/* 	evaluateExpression - traverses an expression tree and returns a number or a bool
			Inputs: expression_root	- an expression tree
			
			Work on:
				should probably do some type checking 
		*/
		evaluateExpression: function(expression_root) {
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
				var left_child_value		= this.evaluateExpression(children[0]);
				var right_child_value		= this.evaluateExpression(children[1]);
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

	/* 	getCursorDirection - returns the direction of the cursor from the x and y positions passed as arguments 
		Inputs:
			myX	- the x location of the start of the vector 
			myY	- the y location of the start of the vector
			
		Outputs: a scalar direction value
	*/
	var getCursorDirection = function (myX, myY) {
		var mousepos = Crafty("MousePos");
		var yDifference = mousepos._y - (myY + canvas_top);
		var xDifference = mousepos._x - (myX + canvas_left);
		//log("xDifference: " + xDifference + " yDifference: " + yDifference);
		//log("hypDist: " + hypDist);
		//log("Angle: " + Math.atan2(xDifference, yDifference) * (180 / Math.PI));
		return Math.atan2(xDifference, yDifference) * (180 / Math.PI);
	}
	
	/*	init - sets up the crafty environment */
	function init() {
		Crafty.init(background_width, background_height);
		Crafty.background('rgb(127,127,127)');	
		
		insertPlayerSpell('fireball',			 '', 'shape 6, accelerate cursor 2');  
		insertPlayerSpell('space_bar_to_cast',	 '', 'fireball');
		
		/*	mousepos - stores the position of the mouse */
		var mousepos = Crafty.e("MousePos, Canvas, 2D, Text")
			.attr({ x: 20, y: 20, w: 100, h: 20 })
			
		var player1 = Crafty.e("Player1, PlayerManager, 2D, Canvas, Color, Keyboard, Multiway")
			.playermanager(3000, 100, 5, 5, 100)
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
		//var targetDummy = Crafty.e("TargetDummy, 2D, Canvas, Color, Collidable")
		//	.color('rgb(0,155,255)')
		//	.attr({ x: 400, y: 250, w: 15, h: 15 })
	
		// this event keeps the mousepos entity up to date with the correct coordinates
		Crafty.addEvent(this, "mousemove", function(e) {
			//log("MouseX " + e.clientX + " MouseY: " + e.clientY);
			mousepos.attr({ x: e.clientX , y: e.clientY, w: 100, h: 20 }); 
		});
	};

	init()
});
