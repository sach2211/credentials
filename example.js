/**
 * Usage for the credentials module to save user credentials and autologin.
 */

import credentials from './index.js';


function googleLogin() {
  console.log("This performs google login");

  // If login is successful, save it 
  cred.storeFederatedCredentials();
}

function emailLogin() {
  console.log("This performs email login");
}

function fbLogin() {
  console.log("This performs fb login");

  // If login is successful, save it 
  cred.storeFederatedCredentials();
}

function loginCheck() {
  // A dummy function
  if (Math.floor(Math.random * 100) % 4 === 0) {
    return true;
  }
  return false;
}

const cred = new credentials({emailLogin, fbLogin, googleLogin, logInCheck});

// To trigger mediated logIn - call:
cred.userMediatedLogIn();

// To trigger silent logIn - call: 
cred.silentLogIn();


