(function(){
    var app = {
      init: function() {
        client.init();
      },
    };

    var client = {
      init: function() {
        this.setConnection();
        tweetMachine.chooseCountry();
        twitter.init();
        this.setChooseAgain();
      },
      setConnection: function() {
  			this.socket = io.connect();
  			this.connectionErrorContainer = document.querySelector('.error-connection-message');
        this.realtimeIndicator = document.querySelector('.realtime-indicator');
        this.statusRealtime = document.querySelector('.status-realtime');

  			window.addEventListener('offline', function() {
  				this.connectionErrorContainer.classList.remove('hide');
          this.realtimeIndicator.classList.add('pulse-offline');
          this.realtimeIndicator.classList.remove('pulse');
  			}.bind(this));

  			window.addEventListener('online', function() {
  				this.connectionErrorContainer.classList.add('hide');
          this.realtimeIndicator.classList.remove('pulse-offline');
          this.realtimeIndicator.classList.add('pulse');
  			}.bind(this));

  			this.socket.on('disconnect', function() {
  				this.connectionErrorContainer.classList.remove('hide');
          this.realtimeIndicator.classList.add('pulse-offline');
          this.realtimeIndicator.classList.remove('pulse');
  			}.bind(this));

  			this.socket.on('reconnect', function() {
  				this.connectionErrorContainer.classList.add('hide');
          this.realtimeIndicator.classList.remove('pulse-offline');
          this.realtimeIndicator.classList.add('pulse');
  			}.bind(this));
  		},
      setChooseAgain: function() {
  			this.tryAgainBtnEl = document.querySelectorAll('.try-again');

  			this.tryAgainBtnEl.forEach(function(el) {
  				el.addEventListener('click', function() {
            console.log('hit');
  					window.location.reload(true);
  				});
  			});
  		}
    };

    var twitter = {
      init: function() {
        this.setError();
        this.getTrendingTopics();
      },
      getTrendingTopics: function() {
        client.socket.on('trendingtopics', function(data) {
          twitter.trendingTopics = data;
          tweetMachine.chooseTopic();
        }.bind(this));
      },
      getTweets: function() {
        client.socket.on('new tweet', function(data, tweet) {
          twitter.data = data;
          tweetMachine.setTweetText(tweet.text, tweet.user.name);
        });
      },
      setError: function() {
        this.errorContainer = document.querySelector('.error');
        this.realtimeIndicator = document.querySelector('.realtime-indicator');

        client.socket.on('error on stream', function(error) {
          this.errorContainer.classList.remove('hide');
          this.realtimeIndicator.classList.add('pulse-offline');
          this.realtimeIndicator.classList.remove('pulse');

          if(error.source) {
            // this.errorMessageEl.innerHTML = error.source;
            console.log(error.source)
          }
        }.bind(this));
      }
    };

    var tweetMachine = {
  		chooseCountry: function() {
  			this.chooseCountryContainer = document.querySelector('.country-choice');
  			this.chooseCountryForm = this.chooseCountryContainer.querySelector('.country-form');
  			this.countryInputEl = this.chooseCountryContainer.querySelectorAll('.country-input');

  			this.chooseCountryContainer.classList.remove('hide');

  			this.chooseCountryForm.addEventListener('submit', function(e) {
  				e.preventDefault();

  				this.chooseCountryContainer.classList.add('hide');
  				this.countryInputEl.forEach(function(el) {
  					if(el.checked) {
  						var country = el.value;
  						var woeid = el.dataset.woeid;
  						client.socket.emit('choose country', country, woeid);
  					}
  				});
  			}.bind(this));
  		},
  		chooseTopic: function() {
  			this.chooseTopicContainer = document.querySelector('.topic-choice');
  			this.topicOptionsContainer = this.chooseTopicContainer.querySelector('.topic-list');

  			this.chooseTopicContainer.classList.remove('hide');

  			twitter.trendingTopics.forEach(function(topic) {
  				var element = document.createElement('li');
  				element.classList.add('topic-option');
  				element.innerHTML = `<a href="" title="${topic.name}">${topic.name}</a>`;
          element.id = topic.name;
          this.topicOptionsContainer.appendChild(element);

  				element.addEventListener('click', function(e) {
            e.preventDefault();
  					client.socket.topicChoice = this.id;
            tweetMachine.start();
  					tweetMachine.setTopicChoice(client.socket.topicChoice);
  				});

  			}.bind(this));
  		},
  		start: function() {
  			this.tweetMachineContainer = document.querySelector('.tweets');

  			client.socket.emit('start streams');

  			twitter.getTweets();

  			this.chooseTopicContainer.classList.add('hide');
  			this.tweetMachineContainer.classList.remove('hide');
  		},
  		setTweetText: function(text, user) {
  			this.tweetsContainer = this.tweetMachineContainer.querySelector('.tweets-container');

  			var element = document.createElement('li');
				element.classList.add('container-tweet-text');
				element.innerHTML = `<li class="container-tweet-text">
            					       <p class="tweet-user">@${user}</p>
            					       <p class="tweet-text">${text}</p>
            				         </li>`;

  			this.tweetsContainer.insertAdjacentHTML('afterbegin', element.innerHTML);
  		},
      setTopicChoice: function() {
        this.topicChoiceEl = this.tweetMachineContainer.querySelector('.topicChoice');
        this.topicChoiceEl.innerHTML = client.socket.topicChoice;
      },
  	};

    app.init();

})();
