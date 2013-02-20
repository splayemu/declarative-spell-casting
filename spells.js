$(document).ready(function() {
	function log(msg) {
		setTimeout(function() {
			throw new Error(msg);
		}, 0);
	}
	
	lookup_library = function(name) {
		return library_spells[name];
	};
	
	add_spell = function(name, ast) {
		player_spells[name] = ast;
	};

	/* general cast - this will
	
	
	*/ /*
	cast		= function (player_id, spell_name, spell_ast) {
		log("Cast called with player_id: " + player_id + " spell_name: " + spell_name);
		var spell = Crafty.e("Spell")
			.spell(player_id + "_" + spell_name, player_id, spell_ast);	
		*/	
		
		/*if(spell_name == 'shape') {
			if(arguments.length > 1) {
				log("Error: Shape must only have 1 arguments");
				return;
			}
			shape(player_id, arguments[0].get_lex_info());
		}
		else {
			var the_spell = library_spells[spell_name];
			the_spell(arguments); 
		}*/
	

	//} 
	
	/* Library calls 
	 * These are the base functions that manipulate the game world.
	 * Deriving manacost - 
	 *
	 *
	 **/
	/* shape - creates a movable spell of a certain size and color
	 * Parameters:
	 *	element - the element (color) of the spell
	 *	size 	- the size of the element
	 * Manacost: 2 * size
	 * Output: returns the entity created
	 */
	 // big issue here is if size is not a number (and instead is a syn_node), it gets confused
	var shape		= function (arguments) {
		if(arguments.length != 2) {
			log("Error: shape must only have 2 arguments. Has " + arguments.length + " argument(s) instead.");
			return;
		}
		spell = arguments[0];
		size = arguments[1].get_lex_info();
		spell.shape(size);
	}
	/* accelerate - adds acceleration to a movable spell
	 * Parameters:
	 *	spell_id 	- the id for the spell
	 *	direction 	- the direction of the acceleration
	 *	amount	 	- the amount of acceleration
	 * Manacost: amount * size (of entity)
	 * Output: in game effects
	 */	
	var accelerate		= function (arguments) {
		if(arguments.length != 3) {
			log("Error: accelerate must only have 2 arguments");
			return;
		}
		spell = arguments[0];
		direction = arguments[1].get_lex_info();
		amount = arguments[2].get_lex_info();
		spell.accelerate(direction, amount);
	}
	/* End of Library calls */
	
	/* test spells */
	var test_shape			= function (arguments) {
		log("Shape is called");
		for(var i = 0; i < arguments.length; i++) {
			log("Argument[" + i + "]:" + arguments[i]);
		}
	}
	var test_accelerate 		= function (arguments) {
		log("Accelerate is called.");
		for(var i = 0; i < arguments.length; i++) {
			log("Argument[" + i + "]:" + arguments[i]);
		}
	}
	
	library_spells['shape'] = shape;
	library_spells['accelerate'] = accelerate;
	library_spells['test_shape'] = test_shape;
	library_spells['test_accelerate'] = test_accelerate;
});
