import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/cards/:playerName/:gameId', (req, res) => {
  const cards = ['2 ♥️', '3 ♦️', '5 ♦️', 'Q ♣️', 'K ♣️', 'A ♣️', '6 ♠️', '7 ♠️', '8 ♠️', '9 ♠️', '10 ♠️', 'J ♠️', '🃏'];
  res.send(cards);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
