### Facebook inbox backup

This tool provides a way to backup your Facebook inbox to localStorage.

##### How to run:

1. Go to https://developers.facebook.com/apps/ and create a new app. Add new platform (web), set Site URL to "http://localhost:8080" and add "locahost" to App Domains.

2. Run `python -m SimpleHTTPServer 8080`

3. Open your browser at http://localhost:8080#appID, where appID is the id of your app
