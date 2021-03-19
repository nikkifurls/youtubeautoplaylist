const dashboardContainer = document.querySelector(".dashboard");
const rulesDiv = document.querySelector(".rules");
const rulesContainer = document.querySelector(".rules-container");
const playlistsDiv = document.querySelector(".playlists");
const playlistsContainer = document.querySelector(".playlists-container");

const rules = [
	{
		// Progressive Politics
		"playlist_id": "PLlVM9OaSW_SC4AtS6oo7BVRYNyqXaY0i8",
		"channels": [
			"UCPWXiRWZ29zrxPFIQT7eHSA", // thehill
			"UCldfgbzNILYZA4dmDt4Cd6A", // SecularTalk
			"UCo9oQdIk1MfcnzypG3UnURA", // Therationalnational
			"UC7Q4rvzJDbHeBHYk5rnvZeA", // TheHumanistReport
			// "UCv002AUCZaPNwiADqwchijg", // TheInterceptFLM
		]
	},
	{
		// Fun
		"playlist_id": "PLlVM9OaSW_SAkhZF0IZ1JdNXpFAa7aAH3",
		"channels": [
			"UCpi8TJfiA4lKGkaXs__YdBA", // tryguys
			"UCRrigpc864fw8ZNsJ2AnEJA", // trypod
			"UCINb0wqPz-A0dV9nARjJlOQ", // TheDodoSite
			"UCzQUP1qoWDoEbmsQxvdjxgQ", // joerogan
			"UCnxGkOGNMqQEUMvroOWps6Q", // JREClips
			"UCL6JmiMXKoXS6bpP1D3bk8g", // DonutMediaTV
			"UCsXVk37bltHxD1rDPwtNM8Q", // inanutshell
		]
	},
	{
		// TEST
		"playlist_id": "PLlVM9OaSW_SBkuoaTH5xb9Ck1nEMsjRvj",
		"channels": []
	}
];

// window.addEventListener("load", () => { });

const updateDashboard = () => {
	const isLoggedIn = getLoginStatus();
	updateLoginButtons();

	if (isLoggedIn) {
		updatePlaylists();
		// displayRules();
		// displayPlaylists();
	}
}

// TO DO
//		Channel		When channel publishes new video
// 		Playlist	When new video added to playlist
//		Terms		When new video matching search terms
const getTodaysVideos = (channelID, date = null) => {

	// Get yesterday's date
	if (date == null) {
		let date = new Date();
		date.setDate(date.getDate()-1);
		date = date.toISOString();
	}

	console.log("getTodaysVideos()", "gapi.client.youtube.search.list");
	return gapi.client.youtube.search.list({
			"part": [
				"snippet"
			],
			"maxResults": 50,
			"order": "date",
			"channelId": channelID,
			"publishedAfter": date,
		})
		.then(
			response => response.result.items,
			error => {
				console.error("getTodaysVideos()", error);
			}
		);
}

// TO DO: unwatched? since date?
const getChannelVideos = (channelID = "me") => {
	return getChannelPlaylistID(channelID)
		.then(playlistID => {
			if (playlistID) {
				return getPlaylistVideos(playlistID)
					.then(videos => videos);
			} else {
				console.error("getChannelVideos()", "No playlist ID found");
			}
		});
}

const getChannelPlaylistID = channelID => {
	let params = null;

	if (channelID == "me") {
		params = {
			"part": [
				"contentDetails"
			],
			"mine": true
		}
	} else {
		params = {
			"part": [
				"contentDetails"
			],
			"id": channelID
		}
	}

	console.log("getChannelPlaylistID()", "gapi.client.youtube.channels.list");
	return gapi.client.youtube.channels.list(params)
		.then(
			response => response.result.items[0].contentDetails.relatedPlaylists.uploads,
			error => {
				console.error("getChannelPlaylistID()", error);
			}
		);
}

const getChannelID = channelName => {
	console.log("getChannelID()", "gapi.client.youtube.channels.list");
	return gapi.client.youtube.channels.list({
			"part": [
				"id"
			],
			"forUsername": channelName,
		})
		.then(
			response => response.result.items ? response.result.items[0].id : null,
			error => {
				console.error("getChannelID()", error);
			}
		);
}

const getChannelName = channelID => {
	console.log("getChannelName()", "gapi.client.youtube.channels.list");
	return gapi.client.youtube.channels.list({
			"part": [
				"snippet,contentDetails,statistics"
			],
			"id": channelID,
		})
		.then(
			response => response.result.items ? response.result.items[0].snippet.title : null,
			error => {
				console.error("getChannelName()", error);
			}
		);
}

