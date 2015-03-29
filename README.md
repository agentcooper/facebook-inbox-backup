### Facebook inbox backup

This tool provides a way to backup your Facebook inbox.

There is also some additional stats tools available,
like getting most used words or drawing messages/day chart.

##### How to run:

Make sure you have Node.js installed. https://nodejs.org/

1. `git clone https://github.com/agentcooper/facebook-inbox-backup.git`

2. `cd facebook-inbox-backup && npm install`

2. Go to https://developers.facebook.com/apps/ and create a new app. Add new platform (web), set Site URL to "http://localhost:8080" and add "locahost" to App Domains.

3. Run `npm start`

4. Open your browser at http://localhost:8080, where appID is the id of your app
