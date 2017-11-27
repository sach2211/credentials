import get from "lodash/get";
import {
  loginWithEmailAndPassword,
  googleLoginWithCredentialManager,
  facebookLogin
} from "./mobile/signIn/SocialLogins.js";

const GOOGLE_SIGNIN = "https://accounts.google.com";
const FACEBOOK_LOGIN = "https://www.facebook.com";

class CredManager {
  isNewApiAvailable() {
    if (navigator.credentials && navigator.credentials.preventSilentAccess) {
      return true;
    }
    return false;
  }

  isLoggedIn() {
    if (get(window, "MYNTRA.myx.session.login")) {
      return true;
    }
    return false;
  }

  requestUserCredentials(mode = "silent") {
    console.error("CM: Requesting user credentials");
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
          console.log("CredManagement - Found PasswordCred", cred);
          // make a request to sign in user
          ga("send", "event", "auto-signin", `signin-password-${mode}`);
          loginWithEmailAndPassword(cred.id, cred.password, mode);
          break;
        }
        case "federated": {
          // make a request to social logins
          console.log("Found FederatedCredential", cred);
          switch (cred.provider) {
            case GOOGLE_SIGNIN: {
              let id = cred.id;
              ga("send", "event", "auto-signin", `signin-google-${mode}`);
              googleLoginWithCredentialManager(cred.id, mode);
              break;
            }
            case FACEBOOK_LOGIN: {
              console.error("CM: Facebook federated login", cred);
              ga("send", "event", "auto-signin", `signin-fb-${mode}`);
              facebookLogin(mode);
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
    console.error(
      "Store federated credentials called, parameters = ",
      id,
      name,
      logo,
      provider
    );
    if (provider === "google") {
      providerID = GOOGLE_SIGNIN;
    }
    if (provider === "facebook") {
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

export default new CredManager();

