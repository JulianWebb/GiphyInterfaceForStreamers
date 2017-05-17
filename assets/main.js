//Globals, globals for days
var gifQueue = [];
var queries = [];
var gifIsPlaying = false;
var gifStart;

var tags = new Object();
tags.gif = document.getElementById('img');
tags.query = document.getElementById('query');
tags.from = document.getElementById('from');
tags.display = document.getElementById('gifs');

var displayTime = 10; //in seconds
var cycleTime = 5; //in seconds


//Twitch client! Yay!
var client = new tmi.client(twitchOptions);
client.connect();


client.on("connected", function(address, port) {
	console.log(`Address: ${address} Port: ${port}`)
	client.action("ponglesesquire", "G.I.F.S. Operational")
})

client.on('chat', function(channel, user, message, self) {
	command = message.match(/\!\S+\b/)[0];
	if (command != null) {
		parameters = message.slice(command.length+1) //to remove the whitespace as well
		
		switch (command) {
			case "!hello":
				client.action(twitchOptions.channels[0], "Sup, " + user['display-name'] + "?");
				break;
			case "!gif":
				query = parameters.replace(" ", "+");

				response = $.get(`http://api.giphy.com/v1/gifs/search?q=${query}&api_key=${options.apikey}&limit=1&rating=${options.rating}`)
				response.done( function( data ) {
					console.log(data);
					if (data.pagination.count < 1) {
						client.action(twitchOptions.channels[0], "Sorry " + user['display-name'] + ", but we can't find a gif related to that!");
					} else {
						client.action(twitchOptions.channels[0], user['display-name'] + ", your gif is on it's way!")
						var gif = {
							from: user['display-name'],
							query: parameters,
							id: data.data["0"].id
						}
						console.log(gif);
						gifQueue.push(gif);
					};
				})
				break;

		}
	}
})

client.on('join', function(channel, username, self) {
	if (username == "ponglesesquire") {
		client.action(twitchOptions.channels[0], "Hello "+ username + ", my creator!");
	}
})


function gifLoop() {
	if (gifIsPlaying) {
		if (Date.now() - gifStart >= displayTime) {
			gifIsPlaying = false;
			tags.display.style.display = "none";
			startGif();
		} else {

			setTimeout(gifLoop, (Date.now() - gifStart) * 1000);
		}

	} else {
		startGif();
	}
}


function startGif() {
	if (gifQueue.length > 0) {
		tags.gif.src = "http://i.giphy.com/" + gifQueue[0].id + ".gif";
		
		tags.query.textContent = gifQueue[0].query;
		tags.from.textContent = gifQueue[0].from;

		tags.display.style.display = "";
		
		gifQueue.splice(0, 1);
		gifStart = Date.now();
		gifIsPlaying = true;
		
		setTimeout(gifLoop, displayTime*1000); //seconds to milliseconds
	} else {

		setTimeout(gifLoop, cycleTime*1000); //seconds to milliseconds
	}
}

startGif();