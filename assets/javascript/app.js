$(document).ready(function() {
  var timeoutId = 0;
  var token;

  $('.music-choice-btn').hide();

  $('#display-weather').hide();

  // $('#display-playlist').hide();

  function prepAuthorize() {
    //Grab the hidden elements containing the values of the id and secret
    var a = $('#a').val();
    var b = $('#b').val();

    //if the elements exist then save their values in local storage
    if (!localStorage.getItem('auth_req_url')) {
      //Use the id and secret to create the base64 string necessary to
      //authenticate
      var requestObject =
        'https://accounts.spotify.com/authorize?' +
        $.param({
          client_id: a,
          response_type: 'code',
          redirect_uri: 'http://localhost:8080',
          scopes: 'user-read-private user-read-email'
        });

      localStorage.setItem('auth_req_url', requestObject);
      localStorage.setItem('auth_creds', btoa(a + ':' + b));
    }

    $('#loginLink').attr('href', localStorage.getItem('auth_req_url'));

    //Remove the elements from the page
    $('#a').remove();
    $('#b').remove();

    getToken();
  }

  function getToken() {
    var params = new URLSearchParams(location.search.slice(1));

    if (localStorage.getItem('s_auth_code') !== null) {
      $('.login-btn').hide();

      $('.music-choice-btn').show();
    }

    if (params.get('code')) {
      var code = params.get('code');

      localStorage.setItem('s_auth_code', code);

      if (localStorage.getItem('s_auth_code') !== null) {
        $('.login-btn').hide();

        $('.music-choice-btn').show();
      }

      refreshToken();
    }
  }

  function refreshToken() {
    $.ajax({
      method: 'POST',
      url:
        'https://cors-anywhere.herokuapp.com/https://accounts.spotify.com/api/token',
      data: {
        grant_type: 'authorization_code',
        code: localStorage.getItem('s_auth_code'),
        redirect_uri: 'http://localhost:8080'
      },
      headers: {
        Authorization: 'Basic ' + localStorage.getItem('auth_creds')
      }
    }).then(function(response) {
      //Save the token returned into local storage
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    });
  }

  function displayPlaylist(playlist) {
    console.log(playlist);

    var playlistWidget = $('<iframe>');

    playlistWidget.attr('src', playlist);

    // playlistWidget.css('display', 'block');

    // playlistWidget.css('margin', '25px auto');

    playlistWidget.attr('width', '640');

    playlistWidget.attr('height', '720');

    playlistWidget.attr('frameborder', '0');

    playlistWidget.attr('allowtransparency', 'true');

    $('.display-playlist').append(playlistWidget);
  }

  function makeMoodBtns() {
    var moods = ['happy', 'mellow', 'focus', 'amp', 'calm'];

    var userMoodIDs = [
      'spotify',
      'funnybunny000000',
      'spotify',
      'spotify',
      'spotify'
    ];

    var moodPlaylistIDs = [
      '2PXdUld4Ueio2pHcB6sM8j',
      '4EoPt05ztUjVaujcWbUL2Z',
      '37i9dQZF1DX6VdMW310YC7',
      '37i9dQZF1DX6T5dWVv97mp',
      '37i9dQZF1DX4eRPd9frC1m'
    ];

    for (let i = 0; i < moods.length; i++) {
      var btnWrapper = $("<div class='col-md-2 mood-images'>");
      var moodBtn = $('<img>');

      moodBtn.text(moods[i]);

      moodBtn.addClass('mood-img');

      moodBtn.attr('src', 'assets/images/' + moods[i] + '.png');

      moodBtn.attr('alt', moods[i]);

      moodBtn.attr(
        'data-playlist',
        'https://open.spotify.com/embed?uri=spotify%3Auser%3A' +
          userMoodIDs[i] +
          '%3Aplaylist%3A' +
          moodPlaylistIDs[i]
      );

      btnWrapper.append(moodBtn);
      $('.mood-row').append(btnWrapper);
    }
  }

  function weatherPlaylist() {
    displayPlaylist(URL);
  }

  $('#display-weather').hide();
  $('#display-playlist').hide();

  $('#add-city').click(function() {
    $('#display-submit').hide();
    $('#display-weather').show();
    $('#display-playlist').show();
  });
  $('#add-city').click(function(event) {
    event.preventDefault();

    var city = $('#city')
      .val()
      .trim();
    var state = $('#state')
      .val()
      .trim();
    var weatherURL =
      'http://api.wunderground.com/api/22c4d183e8562c2d/conditions/geolookup/forecast/hourly10day/q/' +
      state +
      '/' +
      city +
      '.json';

    $.ajax({
      url: weatherURL,
      method: 'GET'
    }).then(function(response) {
      console.log(response);

      var data = response.current_observation;

      var forecast = response.forecast.simpleforecast.forecastday[0];

      var highTemp = forecast.high.fahrenheit;

      var lowTemp = forecast.low.fahrenheit;

      var conditions = forecast.conditions;

      var iconURL = forecast.icon_url;

      var p = $('<p style="color: white; text-align: center;">').html(
        data.display_location.full
      );
      var highTemperature = $(
        '<p style="color: white; text-align: center;">'
      ).text('High: ' + highTemp + '° F');
      var lowTemperature = $(
        '<p style="color: white; text-align: center;">'
      ).text('Low: ' + lowTemp + '° F');

      var weather = $('<p style="color: white; text-align: center;">').text(
        'Conditions: ' + conditions
      );
      var weatherIcon = $('<img style="display: block; margin: 0 auto;">').attr(
        'src',
        iconURL
      );

      $('#location-display').append(
        p,
        highTemperature,
        lowTemperature,
        weather,
        weatherIcon
      );

      weatherUserIDs = ['id1', 'id2', 'id3', 'id4', 'id5'];

      weatherPlaylistIDs = [
        'playlist1',
        'playlist2',
        'playlist3',
        'playlist4',
        'playlist5'
      ];

      if (conditions === 'Clear') {
        displayPlaylist(playlist);

        $('#display-playlist');
      }
    });
  });

  $('#add-city').click(function() {
    $('#display-submit').hide();
    $('#display-weather').show();
    $('#display-playlist').show();
  });

  // if on mood page, run function
  if ($('.mood-background').length > 0) {
    $(function() {
      makeMoodBtns();
    });
  }

  $(document.body).on('click', '.mood-img', function() {
    var target = $(event.target);

    $('.display-playlist').empty();

    var moodPlaylist = $(target).attr('data-playlist');

    displayPlaylist(moodPlaylist);
  });

  prepAuthorize();
});