const getChannelData = channelID => {
	console.log("getChannelData()", "gapi.client.youtube.channels.list");
	return gapi.client.youtube.channels.list({
			"part": [
				"snippet,contentDetails,statistics"
			],
			"id": channelID,
		})
		.then(
			response => {
				if (response.result.items) {
					return {
						"name": response.result.items[0].snippet.title,
						"description": response.result.items[0].snippet.description,
						"image": response.result.items[0].snippet.thumbnails.medium.url,
						"subscriberCount": response.result.items[0].statistics.subscriberCount,
						"videoCount": response.result.items[0].statistics.videoCount,
						"viewCount": response.result.items[0].statistics.viewCount,
					}
				}
			},
			error => {
				console.error("getChannelData()", error);
			}
		);
}

const displayRules = () => {
	getRules().then(
		rules => {
			if (rules) {
				rules.forEach(
					rule => {
						if (rule) {
							getPlaylistData(rule.playlist_id).then(
								playlistData => {
									if (playlistData) {
										if ((typeof rule.channels !== "undefined") && (rule.channels !== null)) {
											Promise.all(rule.channels.map(
												channelID => {
													if (channelID) {
														return getChannelData(channelID).then(
															channelData => {
																if (Object.keys(channelData).length) {
																	return `<li>
																				<a href="https://www.youtube.com/channel/${channelID}" target="_blank" rel="noopener">
																					<img src="${channelData.image}" alt="Thumbnail">${channelData.name}
																				</a>
																			</li>`;
																} else {
																	return `No channels found.`
																}
															}
														);
										
													} else {
														console.error("getRuleChannelsHTML()", "Couldn't get channel ID.")
													}
											})).then(
												channelHTML => channelHTML.join("")
											).then(
												channelsHTML => {
													if (channelsHTML) {
														rulesContainer.innerHTML += 
															`<div class="rule">
																<a href="https://www.youtube.com/playlist?list=${playlistData.id}" target="_blank" rel="noopener">
																	<p class="title">${playlistData.title} (${playlistData.numVideos})</p>
																	<ul class="channels">
																		${channelsHTML}
																	</ul>
																</a>
																<button id="addChannel">Add Channel</button></p>
															</div>`;

														rulesDiv.style.display = "block";
													} else {
														console.error("displayRule()", "Could not get channels HTML");
													}
												}
											);
						
										} else {
											rulesContainer.innerHTML += 
												`<div class="rule">
													<a href="https://www.youtube.com/playlist?list=${playlistData.id}" target="_blank" rel="noopener">
														<p class="title">${playlistData.title} (${playlistData.numVideos})</p>
														<p>No channels found.</p>
													</a>
													<button id="addChannel">Add Channel</button></p>
												</div>`;

											rulesDiv.style.display = "block";
										}
						
									} else {
										console.error("displayRule()", "Couldn't get playlistData.");
									}
								}
							);
						} else {
							console.error("displayRules()", "No rule found.");
						}
					});

			} else {
				console.error("displayRules()", "No rules found.");
			}
		});
}

// TO DO
// 		Playlist	When new video added to playlist
//		Terms		When new video matching search terms
const getRules = () => {
	// When channel publishes new video
	return new Promise((resolve, reject) => {
		const error = false;
		if (!error) {
			resolve(rules);
		} else {
			reject(Error("Error"));
		}
	});
}

// TO DO:
// If playlist in rules, put red border around it to signify that it's auto-generated
const displayPlaylists = () => {
	getPlaylists("me")
		.then(playlists => {
			playlistsContainer.innerHTML = ``;
			playlistsDiv.style.display = "block";

			if (playlists) {
				playlists.sort((playlistA, playlistB) => (playlistA.snippet.localized.title > playlistB.snippet.localized.title) ? 1 : ((playlistB.snippet.localized.title > playlistA.snippet.localized.title) ? -1 : 0));
	
				playlists.forEach(playlist => {
					if (playlist) {
						playlistsContainer.innerHTML += 
							`<a href="https://www.youtube.com/playlist?list=${playlist.id}" class="playlist" target="_blank" rel="noopener">
								<div class="image">
									<img src="${playlist.snippet.thumbnails.medium.url}" alt="Thumbnail">
								</div>
								<div class="text">
									<p class="title">${playlist.snippet.localized.title} (${playlist.contentDetails.itemCount})</p>
								</div>
							</a>`;
					}
				});
	
			} else {

				playlistsDiv.innerHTML += `<p>No playlists found. View playlists dashboard <a href="https://www.youtube.com/feed/playlists" target="_blank" rel="noopener">on YouTube</a>.</p>`
			}
		});
}

