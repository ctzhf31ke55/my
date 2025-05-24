const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Раздаем статику из папки dist (там лежит bundle.js и index.html, сгенерированный HtmlWebpackPlugin)
// Раздаём собранные файлы приложения
app.use(express.static(path.join(__dirname, 'dist')));
// Также отдаём исходную папку public, чтобы был доступ к contract.txt и т.п.
app.use(express.static(path.join(__dirname, 'public')));

// Обработка корневого маршрута – отправляем index.html из папки dist
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
