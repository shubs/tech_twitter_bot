// This file have to be created in the root folder to specify your twitter and mailjet credentials
var credentials = require('./credentials.js');

var Twit = require('twit');

T = new Twit(credentials.twitter);
T2 = new Twit(credentials.twitter2);
T3 = new Twit(credentials.twitter3);

//Connetion with firebase
var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://twlist.firebaseio.com/");

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
	console.log("Trying unfollow " + target);
	T.get('users/lookup', { user_id: target },  function (err, data, response) {
		if(err) { console.log(err); }

		var last_tweet = Date.parse(data[0].status.created_at);
		var current_time = new Date();

		// We decrease one week to the current_time
		var max_delay = current_time.setHours(current_time.getHours() - (24 * 7));

		T.get('friendships/show', { target_id: target },  function (err, data, response) {
			var follows_me = data.relationship.target.following;
			//good for the (last_tweet > max_delay)
			console.log(target + " [Bad] last_tweet < max_delay : " +  (last_tweet > max_delay));
			console.log(target + " follows_me : " + follows_me);
			// if ((!follows_me) || (last_tweet > max_delay)){
			if (!follows_me){
				unfollow(target);
			}
			else{
				console.log("Let " + target + "be a friend !");
			}
		});

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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function follow_machine(){
	console.log("**** Following at " + new Date() + " ****");
	T.get('followers/ids',	function (err, data, response) {
			if(err) { console.log(err); }

		var randFollower = randIndex(data.ids);
		console.log("randFollower" + randFollower);

		T.get('friends/ids', { user_id: randFollower },function (err, data, response) {
			if(err) { console.log(err); }


		console.log("friends/ids");
			var friends = data.ids;

			setInterval(function() {
				var target	= randIndex(friends);
				console.log(target);
				follow_good(target);
			}, 1000);
		});

	});
}


function update_db(target_cursor){
	var count = 0;
	T.get('friends/list', {skip_status : true, include_user_entities:false, count:150, cursor : target_cursor},	function (err, data, response) {
		if(err) {
			console.log(err);

		}

		var following_list = data.users;
		var friends_array = [];


		following_list.forEach(function(value, index){
			T.get('friendships/show', { target_id: value.id },  function (err, data2, response) {
				if(err) { console.log(err); }
				var follows_me = data2.relationship.target.following;

				var r = getRandomInt(1,3);

				T.get('users/lookup', { user_id: value.id },  function (err, data3, response) {
					if(err) { console.log(err); }

					// checking if the tweets are posted less than one week
					var last_tweet = Date.parse(data3[0].status.created_at);

					friends_array[value.screen_name] = {
						user_id : value.id,
						screen_name : value.screen_name,
						date_of_follow : 0,
						followers : value.followers_count,
						followings : value.friends_count,
						follows_me : follows_me,
						last_tweet : last_tweet,
						nb_tweet : data3[0].statuses_count,
						score : 0// 1-5
					};

					var postsRef = myFirebaseRef.child(value.screen_name);
					postsRef.set(friends_array[value.screen_name]);

					console.log("Update ... for " + value.screen_name + (++count));
				});

			});

		});

		// recurse
		if (data.next_cursor > 0){
			update_db(data.next_cursor);

		}

	});

}

update_db();

function unfollow_machine(){
	console.log("**** Unfollowing at " + new Date() + " ****");
}

//
// setInterval(follow_machine, 500);
// setInterval(update_db, 43200000); //half a day
