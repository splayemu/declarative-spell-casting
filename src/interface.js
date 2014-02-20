Interface = {

    mouseX: 0,
    mouseY: 0,
    paper: undefined,
	
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

        
        // start Raphael
        Interface.paper = Raphael(x, y, num_tiles_width * tile_size, num_tiles_height * tile_size);
        Interface.mousey = Interface.paper.rect(Interface.mouseX, Interface.mouseY, 10, 10).attr({"fill": "black"}); 
		Interface.line   = Interface.paper.rect(0, 0, 100, 1); 

    },
}