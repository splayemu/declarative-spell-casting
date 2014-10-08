/*

Things to do:
 - Need a handler to scan and parse spells when they are updated
 - Need some sort of parameter checking
 - Need some sort of manacost calculator
 - 


*/




Library = (function () {
    var my = {};
    
    var librarySpells = {
        spells: [],
        spellPropertiesPrototype: {
            name: {
                value: null,
                writable: false,
            },
            description: {
                value: null,
                writable: false,
            },
            parameters: {
                value: null,
                writable: false,
            },
            funct: {
                value: null,
                writable: false,
            },
            toString: {
                value: function () {
                    return this.name;
                }
            }
        },
        createSpell: function (name, description, funct, parameters) {
            var spellProperties = this.spellPropertiesPrototype;
            spellProperties.name.value = name;
            spellProperties.description.value = description;
            spellProperties.funct.value = funct;
            spellProperties.parameters.value = parameters;
            var newSpell = Object.create({}, spellProperties);
            this.spells.push(newSpell);
            //console.log(spellProperties);
            return newSpell;
        },
    };

    var playerSpells = {
        spells: [],
        spellPrototype: {
            name: undefined,
            contents: undefined,
            params: {},
            ast_: undefined,
            contents_: undefined,
            toString: function() {
                return this.name;
            }
        },
        spellPropertiesPrototype: {
            ast: {
                get: function () {
                    return this.ast_.copy()
                },
            },
            contents: {
                get: function () {
                    return this.contents_;
                },
                set: function (newContents) {
                    console.log('contents: setting to ' + newContents);
                    var toks = scan(newContents);
                    this.contents_ = newContents;
                    this.ast_ = parse(toks);
                },
            },
        },
        createSpell: function (name, contents) {
            console.log('Creating spell ' + name + ' with contents ' + contents);
            var newSpell = Object.create(this.spellPrototype, this.spellPropertiesPrototype);
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
    } 

    my.updatePlayerSpell = function (name, newName, newContents) {
        var spell = my.getSpell(name);
        if(spell === undefined) {
            spell = playerSpells.createSpell(name, contents);
            spellMapping[newName] = spell;
        } else {
            console.log("Updating player spell " + newName + ' with contents.');
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
        var spell = librarySpells.createSpell(name, description, funct, params);
        spellMapping[name] = spell;
        console.log("Inserting library spell " + name + " with function " + spell.funct);
        //console.log(spell);
    }


    /* activate_library_spell - looks up and calls a library spell with the arguments passed
        Inputs: 
            name		- name of the spell to look up and call
            argument	- a list of arguments to pass to the spell
        
    */
    my.activate_library_spell = function(hostspell, name, arguments) {
        console.log('activate_library_spell: called with ' + name);
        spell = spellMapping[name];
        if(spell === undefined 
            || playerSpells.spellPrototype.isPrototypeOf(spell)) {
            console.log(name + " is not a valid library spell");
            return false;
        }
        console.log(spell);
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
        console.log(spellFunct);
        spellFunct(hostspell, arguments);
        return true;
    };

    /*	shape - creates a movable spell of a certain size and color
        Input:
            element - the element (color) of the spell
            size 	- the size of the element
            
        Manacost: 2 * size
        
        Output: returns the entity created
    */
    var shape = function (spell, arguments) {
        if(arguments.length != 1) {
            console.log("Error: shape must only have 1 arguments. Has " + arguments.length + " argument(s) instead.");
            return;
        }
        console.log("Library Shape called.");
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
        console.log(spell);
        console.log('accelerate called: ' + direction + ' ' + amount);
        spell.addVelocityTowards(direction, amount);
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

