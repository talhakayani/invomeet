const { response } = require('express');
const { Rooms } = require('../models');
const rooms = require('../models/rooms');

exports.addRoom = async (req, res, _next) => {
  const body = req.body;
  try {
    if (!body) throw new Error('No posted data attached with body');
    // schema validation using JOI    
    const response = await Rooms.create(body);
    if (!response) 
      throw new Error('Ops! room not created');
    return res.status(200).json({ status: 200, message: 'Room created!', body: response });
    // await Rooms.create(body)
    //   .then(response => {
    //     if (!response) throw new Error('Ops! room not created');
    //     else {
    //       res
    //         .status(200)
    //         .json({ status: 200, message: 'Room created!', body: response });
    //     }
    //   })
    //   .catch(err =>
    //     res.status(400).json({ status: 400, message: err.message })
    //   );
  } catch (err) {
    return res.status(400).json({ status: 400, message: err.message });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    //const attributes = []
    await Rooms.findAll()
      .then(response => {
        if (!response.length) {
          res.status(200).json({
            status: 200,
            message: 'No room exsits',
          });
        } else {
          res.status(200).json({
            status: 200,
            message: 'Rooms record reterived',
            body: response,
          });
        }
      })
      .catch(err =>
        res.status(400).json({ status: 400, message: err.message })
      );
  } catch (err) {
    res.status(400).json({ status: 400, message: err.message });
  }
};

exports.getRoomsByFloor = async (req, res) => {
  try {
    const floor = req.params.floor;
    if (!floor) {
      throw new Error(
        'please mention the floor in which you need the room for meeting'
      );
    }
    const query = {
      where: {
        floor: floor,
      },
    };

    await Rooms.findAll(query)
      .then(response => {
        if (!response.length) {
          res.status(200).json({
            status: 200,
            message: 'No room exsits',
          });
        } else {
          res.status(200).json({
            status: 200,
            message: 'Rooms record reterived',
            body: response,
          });
        }
      })
      .catch(err => {
        res.status(400).json({ status: 400, message: err.message });
      });
  } catch (err) {
    res.status(400).json({ status: 400, message: err.message });
  }
};

exports.getRoomByName = async (req, res) => {
  try {
    const name = req.params.name;
    if (!name) {
      throw new Error(
        'please provide the name of the room that you want to search'
      );
    }
    const query = {
      where: {
        name: name,
      },
    };
    await Rooms.findOne(query)
      .then(response => {
        if (!response) {
          res.status(200).json({
            status: 200,
            message: 'No room exsits',
          });
        } else {
          res.status(200).json({
            status: 200,
            message: 'Rooms record reterived',
            body: response,
          });
        }
      })
      .catch(err => {
        res.status(400).json({ status: 400, message: err.message });
      });
  } catch (err) {
    res.status(400).json({ status: 400, message: err.message });
  }
};

exports.getAvailableRooms = async (req, res) => {
  try {
    const query = {
      where: {
        status: 'available',
      },
    };
    await Rooms.findAll(query).then(response => {
      if (!response.length) {
        res
          .status(400)
          .json({ status: 200, message: 'Currently all rooms are reserved!' });
      }
      res.status(200).json({
        status: 200,
        message: 'Rooms record reterived',
        body: response,
      });
    });
  } catch (err) {
    res.status(400).json({ status: 400, message: err.message });
  }
};
