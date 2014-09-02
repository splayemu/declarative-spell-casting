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
