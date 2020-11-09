const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

export const getActivitiesFromTrading212 = () => new Promise((resolve, reject) => {
  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) {
      console.log('Error loading client secret file:', err);
      reject(err);
      return;
    }
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), getActivities);
  });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
/* function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
} */
const getNewToken = (oAuth2Client) => new Promise((resolve, reject) => {
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err);
        reject(err);
        return;
      }
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        console.log('Token stored to', TOKEN_PATH);
      });
      resolve(oAuth2Client);
    });
  });
});

const getActivitiesFromEmail = (gmail, params) => new Promise((resolve, reject) => {
  gmail.users.messages.get(params, function (err, response) {
    if (err) {
      reject(err);
      return;
    }

    const data = response.data.payload.parts[0].body.data;
    const buff = new Buffer.from(data, 'base64');
    const text = buff.toString();
    const [, secondHalf] = text.split('Total cost');
    const [firstHalf] = secondHalf.split('* All transactions');
    const rows = firstHalf.split('\r\n');
    const headers = [
      'number',
      'orderId',
      'instrument',
      'direction',
      'quantity',
      'price',
      'totalAmount',
      'tradingDay',
      'tradingTime',
      'commission',
      'chargesAndFees',
      'orderType',
      'executionVenue',
      'exchangeRate',
      'totalCost',
    ];
    const activities = rows.reduce((activitiesSoFar, currentRawRow) => {
      const currentRow = currentRawRow.trim();
      if (!currentRow) return activitiesSoFar;
      const lastActivity = activitiesSoFar[activitiesSoFar.length - 1] || {};
      const { length: numOfActivityKeys } = Object.keys(lastActivity);
      if (numOfActivityKeys === 0 || numOfActivityKeys === 15) {
        activitiesSoFar.push({ number: currentRow });
        return activitiesSoFar;
      }
      const activity = { ...lastActivity };
      activity[headers[numOfActivityKeys]] = currentRow;
      const activitiesCopy = [...activitiesSoFar];
      activitiesCopy[activitiesCopy.length - 1] = activity
      return activitiesCopy;
    }, []);
    resolve(activities);
  });
});

const getActivities = (auth) => {
  const gmail = google.gmail({ version: 'v1', auth });
  gmail.users.messages.list({ auth: auth, userId: 'me', q: 'Contract Note Statement from Trading 212' }, function (err, { data = {} }) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    const { messages = [] } = data;
    const { id: message_id } = messages[1];
    const activityPromises = messages.map(({ id: message_id }) => getActivitiesFromEmail(gmail, { auth: auth, userId: 'me', 'id': message_id }));

    return Promise.all(activityPromises)
      /* .then((activities) => {
        console.log(activities.flat());
      })
      .catch((error) => {
        console.log(error);
      }); */
  });
};
