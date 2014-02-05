window.onload = function() {
    Crafty.init(background_width, background_height);
	Crafty.background('rgb(127,127,127)');	
    
    Crafty.scene("main", function() {       
		insertPlayerSpell('fireball',			 '', 'shape 6, accelerate cursor 2');  
		insertPlayerSpell('space_bar_to_cast',	 '', 'fireball');
		
		/*	mousepos - stores the position of the mouse */
		var mousepos = Crafty.e("MousePos, Canvas, 2D, Text")
			.attr({ x: 20, y: 20, w: 100, h: 20 })
			
		var player1 = Crafty.e("Player1, PlayerManager, 2D, Canvas, Color, Keyboard, Multiway")
			.playermanager(3000, 100, 5, 5, 100)
			.color('rgb(0,255,0)')
			.attr({ x: 150, y: 150, w: 25, h: 25 })
			.multiway(4, {W: -90, S: 90, D: 0, A: 180})
			.bind("KeyDown", function(e) {
				var spell_name = 'space_bar_to_cast';
				if (this.isDown('SPACE')) {
					this.trigger("Cast", [spell_name, []]);
				}
			})
	
	
		//Target Dummy
		//var targetDummy = Crafty.e("TargetDummy, 2D, Canvas, Color, Collidable")
		//	.color('rgb(0,155,255)')
		//	.attr({ x: 400, y: 250, w: 15, h: 15 })
	
		// this event keeps the mousepos entity up to date with the correct coordinates
		Crafty.addEvent(this, "mousemove", function(e) {
			//console.console.log("MouseX " + e.clientX + " MouseY: " + e.clientY);
			mousepos.attr({ x: e.clientX , y: e.clientY, w: 100, h: 20 }); 
		});
    });
    
    // Automatically play the loading scene
    Crafty.scene("main");
};