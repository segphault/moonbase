
//
// Moonbase Mayhem
// By Ryan Paul
//

var nowjs = require("now");
var express = require ("express");
var moonbase = require("./game");

var app = express.createServer();
var everyone = nowjs.initialize(app);
var game = new moonbase.Game();

app.use(express.static(__dirname + "/public"));

nowjs.on("connect", function() {
  this.now.populateStage(game.getStageElements());
  this.now.updateScoreRoster(game.getScoreRoster());
  game.addPlayer(this.user.clientId);
  game.addJewel();
  console.log("Connect: " + this.user.clientId + " has joined");
});

nowjs.on("disconnect", function() {
  game.removePlayer(this.user.clientId);
  console.log("Disconnect: " + this.user.clientId + " has quit");
});

game.on("playerAdded", function(player) {
  everyone.now.addPlayer(player);
});

game.on("playerRemoved", function(id) {
  everyone.now.removePlayer(id);
});
 
game.on("jewelAdded", function(jewel) {
  everyone.now.addJewel(jewel);
});

game.on("jewelRemoved", function(id) {
  everyone.now.removeJewel(id);
});

game.on("playerMoved", function(player) {
  everyone.now.adjustStage(player.id, player.x, player.y);
});

game.on("playerScoreChanged", function(player) {
  if (player.name)
    everyone.now.updateScoreRoster(game.getScoreRoster());

  nowjs.getClient(player.id, function(e) {
    this.now.incrementScore(player.jewelsCollected);
  });
});

everyone.now.moveCharacter = function(dir) {
  game.moveCharacter(this.user.clientId, dir);
}

everyone.now.nameChanged = function(name) {
  game.setPlayerName(this.user.clientId, name);
  console.log("Name Change: " + this.user.clientId + " is " + name);
}

app.listen(80);

