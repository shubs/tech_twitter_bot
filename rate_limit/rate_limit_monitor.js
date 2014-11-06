// This file have to be created in the root folder to specify your twitter and mailjet credentials
var credentials = require('./../credentials.js');

var Twit = require('twit');

var util = require('util');

function display_cool(obj_rate){
  // console.log('\033[2J');

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
  var T1 = new Twit(credentials.twitter);
  var T2 = new Twit(credentials.twitter2);
  var T3 = new Twit(credentials.twitter3);
  var T4 = new Twit(credentials.twitter4);
  var T5 = new Twit(credentials.twitter5);
  var used = ["followers", "users", "friends", "friendships", "application"];
  console.log('\033[2J');
  T1.get('application/rate_limit_status', {"resources" : used}, function (err, data1, response) {
    if(err) { console.log(err); }
    console.log("-------------****** 1 ******------------");
    console.log(data1.rate_limit_context);
    display_cool(data1.resources);

  });
  T2.get('application/rate_limit_status', {"resources" : used}, function (err, data2, response) {
    if(err) { console.log(err); }
    console.log("-------------****** 2 ******------------");

    console.log(data2.rate_limit_context);
    display_cool(data2.resources);

  });
  T3.get('application/rate_limit_status', {"resources" : used}, function (err, data3, response) {
    if(err) { console.log(err); }
    console.log("-------------****** 3 ******------------");

    console.log(data3.rate_limit_context);
    display_cool(data3.resources);

  });
  T4.get('application/rate_limit_status', {"resources" : used}, function (err, data4, response) {
    if(err) { console.log(err); }
    console.log("-------------****** 4 ******------------");

    console.log(data4.rate_limit_context);
    display_cool(data4.resources);

  });
  T5.get('application/rate_limit_status', {"resources" : used}, function (err, data5, response) {
    if(err) { console.log(err); }
    console.log("-------------****** 5 ******------------");

    console.log(data5.rate_limit_context);
    display_cool(data5.resources);

  });
}


setInterval(rate_limite_info, 2000);
