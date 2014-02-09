// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
    init: function() {
        this.attr({
            w: Game.map_grid.tile.width,
            h: Game.map_grid.tile.height
        })
    },

    // Locate this entity at the given position on the grid
    at: function(x, y) {
        if (x === undefined && y === undefined) {
            return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
        } else {
            this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
            return this;
        }
    }
});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
    init: function() {
        this.requires('2D, Canvas, Grid');
    },
});

Crafty.c('Rock', {
    init: function() {
        this.requires('Actor, Solid, spr_rock');
    },
});

Crafty.c('Sand', {
    init: function() {
        this.requires('Actor, spr_sand');
    },
});

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
		console.log("Manabar construction with max_mana: " + maximum_mana + " and width " + width);
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
		console.log("changeMana called with " + mana + " width_per_mana: " + this.width_per_mana);
		if(mana < 0) {
			this.front.w = 0;
		}
		else this.front.w = mana * this.width_per_mana;			
	}

});


// This is the player-controlled character
Crafty.c('PlayerCharacter', {
    init: function() {
        this.requires('Actor, Fourway, Collision, spr_player, SpriteAnimation')
            .fourway(4)
            .stopOnSolids()
            // These next lines define our four animations
            //  each call to .animate specifies:
            //  - the name of the animation
            //  - the x and y coordinates within the sprite
            //     map at which the animation set begins
            //  - the number of animation frames *in addition to* the first one
            .reel('PlayerMovingUp',    8, [[4, 8], [5,8]])
            .reel('PlayerMovingRight', 8, [[2, 8], [3,8]])
            .reel('PlayerMovingDown',  8, [[0, 8], [1,8]])
            .reel('PlayerMovingLeft',  8, [[6, 8], [7,8]]);
    
        // Watch for a change of direction and switch animations accordingly
        var animation_speed = 8;
        this.bind('NewDirection', function(data) {
            if (data.x > 0) {
                this.animate('PlayerMovingRight', -1);
            } else if (data.x < 0) {
                this.animate('PlayerMovingLeft', -1);
            } else if (data.y > 0) {
                this.animate('PlayerMovingDown', -1);
            } else if (data.y < 0) {
                this.animate('PlayerMovingUp', -1);
            } else {
                this.pauseAnimation();
            }
        });
    },
    
    // Registers a stop-movement function to be called when
    //  this entity hits an entity with the "Solid" component
    stopOnSolids: function() {
        this.onHit('Solid', this.stopMovement);
    
        return this;
    },
    
    // Stops the movement
    stopMovement: function() {
        this._speed = 0;
        if (this._movement) {
            this.x -= this._movement.x;
            this.y -= this._movement.y;
        }
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
				//console.log("Destroying spells");
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
        this.player_spells = {};
		this.active_spells = {};
		
		this.back = Crafty.e("2D, Color, Canvas")
			.attr({ x: manabar_x, y: manabar_y, w: manabar_width + 2, h: 10, dX: 0, dY: 0})
			.color('rgb(0,0,0)');
		this.front = Crafty.e("2D, Color, Canvas")
			.attr({ x: manabar_x + 1, y: manabar_y + 1, w: manabar_width, h: 8, dX: 0, dY: 0})
			.color('rgb(0,0,255)');
		this.manabar_width = manabar_width;
		this.width_per_mana = manabar_width / maximum_mana;
		console.log("Manabar construction with max_mana: " + maximum_mana + " and width " + manabar_width);
		
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
		//console.log("changeMana called with " + mana + " width_per_mana: " + this.width_per_mana);
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
		// console.log("Current Mana: " + this.mana);
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
		//console.log("Decrementing mana to: " + this.mana + " with the amount of " + amount);
		this.changeMana(this.mana);
	},
    /*	insertPlayerSpell 	- creates the spell object and adds it to the player_spells dictionary
        Inputs:	name 		- the string containing the name of the spell
                parameters	- a dictionary of the arguments and their types
                spell_text	- the string containing the text of the spell
    */
    insertSpell: function (name, params, spell_text) {
        var spells_toks = scan(spell_text);	
        /*	console.log("Starting SCAN");	
        for(var i = 0; i < spells_toks.length;i++) {
            console.log('tok[' + i + ']: ' + spells_toks[i].get_lex_name());
        }
        console.log("Ending SCAN\n"); */
        
        //console.log("Starting PARSE");
        var root_node = parse(spells_toks);
        //console.log("Ending PARSE\n");
        var spell_info = {'params':params, 'funct':root_node, 'spell_text':spell_text};

        this.player_spells[name] = spell_info;
        console.log("Inserting player spell " + name + " paired with " + root_node);
        return this;		
    },
	/*	cast - this looks up the spell in the player spell dict and initializes a Spell entity
			
			
	*/ 
	cast: function(spell_name, spell_arguments) {
		var spell_info = this.player_spells[spell_name];
		if(spell_info == undefined) {
			console.log(spell_name + " is not a spell");
			return;
		}

		var params = {};
		var params_list = spell_info['params'].split(" ");
		// verify arguments == params
		// assign argument values to respective parameters
		for(index in params_list) {
			console.log("Adding argument value: " + spell_arguments[index] + " to parameter: " + params_list[index]);
			params[params_list[index]] = spell_arguments[index];
		}
			
		var spell_root = spell_info['funct'].copy();

		console.log("Cast called with player_id: " + this[0] + " spell_name: " + spell_name);
		var spell = Crafty.e("Spell")
			.spell(this[0], spell_name, spell_root, params);	
					
		this.active_spells[spell[0]] = spell.getName();
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
			if (this.y <= 0 || this.y >= (Game.playable_height - 10))
				this.destroy();

			if (this.x <= 0 || this.x >= (Game.playable_width - 10))
				this.destroy();

			// check for colisions with colidable objects that aren't you
		/*	var collisions = this.hit("Collidable");
			if (collisions != false) {
				for(each_collision in collisions) {
					//if(each_collision["obj"] != Crafty(this.parent_id)) {
						console.log("Collided with " + each_collision + " and " + each_collision.obj);
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
			console.log("Accelerating dX: " + additionaldX + " dY: " + additionaldY);
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
            // broken
			this.variables['cursor'] = 0; //getCursorDirection(this._x, this._y);
			//console.log("Parent_id = " + this.parent_id);
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
		console.log(this.name + " initialized with player_id: " + this.parent_id);
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
		console.log("Shaping a spell of size " + size);
		//console.log("player_id: " + player_id);
		//console.log("size: " + size);

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
		//	console.log("children[" + i + "]:" + children[i].get_lex_info());
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
					console.log("Interpreter Error: " + arguments[i].get_lex_info() + " needs to be a parameter with a value.");
					return;
				}
				arguments[i] = ident_lookup;
			}
			else if(arguments[i].get_lex_name() == 'TOK_NUMBER') {
				arguments[i] = arguments[i].get_lex_info();
			}
			else if(arguments[i].get_lex_name() == 'TOK_SPELL') {
				console.log("Found a spell as an argument");
			}
			else {
				console.log("Interpreter Error: " + arguments[i].get_lex_name() + " should not be here.");
				return;					
			}
		}
		//var parameters = [this].concat(arguments);
		var spell_success = Library.activate_library_spell(this, this.parent_id, spell_name, arguments);
		if(!spell_success) {
			console.log("Trying the player spell library");
			this.activatePlayerSpellSpell(spell_name, arguments);
		}
		//console.log("Player_id: " + this.parent_id);
		Crafty(this.parent_id).decrementMana(1);
	},
	/*	pushSpellAst - pushes a spell with arguments to be executed 
		Inputs: spell_root	- the root of the spell to be added to be executed
		
		Desired behavior:	add the spell root to be executed before any other spells 
							(similar to a stack push)
	
	pushSpellAst: function(spell_root) {
		console.log("Adding " + name + "'s root " + spell_root);
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
		console.log("Trying to cast " + name);
		var spell_info = Crafty(this.parent_id).player_spells[name];
		if(spell_info == undefined) {
			console.log(name + " is not a spell");
			return;
		}
		var params = {};
		var params_list = spell_info['params'].split(" ");
		// verify arguments == params
		for(index in params_list) {
			console.log("Adding argument value: " + spell_arguments[index] + " to parameter: " + params_list[index]);
			this.variables[params_list[index]] = spell_arguments[index];
		}
		var spell_root = spell_info['funct'].copy();
		console.log("Adding " + name + "'s root " + spell_root);
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
		/*console.log("Length of the children " + children.length);
		for(var i = 0; i < children.length; i++) {
				console.log("children[" + i + "]:" + children[i].get_lex_info());
			} */
		if (node_name == 'TOK_OPERATOR') {
			if(children.length != 2) {
				console.log("Interpreter Error: Binary Operators need two arguments.");
				return undefined;
			}
			var left_child_value		= this.evaluateExpression(children[0]);
			var right_child_value		= this.evaluateExpression(children[1]);
			if(left_child_value == undefined || right_child_value == undefined) {
				return undefined;
			}
			// this is the grossest thing I have ever done
			console.log("The operator " + expression_root.get_lex_info());
			console.log("The string to call eval with " + left_child_value.toString() + expression_root.get_lex_info() + right_child_value.toString());
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
