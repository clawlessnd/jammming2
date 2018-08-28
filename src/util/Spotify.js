let accessToken;
let expiresIn;
const clientId = 'c7a5021402444e2abb1f6a8cc82240a9';
const redirectUri = "http://localhost:3000";
const Spotify = {
  getAccessToken () {
    if (accessToken) {
      return accessToken;
    }

    const url = window.location.href;

    if (url.match(/access_token=([^&]*)/) && url.match(/expires_in=([^&]*)/)) {
      const accessTokenMatch = url.match(/access_token=([^&]*)/);
      const expiresInMatch = url.match(/expires_in=([^&]*)/);
      accessToken = accessTokenMatch[1];
      expiresIn = Number(expiresInMatch[1]);

      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');

      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl
    }
  },

  search (searchTerm) {
    const accessToken = Spotify.getAccessToken();
    let urserId;

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`, {
      headers:{Authorization: `Bearer ${accessToken}`}
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
    }).then(jsonResponse => {
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },

  savePlaylist (playlistName, trackURIs) {
    if (!playlistName || !trackURIs.length) {
      return;
    }
    let accessToken = Spotify.getAccessToken();
    const headers = {Authorization: `Bearer ${accessToken}`};
    let userId;
    let playlistID;
    let userUrl;
    return fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => {
      if (response.ok) {
        return response.json();
      }
    }).then(jsonResponse => {
      let userId = jsonResponse.id;
      console.log(userId);

      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${accessToken}`,'Content-type': 'application/json'},
        body: JSON.stringify({name: playlistName})
      }).then(response => {
        return response.json();
      }).then(jsonResponse => {
        let playlistID = jsonResponse.id;

        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`, {
          method: 'POST',
          headers: {Authorization: `Bearer ${accessToken}`,'Content-type': 'application/json'},
          body: JSON.stringify({uris: trackURIs})
        }).then(response => {
          return response.json();
        }).then(jsonResponse => {
          let playlistID = jsonResponse.id;
          console.log(jsonResponse);
        });
      });
    });
  }
};

export default Spotify;
