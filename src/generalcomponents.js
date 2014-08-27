// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
    init: function() {
        this.attr({
            w: Game.map_grid.tile.width,
            h: Game.map_grid.tile.height
        })
    },

    // Locate this entity at the given position on the grid
    at: function(x, y) {
        if (x === undefined && y === undefined) {
            return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
        } else {
            this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
            return this;
        }
    },
	
	getDirection: function(x, y) {
        var xDifference = this.x/Game.map_grid.tile.width - x;
        var yDifference = this.y/Game.map_grid.tile.height - y;

        //console.log("xDifference: " + xDifference + " yDifference: " + yDifference);
        //console.log("hypDist: " + hypDist);
        //console.log("Angle: " + Math.atan2(xDifference, yDifference) * (180 / Math.PI));
        return Math.atan2(xDifference, yDifference);
    },	
	
});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
    init: function() {
        this.requires('2D, Canvas, Grid');
    },
});

Crafty.c('Rock', {
    init: function() {
        this.requires('Actor, Solid, spr_rock');
    },
});

Crafty.c('Sand', {
    init: function() {
        this.requires('Actor, spr_sand');
    },
});

Crafty.c("Endpoint", {
    init: function() {
        this.requires('Actor, spr_spell, SpriteAnimation')
			.reel('Explode',  64, [[8, 10], [9,10], [10,10]])
			.animate('Explode', 1);
    },
	moveTo: function (x, y) {
		this.attr({"w":64, "h":64});
		var x_offset = this._w / Game.map_grid.tile.width / 2;
		var y_offset = this._h / Game.map_grid.tile.height / 2;
		console.log("_w: " + this._w + " x_offset: " + x_offset);
		console.log("_h: " + this._h + " y_offset: " + y_offset);
		this.at(x - x_offset, y - y_offset)
		    .animate('Explode', 1);

	}
});

Crafty.c("Explosion", {
    init: function() {
        this.requires('Actor, spr_spell, SpriteAnimation')
			.reel('Explode',  64, [[8, 10], [9,10], [10,10]])
			.animate('Explode', 1)
		    .bind('EnterFrame', function () {
				if (! this.isPlaying())
					this.destroy();
			}); 
    },
});

Crafty.c("Projectile", {
    init: function() {
        this.requires('Actor, Collision, spr_spell, SpriteAnimation')
		    .bind('EnterFrame', function () {
				//hit floor or roof
				if (this.y <= 0 || this.y >= (Game.playable_height - 10))
					this.destroy();

				if (this.x <= 0 || this.x >= (Game.playable_width - 10))
					this.destroy();

				this.x += this.dX;
				this.y += this.dY;
			})
			.stopOnSolids();

    },
	projectile: function(size, direction, speed) {
        direction = direction;
		var additionaldX = Math.sin(direction) * speed;
		var additionaldY = Math.cos(direction) * speed;
		//console.log("Accelerating dX: " + additionaldX + " dY: " + additionaldY);
		this.attr({ dX: additionaldX, dY: additionaldY });
		return this;
	},

    stopOnSolids: function() {
        this.onHit('Solid', this.explode);
    
        return this;
    },
	
	explode: function () {
	    var pos = this.at();
		Crafty.e("Explosion").at(pos.x, pos.y);
		this.destroy();
	},
});

