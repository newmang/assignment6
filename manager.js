function GameManager() {
  this.scoreSubmitted = null;
  this.scoreShared = null;
  this.todaysBest = null;
  this.currentScore = null;
  this.currentLines = null;
  this.currentLevel = null;

  this.player = null;
  this.playerScore = null;
  this.highScores = null;

  this.busy = 0;

  this.templates = new Array();

  this.templates["highscores_nofb"] = '\
    <font class="header">Top Scores</font>\
    <table border=0 cellspacing=0 cellpadding=0 style="border: 2px dashed #9999ff; width: 100%;">\
      <tr>\
        <td align="center" style="font-size: 20px; font-family: arial, sans-serif;">\
          <a class="greenButton" href="javascript:gMyGameManager.loginFB();" style="float: left;"><span class="greenButtonText" style="font-size: 32px;">Login</span></a> with Facebook to access the leaderboards.\
        </td>\
      </tr>\
    </table>\
    <br />\
  ';

  this.templates["highscores_fb_prefix"] = '\
    <font class="header">Top Scores</font><a class="grayButton" href="javascript:gMyGameManager.logoutFB();" style="float: right;"><span class="grayButtonText" style="font-size: 18px;">Logout</span></a>\
    <div style="width: 100%; max-height: 162px; background-color: #ffffff; overflow-x: hidden; overflow-y: auto;">\
  ';

  this.templates["highscores_fb"] = '\
    <table border=0 cellspacing=0 cellpadding=0 style="border: 2px dashed #9999ff; width: 100%;">\
    <tr>\
      <td align="center" valign="middle" style="background-color: #ffffff; width: 1px;">\
        <font class="label">$1</font>\
      </td>\
      <td style="width: 50px; margin-bottom: 0;">\
        <img src="http://graph.facebook.com/$2/picture?type=square" style="width: 50px; display: block;" />\
        </td>\
        <td valign="top" width="1">\
          <div style="position: relative; width: 0; height: 0;">\
            <font class="name" style="position: absolute;"><nobr>$3</nobr></font>\
          </div>\
        </td>\
        <td valign="bottom" align="right">\
          <font class="score">$4</font>\
        </td>\
      </tr>\
    </table>\
  ';

  this.templates["highscores_fb_postfix"] = '\
    </div>\
    <br />\
  ';

  this.templates["todaysbest"] = '\
    <font class="header">Today\'s Best</font>\
    <table border=0 cellspacing=0 cellpadding=0 style="border: 2px dashed #9999ff; width: 100%;">\
      <tr>\
        <td>\
          <font class="score">$1</font>\
        </td>\
      </tr>\
    </table>\
    <br />\
  ';

  this.templates["yourbest"] = '\
    <font class="header">Your Best</font>\
    <table border=0 cellspacing=0 cellpadding=0 style="border: 2px dashed #9999ff; width: 100%;">\
      <tr>\
        <td style="width: 50px; margin-bottom: 0;">\
          <img src="http://graph.facebook.com/$1/picture?type=square" style="width: 50px; display: block;" />\
        </td>\
        <td valign="top" width="1">\
          <div style="position: relative; width: 0; height: 0;">\
            <font class="name" style="position: absolute;"><nobr>$2</nobr></font>\
          </div>\
        </td>\
        <td valign="bottom" align="right">\
          <font class="score">$3</font>\
        </td>\
      </tr>\
    </table>\
    <br />\
  ';

  this.templates["lastgame"] = '\
    <font class="header">Last Game</font>\
    <table border=0 cellspacing=0 cellpadding=0 style="border: 2px dashed #9999ff; width: 100%;">\
      <tr>\
        <td align="center">\
          <font class="scoreTitle">SCORE</font>\
         <font class="score">$1</font>\
       </td><td align="center">\
         <font class="scoreTitle">LINES</font>\
         <font class="score">$2</font>\
       </td><td align="center">\
         <font class="scoreTitle">LEVEL</font>\
         <font class="score">$3</font>\
       </td>\
     </tr>\
    </table>\
    <br />\
  ';

  this.templates["newhigh"] = '\
    <center><font class="highScore">NEW HIGH SCORE!</font></center>\
  ';

  this.templates["newhigh_fb"] = '\
    <center>\
     <font class="highScore">NEW HIGH SCORE!</font><br />\
     <a class="greenButton" href="javascript:gMyGameManager.shareFB();"><span class="greenButtonText" style="font-size: 18px;">Share on Facebook</span></a>\
   </center>\
  ';
}

GameManager.prototype.update = function() {
  var _this;

  _this = this;	// Async calls change the regular "this" pointer

  if( _this.busy === 1 ) {
    return;
  }

  _this.busy = 1;

  // These variables are ready right away
  _this.scoreSubmitted = window.localStorage.getItem("scoreSubmitted");
  _this.scoreShared = window.localStorage.getItem("scoreShared");
  _this.currentScore = window.localStorage.getItem("currentScore");
  _this.currentLines = window.localStorage.getItem("currentLines");
  _this.currentLevel = window.localStorage.getItem("currentLevel");
  _this.todaysBest = window.localStorage.getItem("todaysBest");

  if( _this.currentScore !== null && (_this.todaysBest === null || _this.todaysBest < _this.currentScore) ) {
    _this.todaysBest = _this.currentScore;
    window.localStorage.setItem("todaysBest", _this.currentScore);
  }

  // This will trigger a Facebook login status change (if the user is logged in)
  FB.getLoginStatus(function(response) { return; });

  // Always draw the non-Facebook score page
  // It will be replaced with the Facebook score page if available
  _this.drawUpdate();
};

