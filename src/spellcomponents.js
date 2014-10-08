/*    PhysicalSpell - component that gives physical 2d properties to a spell. Gives them color and acceleration.

    Values:
        size    - the length (in pixels) of each side of the entity
        x        - the x location of the entity
        y        - the y location of the entity
        color    - the color of the entity
    
    Methods:
        physicalspell
        accelerate
        selfDestruct
*/
Crafty.c("PhysicalSpell", {
    init: function() {
        this.requires('spr_spell');
        this.requires('Motion');
        //this.requires('Collision');
        //.requires('Color');
        /*this.bind('EnterFrame', function () {
            //hit floor or roof
            if (this.y <= 0 || this.y >= (Game.playable_height - 10))
                this.destroy();

            if (this.x <= 0 || this.x >= (Game.playable_width - 10))
                this.destroy();
                
            this.x += this.dX;
            this.y += this.dY;
        });*/
    },
    
    physicalspell: function(size, xStartingPos, yStartingPos) {
        this.at(xStartingPos, yStartingPos);

        return this;
    },
    /*    selfDestruct - calls the entities destroy method
    */
    selfDestruct: function() {
        this.destroy();
    }

});

/*     Spell - Runs each spell by executing one step of the RTSI per frame
    
    Values:
        name        - holds the spell name (later will be generated from the caster's name)
        parent        - the caster of the spell
        spell_ast    - the abstract syntax tree of the spell
        variables    - holds the current variables that the spell has access to. E.G. arguments passes into the spell
    
    Methods:
        spell
        getName
        shape
        realTimeSpellInterpreter
        activatePlayerSpellSpell
        evaluateExpression
        
    To Work On:
        activate_player_spell_argument    - looks up the player created spell and 
        Inputs: name
            arguments

        Desired behavior:    If it is a spell executed as an argument to another spell
                        the spell root needs to be added to place to be executed
                        create a temporary variable, call it return_val, to store the return value
                        return_val = spell
*/
Crafty.c("Spell", {
    init: function() {
        this.bind('EnterFrame', function () {
            // update the cursor variable
            // broken
            if(this.counter % 5 == 0) {
                this.variables['cursor'] = 0; //Interface.getCursorDirection(this._x, this._y);
                //console.log("Parent_id = " + this.parent_id);
                if(this.spell_ast.get_children().length != 0) {
                    this.realTimeSpellInterpreter(this.spell_ast.shift_child());
                }
            }
            this.counter += 1;
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
        this.counter = 0;        
        console.log(this.name + " initialized with player_id: " + this.parent_id);
        return this;
    },
    getName: function() {
        return this.name; 
    },
    
    /*     shape - adds a physical component to a spell entity. Initializes the physical component with a length and width of size
    
        Things to consider 
                - What happens when two shapes are cast in the same spell?
                - What happens when shape is called during a recur?    
    */
    shape: function (size) {
        console.log("Shaping a spell of size " + size);
        //console.log("player_id: " + player_id);
        console.log("size: " + size);

        var parent = Game.main_player;
        var parentLoc = parent.at();
        this.addComponent("Actor, PhysicalSpell").physicalspell(size, parentLoc.x, parentLoc.y);
        //this.addComponent("Projectile");
    },
    
    /*     realTimeSpellInterpreter - function that traverses the spell parse tree, looks up and calls library spells, 
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
        /*for(var i = 0; i < children.length; i++) {
            console.log("children[" + i + "]:" + children[i].get_lex_info());
        }*/
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
        var spell_success = Library.activate_library_spell(this, spell_name, arguments);
        if(!spell_success) {
            console.log("Trying the player spell library");
            this.activatePlayerSpellSpell(spell_name, arguments);
        }
        //console.log("Player_id: " + this.parent_id);
        //Crafty(this.parent_id).decrementMana(1);
    },
    /*    pushSpellAst - pushes a spell with arguments to be executed 
        Inputs: spell_root    - the root of the spell to be added to be executed
        
        Desired behavior:    add the spell root to be executed before any other spells 
                            (similar to a stack push)
    
    pushSpellAst: function(spell_root) {
        console.log("Adding " + name + "'s root " + spell_root);
        this.spell_ast.unshift_children(spell_root);    
    },*/
    /*    activatePlayerSpellSpell    - looks up the player created spell and adds it to the spell tree
        Inputs:    name        - the name of the spell
                arguments    - the arguments of the spell

        Desired behavior:    If it is executing in the spell layer (e.g. spell args, spell args, ...)
                            add the spell root to be executed before any other spells 
                            (similar to a stack push)
    */
    activatePlayerSpellSpell: function(name, spell_arguments) {
        console.log("Trying to cast " + name);
        var spell_info = Library.getSpell(name);
        if(spell_info === undefined) {
            console.log(name + " is not a spell");
            return;
        }
        var params = spell_info.params;
        // verify arguments == params
        for(key in params) {
            console.log("Adding argument value: " + spell_arguments[key] + " to parameter: " + params[key]);
            this.variables[params[key]] = spell_arguments[key];
        }
        var spell_root = spell_info.ast_.copy();
        console.log("Adding " + name + "'s root " + spell_root);
        var spell_children = spell_root.get_children();
        this.spell_ast.unshift_children(spell_children);
    },
    
    /*     evaluateExpression - traverses an expression tree and returns a number or a bool
        Inputs: expression_root    - an expression tree
        
        Work on:
            should probably do some type checking 
    */
    evaluateExpression: function(expression_root) {
        if(expression_root == undefined) {
            return undefined;
        }            
        var node_name     = expression_root.get_lex_name();
        var children     = expression_root.get_children();
        /*console.log("Length of the children " + children.length);
        for(var i = 0; i < children.length; i++) {
                console.log("children[" + i + "]:" + children[i].get_lex_info());
            } */
        if (node_name == 'TOK_OPERATOR') {
            if(children.length != 2) {
                console.log("Interpreter Error: Binary Operators need two arguments.");
                return undefined;
            }
            var left_child_value        = this.evaluateExpression(children[0]);
            var right_child_value        = this.evaluateExpression(children[1]);
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
