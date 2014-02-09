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

    init: function () {
        Crafty.init(Game.width(), Game.width());
	    Crafty.background('rgb(127,127,127)');	
        
        Library.init();
        Crafty.scene('Loading');
        
        Interface.init();
        

    }
}
