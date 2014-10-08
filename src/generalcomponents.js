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

Crafty.c('Motion', {
    init: function() {
        this.requires('Actor');
         
		this.distance_left_x = 0;
		this.distance_left_y = 0;
        this.vX = 0;
        this.vY = 0;
        this.aX = 0;
        this.aY = 0;
        this.target_direction = 0;
		this.direction = 0;
        this.friction_coef = 0.0;
        
		this.bind('EnterFrame', function () {
            if (this.y <= 0 || this.y >= (Game.playable_height - 10))
                this.destroy();

            if (this.x <= 0 || this.x >= (Game.playable_width - 10))
                this.destroy();
            
            this.vX += this.aX;
            this.vY += this.aY;
            
             // adding friction
            this.vX += this.vX * -1 * this.friction_coef;           
            this.vY += this.vY * -1 * this.friction_coef;    
            
            //console.log("vX: " + this.vX + " / " + (1.0 * fps) + " = " + (this.vX / (1.0 * fps)));
            
            //this.x += this.vX / (1.0 * fps);
            //this.y += this.vY / (1.0 * fps);
            
            this.x += this.vX;
            this.y += this.vY;
            //}

		});
    },
    
    // sets acceleration
	accelerateTowards: function (x, y, amount) {

		var pos = this.at();
		this.distance_left_x = Math.abs(x - pos.x) * Game.map_grid.tile.width;
		this.distance_left_y = Math.abs(y - pos.y) * Game.map_grid.tile.height;
		//this.distance_left = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
		//console.log("Distance to walk: " + this.distance_left);
        this.direction = this.getDirection(x, y);
		//console.log("direction: " + this.direction);
        this.aX = -Math.sin(this.direction) * amount;
        this.aY = -Math.cos(this.direction) * amount;
        
        //console.log("aX: " + this.aX + " aY: " + this.aY);

    },
    
    
    // sets velocity
  	moveTowards: function (x, y, speed) {
		var pos = this.at();
		this.distance_left_x = Math.abs(x - pos.x) * Game.map_grid.tile.width;
		this.distance_left_y = Math.abs(y - pos.y) * Game.map_grid.tile.height;
		//this.distance_left = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
		//console.log("Distance to walk: " + this.distance_left);
        this.target_direction = this.getDirection(x, y);
		//console.log("direction: " + this.direction);
		this.vX = -Math.sin(this.target_direction) * speed;
		this.vY = -Math.cos(this.target_direction) * speed;
		//console.log("vX: " + this.vX + ", vY: " + this.vY);
		//console.log("distance_left_x: " + this.distance_left_x + ", frames to complete: " + this.distance_left_x / this.vX);
		//console.log("distance_left_y: " + this.distance_left_y + ", frames to complete: " + this.distance_left_y / this.vY);
    },
    
    addVelocityTowards: function (direction, speed) {
        this.target_direction = direction;
		this.vX += -Math.sin(direction) * speed;
		this.vY += -Math.cos(direction) * speed;
    },
    
    calculateVelocityDirection: function () {
        return Math.atan2(this.vY, this.vX) * 180 / Math.PI;
    },
	
    calculateAccelerationDirection: function () {
        return Math.atan2(this.aY, this.aX) * 180 / Math.PI;    
    },
    
    calculateVelocity: function () {
        return Math.sqrt(Math.pow(this.vX, 2) + Math.pow(this.vY, 2));
    
    },
    
    calculateAcceleration: function () {
        return Math.sqrt(Math.pow(this.aX, 2) + Math.pow(this.aY, 2));
    
    },  
    
    stopOnSolids: function() {
        this.onHit('Solid', this.stopMovement);
        return this;
    },
    
    // Stops the movement
    stopMovement: function() {
		this.direction = 10; // special direction to signify stopped
        if (this.vX || this.vY) {
            this.x -= this.vX;
            this.y -= this.vY;
			this.vX = 0;
			this.vY = 0;
            this.aX = 0;
            this.aY = 0;
            this.distance_left_x = 0;
            this.distance_left_y = 0;
        }
    }  
});

/*
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
}); */



