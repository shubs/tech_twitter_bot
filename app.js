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
		console.log(target + " + followed");
	});
}

function unfollow(target){
	T.post('friendships/destroy', {user_id: target},function (err, data, response) {
		if(err) { console.log(err); }
		console.log(target + " - unfollowed");
	});
}

function unfollow_useless(target){
	T.get('users/lookup', { user_id: target },  function (err, data, response) {
		if(err) { console.log(err); }

		var last_tweet = Date.parse(data[0].status.created_at);
		var current_time = new Date();

		// We decrease one week to the current_time
		var max_delay = current_time.setHours(current_time.getHours() - (24 * 7));

		console.log("[Bad] last_tweet < max_delay : " +  (last_tweet > max_delay));
		if (last_tweet < max_delay){
			unfollow(target);
		}
		else{
			console.log("Let " + target + "be a friend !");
		}

	});
}

function follow_good(target){
	T.get('users/lookup', { user_id: target },  function (err, data, response) {
		if(err) { console.log(err); }

		// checking if the tweets are posted less than one week
		var last_tweet = Date.parse(data[0].status.created_at);
		var current_time = new Date();

		// We decrease one week to the current_time
		var max_delay = current_time.setHours(current_time.getHours() - (24 * 7));

		var enough_updated = last_tweet > max_delay;
		var enough_famous = ((data[0].friends_count > 350) && (data[0].followers_count < 1200));

		console.log("[Good] last_tweet > max_delay : " +  enough_updated);
		console.log(data[0].screen_name + " followings : " + data[0].friends_count + ", followers : " + data[0].followers_count + ": " + enough_famous);

		if (enough_updated && enough_famous){
			follow(target);
		}

	});
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
			}, 4000);
		});

	});
}


function unfollow_useless_friends(){
	T.get('friends/ids',	function (err, data, response) {
		friends = data.ids;

	});
}

follow_good(11158722);
