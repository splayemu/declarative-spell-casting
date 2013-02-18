$(document).ready(function() {
	// quick fix to log messages
	function log(msg) {
		setTimeout(function() {
			throw new Error(msg);
		}, 0);
	}
	
	player_spells	= {};
	library_spells	= {};
	
	// Generic object size
	Object.size = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};

	/* game components */
	Crafty.c("PlayerManager", {
		init: function() {
			this.bind('EnterFrame', function () {
				/* Things to do
					- 
					
				*/
				/* Game tick for player 
					- Increment Mana
					- evaluate/calc manacost (RTSI) for each spell
					- total_manacost = add up the mana cost of the current spells
					- Decrement Mana with total_manacost
					- If cost of executing spells > 0, all spells are destroyed
				
				*/
				// increment mana
				this.incrementMana(manabar);

				// calculate mana_cost of active spells
				if(this.mana <= 0 && Object.size(this.active_spells) != 0) {
					log("Destroying spells");
					// THIS DOES NOT WORK. It seems that it is not quite destroying the spell
					// CURRENTLY - this does not get activated
					for(spell_id in this.active_spells) {
						Crafty("Spell").each(function() { this.destroy() } );
					//	var name = Crafty(spell_id).getName();
					//	log("Destroying id: " + spell_id + " with the name: " + name);
					//	delete this.active_spells[spell_id];
					}
				}
			});
			/* Cast - Will be functionized. Casts a spell
				Preconditions: player.mana - spell.manacost > 0
				Postconditions: spell is cast
			*/
			this.bind('Cast', function(params) {
				//manabar = params[0];
				var id = params[0];
				var name = params[1];
				var mana_cost = params[2];
				var direction = params[3];
				var speed = params[4];
				
				var my_x = getMyX();
				var my_y = getMyY();

				//this.mana -= mana_cost;
				//manabar.trigger("ChangeMana", this.mana);
				var spell = shape("fire", 8);
				this.active_spells[spell[0]] = spell.getName();
				log("Player casts: " + spell[0] + " at the manacost: " + spell.getManaCost());
				this.decrementMana(manabar, spell.getManaCost());
				//Crafty(spell[0]).destroy();

				//accelerate(spell[0], 0, 1);			
				// checks to make sure the spell can be cast
				/*if(this.mana - mana_cost > 0) {
					this.mana -= mana_cost;
					manabar.trigger("ChangeMana", this.mana);
					this.active_spells[id] = name;
					var spell = shape("fire", 8);
					log("Player casts: " + spell[0] + " at the manacost: " + mana_cost);
					accelerate(spell[0]);
				}*/
				/*else if(this.mana - mana_cost <= 0) {
					Crafty(id).destroy();
					log("Not enough mana to cast " + id);
				
				}*/
			});
			//});
		},
		
		// constructor for the player
		// Mana - the player will have a static amount of mana that is used to cast spells. 
		//	      When mana reaches 0, all of his/her spells disappear
		// Mana Regen - how much mana will regen per game tick
		// active_spells - all the active spells this player has cast
		// spell_book - symbol table for spells
		// Actions - a queue for storing the spells a player has to cast
		playermanager: function(maximum_mana, mana_regen) {
			this.maximum_mana = maximum_mana;
			this.mana = 0;
			this.mana_regen = mana_regen;
			this.active_spells = {};
			this.spell_book = {};
			log("Mana " + this.mana);
			// "spellcast" gets triggered every time this player casts a spell
			// 		- Reduces the current mana of the player
			//		- 

			return this;
		},
		incrementMana: function(manabar) {
			this.mana += this.mana_regen;
			if(this.mana + this.mana_regen > this.maximum_mana) {
				this.mana = this.maximum_mana;
			}
			// log("Current Mana: " + this.mana);
			// update manabar
			//if(this.mana != this.maximum_mana)
			manabar.trigger("ChangeMana", this.mana);
		},
		decrementMana: function(manabar, mana_cost) {
			this.mana -= mana_cost;
			// update manabar
			manabar.trigger("ChangeMana", this.mana);
		}

	});


	/* game components */
	Crafty.c("Projectile", {
		init: function() {
			this.requires('2D');
			this.requires('Collision');
			//this.color(this.color);
		},
		
		// constructor for the projectile
		projectile: function(size, xStartingPos, yStartingPos, direction, speed) {
			this.attr({ x: xStartingPos, y: yStartingPos, w: size, h: size, 
				dX: Math.sin(direction) * speed, //Crafty.math.randomInt(2, 5) * xSpeed, 
				dY: Math.cos(direction) * speed}) //Crafty.math.randomInt(2, 5) * ySpeed})
			.bind('EnterFrame', function () {
				//hit floor or roof
				if (this.y <= 0 || this.y >= 290)
					this.destroy();

				if (this.x <= 0 || this.x >= 590)
					this.destroy();

				this.x += this.dX;
				this.y += this.dY;
			})
			//.onHit('Player1', function () {
			//	this.dX *= -1;
			//})
			return this;
		}

	});
	
	Crafty.c("PhysicalSpell", {
		init: function() {
			this.requires('2D');
			this.requires('Collision');
			this.requires('Color');
			/* Unused now
			this.bind('Accelerate', function(params) {
				this.accelerate(params[0], params[1]);
			}); */
		},
		
		// constructor for the projectile
		physicalspell: function(size, xStartingPos, yStartingPos, color) {
			this.attr({ x: xStartingPos, y: yStartingPos, w: size, h: size, dX: 0, dY: 0 })
			.color(color)
			.bind('EnterFrame', function () {
				//hit floor or roof
				if (this.y <= 0 || this.y >= 290)
					this.destroy();

				if (this.x <= 0 || this.x >= 590)
					this.destroy();

				this.x += this.dX;
				this.y += this.dY;
			})
			return this;
		},
		accelerate: function(direction, speed) {
				var dX = Math.sin(direction) * speed;
				var dY = Math.cos(direction) * speed;
				log("Accelerating dX: " + dX + " dY: " + dY);
				this.attr({ dX: dX, dY: dY });
		},
		selfDestruct: function() {
			this.destroy();
		}

	});
	
	Crafty.c("Spell", {
		init: function() {
			//log("Id is: " + this.each());
			this.bind('Echo', function() {
				log(this.name + " says hi.");
			});
		},
		
		// constructor for spell
		spell: function(name, mana_cost) {
			this.name = name;
			//this.parent = parent;
			this.mana_cost = mana_cost;
			log(this.name + " costs " + this.mana_cost + " mana.");
			return this;
		},
		getManaCost: function() {
			return this.mana_cost;
		},
		getName: function() {
			return this.name;
		},
	}); 
	/* end game components */


	/* general purpose global functions */
	// need getters for the mouse position and player position
	function getMouseX() {
		var mousepos = Crafty("MousePos");
		return mousepos._x;
	}

	function getMouseY() {
		var mousepos = Crafty("MousePos");
		return mousepos._y;
	}

	function getMyX() {
		var player1 = Crafty("Player1");
		return player1._x;
	}

	function getMyY() {
		var player1 = Crafty("Player1");
		return player1._y;
	}
	/* end general purpose global functions */


	var fireball = function(wizard) {
		var mousepos_x = getMouseX();
		var mousepos_y = getMouseY();
		var my_x = getMyX();
		var my_y = getMyY();
		var speed = 3;
		var direction = Math.atan2(mousepos_x - my_x, mousepos_y - my_y);
		var spell = shape("fire",8);
		//accelerate(spell[0], direction, speed);
		
		//var params = [5, "fireball", 1, direction, speed];	
		//wizard.trigger("Cast", params);
	}

	var ball = function(wizard) {
		var my_x = getMyX();
		var my_y = getMyY();
		
		var params = [5, "ball", 1, 0, 0];	
		wizard.trigger("Cast", params);
	}

	
	function init() {
		Crafty.init(600, 300);
		Crafty.background('rgb(127,127,127)');	
		
		
		var spells_toks = new Array();
		var spell = 'shape 40 10 5';

		spells_toks = scan(spell);
		
		log("Starting SCAN");	
		for(var i = 0; i < spells_toks.length;i++) {
			log('tok[' + i + ']: ' + spells_toks[i].get_lex_name());
		}
		log("Ending SCAN\n");
		
		log("Starting PARSE");
		var root_node = parse(spells_toks);
		log("Ending PARSE\n");
		
		tree_str = root_node.toString();
		log('traversal : ' + tree_str);
		// depth first traversal of the grammar tree

		
		var mousepos = Crafty.e("MousePos, DOM, 2D, Text")
			.attr({ x: 20, y: 20, w: 100, h: 20 })
			//.text("(0,0)");
		
		/* Manabar - should move to a component probably
			- The event to change the mana is 'ChangeMana' which accepts an int */
		Crafty.e("ManabarBack, DOM, 2D, Color")
			.attr({ x: 5, y: 5, w: 102, h: 10, dX: 0, dY: 0})
			.color('rgb(0,0,0)')

		manabar = Crafty.e("Manabar, DOM, 2D, Color")
			.attr({ x: 6, y: 6, w: 100, h: 8, dX: 0, dY: 0})
			.color('rgb(0,0,255)')
			.bind("ChangeMana", function(current_mana) {
				//log("Mana will be changed to " + current_mana );
				if(current_mana < 0) {
					this.w = 0;
				}
				else this.w = current_mana;
			})
			
		//Main character
		var player1 = Crafty.e("Player1, PlayerManager, 2D, DOM, Color, Keyboard, Multiway")
			.playermanager(100,1)
			.color('rgb(0,255,0)')
			.attr({ x: 300, y: 150, w: 25, h: 25 })
			.multiway(4, {W: -90, S: 90, D: 0, A: 180})
			.bind("KeyDown", function(e) {
				if (this.isDown('SPACE')) {
					//for(var i = 0; i < 360; i++) {
					//	fireball(this, i);
					//}
					real_time_si(root_node);
				}
			});
			
		Crafty.addEvent(this, "mousemove", function(e) {
			//var pos = Crafty.DOM.translate(e.clientX, e.clientY);	
			//var direction = (Math.atan2(e.clientY - player1._y, e.clientX - player1._x));
			//mousepos.text("(" + Math.cos(direction) + "," + Math.sin(direction) + ")");
			//mousepos.text("(" + direction + ")");
			mousepos.attr({ x: e.clientX , y: e.clientY, w: 100, h: 20 }); 
			//me.rotation = ~~(Math.atan2(pos.y - me._y, pos.x - me._x) * (180 / Math.PI)) + 90;
		});
		

			
	};

	init()
});
