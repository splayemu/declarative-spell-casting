$(document).ready(function() {
	function log(msg) {
		setTimeout(function() {
			throw new Error(msg);
		}, 0);
	}
	
	/* activate_library_spell -
		Arguments: name, argument
		
	*/
	activate_library_spell = function(hostspell, player_id, name, arguments) {
		spell_info = library_spells[name];
		if(spell_info == undefined) {
			log(name + " is not a valid library spell");
			return 0;
		}
		var spell = spell_info['funct'];
		var parameters = spell_info['params'];
		//for(var i = 0; i < children.length; i++) {
		//	log("Child[" + i + "]: " + children[i].get_lex_info());
		//}
		log(name + " recieved " + arguments.length + " arguments.");
		// verfiy that the arguments are compatible with the parameters
		//if(arguments.length != parameters.length) {
		//	log("Error: Expected " + parameters.length + " and recieved " + arguments.length);
		//	return -1;
		//}
		// calculate manacost
		spell(hostspell, arguments);
		return 1;
	};
	
	/* Library calls 
	 * These are the base functions that manipulate the game world.
	 * Deriving manacost - 
	 *
	 *
	 */
	/* shape - creates a movable spell of a certain size and color
	 * Parameters:
	 *	element - the element (color) of the spell
	 *	size 	- the size of the element
	 * Manacost: 2 * size
	 * Output: returns the entity created
	 */
	 // big issue here is if size is not a number (and instead is a syn_node), it gets confused
	var shape		= function (spell, arguments) {
		if(arguments.length != 1) {
			log("Error: shape must only have 1 arguments. Has " + arguments.length + " argument(s) instead.");
			return;
		}
		size = arguments[0];
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
	var accelerate		= function (spell, arguments) {
		if(arguments.length != 2) {
			log("Error: accelerate must only have 2 arguments");
			return;
		}
		direction = arguments[0];
		amount = arguments[1];
		spell.accelerate(direction, amount);
	}
	/* End of Library calls */
	
	/* Create the library spells
	   Each spell consists of:

		name   params  function
	*/
	
	/* insert_library_spell - is a function that inserts the spell
		Inputs: name 	- a string containing the name of the spell
				params	- a dictionary containing all the parameters and their types
				funct	- the spell
	*/

	var insert_library_spell = function (name, params, funct) {
		var spell_info = {'params':params, 'funct':funct};
		library_spells[name] = spell_info;
		log("Inserting library spell " + name + " paired with " + spell_info.toString());
	}	

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
	
	insert_library_spell("shape", {"spell":"object", "size":"number"}, shape);
	insert_library_spell("accelerate", {"spell":"object", "direction":"number", "direction":"number"}, accelerate);
	//library_spells['shape'] = shape;
	//library_spells['accelerate'] = accelerate;
	//library_spells['test_shape'] = test_shape;
	//library_spells['test_accelerate'] = test_accelerate;
});
