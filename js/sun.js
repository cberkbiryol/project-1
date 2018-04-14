var coords = {
    lat: [],
    lng: [],
    addressStr: [],
}

var config = {
    apiKey: "AIzaSyBLtmYZZyEL9qO12gnAady4qj-Vrvurk4o",
    authDomain: "proj-group-6-1522726463174.firebaseapp.com",
    databaseURL: "https://proj-group-6-1522726463174.firebaseio.com",
    projectId: "proj-group-6-1522726463174",
    storageBucket: "proj-group-6-1522726463174.appspot.com",
    messagingSenderId: "278515349370"
};
firebase.initializeApp(config);

// Retrieve the Dark Sky API Key hidden in Firebase
var SUNdb = firebase.database();
SUNdb.ref().once('value').then(function(snap){
    DS_AK = snap.val().DS_AK; 
});


function initMap() {
    var geocoder = new google.maps.Geocoder(); // Greates a Geocoder object to convert user input to lat and lng
    $('#location-form-2').on('submit', function (event) {
        //adress can be zip code or any form of place name
        var address = $("#search-2").val().trim();
        $("#search-2").val("");
        geocodeAddress(geocoder, address); // Uses geocoder, map objects to do coordinate conversion                       
        event.preventDefault();
    })
    $('#location-form').on('submit', function (event) {
        var address = $("#search").val().trim();
        $("#search").val("");
        geocodeAddress(geocoder, address); // Uses geocoder, map objects to do coordinate conversion                       
        event.preventDefault();
    })
};

// retreiving user input and set up of Geocoder
function geocodeAddress(geocoder, address) {
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === 'OK') {
            // get lat and Lng and assign them to coords object
            coords.lat = results[0].geometry.location.lat();
            coords.lng = results[0].geometry.location.lng();            
            var temp_str = results[0].formatted_address.split(",");        
            if (temp_str.length > 3) {
                coords.addressStr = temp_str.splice(-(temp_str.length-1),3)
            } else { 
                coords.addressStr = results[0].formatted_address;
            }            
            getUVIndex();
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
        }
    });
};

function getUVIndex() {
    var lat = coords.lat;
    var lng = coords.lng;

    var queryURL = "https://api.darksky.net/forecast/" + DS_AK + "/" + lat + "," + lng;

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "jsonp",
        xhrFields: {
            withCredentials: false
        }
    }).then(function (response) {
        //console.log(response)
        var results = response;
        var uv = response.currently.uvIndex;
        var uv_today = response.daily.data[0].uvIndex;
        var uv_todayTime = moment(response.daily.data[0].uvIndexTime, 'X').format('h:mm a');
        var uv_tomorrow = response.daily.data[1].uvIndex;
        var uv_tomorrowTime = moment(response.daily.data[1].uvIndexTime, 'X').format('h:mm a');
        var uv_dayAfter = response.daily.data[2].uvIndex;
        var uv_dayAfterTime = moment(response.daily.data[2].uvIndexTime, 'X').format('h:mm a');

        SUNdb.ref().push({
            LastLocation: coords.addressStr,
            UV: uv,
            UV_today: uv_today,
            UV_todayTime: uv_todayTime,
            UV_tomorrow: uv_tomorrow,
            UV_tomorrowTime: uv_tomorrowTime,
            UV_dayAfter: uv_dayAfter,
        });

        $("#uvIndex").text(uv);
        $("#location").text(coords.addressStr);
        $("#location-2").text(coords.addressStr);
        //set forecast UV
        $("#day1uv").text(uv_today);
        $("#day2uv").text(uv_tomorrow);
        $("#day3uv").text(uv_dayAfter);
        $("#day1uvTime").text("at " + uv_todayTime);
        $("#day2uvTime").text("at " + uv_tomorrowTime);
        $("#day3uvTime").text("at " + uv_dayAfterTime);
    })
}

function setGoalTime() {
    //demo mode
    var goalTime = moment().add(1, 'minutes').format("h:mm:ss a");

    // normal run mode
    // var goalTime = moment().add(2, 'hours').format("h:mm:ss a");
    //console.log("goal time: " + goalTime);
    localStorage.setItem("goalTime", JSON.stringify(goalTime));
}


function clearGoalTime() {
    var storageCheck = JSON.parse(localStorage.getItem("goalTime"));
    if (!Array.isArray(storageCheck)) {
        storageCheck = null;
    }
}

function setSunTimer() {
    $(".btn").on("click", function (event) {
        event.preventDefault();
        clearGoalTime();
        var setInitialTime = moment();
        //console.log("initial time: " + setInitialTime);
        setGoalTime();
        runTimer();
    })
}
setSunTimer();


function restartTimer() {
    clearGoalTime();
    var setInitialTime = moment();
    setGoalTime();
    runTimer();
}




var intervalId;

function runTimer() {
    clearInterval(intervalId);
    intervalId = setInterval(checkTime, 5000);
    //5 * 60 * 1000
    // be sure to change the time it is checking for every 5 minutes.
    // make a demo interval timer for people to see it in action.   
}

function endTimer() {
    clearInterval(intervalId);
}

function checkTime() {
    var currentTime = moment().format("h:mm:ss a");
    //console.log("Grabbing current: " + currentTime);
    var checkGoalTime = JSON.parse(localStorage.getItem("goalTime"));
    //console.log("Check goal time: " + checkGoalTime);


    if (currentTime >= checkGoalTime) {
        modal();
        endTimer();
    }

}

function modal() {
    vex.dialog.open({
            message: 'Apply sunscreen now.',
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: 'Apply Sunscreen'
                }),
                $.extend({}, vex.dialog.buttons.NO, {
                    text: 'Cancel'
                })
            ],
            callback: function(data) {
                if (data) {
                    restartTimer();
            }
        }
    })
}




var clock;

$(document).ready(function () {
    clock = $(".clock").FlipClock({
        clockFace: "TwelveHourClock"
    });
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var date = new Date();
    var day1 = weekday[date.getDay()];
    var day2 = weekday[(date.getDay() + 1) % 7];
    var day3 = weekday[(date.getDay() + 2) % 7];
    $("#day1").text(day1);
    $("#day2").text(day2);
    $("#day3").text(day3);
});