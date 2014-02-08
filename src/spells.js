/* spells.js - file that holds the library
*/

Library = (function () {
    var my = {};
    
    var library = {};
    
    /* insert_library_spell - puts a function 
        Inputs: name 	- a string containing the name of the spell
                params	- a dictionary containing all the parameters and their types
                funct	- the function that gets called when the player casts thi corresponding name
    */
    var insert_library_spell = function (name, params, funct) {
        var spell_info = {'params':params, 'funct':funct};
        library[name] = spell_info;
        console.log("Inserting library spell " + name + " paired with " + spell_info.toString());
    }

    my.init = function() {
        insert_library_spell("shape", {"spell":"object", "size":"number"}, shape);
        insert_library_spell("accelerate", {"spell":"object", "direction":"number", "amount":"number"}, accelerate);
        insert_library_spell("if", {"spell":"object", "conditional_value":"boolean", "spell":"ast", "spell":"ast"}, cond);
        insert_library_spell("destroy", {"spell":"object"}, destroy);
    }	
    my.getSpells = function() {
        return library;
    }
    /* activate_library_spell - looks up and calls a library spell with the arguments passed
        Inputs: 
            name		- name of the spell to look up and call
            argument	- a list of arguments to pass to the spell
        
    */
    my.activate_library_spell = function(hostspell, player_id, name, arguments) {
        spell_info = library[name];
        if(spell_info == undefined) {
            console.log(name + " is not a valid library spell");
            return 0;
        }
        var spell = spell_info['funct'];
        var parameters = spell_info['params'];
        //for(var i = 0; i < children.length; i++) {
        //	console.log("Child[" + i + "]: " + children[i].get_lex_info());
        //}
        console.log(name + " recieved " + arguments.length + " arguments.");
        // verfiy that the arguments are compatible with the parameters
        //if(arguments.length != parameters.length) {
        //	console.log("Error: Expected " + parameters.length + " and recieved " + arguments.length);
        //	return -1;
        //}
        // calculate manacost
        spell(hostspell, arguments);
        return 1;
    };

    /*	shape - creates a movable spell of a certain size and color
        Input:
            element - the element (color) of the spell
            size 	- the size of the element
            
        Manacost: 2 * size
        
        Output: returns the entity created
    */
    // big issue here is if size is not a number (and instead is a syn_node), it gets confused
    var shape = function (spell, arguments) {
        if(arguments.length != 1) {
            console.log("Error: shape must only have 1 arguments. Has " + arguments.length + " argument(s) instead.");
            return;
        }
        var size = arguments[0];
        spell.shape(size);
    }
    /*	accelerate - adds acceleration to a movable spell
        Inputs:
            spell	 	- the spell object
            direction 	- the direction of the acceleration
            amount	 	- the amount of acceleration
            
        Manacost: amount * size (of entity)
        
        Output: in game effects
     */	
    var accelerate = function (spell, arguments) {
        if(arguments.length != 2) {
            console.log("Error: accelerate must only have 2 arguments");
            return;
        }
        var direction = arguments[0];
        var amount = arguments[1];
        spell.accelerate(direction, amount);
    }
    /*	cond - chooses between the second and third arguments based on the boolean first argument
        Inputs:
            spell		- the spell object
            bool		- decides whether or not the first or second spell object gets executed
            spell1_ast	- the ast of the "true" spell
            spell2_ast	- the ast of the "false" spell

        Manacost: free?
        
        Output: pushes a spell_ast to be executed
    */
    var cond = function (spell, arguments) {
        if(arguments.length != 3) {
            console.log("Error: if must have 3 arguments.");
        }
        var bool = arguments[0];
        var spell1_ast = arguments[1];
        var spell2_ast = arguments[2];
        
        if(bool == true)
            spell.realTimeSpellInterpreter(spell1_ast);
        else 
            spell.realTimeSpellInterpreter(spell2_ast);
    }

    var destroy = function (spell, arguments) {
        if(arguments.length != 0) {
            console.log("Error: destroy must have 0 arguments.");
        }
        spell.destroy();
    }
    
    return my;
}());

