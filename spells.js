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
	var shape			= function (x, y, size) {
		log("Printing arguments to shape: ");
		log("x: " + x);
		log("y: " + y);
		log("size: " + size);
		var spell = Crafty.e("2D, DOM, Collision, PhysicalSpell, Spell")
			.physicalspell(size, x, y, 'rgb(255,10,10)')
			.spell("Shape", 2 * size);	
		return spell;
	}
	/* accelerate - adds acceleration to a movable spell
	 * Parameters:
	 *	spell_id 	- the id for the spell
	 *	direction 	- the direction of the acceleration
	 *	amount	 	- the amount of acceleration
	 * Manacost: amount * size (of entity)
	 * Output: in game effects
	 */	
	var accelerate		= function (spell_id, direction, amount) {
		Crafty(spell_id).accelerate(direction, amount);
	}
	/* End of Library calls */
	
	/* test spells */
	var test_shape			= function (arguments) {
		log("Shape is called");
		for(var i = 0; i < arguments.length; i++) {
			log("Argument[" + i + "]:" + arguments[i].get_lex_info());
		}
	}
	var test_accelerate 		= function (arguments) {
		log("Accelerate is called.");
		for(var i = 0; i < arguments.length; i++) {
			log("Argument[" + i + "]:" + arguments[i].get_lex_info());
		}
	}
	
	library_spells['shape'] = shape;
	library_spells['accelerate'] = accelerate;
	library_spells['test_shape'] = test_shape;
	library_spells['test_accelerate'] = test_accelerate;	
});
