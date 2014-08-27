Interface = {

    mouseX: 0,
    mouseY: 0,
    paper: undefined,
    focus: false,
	
    mousePos: function (e) {
        Interface.mouseX = e.pageX - 2;
        Interface.mouseY = e.pageY - 2;
        //Interface.mousey.attr({"x": Interface.mouseX - 5, "y": Interface.mouseY - 5});
        //console.log("Mouse moved (" + Interface.mouseX + "," + Interface.mouseY + ")");
        return true;
    },
    
	getMousePos: function () {
	    return {"x": Interface.mouseX, "y":Interface.mouseY};
	},
	
    getCursorDirection: function (myX, myY) {
        //var yDifference = Interface.mouseX - (myY + Game.canvas_top);
        //var xDifference = Interface.mouseY - (myX + Game.canvas_left);
        var xDifference = Interface.mouseX - (myX + Game.canvas_left);
        var yDifference = Interface.mouseY - (myY + Game.canvas_top);

        //console.log("xDifference: " + xDifference + " yDifference: " + yDifference);
        //console.log("hypDist: " + hypDist);
        //console.log("Angle: " + Math.atan2(xDifference, yDifference) * (180 / Math.PI));
        return Math.atan2(xDifference, yDifference) * (180 / Math.PI);
    },

    movePlayer: function (e) {
    	console.log("Mouse clicked.");
    	Game.main_player.moveTowards(Interface.mouseX,Interface.mouseY);
    	Game.endpoint.moveTo(Interface.mouseX, Interface.mouseY);
    },

    ui: {
        // library spells first tab and x spells
        // player spells second tab and y spells
        spellPage: undefined,
        curentSpell: null,
        listHtml: '<ul id="spellList"></ul>',
        spellHtml: '<input id="name" type="text"></input><input id="contents" type="text"></input>',
        getCurrentSpell: function () {
            return this.currentSpell;
        },
        toggleSpellBook: function () {
            this.spellPage.toggleClass('spellBookAnimation');
        },
        // list format versus spell format
        displayList: function () {
            this.currentSpell = null;
            librarySpells = Library.getLibrarySpells();
            playerSpells = Library.getPlayerSpells();
            var numSpells = playerSpells.length;
            // going to need a list needs pagination
            var numSpellsShown = numSpells / 15; // px
            $('#spellPage').html(this.listHtml);
            for (spell in playerSpells) {
//                $('#spellList').append(
                console.log('adding ' + playerSpells[spell].name);
                $('#spellList').append(
                    $('<li>').html(playerSpells[spell].name)
                );
            }


        },
        displaySpell: function (name) {
            var spell = Library.getSpell(name);
            if(spell === 0) {
                return false;
            }
            
            this.currentSpell = spell;
            console.log(this.currentSpell);
            this.spellPage = $('#spellPage');

            this.spellPage.children("#name").val(spell.name);
            this.spellPage.children("#contents").val(spell.contents);
        },
        updateSpell: function () {
            currentSpell = Interface.ui.getCurrentSpell();
            console.log("updatingSpell " + currentSpell);
            this.spellPage = $('#spellPage');
            currentSpell.name = this.spellPage.children("#name").val();
            currentSpell.contents = this.spellPage.children("#contents").val();
        },
	init: function (viewport_width, viewport_height) {
            // maximum/ minimum width and height of the ui
            var maxHeight = 1000;
            var maxWidth = 600;
            var minHeight = 600;
            var minWidth = 400;
            // calculate the width and height min < % < max
            var interfaceWidth = viewport_width / 4;
            var interfaceHeight = viewport_height / 2;
       
            var interfaceWidth = interfaceWidth > maxWidth ? maxWidth : interfaceWidth
            var interfaceHeight = interfaceHeight > maxHeight ? maxHeight : interfaceHeight

            console.log("interfaceWidth: " + interfaceWidth);
            console.log("interfaceHeight: " + interfaceHeight);
             // calculate position of interface
            var x = viewport_width - interfaceWidth;

            // resize css elements
            var spellPage = this.spellPage = $('#spellPage');
            
            spellPage.css('height', interfaceHeight + 'px');
            spellPage.css('width', interfaceWidth + 'px');
            spellPage.css('left', x + 'px');
            // populate lists of spells
            Library.addPlayerSpell('fireball', 'test');
            Library.addPlayerSpell('iceball', 'test');

            spells = Library.getPlayerSpells();

            for (each in spells) {
                console.log('printing spell: ' + spells[each]);
                Interface.ui.displaySpell(spells[each].name);
            }
            console.log(this.currentSpell);

            this.spellPage.on("focusin", function () { Interface.focus = true });
            this.spellPage.on("focusout", function () { Interface.focus = false; Interface.ui.updateSpell() });
            // create tabs of spells
            // create empty spell
            // create right and left buttons
            // pressing a button toggles the interface
            this.toggleSpellBook();
            this.displayList();
        }
    },

    init: function () {
        document.onmousemove = function (e) {Interface.mousePos(e);};

        var viewport_width = window.innerWidth - 64 ,
            viewport_height = window.innerHeight - 64;
        
        var tile_size = 16;
        var num_tiles_width = Math.floor(viewport_width / tile_size);
        var num_tiles_height= Math.floor(viewport_height / tile_size);        

        // start crafty
        var crafty_div = document.getElementById('cr-stage');
        var position = crafty_div.getBoundingClientRect();
        var x = position.left;
        var y = position.top;
        Game.init(viewport_width, viewport_height, x, y, tile_size);       
        Interface.ui.init(viewport_width, viewport_height);
    },
}
