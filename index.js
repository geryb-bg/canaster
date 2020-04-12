import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/cards/:playerName/:gameId', (req, res) => {
  const cards = [
    { value: '3', icon: '♥️', colour: 'red', suite: 'hearts' },
    { value: '4', icon: '♥️', colour: 'red', suite: 'hearts' },
    { value: '5', icon: '♥️', colour: 'red', suite: 'hearts' },
    { value: '6', icon: '♦️', colour: 'red', suite: 'diamonds' },
    { value: '7', icon: '♦️', colour: 'red', suite: 'diamonds' },
    { value: '8', icon: '♦️', colour: 'red', suite: 'diamonds' },
    { value: '9', icon: '♣️', colour: 'black', suite: 'clubs' },
    { value: '10', icon: '♣️', colour: 'black', suite: 'clubs' },
    { value: 'J', icon: '♣️', colour: 'black', suite: 'clubs' },
    { value: 'Q', icon: '♠️', colour: 'black', suite: 'spades' },
    { value: 'K', icon: '♠️', colour: 'black', suite: 'spades' },
    { value: 'A', icon: '♠️', colour: 'black', suite: 'spades' },
    { value: 'Joker', icon: '🃏', colour: 'black', suite: 'none' },
  ];
  res.send(cards);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
