/**
 * Firebase Config
 * @type {{apiKey: string, authDomain: string, databaseURL: string, projectId: string, storageBucket: string, messagingSenderId: string}}
 */
const config = {
  apiKey: "AIzaSyCyFFlbISbTyrZI9XlIcNQBWs-eWDgpK20",
  authDomain: "media-615d8.firebaseapp.com",
  databaseURL: "https://media-615d8.firebaseio.com",
  projectId: "media-615d8",
  storageBucket: "media-615d8.appspot.com",
  messagingSenderId: "1032551991393"
};

/**
 * Media Type Model
 * @type {*[]}
 */
const mediaTypes = [
  {
    type: 'music',
    media: [
      'vinyl',
      'cd',
      'digital'
    ]
  },
  {
    type: 'movie',
    media: [
        'bluray',
        'online',
        'digital',
        'dvd'
    ]
  },
  {
    type: 'book',
    media: [
        'hardcover'
    ]
  }
];

firebase.initializeApp(config);
let db = firebase.database();

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {

  let elsIsLoggedIn = document.querySelectorAll('.is-logged-in');
  let elsIsLoggedOut = document.querySelectorAll('.is-logged-out');

  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {

      for (let element of elsIsLoggedIn) {
        element.style.display = '';
      }
      for (let element of elsIsLoggedOut) {
        element.style.display = 'none';
      }

      // create media
      let addMediaForm = document.getElementById('addMediaForm');
      let mediaTitle = document.getElementById('media-title');
      let mediaDescription = document.getElementById('media-description');
      let mediaHiddenId = document.getElementById('media-hiddenId');
      let mediaType = document.getElementById('media-type');
      let mediaMedium = document.getElementById('media-medium');
      let mediaImage = document.getElementById('media-image');

      /**
       * Create Type Selects Template
       * @returns {string}
       */
      function createTypeSelects() {
        return `
  ${mediaTypes.map(mediaType =>
          `<option>${mediaType.type}</option>`
        ).join('')}
  `;
      }

      /**
       * Create Medium Select Template
       * @param mediaToSelect
       * @returns {string}
       */
      function createMediumSelects(mediaToSelect = mediaTypes[0].media) {
        return `
  ${mediaToSelect.map(availableMedium =>
          `<option>${availableMedium}</option>`)}
  `;
      }

      function appInit(){
        mediaType.innerHTML = createTypeSelects();
        mediaType.addEventListener('change', createMediumSelectsByType);
      }

      appInit();

      /**
       * Create Mediums by Type
       */
      function createMediumSelectsByType() {
        let targetMediaType = this.value;
        /**
         * return Index of Media Object in mediaTypes Model
         * @type {number}
         */
        let mediaTypeIndex = mediaTypes.findIndex(function(obj) { return obj.type === targetMediaType; });
        mediaMedium.innerHTML = createMediumSelects(mediaTypes[mediaTypeIndex].media);
      }

      /**
       * Handle Form submit to create Media Item
       */
      addMediaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!mediaTitle.value || !mediaDescription.value) {
          return null;
        }

        let id = mediaHiddenId.value || Date.now();

        db.ref('medialist/' + id).set({
          title: mediaTitle.value,
          description: mediaDescription.value,
          type: mediaType.value || null,
          imagePath: mediaImage.value || null,
          medium: mediaMedium.value || null
        });

        mediaTitle.value = '';
        mediaDescription.value  = '';
        mediaHiddenId.value = '';
      });

