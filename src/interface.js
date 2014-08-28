Interface = {

    mouseX: 0,
    mouseY: 0,
    paper: undefined,
    focus: false,
    playerSpells: undefined,
    librarySpells: undefined,
	
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
        pageText: undefined,
        curentSpell: undefined,
        spellList: [],
        listHtml: '<ul id="spellList"></ul>',
        spellHtml: '<input id="name" type="text"></input><input id="contents" type="text"></input>',

        getCurrentSpell: function () {
            return Library.getSpell(this.spellList[this.currentSpell]);
        },

        toggleSpellBook: function () {
            $('#spellBook').toggleClass('spellBookAnimation');
        },

        isSpellValid: function (name) {
            if(name === '') return false;
            for(var i = 0; i < this.spellList.length; i++) {
                if(this.spellList[i] === name && this.currentSpell !== i)
                    return false;
            }
            return true;
        },

        previousPage: function () {
            if(this.currentSpell === 0) {
                this.displayList();
            } else {
                this.currentSpell -= 1;
                this.displaySpell(this.currentSpell);
            }
        },
                 
        nextPage: function () {
            if(this.currentSpell === undefined) {
                this.currentSpell = -1;
            }
            if(this.currentSpell === this.spellList.length - 1) {
                this.spellList.push('blank');
            }
            this.currentSpell += 1;
            this.displaySpell(this.currentSpell);
        },

        // list format versus spell format
        displayList: function () {
            this.currentSpell = undefined;
            var numSpells = this.spellList.length;
            // going to need a list needs pagination
            var numSpellsShown = numSpells / 15; // px
            $('#pageText').html(this.listHtml);
            for(var i = 0; i < this.spellList.length; i++) {
                console.log('adding ' + this.spellList[i]);
                $('#spellList').append(
                    $('<li>').html(this.spellList[i])
                             .on('click', { index: i },
                                 function(event) {
                                     Interface.ui.displaySpell(event.data.index); 
                                 })
                );
            }


        },

        displaySpell: function (index) {
            var spell = Library.getSpell(this.spellList[index]);
            if(spell === 0) {
                return false;
            }
            
            this.currentSpell = index;
            console.log(this.spellList[index] + ' ' + this.currentSpell);
            this.pageText = $('#pageText');
            this.pageText.html(this.spellHtml);

            this.pageText.children("#name").val(spell.name);
            this.pageText.children("#contents").val(spell.contents);
        },

        updateSpell: function () {
            var currentSpell = this.spellList[this.currentSpell];
            console.log("updatingSpell " + currentSpell);
            this.spellPage = $('#pageText');
            var newName = this.spellPage.children("#name").val();
            var newContents = this.spellPage.children("#contents").val();
            if(this.isSpellValid(newName)) {
                Library.updatePlayerSpell(currentSpell, newName, newContents);
                console.log("updatingSpell " + currentSpell);
                this.spellList[this.currentSpell] = newName;
            } else {
                console.log('Spell: ' + newName + ' is not chill.');
            }
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
            var spellPage = this.spellPage = $('#pageText');
            var spellBook = $('#spellBook');
            
            spellBook.css('height', interfaceHeight + 'px');
            spellBook.css('width', interfaceWidth + 'px');
            spellBook.css('left', x + 'px');
            // populate lists of spells
            Library.addPlayerSpell('fireball', 'test');
            Library.addPlayerSpell('iceball', 'test');

            spells = Library.getPlayerSpells();

            //for (each in spells) {
            //    console.log('printing spell: ' + spells[each]);
            //    Interface.ui.displaySpell(spells[each].name);
            //}

            this.spellPage.on("focusin", function () { Interface.focus = true });
            this.spellPage.on("focusout", function () { Interface.focus = false; Interface.ui.updateSpell() });

            $('#next').on('click', function () { Interface.ui.nextPage() });
            $('#prev').on('click', function () { Interface.ui.previousPage() });
            // create tabs of spells
            // create empty spell
            // create right and left buttons
            // pressing a button toggles the interface
            this.toggleSpellBook();

            this.spellList = Library.getLibrarySpells();
            this.spellList.push.apply(this.spellList, Library.getPlayerSpells());
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

        // stoart crafty
        var crafty_div = document.getElementById('cr-stage');
        var position = crafty_div.getBoundingClientRect();
        var x = position.left;
        var y = position.top;
        Game.init(viewport_width, viewport_height, x, y, tile_size);       
        Interface.ui.init(viewport_width, viewport_height);
    },
}
