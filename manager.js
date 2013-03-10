// <!-- General documentation is in readme.txt -->
//
// File: manager.js
// Class: GameManager
//
// Purpose:
// The manager object is created in index.html. It handles all of the
// Facebook integraion and generates the High Scores page.
//
// If you are logged into Facebook, it shows:
//   - The Facebook high scores leaderboard
//   - A "Logout of Facebook" button
//   - Your all-time high score (from Facebook)
//   - The score from the last game played
//   - A "NEW HIGH SCORE" indicator if you have beaten your all-time high
//   - A "Share on Facebook" button if you have beaten your all-time high
//   - Note that your new high score automatically gets saved to the Facebook
//     leaderboard. The "Share on Facebook" button is if you wish to make
//     a Facebook Wall post about it as well.
//
// If you are NOT logged into Facebook, it shows:
//   - A "Login with Facebook to see the leaderboard" button
//   - Your best score since you launched the app
//   - The score from the last game played
//   - A "NEW HIGH SCORE" indicator if you have beaten the "Today's Best" score
//
// The score of the last game played is passed between pages using the HTML5
// window.localStorage feature.


// Method: Constructor
// Purpose: Initialize all variables (for readability) 

function GameManager() {
  this.todaysBest = null;	// the best score since the app was launched
  this.currentScore = null;	// the score of the last game played
  this.currentLines = null;	// additional stats of the last game played
  this.currentLevel = null;	// additional stats of the last game played

  this.player = null;		// a Facebook user object containing "id" and "name"
  this.playerScore = null;	// Facebook's highest recorded score for this user
  this.highScores = null;	// Facebook's highest recorded scores for the app

  // The following HTML templates are used to generate the High Scores page.
  // Some templates reference variables in-line with the syntax $1, $2, etc.
  // The content of these templates must be ran through the prepTemplate
  // method in order to replace these arbitrary variable names with actual
  // variables.

  this.templates = new Array();

  // Non-Facebook High Scores block
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

  // Prefix for the Facebook High Scores block
  this.templates["highscores_fb_prefix"] = '\
    <font class="header">Top Scores</font><a class="grayButton" href="javascript:gMyGameManager.logoutFB();" style="float: right;"><span class="grayButtonText" style="font-size: 18px;">Logout</span></a>\
    <div style="width: 100%; max-height: 162px; background-color: #ffffff; overflow-x: hidden; overflow-y: auto;">\
  ';

  // Repeatable entry for the Facebook High Scores block
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

  // Postfix for the Facebook High Scores block
  this.templates["highscores_fb_postfix"] = '\
    </div>\
    <br />\
  ';

  // Non-Facebook Today's Best Score block
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

  // Facebook Your Best Score block
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

  // Facebook/Non-Facebook Last Game block
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

  // Non-Facebook New High Score block
  this.templates["newhigh"] = '\
    <center><font class="highScore">NEW HIGH SCORE!</font></center>\
  ';

  // Facebook New High Score block (with Share on Facebook button)
  this.templates["newhigh_fb"] = '\
    <center><font class="highScore">NEW HIGH SCORE!</font><br /><a class="greenButton" href="javascript:gMyGameManager.shareFB(gMyGameManager.playerScore);"><span class="greenButtonText" style="font-size: 18px;">Share on Facebook</span></a></center>\
  ';
}

// Method: prepTemplate
// Purpose:
//   Insert real variable values into the HTML templates defined above.
//   If there is only the required parameter, it is returned un-changed.
//   If additional parameters are passed to this function, they will replace the corrisponding $1, $2, etc. variables
//   that are used in-line in the templates.

