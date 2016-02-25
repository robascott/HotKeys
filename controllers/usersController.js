var User   = require('../models/user');
var Race   = require('../models/race');

function usersIndex(req, res) {
  User.find(function(err, users){
    if (err) return res.status(404).json({message: 'Something went wrong.'});
    res.status(200).json(users);
  });
}

function usersShow(req, res){
  User.findById(req.params.id).populate('races').exec(function(err, user){
    if (err) return res.status(404).json({message: 'Something went wrong.'});
    res.status(200).send(user);
  });
}

function usersUpdate(req, res){
  User.findById(req.params.id,  function(err, user) {
    if (err) return res.status(500).json({message: "Something went wrong!"});
    if (!user) return res.status(404).json({message: 'No user found.'});

    if (req.body.email) user.local.email = req.body.name;
    if (req.body.password) user.local.password = req.body.password;

    user.save(function(err) {
     if (err) return res.status(500).json({message: "Something went wrong!"});

      res.status(201).json({message: 'User successfully updated.', user: user});
    });
  });
}

function usersDelete(req, res){
  User.findByIdAndRemove({_id: req.params.id}, function(err, user) {
    if (err) return res.status(500).json({message: "Something went wrong!"});

    Race.find({user: user._id}, function(err, races) {
      races.forEach(function(race) {
        race.remove();
      })
    });

    res.status(200).json({message: 'User has been successfully deleted'});
  });
}

module.exports = {
  usersIndex:  usersIndex,
  usersShow:   usersShow,
  usersUpdate: usersUpdate,
  usersDelete: usersDelete
};
