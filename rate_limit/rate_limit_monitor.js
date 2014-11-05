// This file have to be created in the root folder to specify your twitter and mailjet credentials
var credentials = require('./../credentials.js');

var Twit = require('twit');

var util = require('util');
T = new Twit(credentials.twitter);

var used = ["followers", "users", "friends", "friendships", "application"];

function display_cool(obj_rate){
  console.log('\033[2J');

  for(var attributename in obj_rate){
    for(var item in obj_rate[attributename]){
      console.log(
        "limit : " + obj_rate[attributename][item].limit+
        "\t remain : " + obj_rate[attributename][item].remaining+
        "\t reset : " + (obj_rate[attributename][item].reset - (Math.round(+new Date()/1000))) + " s\t"+
        item
      );
    }
  }
}

function rate_limite_info(){
  T.get('application/rate_limit_status', {"resources" : used}, function (err, data, response) {
    if(err) { console.log(err); }

    display_cool(data.resources);

  });
}


setInterval(rate_limite_info, 1000);
