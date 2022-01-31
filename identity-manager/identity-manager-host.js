import { initialize } from './lib/identity-manager-host-lib.js';

//console.log('Monitoring Storage Events');
//monitorStorageEvents();

console.log('Initializing Login Profile');
initializePage();

console.log('Initializing Identity Manager');
initializeIdentityManager();

console.log('Starting Auth Polling Service');
var count = 0;
var isAuthenticated = false;
function pollAuthStatus() {
  if (count++ < 60 && !isAuthenticated) {
    evaulateAuthenticationState();
    setTimeout(function () {
      pollAuthStatus();
    }, 500);
  }
}

async function initializeIdentityManager() {
  const config = {
    authority: 'https://loginpreview.dignityhealth.org/oauth2/ausb2b0jbri7MsQGl0h7',
    clientId: '0oatqpj4ncIYZOm1j0h7',
    postLoginRedirectUri: 'https://dignity-health.cshcontentdev.org/my-care/my-account',
    postLogoutRedirectUri: 'https://dignity-health.cshcontentdev.org',
    silentRenewUri: 'https://dignity-health.cshcontentdev.org/silent-renewal',
    nonProductionEnvironmentDescriptor: 'dev',
    aemHomeUri: 'https://dignity-health.cshcontentdev.org/my-care/my-account',
    autoLoginOnInitialization: false
  };

  const { identityManagerService, idleLogoffService } = await initialize(config);

  window.identityManager = identityManagerService;
  window.useSharedClient = true;

  idleLogoffService.initialize({
    idleWarningTimeoutInSeconds: '120', //120
    idleActivityTimeoutInSeconds: '480',//780
    idleLogoffModalConentPath: 'https://cdn-dev.dignityhealthppe.org/identity-manager/idle-logoff-timeout-modal/idle-logoff-timeout-modal.html',
    idleLogoffModalStylePath: 'https://cdn-dev.dignityhealthppe.org/identity-manager/idle-logoff-timeout-modal/idle-logoff-timeout-modal.css'
  });  

  // Start polling function after async initialization has completed.
  pollAuthStatus();
}


function monitorStorageEvents() {
  window.onstorage = () => {
    evaulateAuthenticationState();
  };
}

function initializePage() {
  initializeNormalView();
  initializeTabletView();
  initializeMobileView();
}

function initializeNormalView() {
  $('.login-profile #loginButton').attr('href', 'javascript:window.identityManager.loginRedirect()');
  $('.login-profile #logout').attr('href', 'javascript:window.identityManager.logoutRedirect()');
}

function initializeTabletView() {
  $('div#logintab a#loginTab').attr('href', 'javascript:window.identityManager.loginRedirect()');
  $('div#mobileSettingsLinks a#logout').attr('href', 'javascript:window.identityManager.logoutRedirect()'); // Same as mobile
}

function initializeMobileView() {
  $('#loginmob button.login-btn').click(function () { window.identityManager.loginRedirect() });
  $('div#mobileSettingsLinks a#logout').attr('href', 'javascript:window.identityManager.logoutRedirect()'); // Same as tablet
}

function evaulateAuthenticationState() {  
  window.identityManager.isAuthenticated().then(isAuth => {
    if (isAuth) {
      alterDisplayForLoggedIn();
      isAuthenticated = true;
    } else {
      alterDisplayForLogin();
      isAuthenticated = false;
    }
  });

  getLoggedInMenu().parent().show();
  return isAuthenticated;
}

function alterDisplayForLogin() {
  alterDisplayForNormalLogin();

  if (window.outerWidth > 768) {
    alterDisplayForTabletLogin();
  } else {
    alterDisplayForMobileLogin();
  }
}

function alterDisplayForLoggedIn() {
  alterDisplayForNormalLoggedIn();

  if (window.outerWidth > 768) {
    alterDisplayForTabletLoggedIn();
  } else {
    alterDisplayForMobileLoggedIn();
  }
}

function alterDisplayForNormalLogin() {
  getLoginButton().show();
  getLoggedInMenu().hide();
}

function alterDisplayForNormalLoggedIn() {
  getLoginButton().hide();
  getLoggedInMenu().show();
}

function alterDisplayForTabletLogin() {
  getTabletLoginButton().show();
  getTabletLoggedInMenu().hide();
  $('#mobileUtilityLinks').hide();
  $('#mobileSettingsLinks').hide();
  getMobileLoginButton().hide();
}

function alterDisplayForTabletLoggedIn() {
  getTabletLoginButton().hide();
  getTabletLoggedInMenu().css('display', 'flex');
  $('#mobileUtilityLinks').css('display', 'block');
  $('#mobileSettingsLinks').css('display', 'block');
  getMobileLoginButton().hide();
}

function alterDisplayForMobileLogin() {
  getMobileLoginButton().show();
  $('#mobileUtilityLinks').hide();
  $('#mobileSettingsLinks').hide();
  getMobileLoginButton().show();
}

function alterDisplayForMobileLoggedIn() {
  getMobileLoginButton().hide();
  $('#mobileUtilityLinks').css('display', 'block');
  $('#mobileSettingsLinks').css('display', 'block');
  getMobileLoginButton().hide();
}

function getLoginButton() {
  return $('#loginButton');
}

function getLoggedInMenu() {
  return $('#dropdownMenuButton');
}

function getTabletLoginButton() {
  return $('div#logintab a#loginTab');
}

function getTabletLoggedInMenu() {
  return $('div#logintab a#loggedInTab');
}

function getMobileLoginButton() {
  return $('#loginmob');
}