// This is the player-controlled character
Crafty.c('PlayerCharacter', {
    init: function() {
        this.requires('Actor, Collision, spr_player, SpriteAnimation, ')
            .stopOnSolids()
			.stopAtEndpoint()
            .reel('PlayerMovingUp',    8, [[4, 8], [5,8]])
            .reel('PlayerMovingRight', 8, [[2, 8], [3,8]])
            .reel('PlayerMovingDown',  8, [[0, 8], [1,8]])
            .reel('PlayerMovingLeft',  8, [[6, 8], [7,8]]);
    
		this.targetX = this.at().x;
		this.targetY = this.at().y;
		this.distance_left_x = 0;
		this.distance_left_y = 0;
		this.dx = 0;
		this.dy = 0;
		this.speed = 1;
		this.direction = 0;
		//this.turn_speed = 1;

		this.bind('EnterFrame', function () {

		
			var dir = Math.abs(this.direction);
			if (dir < Math.PI / 4) {
				if (! this.isPlaying('PlayerMovingUp'))
					this.animate('PlayerMovingUp', -1);			
			}
			else if (dir < 3 * Math.PI / 4) {
				if (this.direction < 0) {
					if (! this.isPlaying('PlayerMovingRight')) 
						this.animate('PlayerMovingRight', -1);				
				}
				else {
					if (! this.isPlaying('PlayerMovingLeft')) 
						this.animate('PlayerMovingLeft', -1);						
				}
			}
			else if (dir < Math.PI) {
				if (! this.isPlaying('PlayerMovingDown')) 
					this.animate('PlayerMovingDown', -1);
			}
			else { // dir is set to 10 to signify stopped
				this.pauseAnimation();
			}
		
			this.distance_left_x -= Math.abs(this.dx);
			this.distance_left_y -= Math.abs(this.dy);
			//if(this.dx != 0 && this.dy != 0) {
			//	console.log("distance_left_x: " + this.distance_left_x + ", frames to complete: " + this.distance_left_x / this.dx);
			//	console.log("distance_left_y: " + this.distance_left_y + ", frames to complete: " + this.distance_left_y / this.dy);
			//}
			if((this.dx != 0 && this.dy != 0) && 
			   (this.distance_left_x <= 0 && this.distance_left_y <= 0)) {
				
			    this.at(this.targetX, this.targetY);
				this.pauseAnimation();
				this.stopMovement();
			} else {
				this.x += this.dx;
				this.y += this.dy;
			
			}
			
		});
    },
    
	
	
	moveTowards: function (x, y) {
	    this.speed = 3;
		this.targetX = x;
		this.targetY = y;

		var pos = this.at();
		this.distance_left_x = Math.abs(x - pos.x) * Game.map_grid.tile.width;
		this.distance_left_y = Math.abs(y - pos.y) * Game.map_grid.tile.height;
		//this.distance_left = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
		//console.log("Distance to walk: " + this.distance_left);
        this.direction = this.getDirection(x, y);
		console.log("direction: " + this.direction);
		this.dx = -Math.sin(this.direction) * this.speed;
		this.dy = -Math.cos(this.direction) * this.speed;
		console.log("_movement(x: " + this.dx + ", y: " + this.dy + ")");
		console.log("distance_left_x: " + this.distance_left_x + ", frames to complete: " + this.distance_left_x / this.dx);
		console.log("distance_left_y: " + this.distance_left_y + ", frames to complete: " + this.distance_left_y / this.dy);
		
		
        //console.log("xDifference: " + xDifference + " yDifference: " + yDifference);
        //console.log("hypDist: " + hypDist);
        //console.log("Angle: " + Math.atan2(xDifference, yDifference) * (180 / Math.PI));

    },
	
	
    // Registers a stop-movement function to be called when
    //  this entity hits an entity with the "Solid" component
    stopOnSolids: function() {
        this.onHit('Solid', this.stopMovement);
    
        return this;
    },
    // Registers a stop-movement function to be called when
    //  this entity hits an entity with the "Solid" component
    stopAtEndpoint: function() {
        //this.onHit('Endpoint', this.stopMovement);
    
        return this;
    },
    
    // Stops the movement
    stopMovement: function() {
        this.speed = 0;
		this.direction = 10; // special direction to signify stopped
        if (this._movement) {
            this.x -= this.dx;
            this.y -= this.dy;
			this.dx = 0;
			this.dy = 0;
			this.targetX = this.at().x;
			this.targetY = this.at().y;
        }
    }
});
