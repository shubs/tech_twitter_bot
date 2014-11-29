// This file have to be created in the root folder to specify your twitter and mailjet credentials
var credentials = require('./credentials.js');

var Twit = require('twit');


// node-getopt oneline example.
opt = require('node-getopt').create([
  ['u' , 'unfollow'                    , 'start the follow machine'],
  ['U'  , 'update'                , 'firebase update'],
  ['f' , 'follow'  , 'start follow machine'],
  ['e' , 'followinevent=ARG'   , 'start a following in event'],
  ['h' , 'help'                , 'display this help']
])              // create Getopt instance
.bindHelp()     // bind option 'help' to default action
.parseSystem(); // parse command line

console.info(opt);

var T1 = new Twit(credentials.twitter);
var T2 = new Twit(credentials.twitter2);
var T3 = new Twit(credentials.twitter3);
var T4 = new Twit(credentials.twitter4);
var T5 = new Twit(credentials.twitter5);
var keyArray = [T1, T2, T3, T4, T5];

//Connetion with firebase
var Firebase = require('firebase');
var myFirebaseRef = new Firebase('https://twlist.firebaseio.com/');

function randIndex (arr) {
	'use strict';
	var index = Math.floor(arr.length*Math.random());
	return arr[index];
}

function giveAPIkey(){
	'use strict';
	var T = randIndex(keyArray);
	return T;
}

function follow(target){
	'use strict';
	var T = giveAPIkey();
	T.post('friendships/create', {user_id: target, follow: true},function (err, data, response) {
		if(err) { console.log(err); }
		console.log(target + ' + followed');
	});
}

function followInEvent(){

	var current_time = new Date();

	// We decrease one week to the current_time
	var since_date = current_time.setHours(current_time.getHours() - (24 * 7));
	var params = {
	    q: '#HTML5Meetup',
			since: since_date,
			result_type: 'mixed',
			count:99,
			max_id:537752659823177700
	};
	var T = giveAPIkey();
	T.get('search/tweets', params,function (err, data, response) {
		console.log(data);
  	data.statuses.forEach(function(value,index){
			console.log(value.user.name);
			follow_good(value.user.id)
		});
	});
}

function unfollow(target, screen_name){
	var T = giveAPIkey();
	T.post('friendships/destroy', {user_id: target},function (err, data, response) {
		if(err) { console.log(err); }
		var userref = new Firebase('https://twlist.firebaseio.com/'+screen_name);

		userref.remove(function	(e){
			if(err) {
				console.log(e);
			}
			else {
				console.log(target + ' - unfollowed');
			}
		});
	});
}

function unfollow_machine(){
	console.log('**** Unfollowing at ' + new Date() + ' ****');

	var T = giveAPIkey();

	myFirebaseRef.on('value', function(snapshot) {
	  var db = snapshot.val();

		for(var attributename in db){
			var cur = db[attributename];

			console.log('Trying unfollow ' + cur.screen_name);
			var last_tweet = Date.parse(cur.last_tweet);
			var current_time = new Date();

			// We decrease one week to the current_time
			var max_delay = current_time.setHours(current_time.getHours() - (24 * 7));

			//good for the (last_tweet > max_delay)
			console.log(cur.screen_name + ' [Bad] last_tweet < max_delay : ' +  (last_tweet > max_delay));
			console.log(cur.screen_name + ' follows_me : ' + cur.follows_me);
			// if ((!follows_me) || (last_tweet > max_delay)){
			if (!cur.follows_me){
				unfollow(cur.user_id, cur.screen_name);
			}
			else{
				console.log('Let ' + cur.user_id + 'be a friend !');
			}
		}


	});
}

function follow_good(target){
	var T = giveAPIkey();
	T.get('users/lookup', { user_id: target },  function (err, data, response) {
		if(err) { console.log(err); }

		// checking if the tweets are posted less than one week
		if (data[0].status !== undefined){

			var last_tweet = Date.parse(data[0].status.created_at);
			var current_time = new Date();

			// We decrease one week to the current_time
			var max_delay = current_time.setHours(current_time.getHours() - (24 * 7));

			var enough_updated = last_tweet > max_delay;
			var enough_famous = ((data[0].friends_count > 400) && (data[0].followers_count < 600));

			console.log('[Good] last_tweet > max_delay : ' +  enough_updated);
			console.log(data[0].screen_name + ' followings : ' + data[0].friends_count + ', followers : ' + data[0].followers_count + ': ' + enough_famous);

			if (enough_updated && enough_famous){
				follow(target);
			}

		}
	});
}

function follow_machine(){
	var T = giveAPIkey();
	console.log('**** Following at ' + new Date() + ' ****');
	T.get('followers/ids',	function (err, data, response) {
			if(err) { console.log(err); }

		var randFollower = randIndex(data.ids);
		console.log('randFollower' + randFollower);

		T.get('friends/ids', { user_id: randFollower },function (err, data, response) {
			if(err) { console.log(err); }


		console.log('friends/ids');
			var friends = data.ids;

			setInterval(function() {
				var target	= randIndex(friends);
				console.log(target);
				follow_good(target);
			}, 100);
		});

	});
}

function update_db(target_cursor){
	var count = 0;
	var T = giveAPIkey();
	T.get('friends/list', {skip_status : true, include_user_entities:false, count:150, cursor : target_cursor},	function (err, data, response) {
		if(err) {console.log(err);}

		var following_list = data.users;
		var friends_array = [];

		following_list.forEach(function(value, index){
			var T = giveAPIkey();

			T.get('friendships/show', { target_id: value.id },  function (err, data2, response) {
				if(err) { console.log(err); }
				var follows_me = data2.relationship.target.following;

				var T = giveAPIkey();
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

					console.log('Update ... for ' + value.screen_name);
				});

			});

		});

		// recurse
		if (data.next_cursor > 0){
			update_db(data.next_cursor);

		}

	});

}
