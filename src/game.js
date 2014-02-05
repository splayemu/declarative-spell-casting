/*	game.js	- file that contains all the craftyJs components and entities. Initializes the game world.

*/

// canvas constants
var background_width = 600,
    background_height = 400,
    playable_width = 600,
    playable_height = 400,
    canvas_top = 175, //px
    canvas_left = 50; //px


//var canvasPosition = $('#cr-stage').offset();
//console.log("canvasPosition y: " + canvasPosition.top  + " x: " + canvasPosition.left);


var player_spells	= {},
    library_spells	= {};

/*	insertPlayerSpell 	- creates the spell object and adds it to the player_spells dictionary
	Inputs:	name 		- the string containing the name of the spell
			parameters	- a dictionary of the arguments and their types
			spell_text	- the string containing the text of the spell
*/
var insertPlayerSpell = function (name, params, spell_text) {
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

jQuery(document).ready(function(){
	listPlayerSpellNames();
	var spell_tab = "player_spells_tab";
	
	$("#submit_btn").click(function() {  
		var spell_name 		= $("input#spell_name").val();
		var spell_text 		= $("textarea#spell_text").val();
		var spell_params 	= $("textarea#spell_params").val();
		//alert("Spell text: " + spell_text);
		insertPlayerSpell(spell_name, spell_params, spell_text);
		listPlayerSpellNames();
		return false; 
	});  
	
	$(document).on("click", ".spell_name", (function() {  
		var clicked_spell_name = $(this).text();
		$("input#spell_name").val(clicked_spell_name);
		grabSpellText(clicked_spell_name);
		grabSpellParams(clicked_spell_name);
		//alert(clicked_element);
		return false; 
	}));
	
	$(".tab").on('click', (function() {  
		var clicked_spell_type = $(this).attr('id');

		if (clicked_spell_type != spell_tab && clicked_spell_type == "player_spells_tab") {
			listPlayerSpellNames();
		}
		else if (clicked_spell_type != spell_tab && clicked_spell_type == "library_spells_tab") {
			listLibrarySpellNames();					
		}
		spell_tab = clicked_spell_type;
		//alert(clicked_spell_type);				
		return false; 
	}));
	
});

var listPlayerSpellNames = function () {
	/*
	$("#spell_name_lister").html('<ul>');
	for(var spell_name in player_spells) {
		//console.log("Spell name: " + spell_name);
		$("#spell_name_lister").append('<li id=spell_' + spell_name + ' class=spell_name>' + spell_name + '</li>');
	}
	$("#spell_name_lister").append('</ul>');
	*/
	$("#spell_name_lister").html('');				
	// create an empty array for building up the html output
	var html = [];

	// create a table
	html.push('<ul>');

	for(var spell_name in player_spells) {
		// do some sanity checking
		if (null != spell_name) {
			// add a row to the table
			html.push('<li id=spell_' + spell_name + ' class=spell_name>' + spell_name + '</li>');
		}
	}

	// close the table
	html.push('</ul>');

	// find the results div in the DOM and set its HTML content
	document.getElementById("spell_name_lister").innerHTML = html.join("");
	
}
var listLibrarySpellNames = function () {	
	$("#spell_name_lister").html('');	

	// create an empty array for building up the html output
	var html = [];

	// create a table
	html.push('<ul>');

	for(var spell_name in library_spells) {
		// do some sanity checking
		if (null != spell_name) {
			// add a row to the table
			html.push('<li id=spell_' + spell_name + ' class=spell_name>' + spell_name + '</li>');
		}
	}

	// close the table
	html.push('</ul>');

	// find the results div in the DOM and set its HTML content
	document.getElementById("spell_name_lister").innerHTML = html.join("");
	
}			


var grabSpellText = function (spell_name) {
	// save code currently in textarea#spell_text
	var spell = player_spells[spell_name];
	if(spell == undefined) {
		alert("Error: " + spell_name + " is not a spell");
		return false;
	}
	var spell_text = spell['spell_text'];
	$("textarea#spell_text").val(spell_text);
}

var grabSpellParams = function (spell_name) {
	// save code currently in textarea#spell_text
	var spell = player_spells[spell_name];
	if(spell == undefined) {
		alert("Error: " + spell_name + " is not a spell");
		return false;
	}
	var spell_params = spell['params'];
	$("textarea#spell_params").val(spell_params);
}

