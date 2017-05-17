//Globals, globals for days
var gifIds = [];
var queries = [];
var gifIsPlaying = false;
var gifStart;
var gifTag = document.getElementById('gif');
var queryTag = document.getElementById('query');
var displayTag = document.getElementById('gifs');

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
						gifIds.push(data.data["0"].id);
						queries.push(parameters);
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
			displayTag.style.display = "none";
			startGif();
		} else {

			setTimeout(gifLoop, (Date.now() - gifStart) * 1000);
		}

	} else {
		startGif();
	}
}


function startGif() {
	if (gifIds.length > 0) {
		gifTag.src = "http://i.giphy.com/" + gifIds[0] + ".gif";
		
		queryTag.text = queries[0];
		displayTag.style.display = "";
		
		gifIds.splice(0, 1);
		queries.splice(0, 1);

		gifStart = Date.now();
		gifIsPlaying = true;
		
		setTimeout(gifLoop, displayTime*1000); //seconds to milliseconds
	} else {

		setTimeout(gifLoop, cycleTime*1000); //seconds to milliseconds
	}
}

startGif();