/*	game.js	- file that contains all the craftyJs components and entities. Initializes the game world.

*/
Game = {
    map_grid: {
        width:  24,
        height: 16,
        tile: {
            width:  16,
            height: 16
        }
    },
    
    game_area: {
        canvas_width: 600,
        canvas_height: 400,
        playable_width: 600,
        playable_height: 400,
        canvas_top: 175, //px
        canvas_left: 50 //px   
    },
    
    width: function() {
        return this.map_grid.width * this.map_grid.tile.width;
    },

    height: function() {
        return this.map_grid.height * this.map_grid.tile.height;
    },   

    main_player: undefined,
    
    /* 	getCursorDirection - returns the direction of the cursor from the x and y positions passed as arguments 
        Inputs:
            myX	- the x location of the start of the vector 
            myY	- the y location of the start of the vector
            
        Outputs: a scalar direction value
    */
    getCursorDirection: function (myX, myY) {
        var mousepos = Crafty("MousePos");
        var yDifference = mousepos._y - (myY + canvas_top);
        var xDifference = mousepos._x - (myX + canvas_left);
        //console.console.log("xDifference: " + xDifference + " yDifference: " + yDifference);
        //console.console.log("hypDist: " + hypDist);
        //console.console.log("Angle: " + Math.atan2(xDifference, yDifference) * (180 / Math.PI));
        return Math.atan2(xDifference, yDifference) * (180 / Math.PI);
    },

    start: function () {
        Crafty.init(Game.width(), Game.width());
	    Crafty.background('rgb(127,127,127)');	
        
        Library.init();
        Crafty.scene('main');
        
        Interface.init();
        

    }
}
Interface = {
    listPlayerSpellNames: function () {
        $("#spell_name_lister").html('');				
        // create an empty array for building up the html output
        var html = [];

        // create a table
        html.push('<ul>');

        for(var spell_name in Game.main_player.player_spells) {
            // do some sanity checking
            if (null != spell_name) {
                // add a row to the table
                html.push('<li id=spell_' + spell_name + ' class=spell_name>' + spell_name + '</li>');
            }
        }

        // close the table
        html.push('</ul>');

        // find the results div in the DOM and set its HTML content
        document.getElementById("spell_name_lister").innerHTML = html.join("");
        
    },
    
    listLibrarySpellNames: function () {	
        $("#spell_name_lister").html('');	

        // create an empty array for building up the html output
        var html = [];

        // create a table
        html.push('<ul>');

        for(var spell_name in Library.getSpells()) {
            // do some sanity checking
            if (null != spell_name) {
                // add a row to the table
                html.push('<li id=spell_' + spell_name + ' class=spell_name>' + spell_name + '</li>');
            }
        }

        // close the table
        html.push('</ul>');

        // find the results div in the DOM and set its HTML content
        document.getElementById("spell_name_lister").innerHTML = html.join("");
        
    },			


    grabSpellText: function (spell_name) {
        // save code currently in textarea#spell_text
        var spell = Game.main_player.player_spells[spell_name];
        if(spell == undefined) {
            alert("Error: " + spell_name + " is not a spell");
            return false;
        }
        var spell_text = spell['spell_text'];
        $("textarea#spell_text").val(spell_text);
    },

    grabSpellParams: function (spell_name) {
        // save code currently in textarea#spell_text
        var spell = Game.main_player.player_spells[spell_name];
        if(spell == undefined) {
            alert("Error: " + spell_name + " is not a spell");
            return false;
        }
        var spell_params = spell['params'];
        $("textarea#spell_params").val(spell_params);
    },
    
    init: function () {
        Interface.listPlayerSpellNames();
        var spell_tab = "player_spells_tab";
        $("#submit_btn").click(function() {  
            var spell_name 		= $("input#spell_name").val();
            var spell_text 		= $("textarea#spell_text").val();
            var spell_params 	= $("textarea#spell_params").val();
            //alert("Spell text: " + spell_text);
            Game.main_player.insertSpell(spell_name, spell_params, spell_text);
            Interface.listPlayerSpellNames();
            return false; 
        });  
        
        $(document).on("click", ".spell_name", (function() {  
            var clicked_spell_name = $(this).text();
            $("input#spell_name").val(clicked_spell_name);
            Interface.grabSpellText(clicked_spell_name);
            Interface.grabSpellParams(clicked_spell_name);
            //alert(clicked_element);
            return false; 
        }));
        
        $(".tab").on('click', (function() {  
            var clicked_spell_type = $(this).attr('id');

            if (clicked_spell_type != spell_tab && clicked_spell_type == "player_spells_tab") {
                Interface.listPlayerSpellNames();
            }
            else if (clicked_spell_type != spell_tab && clicked_spell_type == "library_spells_tab") {
                Interface.listLibrarySpellNames();					
            }
            spell_tab = clicked_spell_type;
            //alert(clicked_spell_type);				
            return false; 
        }));   
    },
}
