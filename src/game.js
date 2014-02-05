/*	game.js	- file that contains all the craftyJs components and entities. Initializes the game world.

*/
$(document).ready(function() {
	
	// canvas constants
	var background_width = 600;
	var background_height = 400;
	var playable_width = 600;
	var playable_height = 400;
	var canvas_top = 175; //px
	var canvas_left = 50; //px
	
	
	//var canvasPosition = $('#cr-stage').offset();
	//console.log("canvasPosition y: " + canvasPosition.top  + " x: " + canvasPosition.left);
	
	
	player_spells	= {};
	library_spells	= {};
	
	/* 	size - returns the size of the object
		
		Found somewhere on stackoverflow
	*/
	Object.size = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};

	/*	insertPlayerSpell 	- creates the spell object and adds it to the player_spells dictionary
		Inputs:	name 		- the string containing the name of the spell
				parameters	- a dictionary of the arguments and their types
				spell_text	- the string containing the text of the spell
	*/
	insertPlayerSpell = function (name, params, spell_text) {
		var spells_toks = scan(spell_text);	
	/*	console.log("Starting SCAN");	
		for(var i = 0; i < spells_toks.length;i++) {
			console.log('tok[' + i + ']: ' + spells_toks[i].get_lex_name());
		}
		console.log("Ending SCAN\n"); */
		
		//console.log("Starting PARSE");
		var root_node = parse(spells_toks);
		//console.log("Ending PARSE\n");
		var spell_info = {'params':params, 'funct':root_node, 'spell_text':spell_text};

		player_spells[name] = spell_info;
		console.log("Inserting player spell " + name + " paired with " + root_node);		
	}

	/* 	getCursorDirection - returns the direction of the cursor from the x and y positions passed as arguments 
		Inputs:
			myX	- the x location of the start of the vector 
			myY	- the y location of the start of the vector
			
		Outputs: a scalar direction value
	*/
	var getCursorDirection = function (myX, myY) {
		var mousepos = Crafty("MousePos");
		var yDifference = mousepos._y - (myY + canvas_top);
		var xDifference = mousepos._x - (myX + canvas_left);
		//console.console.log("xDifference: " + xDifference + " yDifference: " + yDifference);
		//console.console.log("hypDist: " + hypDist);
		//console.console.log("Angle: " + Math.atan2(xDifference, yDifference) * (180 / Math.PI));
		return Math.atan2(xDifference, yDifference) * (180 / Math.PI);
	}
	
	/*	init - sets up the crafty environment */
	function init() {
		Crafty.init(background_width, background_height);
		Crafty.background('rgb(127,127,127)');	
		
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
	};

	init()
});
