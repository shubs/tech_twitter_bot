// This file have to be created in the root folder to specify your twitter and mailjet credentials
var credentials = require('./credentials.js');

var Twit = require('twit');

//
//	tweet 'hello world!'
//
T = new Twit(credentials.twitter);

function randIndex (arr) {
	var index = Math.floor(arr.length*Math.random());
	return arr[index];
}

function go(){
	T.get('followers/ids',	function (err, data, response) {
			if(err) { console.log(err); }

		var randFollower = randIndex(data.ids);

		T.get('friends/ids', { user_id: randFollower },function (err, data, response) {
			if(err) { console.log(err); }

			var friends = data.ids;
			var target	= randIndex(friends);
			console.log(target);

			T.post('friendships/create', {user_id: target, follow: true},function (err, data, response) {console.log(err);});

		});

	});
}


setInterval(function() {
	go();
}, 5000);
