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

socketio.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join-game', (room) => {
    console.log('user joined game ' + room);
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpServer.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
