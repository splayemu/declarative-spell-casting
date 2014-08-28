/* spells.js - file that holds the library
*/

Library = (function () {
    var my = {};
    
    var librarySpells = {
        spells: [],
        spellPrototype: {
            name: "undefined",
            description: "undefined",
            parameters: "undefined",
            funct: "undefined",
            toString: function () {
                return this.name;
            }
        },
        createSpell: function (name, description, funct, parameters) {
            var newSpell = Object.create(this.spellPrototype);
            newSpell.name = name;
            newSpell.description = description;
            newSpell.funct = funct;
            newSpell.parameters = parameters;
            this.spells.push(newSpell);
            return newSpell;
        },
    };

    var playerSpells = {
        spells: [],
        spellPrototype: {
            name: "undefined",
            contents: "undefined",
            toString: function() {
                return this.name;
            }
        },
        createSpell: function (name, contents) {
            var newSpell = Object.create(this.spellPrototype);
            newSpell.name = name;
            newSpell.contents = contents;
            this.spells.push(newSpell);
            return newSpell;
        },
        // get a list of the names
        // get the object of a particular one for editing
        // get the object of a particular one for casting 
    };

    var spellMapping = {};

    my.addPlayerSpell = function (name, contents) {
        var spell = playerSpells.createSpell(name, contents);
        spellMapping[name] = spell;
        console.log("Inserting player spell " + name);
    }

    my.updatePlayerSpell = function (name, newName, newContents) {
        var spell = my.getSpell(name);
        console.log("Updating player spell " + newName);
        if(spell === undefined) {
            spell = playerSpells.createSpell(name, contents);
            spellMapping[newName] = spell;
        } else {
            spell.name = newName;
            spell.contents = newContents;
            if(newName !== name) {
                spellMapping[newName] = spell;
                delete spellMapping[name];
            }
        }
    }

    my.getSpell = function (name) {
        spell = spellMapping[name];
        if(spell === undefined) {
            console.log(name + " is not a valid spell");
            return undefined;
        }
        return spell;
    }

    my.getLibrarySpells = function () {
        nameList = [];
        for(var i = 0; i < librarySpells.spells.length; i++) {
            nameList.push(librarySpells.spells[i].name);
        }
        return nameList;
    }
        
    my.getPlayerSpells = function () {
        nameList = [];
        for(var i = 0; i < playerSpells.spells.length; i++) {
            nameList.push(playerSpells.spells[i].name);
        }
        return nameList;
    }
    
    /* insert_library_spell - puts a function 
        Inputs: name 	- a string containing the name of the spell
                params	- a dictionary containing all the parameters and their types
                funct	- the function that gets called when the player casts thi corresponding name
    */
    var addLibrarySpell = function (name, description, params, funct) {
        
        // var spell_info = {'params':params, 'funct':funct};
        var spell = librarySpells.createSpell(name, description, params, funct);
        spellMapping[name] = spell;
        console.log("Inserting library spell " + name);
    }


    /* activate_library_spell - looks up and calls a library spell with the arguments passed
        Inputs: 
            name		- name of the spell to look up and call
            argument	- a list of arguments to pass to the spell
        
    */
    my.activate_library_spell = function(hostspell, player_id, name, arguments) {
        spell = spellMapping[name];
        if(spell == undefined) {
            console.log(name + " is not a valid library spell");
            return 0;
        }
        var spellFunct = spell.funct;
        var spellParameters = spell.parameters;
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
        spellFunct(hostspell, arguments);
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

    my.init = function() {
        addLibrarySpell("shape", "", {"spell":"object", "size":"number"}, shape);
        addLibrarySpell("accelerate", "", {"spell":"object", "direction":"number", "amount":"number"}, accelerate);
        addLibrarySpell("if", "", {"spell":"object", "conditional_value":"boolean", "spell":"ast", "spell":"ast"}, cond);
        addLibrarySpell("destroy", "", {"spell":"object"}, destroy);
    }	
    
    return my;
}());

