const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const fs = require('fs');

// create express app
const app = express();

// socketio listen on port 8080
const server = http.Server(app).listen(8080);
const io = socketIo(server, { cors: { origin: '*' } });

var players = {};
var unmatched;

function tryJoinGame(socket, playerAccAddress) {
  if (unmatched) {
    // there is a player waiting
    players[socket.id] = {
      // The opponent will either be the socket that is
      // currently unmatched, or it will be null if no
      // players are unmatched
      player1: players[unmatched].player1,
      player1AccAddress: players[unmatched].player1AccAddress,
      player2: socket.id,
      player2AccAddress: playerAccAddress,
      // The socket that is associated with this player
      socket: socket,
    };

    // set the player2 for the unmatched player
    players[unmatched].player2 = socket.id;
    players[unmatched].player2AccAddress = playerAccAddress;

    // set unmatched to null
    unmatched = null;
  } else {
    // there is no player waiting
    players[socket.id] = {
      // The opponent will either be the socket that is
      // currently unmatched, or it will be null if no
      // players are unmatched
      player1: socket.id,
      player1AccAddress: playerAccAddress,
      player2: null,
      player2AccAddress: null,
      // The socket that is associated with this player
      socket: socket,
    };
    // set unmatched to this player
    unmatched = socket.id;
  }

  // Every other player is marked as 'unmatched', which means
  // there is not another player to pair them with yet. As soon
  // as the next socket joins, the unmatched player is paired with
  // the new socket and the unmatched variable is set back to null
}

// Returns the opponent socket
function getOpponent(socket) {
  if (
    players[socket.id].player1 == socket.id &&
    players[socket.id].player2 != null
  ) {
    // we are player 1
    // so return player 2
    return players[players[socket.id].player2].socket;
  } else if (
    players[socket.id].player2 == socket.id &&
    players[socket.id].player1 != null
  ) {
    // we are player 2
    // so return player 1

    return players[players[socket.id].player1].socket;
  } else {
    return;
  }
}

io.on('connection', function (socket) {
  console.log('Connection!');
  // will attempt to join a game if there is a waiting player
  // otherwise will add this player to the waiting pool
  tryJoinGame(socket, socket.handshake.query['accAddress']);
  console.log(players);

  // Once the socket has an opponent, we can begin the game
  if (getOpponent(socket)) {
    var playerInfo = {
      // player1: players[socket.id].player1,
      player1: players[socket.id].player1AccAddress,
      // player2: players[socket.id].player2,
      player2: players[socket.id].player2AccAddress,
    };

    console.log('Game Beginning!');
    socket.emit('game.begin', playerInfo);

    getOpponent(socket).emit('game.begin', playerInfo);
  }

  // // Listens for a move to be made and emits an event to both
  // // players after the move is completed
  // socket.on('make.move', function (data) {
  //   if (!getOpponent(socket)) {
  //     return;
  //   }

  //   socket.emit('move.made', data);
  //   getOpponent(socket).emit('move.made', data);
  // });

  // Emit an event to the opponent when the player leaves
  socket.on('disconnect', function () {
    console.log('Disconnection!');
    if (getOpponent(socket)) {
      getOpponent(socket).emit('opponent.left');
    }
  });
});
