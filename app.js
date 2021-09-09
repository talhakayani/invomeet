const express = require('express');
const { sequelize } = require('./models');

const expressApp = express();
expressApp.use(express.json());
const PORT = process.env.PORT || 3000;
const roomsRoute = require('./routes/roomsRoute');
// single file for all routes. 
expressApp.use('/', roomsRoute);

expressApp.listen(PORT, async () => {
  await sequelize.authenticate();
  console.log(`Server is running on: ${PORT} http://localhost:${PORT}`);
});
