var express = require('express');
var router = express.Router();

const got = require('got');

const clientID = "aa11d0fe227f15e7633c"
const clientSecret = "1c6b24ef6892629c66217dc748549d7b9afc7428"
const redirectUri = 'YOUR_REDIRECT_URI'; // Replace with your actual redirect URI

const tokenUrl = 'https://github.com/login/oauth/access_token';


/* GET users listing. */
router.post('/login', function(req, res, next) {
  let requestCode = req.body.code
  if (requestCode === null){
    return res.status(400).json({ error: 'Bad Request', message: 'Missing code in body' });
  }
  let requestBody = {
    code: requestCode,
    client_id: clientID,
    client_secret: clientSecret,
    redirect_uri: redirectUri
  };

  got.post(tokenUrl, {
    json: requestBody,
    responseType: 'json'
  })
  .then(response => {
    // Extract the access token from the response
    const accessToken = response.body.access_token;
    console.log('Access token:', accessToken);
  })
  .catch(error => {
    console.error('Failed to get access token:', error);
  });
});


const verifyUrl = 'https://api.github.com/user';

const githubVerifyMiddleware = async (req, res, next) => {
    const accessToken = req.headers.authorization; // Assuming the token is passed in the Authorization header
    
    if (!accessToken) {
      // If access token is not provided, return a 401 Unauthorized response
      return res.status(401).json({ error: 'Unauthorized', message: 'Access token is missing' });
    }
  
    try {
      const verifyUrl = 'https://api.github.com/user';
  
      // Send a GET request to the GitHub API to verify the access token
      const response = await got.get(verifyUrl, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'finamte' // Replace with your app's name or identifier
        },
        responseType: 'json'
      });
  
      // If the access token is valid, store the user information in the request object and call the next middleware
      req.user = response.body;
      next();
    } catch (error) {
      // If the access token is invalid, the GitHub API will return an error response
      // Return a 401 Unauthorized response with the error message
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid access token' });
    }
  };
  


module.exports = {githubVerifyMiddleware, router};
