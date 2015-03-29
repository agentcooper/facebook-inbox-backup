### Facebook inbox backup

This tool provides a way to backup your Facebook inbox to localStorage.

##### How to run:

Make sure you have Node.js installed. https://nodejs.org/

1. `https://github.com/agentcooper/facebook-inbox-backup.git`

2. `cd facebook-inbox-backup && npm install`

2. Go to https://developers.facebook.com/apps/ and create a new app. Add new platform (web), set Site URL to "http://localhost:8080" and add "locahost" to App Domains.

3. Run `npm start`

4. Open your browser at http://localhost:8080, where appID is the id of your app
