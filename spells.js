$(document).ready(function() {
	player_spells	= {};
	library_spells	= {};

	var add_spell = function(name, ast) {
		player_spells[name] = ast;
	};

	var lookup_spell = function(name) {
		return player_spells[name];
	};
});
