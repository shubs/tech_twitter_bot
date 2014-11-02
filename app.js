// This file have to be created in the root folder to specify your twitter and mailjet credentials
var credentials = require('./credentials.js');

var Twit = require('twit');

//
//  tweet 'hello world!'
//
T = new Twit(credentials.twitter);



//
//  choose a random friend of one of your followers, and follow that user
//
function mingle(){
	var self = this;
  
  	T.get('followers/ids', function(err, reply) {
      if(err) { console.log(err); }
      
      var followers = reply.ids
        , randFollower  = randIndex(followers);
        
      T.get('friends/ids', { user_id: randFollower }, function(err, reply) {
          if(err) { console.log(err); }
          
          var friends = reply.ids
            , target  = randIndex(friends);
            
          T.post('friendships/create', { id: target });
          console.log("followed : " + target);
        })
    });
}

//
//  prune your followers list; unfollow a friend that hasn't followed you back
// //
// Bot.prototype.prune = function (callback) {
//   var self = this;
  
//   this.twit.get('followers/ids', function(err, reply) {
//       if(err) return callback(err);
      
//       var followers = reply.ids;
      
//       self.twit.get('friends/ids', function(err, reply) {
//           if(err) return callback(err);
          
//           var friends = reply.ids
//             , pruned = false;
          
//           while(!pruned) {
//             var target = randIndex(friends);
            
//             if(!~followers.indexOf(target)) {
//               pruned = true;
//               self.twit.post('friendships/destroy', { id: target }, callback);   
//             }
//           }
//       });
//   });
// };

function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};

setInterval(function() {
	  
	T.get('followers/ids',  function (err, data, response) {
	    if(err) { console.log(err); }

		var randFollower  = randIndex(data.ids);

		T.get('friends/ids', { user_id: randFollower },function (err, data, response) {
			if(err) { console.log(err); }

			var friends = data.ids;
			var target  = randIndex(friends);
			console.log(target);

			T.post('friendships/create', { user_id: target, follow: true },function (err, data, response) {console.log(err)});
		})

	})
}, 2000);