GameManager.prototype.updateAsync = function(response) {
  var _this, foundPlayerScore, opts;

  _this = this;

  if( response !== undefined && response.status === 'connected' ) {
    FB.api('/me?fields=name', function(response) {
      _this.player = response;
      FB.api('/me/scores', function(response) {
        foundPlayerScore = 0;
        for( var i = 0; i < response.data.length; i++ ) {
          if( response.data[i]["application"] != undefined && response.data[i]["application"]["id"] == "473600756038526" ) {
            foundPlayerScore = 1;
            break;
          }
        }
        if( foundPlayerScore === 1 ) {
          _this.playerScore = response.data[i]["score"];
          if( _this.currentScore !== null && _this.currentScore > _this.playerScore ) {
            _this.playerScore = _this.currentScore;
            opts = {score: _this.currentScore};
            FB.api('/me/scores', 'post', opts, function(response) {
              _this.updateAsync2();
            });
          }
          else {
            _this.updateAsync2();
          }
        }
      });
    });
  }
};

GameManager.prototype.updateAsync2 = function() {
  var _this;

  _this = this;

  FB.api('/473600756038526/scores?fields=user,score', function(response) {
    _this.highScores = response.data;
    _this.highScores.sort(function(a,b) { return b["score"] - a["score"]; });
    _this.drawUpdateFB();
  });
};
  
GameManager.prototype.drawUpdateFB = function() {
  var i, content;

  content = this.prepTemplate(this.templates["highscores_fb_prefix"]);

  for( i = 0; i < this.highScores.length; i++ ) {
    content += this.prepTemplate(this.templates["highscores_fb"], i+1, this.highScores[i]["user"]["id"], this.highScores[i]["user"]["name"], this.highScores[i]["score"]);
  }

  content += this.prepTemplate(this.templates["highscores_fb_postfix"]);

  if( this.playerScore !== null ) {
    content += this.prepTemplate(this.templates["yourbest"], this.player["id"], this.player["name"], this.playerScore);
  }

  if( this.currentScore !== null ) {
    content += this.prepTemplate(this.templates["lastgame"], this.currentScore, this.currentLines, this.currentLevel);

    if( this.playerScore !== null && this.playerScore === this.currentScore ) {
      content += this.prepTempalte(this.templates["newhigh_fb"]);
    }
  }

  this.writeElement(document.getElementById("highscores"), content);

  // All async calls have completed
  this.busy = 0;
};

GameManager.prototype.drawUpdate = function() {
  var content;

  content = this.prepTemplate(this.templates["highscores_nofb"]);

  if( this.todaysBest !== null ) {
    content += this.prepTemplate(this.templates["todaysbest"], this.todaysBest);
  }

  if( this.currentScore !== null ) {
    content += this.prepTemplate(this.templates["lastgame"], this.currentScore, this.currentLines, this.currentLevel);

    if( this.currentScore === this.todaysBest ) {
      content += this.prepTemplate(this.templates["newhigh"]);
    }
  }

  this.writeElement(document.getElementById("highscores"), content);

  // All async calls have completed
  this.busy = 0;
};

GameManager.prototype.loginFB = function() {
  FB.login(function(response) { return; }, { scope: "publish_actions" });
};

GameManager.prototype.logoutFB = function() {
  var _this;

  _this = this;
  FB.logout(function(response) {
    _this.update();
  });
};

GameManager.prototype.shareFB = function(score) {
  var params, _this;

  params = {
    method: 'feed',
    name: 'NEW HIGH SCORE',
    picture: 'http://www.anarchyarcade.com/cse/mobile/icon.png',
    caption: score
  };

  _this = this;
  FB.ui(params, function(response) {
    _this.scoreShared = 1;
    _this.update();
  });
};

GameManager.prototype.prepTemplate = function(template) {
  var result, buf, i;

  result = template;

  for( i = 1; i < arguments.length; i++ ) {
    while( 1 ) {
      buf = result.replace("$" + i, arguments[i]);
      if( buf !== result ) {
        result = buf;
      }
      else {
        break;
      }
    }
  }

  return result;
};

GameManager.prototype.writeElement = function(elem, content) {
  var frag, temp;

  // Empty the nodes of the element
  while( elem.hasChildNodes() ){
    elem.removeChild(elem.lastChild);
  }

  // Convert our HTML into nodes
  frag = document.createDocumentFragment();
  temp = document.createElement('div');

  temp.innerHTML = content;	// Note that "temp" is NOT in the active DOM
  while( temp.firstChild ) {
    frag.appendChild(temp.firstChild);
  }

  // Append the new nodes to the element
  elem.appendChild(frag);
};