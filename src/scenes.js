Crafty.scene("Main", function() {       

	/*	mousepos - stores the position of the mouse */
	var mousepos = Crafty.e("MousePos, Canvas, 2D, Text")
		.attr({ x: 20, y: 20, w: 100, h: 20 })

    // A 2D array to keep track of all occupied tiles
    this.occupied = new Array(Game.map_grid.width);
    for (var i = 0; i < Game.map_grid.width; i++) {
        this.occupied[i] = new Array(Game.map_grid.height);
        for (var y = 0; y < Game.map_grid.height; y++) {
            this.occupied[i][y] = false;
        }
    }

	



    for (var x = 0; x < Game.map_grid.width; x++) {
        for (var y = 0; y < Game.map_grid.height; y++) {
            var at_edge = x == 0 || x == Game.map_grid.width - 1 || y == 0 || y == Game.map_grid.height - 1;
        
            if (at_edge) {
                // Place a rock entity at the current tile
                Crafty.e('Rock').at(x, y);
                this.occupied[x][y] = true;
            } 
            else {
                Crafty.e('Sand').at(x,y);
                this.occupied[x][y] = true;
            }
        }
    }
    
    Game.main_player = Crafty.e("PlayerManager, PlayerCharacter, Keyboard")
		.playermanager(3000, 100, 5, 5, 100)
        .at(5, 5)
		.bind("KeyDown", function(e) {
			var spell_name = 'space_bar_to_cast';
			if (this.isDown('SPACE')) {
				this.trigger("Cast", [spell_name, []]);
			}
		})
        .insertSpell('fireball',			 '', 'shape 6, accelerate cursor 2')  
        .insertSpell('space_bar_to_cast',	 '', 'fireball');

	// this event keeps the mousepos entity up to date with the correct coordinates
	Crafty.addEvent(this, "mousemove", function(e) {
		//console.console.log("MouseX " + e.clientX + " MouseY: " + e.clientY);
		mousepos.attr({ x: e.clientX , y: e.clientY, w: 100, h: 20 }); 
	});
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
    Crafty.load(['assets/basictiles.png'], function(){
        Crafty.sprite(16, 'assets/basictiles.png', {
            spr_rock:    [7, 1],
            spr_sand:    [2, 1],
            spr_bush:    [6, 3],
            spr_village: [3, 5],
            spr_player:  [0, 8],
        });
        
        // Now that our sprites are ready to draw, start the game
        Crafty.scene('Main');
    })
});