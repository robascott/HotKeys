var User   = require('../models/user');
var Race   = require('../models/race');

function racesCreate(req, res) {
  var race = new Race(req.body.race);

  race.save(function(err){
    if (err) return res.status(500).send(err);
    var id = req.body.race.user;
    User.findById(id, function(err, user){
       user.races.push(race);
       user.save();
       return res.status(201).send(race);
    });
  });
}

module.exports = {
  racesCreate: racesCreate
};
