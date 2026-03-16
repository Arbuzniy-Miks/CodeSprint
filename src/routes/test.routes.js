const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');

// GET
router.get('/', testController.getTest);
router.get('/health', testController.healthCheck);
router.get('/users', testController.getUsers);
router.get('/users/:id', testController.getUserById);

// POST
router.post('/echo', testController.echoPost);
router.post('/users', testController.createUser);

// PUT
router.put('/users/:id', testController.updateUser);

// DELETE
router.delete('/users/:id', testController.deleteUser);

module.exports = router;