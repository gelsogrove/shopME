// Importiamo i moduli necessari
const express = require('express');

// Creiamo un'app Express
const app = express();
const port = 3500;

// Creiamo un router
const router = express.Router();

// Definiamo una route di base
router.get('/test', (req, res) => {
  res.json({ message: 'Test route funzionante!' });
});

// Montiamo il router
app.use('/api', router);

// Avviamo il server
app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
}); 