GameManager.prototype.prepTemplate = function(template) {
  var result, buf, i;	// All variables get promoted to the function scope, so declare them all here to keep track.

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

// Method: update
// Purpose:
//   Populate all of the GameManager's class variables, draw the default non-Facebook page, and check if user is logged into Facebook.
//   The window.localStorage values are already set by the time the GameManager is created.
//   This method is only called when index.html is loaded, and when the user uses the "Logout of Facebook" button.

GameManager.prototype.update = function() {
  // These variables are ready right away
  this.currentScore = window.localStorage.getItem("currentScore");
  this.currentLines = window.localStorage.getItem("currentLines");
  this.currentLevel = window.localStorage.getItem("currentLevel");
  this.todaysBest = window.localStorage.getItem("todaysBest");

  // Update the Today's Best value (if needed)
  if( this.currentScore !== null && (this.todaysBest === null || this.todaysBest < this.currentScore) ) {
    this.todaysBest = this.currentScore;
    window.localStorage.setItem("todaysBest", this.currentScore);
  }

  // Always draw the non-Facebook score page
  // It will be replaced with the Facebook score page if available
  this.drawUpdate();

  // This will trigger a Facebook login callback (if the user is logged in)
  // The callback will populate the remaining GameManager variables and redraw the page with the Facebook version (if possible)
  FB.getLoginStatus(function(response) { return; });
};

// Method: updateAsync
// Purpose:
//   This is the Facebook login callback. The listener is registered from index.html.
//   ALL of the async function calls are cascaded from here (aside from the FB.getLoginStatus that triggers this callback)
//   If ANY of these async calls fail to retrieve the information needed, the entire thread is abandoned and no Facebook
//   re-draw of the High Scores page occurs. (This is why the default non-Facebook page gets drawn first.)

GameManager.prototype.updateAsync = function(response) {
  var _this, foundPlayerScore, opts;	// Declare variables at the function scope (to keep track)

  _this = this;	// Async calls each have their own "this" pointer in their callbacks, so store the one that points to the GameManager object now.

  // A series of async function calls, populating the GameManager's variables each step of the way.
  if( response !== undefined && response.status === 'connected' ) {
    FB.api('/me?fields=name', function(response) {
      _this.player = response;
      FB.api('/me/scores', function(response) {
        // resonse.data has the recorded Facebook scores of the user for ANY app they use, so find their top score for OUR app only.
        foundPlayerScore = 0;
        for( var i = 0; i < response.data.length; i++ ) {
          if( response.data[i]["application"] != undefined && response.data[i]["application"]["id"] == "473600756038526" ) {
            foundPlayerScore = 1;
            break;
          }
        }
        if( foundPlayerScore === 1 ) {
          _this.playerScore = response.data[i]["score"];
          // If the score from the last game is better than the user's recorded Facebook high score, update the value stored on Facebook
          if( _this.currentScore !== null && _this.currentScore > _this.playerScore ) {
            _this.playerScore = _this.currentScore;	// Also update the GameManager's high score for the user with the new value
            opts = {score: _this.currentScore};
            FB.api('/me/scores', 'post', opts, function(response) {
              _this.updateAsync2();	// Now that the new high score has been saved, make the final async function call
            });
          }
          else {
            _this.updateAsync2();	// If there is nothing to save, make the final async function call
          }
        }
      });
    });
  }
};

// Method: updateAsync2
// Purpose:
//   This method is necessary because of updateAsync's OPTIONAL async call to save a new high score to Facebook.

GameManager.prototype.updateAsync2 = function() {
  var _this;	// Declare the variables at the function scope (to keep track)

  _this = this;	// Async callbacks have their own "this" pointers

  FB.api('/473600756038526/scores?fields=user,score', function(response) {
    _this.highScores = response.data;
    _this.highScores.sort(function(a,b) { return b["score"] - a["score"]; });

    // We have completed all async calls and have all the information needed to draw the Facebook version of the page.
    _this.drawUpdateFB();
  });
};

// Method: drawUpdateFB
// Purpose:
//   Generate the HTML for the Facebook high scores page and draw it.
  
GameManager.prototype.drawUpdateFB = function() {
  var i, content;	// Declare variables at function scope (to keep track)

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

    if( this.playerScore !== null && this.playerScore <= this.currentScore ) {
      content += this.prepTemplate(this.templates["newhigh_fb"]);
    }
  }

  this.writeElement(document.getElementById("highscores"), content);
};

// Method: drawUpdate
// Purpose:
//   Draw the default non-Facebook page.

GameManager.prototype.drawUpdate = function() {
  var content;	// Declare variables at function scope to keep track.

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

// Method: shareFB
// Purpose:
//   If the player has set a new personal high score, allow them to share it onto their Facebook wall.

GameManager.prototype.shareFB = function() {
  var params, line;

  line = 'I just got a new high score of ' + this.playerScore + '!';

  params = {
    method: 'feed',
    link: 'https://build.phonegap.com/apps/297033',
    picture: 'http://www.anarchyarcade.com/cse/mobile/icon.jpg',
    name: 'Newmang Squares',
    caption: line,
    description: 'Think you got what it takes to top that?'
  };

  FB.ui(params, function(response) { return; });
};

// Method: writeElement
// Purpose:
//   Convert an HTML string into nodes and then insert them into the document.
//   Using this instead of just innerHTML directly will keep the active DOM intact.

GameManager.prototype.writeElement = function(elem, content) {
  var frag, temp;	// Declare variables at function scope to keep track.

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

  // Append the new nodes to the element in the active DOM
  elem.appendChild(frag);
};