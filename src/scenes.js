Crafty.scene("Main", function() {       

    // A 2D array to keep track of all occupied tiles
    this.occupied = new Array(Game.map_grid.width);
    for (var i = 0; i < Game.map_grid.width; i++) {
        this.occupied[i] = new Array(Game.map_grid.height);
        for (var y = 0; y < Game.map_grid.height; y++) {
            this.occupied[i][y] = false;
        }
    }
    
    var x_start = Math.floor(Game.map_grid.width / 4);
    var y_start = Math.floor(Game.map_grid.height / 4);
    var width = Math.floor(Game.map_grid.width * 3 / 4);
    var height = Math.floor(Game.map_grid.height * 3 / 4);
    console.log("Creating boundary rocks with " + width + " " + height);
    for (var x = 0; x < Game.map_grid.width; x++) {
        for (var y = 0; y < Game.map_grid.height; y++) {
            var at_edge = x == x_start || x == width - 1 
                       || y == y_start || y == height - 1;
        
            if (at_edge) {
                // Place a rock entity at the current tile
                Crafty.e('Rock').at(x, y);
                this.occupied[x][y] = true;
            } 
            /*else {
                Crafty.e('Sand').at(x,y);
                this.occupied[x][y] = true;
            }*/
        }
    }
 

	/* mousepos - stores the position of the mouse */
	var mousepos = Crafty.e("Actor, Text")
		.attr({ x: 20, y: 20, w: 100, h: 20 })
		.text('lel');
 	
	Game.endpoint = Crafty.e("Endpoint")
        .at(0, 0);
 
    Game.main_player = Crafty.e("PlayerCharacter, Keyboard")
        .at(x_start + 1, y_start + 1)
        .bind("KeyDown", function(e) {
            if(Interface.focus === false) {
                if (this.isDown('B')) {
                    console.log('toggling spellbook');
                    Interface.ui.toggleSpellBook();
                }
        	if (this.isDown('SPACE')) {
                    var playerPos = Game.main_player.at();
                    Crafty.e('Projectile')
                        .at(playerPos.x, playerPos.y)
                        .projectile(5, mousepos.getDirection(playerPos.x, playerPos.y), 1);
        
                    //.projectile(5, Interface.getCursorDirection(Game.main_player.x + Crafty.viewport.x, Game.main_player.y + Crafty.viewport.y), 1);
			    //console.log("viewportX: " + Crafty.viewport.x + " viewportY: " + Crafty.viewport.y);
				//console.log("Player x: " + (Game.main_player.x + Crafty.viewport.x)
				//          + " y: " + (Game.main_player.y + Crafty.viewport.y));
				//var mouse = Interface.getMousePos();
				//console.log("MouseX: " + mouse.x + " MouseY: " + mouse.y);
  				//Interface.drawLineToCursor(Game.main_player.x, Game.main_player.y);
				//this.trigger("Cast", [spell_name, []]);
			}
           }
        });


		
	// this event keeps the mousepos entity up to date with the correct coordinates
	Crafty.addEvent(this, "mousemove", function(e) {
		//console.log("MouseX " + e.clientX + " MouseY: " + e.clientY);
		mousepos.attr({ x: e.clientX - Crafty.viewport.x - Game.canvas_left, y: e.clientY - Crafty.viewport.y - Game.canvas_top, w: 100, h: 20 });
	});

	Crafty.addEvent(this, "mousedown", function(e) {
            if(e.buttons === 2) {
	        var mousePos = mousepos.at();
	        console.log("Clicked. with mouse position x:" + mousePos.x + " and y: " + mousePos.y);
	        Game.endpoint.moveTo(mousePos.x, mousePos.y);
	        Game.main_player.moveTowards(mousePos.x, mousePos.y);
            }
	});
	
		
    Crafty.viewport.follow(Game.main_player, 0, 0);
});

// Loading scene
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
    // Draw some text for the player to see in case the file
    //  takes a noticeable amount of time to load
    Crafty.e('2D, DOM, Text')
    .text('Loading...')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() });
    
    // Load our sprite map image
    Crafty.load(['assets/basictiles.png', 'assets/64fun.png'], function(){
        Crafty.sprite(16, 'assets/basictiles.png', {
            spr_rock:    [7, 1],
            spr_sand:    [2, 1],
            spr_bush:    [6, 3],
            spr_village: [3, 5],
            spr_player:  [0, 8],
        });
        Crafty.sprite(64, 'assets/64fun.png', {
            spr_spell:    [8, 10],
        });
        
        // Now that our sprites are ready to draw, start the game
        Crafty.scene('Main');
    })
});
