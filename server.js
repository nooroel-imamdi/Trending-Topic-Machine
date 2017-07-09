// Packages
var dotenv = require('dotenv');
var express = require('express');
var path = require('path');
var socketio = require('socket.io');
var twitter = require('twitter');

// Config
dotenv.config();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// Set Static Path
app.use(express.static(path.join(__dirname, './public')));

// Twitter API & keys
var client = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

// Socket connection
io.on('connection', function(socket) {

  console.log('Connected');

  socket.on('choose country', function(country, woeid) {
		socket.selectedCountry = country;
		socket.selectedWoeid = woeid;
		socket.selectedLang = (country == 'nl') ? 'nl' : 'en';

		getTrendingTopics(woeid, emitTrendingTopics);

		function emitTrendingTopics(topics, trendingTopicsString) {
			socket.topics = topics;
			socket.trendingTopicsString = trendingTopicsString;
			socket.emit('trendingtopics', topics);
		}
	});

  socket.on('start streams', function() {
		client.stream('statuses/filter', {track: socket.trendingTopicsString}, function(stream) {
			stream.on('error', function(error) {
				socket.emit('error on stream', error)
				console.log(error)
			});

			stream.on('data', function(tweet) {
				if(tweet.user) {
					if(tweet.user.lang === socket.selectedLang) {
						socket.topics.forEach(function(topic) {
							if ((tweet.text).includes(topic.name)) {
								topic.numberOfTweets++;
								socket.emit('new tweet', socket.topics, tweet);
							}
						});
					}
				}
			});

		});
	});

  socket.on('disconnect', function(data) {

		console.log('Disconnect', data)
	});

});

// Get trending topics from twitter api
function getTrendingTopics(woeid, callback) {
	client.get('trends/place', {id: woeid}, function(err, data) {
		if (err) { console.error(err); }

		var trendingTopicsArray = [];
		var trendingTopicsString = [];

		var subsetTrends = data[0].trends.slice(0, 10);
    var trends = subsetTrends.slice(0, 6);

		for (var i = 0; i < trends.length; i++) {
			var topicObject = {
				name: trends[i].name,
				numberOfTweets: 0
			};
			trendingTopicsArray.push(topicObject);
			trendingTopicsString.push(trends[i].name);
		}
		trendingTopicsString = trendingTopicsString.join(', ');

		callback(trendingTopicsArray, trendingTopicsString);
	});
}

// Router
app.get('/', function (req, res) {
  res.render('index.ejs');
});

// Run Server
server.listen(process.env.PORT || 3000);
console.log('server running... port 3000');
