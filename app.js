// This file have to be created in the root folder to specify your twitter and mailjet credentials
var credentials = require('./credentials.js');

var Twit = require('twit');

// Connetion with firebase
var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://twlist.firebaseio.com/");

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

		T.get('friendships/show', { target_id: target },  function (err, data, response) {
			var follows_me = data.relationship.target.followed_by;

			console.log("[Bad] last_tweet < max_delay : " +  (last_tweet > max_delay));
			console.log("follows_me : " + follows_me);
			if ((last_tweet < max_delay) && (!follows_me)){
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

function update_db(target_cursor){
	T.get('friends/list', {skip_status : true, include_user_entities:false, count:200, cursor : target_cursor},	function (err, data, response) {
		if(err) { console.log(err); }

		var following_list = data.users;

		following_list.forEach(function(value, index){
			console.log(value.screen_name + " - "+index);
			//
			// var obj = {
			// 	user_id : value.id,
			// 	screen_name : value.screen_name,
			// 	date_of_follow : ,
			// 	followers : ,
			// 	followings : ,
			// 	is_following_me : ,
			// 	last_tweet : ,
			// 	nb_tweet : ,
			// 	score : // 1-5
			// }

		});

		// // recurse
		// if (data.next_cursor > 0){
		// 	update_db(data.next_cursor);
		// }

	});

}
//
// update_db();
unfollow_useless(619146464);

function follow_machine(){
	console.log("**** Following at " + new Date() + " ****");
}

function unfollow_machine(){
	console.log("**** Unfollowing at " + new Date() + " ****");
}

// setInterval(unfollow_machine, 2000);
//
// setInterval(follow_machine, 500);