const getPlaylists = (channelID = "me") => {
	let params = null;

	if (channelID == "me") {
		params = {
			"part": [
				"snippet,contentDetails"
			],
			"maxResults": 25,
			"mine": true
		};
	} else {
		params = {
			"part": [
				"snippet,contentDetails"
			],
			"channelId": channelID,
			"maxResults": 25
		};
	}

	console.log("getPlaylists()", "gapi.client.youtube.playlists.list");
	return gapi.client.youtube.playlists.list(params)
		.then(
			response => response.result.items,
			error => {
				console.error("getPlaylists()", error);
			});	
}

const getPlaylistData = playlistID => {
	console.log("getPlaylistData()", "gapi.client.youtube.playlists.list");
	return gapi.client.youtube.playlists.list({
			"part": [
				"snippet,contentDetails"
			],
			"mine": true,
			"maxResults": 25
		})
		.then(
			response => {
				const playlistData = response.result.items.filter(item => {
					return item.id == playlistID;
				});

				if (playlistData) {
					return {
						"id": playlistData[0].id,
						"title": playlistData[0].snippet.title,
						"url": playlistData[0].snippet.thumbnails.medium.url,
						"numVideos": playlistData[0].contentDetails.itemCount
					};
				} else {
					console.error("getPlaylistData()", "Can't get playlistData");
				}
			},
			error => {
				console.error("getPlaylistData()", error);
			});	
}

const getPlaylistVideos = playlistID => {
	console.log("getPlaylistVideos()", "gapi.client.youtube.playlistItems.list");
	return gapi.client.youtube.playlistItems.list({
			"part": [
				"snippet,contentDetails,status"
			],
			"playlistId": playlistID,
			"maxResults": 50
		})
		.then(
			response => response.result.items,
			error => {
				console.error("getPlaylistVideos()", error);
			});
}

// TO DO
// How to not re-add watched videos?
// Expand from only daily lists to more granular searching
// getChannelVideos(channelID).then(videos => {
	// console.log(videos);
// });
const updatePlaylists = () => {
	getRules()
		.then(rules => {
			if (rules) {
				rules.forEach(rule => {
					if (rule) {
						rule.channels.forEach(channelID => {
							if (channelID) {
								getTodaysVideos(channelID)
									.then(videos => {
										if (videos) {
											videos.forEach(video => {
												console.log("222 Adding video #" + video.id.videoId + " to playlist " + rule.playlist_id);
												// return addVideoToPlaylist(video.id.videoId, rule.playlist_id);
											});
										} else {
											console.error("updatePlaylists()", "No videos found.")
										}
									})
									// .then(what => {
									// 	console.log(what);
									// });
							} else {
								console.error("updatePlaylists()", "Channel ID not found.")
							}
						});
					} else {
						console.error("updatePlaylists()", "Rule not found.")
					}
				});
			} else {
				console.error("updatePlaylists()", "No rules found.")
			}
		});
}

// Make sure the client is loaded and sign-in is complete before calling this method.
const addVideoToPlaylist = (videoID, playlistID) => {

	console.log("111 Adding video #" + videoID + " to playlist " + playlistID);

	console.log("addVideoToPlaylist()", "gapi.client.youtube.playlistItems.insert");
	return gapi.client.youtube.playlistItems.insert({
			"part": [
				"snippet"
			],
			"resource": {
				"snippet": {
					"playlistId": playlistID,
					"position": 0,
					"resourceId": {
						"kind": "youtube#video",
						"videoId": videoID
					}
				}
			}
		})
		// .then(
		// 	response => {
		// 		// updateDashboard();
		// 		// showNotification("Video " + videoID + " successfully added to playlist " + playlistID + "!");
		// 	},
		// 	error => {
		// 		console.error("addVideoToPlaylist()", error);
		// 	}
		// );
}

const createPlaylist = (playlistTitle, playlistDescription) => {
	console.log("createPlaylist()", "gapi.client.youtube.playlists.insert");
	return gapi.client.youtube.playlists.insert({
			"part": [
				"snippet,status"
			],
			"resource": {
				"snippet": {
					"title": playlistTitle,
					"description": playlistDescription,
					"tags": [
						"YouTube Auto Playlist",
					],
					"defaultLanguage": "en"
				},
				"status": {
					"privacyStatus": "private"
				}
			}
		})
		.then(
			response => {
				updateDashboard();
				showNotification("Playlist \"" + playlistTitle + "\" successfully created!");
			},
			error => {
				console.error("createPlaylist()", error);
			}
		);
}