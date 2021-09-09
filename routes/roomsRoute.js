const express = require('express');
const router = express.Router();

const roomsController = require('../controllers/roomsControllers');
router.get('/', (req, res) => {
  res
    .status(200)
    .json({ status: 200, message: 'Welcome to the Invomeet Room serve' });
});

router.post('/', (req, res) => {
  res
    .status(200)
    .json({ status: 200, message: 'Welcome to the Invomeet Room serve' });
});

router.post('/room/add', roomsController.addRoom);
router.get('/rooms/all', roomsController.getAllRooms);
router.get('/room/:name', roomsController.getRoomByName);
router.get('/room/floor/:floor', roomsController.getRoomsByFloor);
router.get('/rooms/available', roomsController.getAvailableRooms);
router.put('/room/status/:id', roomsController.updateStatus);
module.exports = router;
