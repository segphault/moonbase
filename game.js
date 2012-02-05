
//
// Moonbase Mayhem
// By Ryan Paul
//

var util = require('util');
var events = require('events');

function Game() {
  events.EventEmitter.call(this);

  // Constants
  var MOVINC = 10;
  var BOUNDS = {
    "x": 0,
    "y": 50,
    "w": 720,
    "h": 500,
  }

  // Storage
  var allPlayers = {}
  var allJewels = {}

  // Player Statistics
  var playersTotal = 0;
  var playersCurrent = 0;
  var playersMax = 0;

  // Jewel Statistics
  var jewelsTotal = 0;
  var jewelsCollectedTotal = 0;

  function Jewel(id) {
    this.id = id;
    this.x = 0;
    this.y = 0;

    this.w = 30;
    this.h = 34;
  }

  function Player(id) {
    this.id = id;
    this.x = 0;
    this.y = 0;

    this.w = 55;
    this.h = 95;
    
    this.name = null;
    this.jewelsCollected = 0;
  }

  function placeItem(item) {
    item.x = Math.floor(Math.random() * BOUNDS.w - 20) + BOUNDS.x + 20;
    item.y = Math.floor(Math.random() * BOUNDS.h - 20) + BOUNDS.y + 20;
  }

  function intersects(objA, objB) {
    return objA.x < objB.x + objB.w &&
           objA.x + objA.w > objB.x &&
           objA.y < objB.y + objB.h &&
           objA.y + objA.h > objB.y;
  }

  this.getScoreRoster = function() {
    var scores = []
    for (var p in allPlayers) {
      var player = allPlayers[p];
      if (player.name)
        scores.push([player.name, player.jewelsCollected]);
    }

    return scores.sort(function(a,b) {b[1] - a[1]}).slice(0, 10);
  }

  this.getStageElements = function() {
    return {
      "players": allPlayers,
      "jewels": allJewels
    }
  }

  this.addPlayer = function(id) {
    var player = new Player(id);
    allPlayers[id] = player;
    placeItem(player);

    playersTotal += 1;
    playersCurrent += 1;

    if (playersCurrent > playersMax)
      playersMax = playersCurrent;

    this.emit("playerAdded", player);
  }

  this.removePlayer = function(id) {
    delete allPlayers[id];
    this.emit("playerRemoved", id);
  }

  this.addJewel = function() {
    var jewel = new Jewel(++jewelsTotal);
    allJewels[jewel.id] = jewel;
    placeItem(jewel);
    this.emit("jewelAdded", jewel);
  }

  this.removeJewel = function(id) {
    delete allJewels[id];
    this.emit("jewelRemoved", id);
  }

  this.setPlayerName = function(id, name) {
    allPlayers[id].name = name;
  }

  this.moveCharacter = function(id, direction) {
    var player = allPlayers[id];

    if (direction == "left") 
      player.x = Math.max(player.x - MOVINC, BOUNDS.x);
    else if (direction == "right")
      player.x = Math.min(player.x + MOVINC, BOUNDS.w);
    else if (direction == "up")
      player.y = Math.max(player.y - MOVINC, BOUNDS.y);
    else if (direction == "down") 
      player.y = Math.min(player.y + MOVINC, BOUNDS.h);

    this.emit("playerMoved", player);

    // Determine if user picked up a jewel
    for (var j in allJewels) {
      if (intersects(player, allJewels[j])) {
        player.jewelsCollected += 1;
        this.emit("playerScoreChanged", player);
        this.removeJewel(j);
        this.addJewel();
      }
    }
    
  }
}

util.inherits(Game, events.EventEmitter);
module.exports.Game = Game;

