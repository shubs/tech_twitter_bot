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

function follow(target){
	T.post('friendships/create', {user_id: target, follow: true},function (err, data, response) {
		if(err) { console.log(err); }
		console.log("followed");
	});
}

function good_friend_to_follow(id){

}

function go(){
	T.get('followers/ids',	function (err, data, response) {
			if(err) { console.log(err); }

		var randFollower = randIndex(data.ids);

		T.get('friends/ids', { user_id: randFollower },function (err, data, response) {
			if(err) { console.log(err); }

			var friends = data.ids;

			setInterval(function() {
				var target	= randIndex(friends);
				console.log(target);
				T.get('users/lookup', { user_id: target },  function (err, data, response) {
					if(err) { console.log(err); }
					console.log(data[0].screen_name + " followers : "+data[0].followers_count + ", followings : "+data[0].friends_count);
					var good = ((data[0].followers_count < 700) && (data[0].friends_count > 200));
					if (good){
						follow(target);
					}
				});
			}, 40000);
		});

	});
}

go();
