
function OnLoadCallback() {
  console.log("Received Google+ API callback.");
  auth(/* immediate */ true);
}

function auth(immediate) {
  // Visit https://code.google.com/apis/console?api=plus to generate your
  // oauth2 client id and simple api key.
  var config = {
    client_id: '965137897257-t0die7i6s87feet2uf78s67k1b8id2i1.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/plus.me',
    immediate: immediate
  };
  gapi.client.setApiKey('AIzaSyDxyfuiHpzYfdl_RQ1rgM123hNVIhAXtJU');
  window.setTimeout(function() {  
    gapi.auth.authorize(config, onAuthResponse);
  }, 1);
}

function onAuthResponse(token) {
  var login = document.getElementById('google-login');
  if (token && login) {
    login.style.display = 'none';
    makeRequest();
  } else {
     if (login)
        login.style.display = '';
  }
}

function makeRequest() {
  gapi.client.load('plus', 'v1', function() {
    var request = gapi.client.plus.activities.list({
        'userId': 'me',
        'maxResults': '20',
        'collection': 'public'
    });

    request.execute(function(data) {
      var div = document.getElementById('results');
      for(var i=0; i<data.items.length; i++) {
        var activity = data.items[i];
        div.appendChild(document.createElement('P'));
        div.appendChild(document.createTextNode(activity.object.content));
      }
    });

    var personReq = gapi.client.plus.people.get({'userId': 'me'});
    personReq.execute(function(data) {
      var div = document.getElementById('me');
      div.innerHTML = "<a href='" + data.url + "'>"
            + data.displayName + "</a><div><img src='" + data.image.url + "'></div>";
    });
  });
}

(function() {
  var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
  po.src =  'https://apis.google.com/js/client.js?onload=OnLoadCallback';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();
