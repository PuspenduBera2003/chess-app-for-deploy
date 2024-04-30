const { Server } = require("socket.io");
const db = require("../database");
const { v4: uuidv4 } = require('uuid');

const user2Selection = (data) => {
  if (data === 'white') {
    return 'black';
  } else {
    return 'white';
  }
}

const playWithFriendSelection = new Map();

const opponentDetails = new Map();

const socketRooms = new Map();

function initializeSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_HOST, credentials: true }
  });

  io.on("connection", socket => {

    socket.on("logIn", (data) => {
      const room = data.sessionID;
      socket.join(room);
      socket.join(data.id);
    });

    socket.on("add-friend", (data) => {
      io.to(data.rid).emit("new-friend-request", { sid: data.sid, susername: data.susername, sprofile_photo: data.sprofile_photo });
    })

    socket.on("accept-request", (data) => {
      io.to(data.rid).emit("new-friend", { sid: data.sid, username: data.username, profile_photo: data.profile_photo })
    })

    socket.on("reject-request", (data) => {
      io.to(data.rid).emit("remove-request", { sid: data.sid })
    })

    socket.on("logOut", (data) => {
      const room = data.sessionID;
      socket.to(room).emit("log-out");
    });

    socket.on('disconnect', () => {

      // Emit a custom event to each room the socket was in before disconnecting
      const room = socketRooms.get(socket.id);
      if (room) {
        io.to(room).emit('playerDisconnected', { gameId: room });
      }

      // Remove the socket from the socketRooms map
      socketRooms.delete(socket.id);
    });

    socket.on("game-created", (data) => {
      const gameRoom = data.room;
      socket.join(gameRoom);
      const roomSize = parseInt(socket.adapter.rooms.get(gameRoom).size) || 0;
      if (roomSize > 2) {
        socket.emit("closed", { success: false, data: "Already 2 members joined" });
        socket.leave(gameRoom)
        return
      }
      if (data.userSelection) {
        playWithFriendSelection.set(data.room, data.userSelection);
      }
      if (data.userDetails) {
        let userDetails = { [socket.id]: data.userDetails };
        if (opponentDetails.has(data.room)) {
          let existingDetails = opponentDetails.get(data.room);
          Object.assign(existingDetails, userDetails);
          opponentDetails.set(data.room, existingDetails);
        } else {
          opponentDetails.set(data.room, userDetails);
        }
      }
      const clients = io.sockets.adapter.rooms.get(gameRoom);
      const socketIds = Array.from(clients.keys());
      let player1, player2;
      if (roomSize == 2) {
        if (opponentDetails.has(data.room)) {
          let roomDetails = opponentDetails.get(data.room);
          if (roomDetails.hasOwnProperty(socketIds[0])) {
            player1 = roomDetails[socketIds[0]];
          }
          if (roomDetails.hasOwnProperty(socketIds[1])) {
            player2 = roomDetails[socketIds[1]];
          }
        }
        if (player1 && player1.id && player2 && player2.id) {
          io.to(socketIds[0]).emit("redirect", { gameId: gameRoom, opponentDetails: player2 });
          io.to(socketIds[1]).emit("both-joined", { gameId: gameRoom, opponentDetails: player1 });
        } else if (player1 && player1.id) {
          io.to(socketIds[0]).emit("redirect", { gameId: gameRoom, opponentDetails: null });
          io.to(socketIds[1]).emit("both-joined", { gameId: gameRoom, opponentDetails: player1 })
        } else if (player2 && player2.id) {
          io.to(socketIds[0]).emit("redirect", { gameId: gameRoom, opponentDetails: player2 });
          io.to(socketIds[1]).emit("both-joined", { gameId: gameRoom, opponentDetails: null })
        } else {
          io.to(socketIds[0]).emit("redirect", { gameId: gameRoom, opponentDetails: null });
          io.to(socketIds[1]).emit("both-joined", { gameId: gameRoom, opponentDetails: null });
        }
      }
      io.to(socketIds[0]).emit("board-orientation", { orientation: playWithFriendSelection.get(data.room) });
      io.to(socketIds[1]).emit("board-orientation", { orientation: user2Selection(playWithFriendSelection.get(data.room)) });
      socketRooms.set(socketIds[0], gameRoom);
      socketRooms.set(socketIds[1], gameRoom);
    });

    socket.on("cancel-game", (data) => {
      socket.to(data.room).emit("game-cancelled", { message: `${data.sender} Cancelled The Game` });
      io.of('/').in(data.room).socketsLeave(data.room);
      playWithFriendSelection.delete(data.room);
      socketRooms.forEach((value, key) => {
        if (value === data.room) {
          socketRooms.delete(key);
        }
      });
    })

    socket.on("resigned", (data) => {
      socket.to(data.room).emit("opponent-resigned", { gameId: data.room, message: `${data.sender} Resigned` });
      io.of('/').in(data.room).socketsLeave(data.room);
      playWithFriendSelection.delete(data.room);
      socketRooms.forEach((value, key) => {
        if (value === data.room) {
          socketRooms.delete(key);
        }
      });
    })

    socket.on("time-out", (data) => {
      socket.to(data.room).emit("opponent-time-out", { gameId: data.room, message: `${data.sender}'s Time Out` });
      io.of('/').in(data.room).socketsLeave(data.room);
      playWithFriendSelection.delete(data.room);
      socketRooms.forEach((value, key) => {
        if (value === data.room) {
          socketRooms.delete(key);
        }
      });
    })

    socket.on("gameConcluded", (data) => {
      io.of('/').in(data.room).socketsLeave(data.room);
      playWithFriendSelection.delete(data.room);
      socketRooms.forEach((value, key) => {
        if (value === data.room) {
          socketRooms.delete(key);
        }
      });
    })

    socket.on("draw-request-send", (data) => {
      socket.to(data.room).emit("draw-request-received", { sender: data.sender, room: data.room });
    })

    socket.on("draw-request-accepted", (data) => {
      io.to(data.room).emit("game-drawn", { gameId: data.room });
      io.of('/').in(data.room).socketsLeave(data.room);
      playWithFriendSelection.delete(data.room);
      socketRooms.forEach((value, key) => {
        if (value === data.room) {
          socketRooms.delete(key);
        }
      });
    })

    socket.on("draw-request-rejected", (data) => {
      socket.to(data.room).emit("draw-rejected", { gameId: data.room })
    })

    socket.on("move", (data) => {
      io.to(data.room).emit("board", { game: data.game, position: data.position, turn: data.turn, move: data.move });
    });

    socket.on("search-user", async (data) => {
      try {
        const userList = await db.query("select id,username,profile_photo from users where lower(username) like $1 || '%';", [data.query.toLowerCase()]);
        io.to(socket.id).emit("search-user-result", { result: userList.rows })
      }
      catch (err) {
        io.to(socket.id).emit("search-user-result", { error: err.message })
      }
    });

    socket.on("play-with-friend", (data) => {
      const gameRoom = data.room;
      socket.join(gameRoom);
      socket.to(data.rid).emit("new-match-request", { sid: data.sid, susername: data.susername, sprofile_photo: data.sprofile_photo, gameLink: data.gameLink, gameId: data.room })
      playWithFriendSelection.set(data.room, data.userSelection);
    })

    socket.on("game-request-accepted", (data) => {
      const clients = io.sockets.adapter.rooms.get(data.room);
      const socketIds = Array.from(clients.keys());
      socket.to(socketIds[0]).emit("challenge-accepted", { gameLink: data.gameLink });
    })

    socket.on("game-request-rejected", (data) => {
      const clients = io.sockets.adapter.rooms.get(data.room);
      const socketIds = Array.from(clients.keys());
      socket.to(socketIds[0]).emit("challenge-rejected", { id: data.id, username: data.username, profile_photo: data.profile_photo });
      io.of('/').in(data.room).socketsLeave(data.room);
    })

    socket.on("game-request-cancelled", (data) => {
      socket.to(data.rid).emit("game-cancelled", { gameId: data.room });
      io.of('/').in(data.room).socketsLeave(data.room);
    })

    socket.on("game-between-same-user", (data) => {
      socket.leave(data.gameId);
      socketRooms.delete(socket.id);
    })

    socket.on("random-play", () => {
      socket.join('random');
      const clients = io.sockets.adapter.rooms.get('random');
      const socketIds = Array.from(clients.keys());
      if (socketIds.length == 2) {
        const player1 = socketIds[0];
        const player2 = socketIds[1];
        io.of('/').in('random').socketsLeave('random');
        const uniqueId = uuidv4();
        io.to(player1).emit("random-game-id", { gameId: uniqueId, userSelection: 'white' });
        io.to(player2).emit("random-game-id", { gameId: uniqueId });
      }
    })

    socket.on("cancel-random-play-request", () => {
      socket.leave('random');
    })

  });

  return io;
}

module.exports = initializeSocket;