// read media
      let mediaList = document.getElementById('medialist');
      let mediaListRef = db.ref('/medialist');

      /**
       * Listen on API adds, render mediaList
       */
      mediaListRef.on('child_added', (data) => {
        let listItem = document.createElement('li');
        listItem.classList.add('card', 'media-list__item');
        listItem.id = data.key;
        listItem.innerHTML = mediaListTemplate(data.key, data.val());
        mediaList.appendChild(listItem);
      });

      /**
       * Listen on API changes, re-render mediaList Item
       */
      mediaListRef.on('child_changed', (data) => {
        let mediaNode = document.getElementById(data.key);
        mediaNode.innerHTML = mediaListTemplate(data.key, data.val());
      });

      /**
       * Listen on API deletes, remove mediaList Item
       */
      mediaListRef.on('child_removed', (data) => {
        let mediaNode = document.getElementById(data.key);
        mediaNode.parentNode.removeChild(mediaNode);
      });

      /**
       * Listener and Handler for edit/delete
       */
      mediaList.addEventListener('click', (e) => {
        let mediaNode = document.getElementById(e.target.dataset.mediaTarget);

        // update media
        if (e.target.classList.contains('edit')) {
          let list = mediaNode.querySelectorAll('[data-media-content-ref]');
          Array.prototype.forEach.call(list, function (item) {
            let mediaIdRef = document.getElementById(item.dataset.mediaContentRef);
            mediaIdRef.value = item.dataset.mediaContent;
          });

          mediaHiddenId.value = mediaNode.id;
        }

        // delete media
        if (e.target.classList.contains('delete')) {
          let id = mediaNode.id;
          db.ref('medialist/' + id).remove();
        }
      });

      /**
       * Create Media List Template
       * @param id
       * @param title
       * @param description
       * @param type
       * @param medium
       * @param imagePath
       * @returns {string}
       */
      function mediaListTemplate(id,{title, description, type, medium, imagePath}) {
        return `
    <div class="card__image">
        <img src="${imagePath}" alt="" data-media-content-ref="media-image" data-media-content="${imagePath}" class='image-path'>
    </div>
    <div class="card__content">
      <h3 class="card__title" data-media-content-ref="media-title" data-media-content="${title}">${title}</h3>
      <div data-media-content-ref="media-description" data-media-content="${description}" class="card__description">
        <p>${description}</p>
      </div>
      <span class="chip chip--with-label" data-media-content-ref="media-type" data-media-content="${type}">
        <span class="chip__label">T</span>
        <span class="chip__text">${type}</span>
      </span>
      <span class="chip chip--with-label" data-media-content-ref="media-medium" data-media-content="${medium}">
        <span class="chip__label">M</span>
        <span class="chip__text">${medium}</span>
      </span>
    </div>
    <div class="card__actions">
      <button data-media-target="${id}" class="button button--danger delete">Delete</button>
      <button data-media-target="${id}" class="button edit">Edit</button>
    </div>
  `
      }


    } else {
      console.log('signed out');
      for (let element of elsIsLoggedIn) {
        element.style.display = 'none';
      }
      for (let element of elsIsLoggedOut) {
        element.style.display = '';
      }
    }
  });
}
window.onload = function() {
  initApp();
};

/**
 * Login
 */
let signInButton = document.getElementById('sign-in-button');
let signInGoogleButton = document.getElementById('sign-in-google-button');
let signOutButton = document.getElementById('sign-out-button');

/**
 * Handles the sign in button press.
 */
function toggleSignIn(e) {

  /**
   * Handle Google LogIn
   */
  if (e.target === signInGoogleButton) {
// [START createprovider]
    let provider = new firebase.auth.GoogleAuthProvider();
    // [END createprovider]
    // [START addscopes]
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    // [END addscopes]
    // [START signin]
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      let token = result.credential.accessToken;
      // The signed-in user info.
      let user = result.user;
      // [START_EXCLUDE]
      // [END_EXCLUDE]
    }).catch(function(error) {
      // Handle Errors here.
      let errorCode = error.code;
      let errorMessage = error.message;
      // The email of the user's account used.
      let email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      let credential = error.credential;
      // [START_EXCLUDE]
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else {
        console.error(error);
      }
      // [END_EXCLUDE]
    });
    // [END signin]
  } else {

    console.log(firebase.auth().currentUser);

    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
    } else {

      let email = document.getElementById('email').value;
      let password = document.getElementById('password').value;

      if (email.length < 4) {
        alert('Please enter an email address.');
        return;
      }
      if (password.length < 4) {
        alert('Please enter a password.');
        return;
      }
      // Sign in with email and pass.
      // [START authwithemail]
      firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
        signInButton.disabled = false;
        // [END_EXCLUDE]
      });
      // [END authwithemail]
    }
    signInButton.disabled = true;
  }
}

signInButton.addEventListener('click', toggleSignIn, false);
signInGoogleButton.addEventListener('click', toggleSignIn, false);
signOutButton.addEventListener('click', toggleSignIn, false);
