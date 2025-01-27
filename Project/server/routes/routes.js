const express = require('express');
const router = express.Router();

// Пример маршрута GET
router.get('/', (req, res) => {
  res.json({ message: 'Example route is working' });
});

module.exports = router;
