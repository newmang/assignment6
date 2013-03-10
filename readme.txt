Programmer: Elijah Newman-Gomez
Instructor: Dr. David Turner
Class: CSE 594 Winter 2013

-----------------------------------------------------------------------------------------

App Name: Newmang Squares
Description: A puzzle block game with Facebook high scores.
Type: Mobile Phone App
Device: Android 4.0 and higher
Binary: https://build.phonegap.com/apps/297033
Source Code: https://github.com/newmang/assignment6.git

Features:
  Progressive puzzle gameplay
  In-game help screens
  Login with the Facebook App automatically (if you have it)
  Login with the standard Facebook JavaScript API (if you don't)
  Facebook high score leaderboard
  Share your top scores with your Facebook friends

-----------------------------------------------------------------------------------------

Development Framework:
  PhoneGap

Coding Languages:
  XML/HTML/JavaScript

Compiled Using:
  Adobe PhoneGap Build cloud service

Plugins:
  Facebook Connect

Web APIs:
  Facebook SDK for Javascript

Notes:
  Code is heavily commented for clarity.
  CSS and JavaScript have not been minified.
  Facebook API calls could be cached instead of repeating every time index.html loads.
  No high scores are saved to the device or otherwise if there is no Facebook login.

References:
  Facebook Connect
    - https://developers.facebook.com/docs/coreconcepts/

  PhoneGap
    - http://www.phonegap.com/

  PhoneGap API
    - http://docs.phonegap.com/

  PhoneGap Build:
    - https://build.phonegap.com/

  Adobe PhoneGap Build plugin for Facebook Connect
    - https://build.phonegap.com/blog/adobe-phonegap-build-plugin-for-facebook-connect

  Facebook SDK for Javascript
    - https://developers.facebook.com/docs/reference/javascript/

  Facebook Scores API
    - https://developers.facebook.com/docs/howtos/scores/

  Facebook's Open Graph for Games
    - https://developers.facebook.com/games/opengraph/

  Facebook's Open Graph
    - https://developers.facebook.com/docs/technical-guides/opengraph/

  Example of Facebook JavaScript API used in a PhoneGap application
    - https://github.com/phonegap-build/FacebookConnect/blob/master/example/Simple/index.html

  Facebook Button CSS
    - http://www.100scripts.com/article/29/Facebook-Button-CSS.html