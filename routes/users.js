var express = require('express');
var router = express.Router();

var User = require('../models/Users');

router.param('user', function(req, res, next, id) {
  var query = User.findById(id);

  query.exec(function (err, user){
    if (err) { return next(err); }
    if (!user) { return next(new Error('can\'t find comment')); }

    req.user = user;
    return next();
  });
});

router.get('/', function(req, res, next) {
  User.find(function(err, users){
    if(err){ return next(err); }
    res.json(users);
  });
});

router.put('/:user/addfriend', function(req, res, next) {
  var friend = req.body.friend;
  var friendsArr = req.user.friends;

  var duplicate = friendsArr.indexOf(friend);

  if (duplicate > -1) {
    return res.status(400).json({message: 'User is already a friend!'});
  } else {
      var newFriend = User.findById(friend, function (err, newfriend) {
          req.user.friends.push(friend);

          newfriend.friends.push(req.user._id);

          req.user.save(function(err, user) { 
            res.json(user);
          });

          newfriend.save(function(err, newfriend) {
            res.end();
          });

      });
  };
});

router.put('/:user/deletefriend', function(req, res, next){

    var index = req.user.friends.indexOf(req.body.friend);

    req.user.friends.splice(index,1);

    req.user.save(function(err, user) { 
        res.json(user);
    });

    var removeFromFriend = User.findById(req.body.friend, function(err, friend){
      var indexFriend = req.user.friends.indexOf(req.body.friend);
      friend.friends.splice(indexFriend,1);

    friend.save(function(err, friend){
      res.end();
    });


    });

});

module.exports = router;