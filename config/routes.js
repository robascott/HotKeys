var express = require('express'),
    router  = express.Router();

var usersController = require('../controllers/usersController');
var racesController = require('../controllers/racesController');
var authenticationsController = require('../controllers/authenticationsController');

router.post('/login', authenticationsController.login);
router.post('/register', authenticationsController.register);

router.route('/')
  .get(usersController.usersIndex)
 
router.route('/users')
  .get(usersController.usersIndex)

router.route('/users/:id') 
  .get(usersController.usersShow)
  .patch(usersController.usersUpdate)
  .delete(usersController.usersDelete)

router.route('/races')
  .post(racesController.racesCreate)


module.exports = router;