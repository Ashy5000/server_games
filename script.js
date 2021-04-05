class Player {
  constructor(name) {
    this.name = name;
    this.opponent = "";
    this.confirmed = false;
  }
}
var Parse = {
  get: function(successCB) {
    var result = 0;
    $.ajax({
      type: "GET",
      url: "http://127.0.0.1:8080",
      success: successCB,
      error: function(data) {
        console.log(data);
      }
    });
  },
  post: function(data, sucsessCB) {
    $.ajax({
      type: "POST",
      url: "http://127.0.0.1:8080",
      data: data,
      success: sucsessCB || function() {},
      error: function(data) {
        console.error(data);
      }
    });
  },
  test: function() {
    $.ajax({
      type: "GET",
      url: "http://127.0.0.1:8080",
      error: function(data) {
        $app.append($("<h3>Error: " + JSON.stringify(data) + "</h3>"));
      }
    })
  },
  delete: function(key) {
    var item = key;
    Parse.get(function(data) {
      var dataObject = JSON.parse(data);
      for(var i = 0; i < dataObject.length; i++) {
        if(dataObject[i].name === key) {
          dataObject.splice(i, 1);
        }
      }
      Parse.post(JSON.stringify(dataObject));
    });
  },
  put: function(player, key, value) {
    var item = key;
    var valueVar = value;
    Parse.get(function(data) {
      var newData = JSON.parse(data);
      for(var k = 0; k < newData.length; k++) {
        if(newData[k].name === player) {
          console.log("Found player");
          newData[k][key] = valueVar;
        }
      }
      Parse.post(JSON.stringify(newData));
    });
  },
  getPlayer: function(requestedPlayer, resultCallback) {
    var callback = resultCallback;
    var name = requestedPlayer;
    Parse.get(function(data) {
      var jsonParsedData = JSON.parse(data);
      for(var i = 0; i < jsonParsedData.length; i++) {
        if(jsonParsedData[i].name === name) {
          callback(jsonParsedData[i]);
        }
      }
    });
  }
};
Parse.test();
var nameInput = $('<input id="name"></input>');
var submitButton = $('<button>Submit</button>');
var playerHeader = $("<h2>Availible players</h2>");
var checkForRequestsBtn = $("<button>Check for requests</button>");
var reloadBtn = $("<button>Reload</button>");
var exitGameButton = $("<button>Exit game</button>");
var checkForResponsesBtn = $("<button>Check for responses</button>");
var $app = $("<div></div>");
var playerName = "";
var opponentName = "";
submitButton.on('click', function() {
  var info = new Player(nameInput.val());
  playerName = info.name;
  Parse.get(function(data) {
    var postData = JSON.parse(data);
    postData = postData.concat([info])
    Parse.post(JSON.stringify(postData));
    reloadPlayers();
  });
});
$("body").append($app);
$app.append(nameInput);
$app.append(submitButton);
$app.append(playerHeader);
$app.append($("<br>"));
$app.append(checkForRequestsBtn);
$app.append($("<br>"));
$app.append(reloadBtn);
$app.append($("<br>"));
$app.append(exitGameButton);
$app.append($("<br>"));
$app.append(checkForResponsesBtn);
checkForRequestsBtn.on("click", function() {
  reloadPlayers();
  Parse.get(function(data) {
    var parsedData = JSON.parse(data);
    var info = undefined;
    for(var i = 0; i < parsedData.length; i++) {
      if(parsedData[i].name === playerName) {
        info = parsedData[i];
      }
    }
    if(info.opponent !== "") {
      if(confirm(`Would you like to play against ${info.opponent}?`)) {
        Parse.put(playerName, "confirmed", true);
        Parse.getPlayer(playerName, function(data) {
          Parse.getPlayer(data.opponent, function(opponentData) {
            runGame(data, opponentData);
          });
        });
      }
    }
  });
});
reloadBtn.on("click", function() {
  reloadPlayers();
});
exitGameButton.on("click", function() {
  if(confirm("Would you like to exit the game?")) {
    Parse.delete(playerName);
  }
});
checkForResponsesBtn.on("click", function() {
  Parse.getPlayer(opponentName, function(opponentData) {
    if(opponentData.confirmed === true) {
      if(confirm("Launch game with " + opponentName + "?")) {
        Parse.getPlayer(playerName, function(yourPlayer) {
          runGame(yourPlayer, opponentData);
        });
      }
    } else {
      alert("Either declined or still waiting...");
    }
  });
});
console.log("Client is running.");
function reloadPlayers() {
  var playerData = undefined;
  Parse.get(function(data) {
    playerData = JSON.parse(data);
    $(".player").remove();
    for(var i = 0; i < playerData.length; i++) {
      addPlayerListItem(playerData[i], i, playerData);
    }
  });
}
function addPlayerListItem(player, position, playerData) {
  var playerListItem = $('<p class="player">' + playerData[position].name + '</p>');
  var i = position;
  $app.append(playerListItem);
  if(player.opponent !== "" || player.requesting) {
    playerListItem.css("color", "red");
    playerListItem.text(playerListItem.text() + "- Already in game");
  }
  if(player.name === playerName) {
    playerListItem.css("color", "green");
    playerListItem.text(playerListItem.text() + "- You");
  }
  playerListItem.on("click", function() {
    Parse.get(function(data) {
      var dataCopy = JSON.parse(data);
      dataCopy[i].opponent = playerName;
      opponentName = dataCopy[i].name;
      Parse.post(JSON.stringify(dataCopy), reloadPlayers);
    });
  });
}
reloadPlayers();