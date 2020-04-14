import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import io from 'socket.io';
import { createGame, playerJoins, startGame } from './create-game.js';
import { games } from './data/game.js';
import { playerCards, playerDraw, playerDiscard, meldCards, meldCardsWithDiscard } from './play-game.js';

const app = express();
const port = 3000;

const httpServer = http.createServer(app);
const socketio = io(httpServer);

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/game', (req, res) => {
  res.send(games);
});

app.get('/game/:gameId', (req, res) => {
  const game = games.find((g) => g.gameId === req.params.gameId);
  if (!game) {
    res.send({ error: 'Game does not exist' });
    return;
  }
  res.send(game);
});

app.post('/game', (req, res) => {
  const game = createGame();
  res.send(game);
});

app.put('/game/:gameId', (req, res) => {
  const game = startGame(req.params.gameId);
  res.send(game);
});

app.post('/player/:playerName/:gameId', (req, res) => {
  const message = playerJoins(req.params.playerName, req.params.gameId, socketio);
  res.send(message);
});

app.get('/cards/:playerName/:gameId', (req, res) => {
  const cards = playerCards(req.params.playerName, req.params.gameId);
  res.send(cards);
});

app.get('/draw/:playerName/:gameId', (req, res) => {
  const result = playerDraw(req.params.playerName, req.params.gameId);
  res.send(result);
});

app.post('/discard/:playerName/:gameId', (req, res) => {
  socketio.toHost(req.params.gameId).emit('show-message', req.params.playerName + ' discarded a card');
  const result = playerDiscard(req.params.playerName, req.params.gameId, req.body.card, socketio);
  res.send(result);
});

app.post('/meld/:playerName/:gameId', (req, res) => {
  const result = meldCards(req.params.playerName, req.params.gameId, req.body.cards, socketio);
  res.send(result);
});

app.post('/melddiscard/:playerName/:gameId', (req, res) => {
  const result = meldCardsWithDiscard(req.params.playerName, req.params.gameId, req.body.cards, socketio);
  res.send(result);
});

socketio.toHost = (gameId) => socketio.to(`${gameId}-host`);
socketio.toPlayers = (gameId) => socketio.to(`${gameId}-players`);

socketio.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join-game-host', (gameId) => {
    socket.join(`${gameId}-host`);
    console.log('host joined game ' + gameId);

  });

  socket.on('join-game-player', (gameId) => {
    socket.join(`${gameId}-players`);
    console.log('player joined game ' + gameId);

  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpServer.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
