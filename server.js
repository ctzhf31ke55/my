const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Раздаем статику из папки dist (там лежит bundle.js и index.html, сгенерированный HtmlWebpackPlugin)
app.use(express.static(path.join(__dirname, 'dist')));

// Обработка корневого маршрута – отправляем index.html из папки dist
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
