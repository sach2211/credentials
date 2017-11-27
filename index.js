import get from "lodash/get";

const GOOGLE_SIGNIN = "https://accounts.google.com";
const FACEBOOK_LOGIN = "https://www.facebook.com";

export default class CredManager {

  contructor(loginWithEmailAndPassword, facebookLogin, googleLogin, logInCheck) {
    // Methods to call once credentials are retrieved.
    this.loginWithEmailAndPassword = loginWithEmailAndPassword;
    this.facebookLogin = facebookLogin;
    this.googleLogin = googleLogin;

    // Boolean fn that tells wether user is signed in or not.
    this.isLoggedIn = logInCheck;
  }

  isNewApiAvailable() {
    if (navigator.credentials && navigator.credentials.preventSilentAccess) {
      return true;
    }
    return false;
  }

  requestUserCredentials(mode = "silent") {
    if (this.isNewApiAvailable() && !this.isLoggedIn()) {
      return navigator.credentials.get({
        password: true,
        federated: {
          providers: [FACEBOOK_LOGIN, GOOGLE_SIGNIN]
        },
        mediation: mode
      });
    } else {
      // If api not available ; or ; user is already logged in.
      return Promise.reject("API not available / Already logged in");
    }
  }

  silentLogIn() {
    this.requestUserCredentials("silent")
      .then(cred => this.processCredentials(cred, "silent"))
      .catch(e => {
        console.error("CredManagement error in silent login = ", e);
      });
  }

  userMediatedLogIn() {
    this.requestUserCredentials("optional")
      .then(cred => this.processCredentials(cred, "optional"))
      .catch(e => {
        console.error("CredManagement error in optional login = ", e);
      });
  }

  processCredentials(cred, mode) {
    if (cred && cred.type) {
      switch (cred.type) {
        case "password": {
          // make a request to sign in user
          loginWithEmailAndPassword(cred.id, cred.password);
          break;
        }
        case "federated": {
          // make a request to social logins
          switch (cred.provider) {
            case GOOGLE_SIGNIN: {
              let id = cred.id;
              googleLoginWithCredentialManager(cred.id);
              break;
            }
            case FACEBOOK_LOGIN: {
              facebookLogin(cred.id);
              break;
            }
            default: {
              console.error(
                "CM: Unkown federated account provider, please choose a different mode to login"
              );
            }
          }
          break;
        }
        default: {
          console.log("Found unknown Cred ", cred);
          break;
        }
      }
    }
  }

  storeFederatedCredentials(id, name, logo = "", provider) {
    let providerID;
    if (provider === "google") {
      providerID = GOOGLE_SIGNIN;
    } else if (provider === "facebook") {
      providerID = FACEBOOK_LOGIN;
    }

    if (this.isNewApiAvailable()) {
      // Create `Credential` object for federation
      var cred = new FederatedCredential({
        id: id,
        name: name,
        iconURL: logo,
        provider: providerID
      });
      // Store credential information after successful authentication
      navigator.credentials.store(cred);
    } else {
      console.error("CM: Access not available for storage");
    }
  }
}
