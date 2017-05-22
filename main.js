var config = {
  apiKey: "AIzaSyCyFFlbISbTyrZI9XlIcNQBWs-eWDgpK20",
  authDomain: "media-615d8.firebaseapp.com",
  databaseURL: "https://media-615d8.firebaseio.com",
  projectId: "media-615d8",
  storageBucket: "media-615d8.appspot.com",
  messagingSenderId: "1032551991393"
};

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
var db = firebase.database();

// CREATE REWIEW

var addMediaForm = document.getElementById('addMediaForm');
var mediaTitle   = document.getElementById('media-title');
var mediaDescription    = document.getElementById('media-description');
var mediaHiddenId   = document.getElementById('media-hiddenId');
var mediaType   = document.getElementById('media-type');
var mediaMedium   = document.getElementById('media-medium');
var mediaImage   = document.getElementById('media-image');

addMediaForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!mediaTitle.value || !mediaDescription.value) return null

  var id = mediaHiddenId.value || Date.now()

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

// READ REVEIWS

var mediaList = document.getElementById('medialist');
var mediaListRef = db.ref('/medialist');

mediaListRef.on('child_added', (data) => {
  let listItem = document.createElement('li');
  listItem.classList.add('card', 'media-list__item');
  listItem.id = data.key;
  listItem.innerHTML = mediaListTemplate(data.key, data.val());
  mediaList.appendChild(listItem);
});

mediaListRef.on('child_changed', (data) => {
  var mediaNode = document.getElementById(data.key);
  mediaNode.innerHTML = mediaListTemplate(data.key, data.val());
});

mediaListRef.on('child_removed', (data) => {
  var mediaNode = document.getElementById(data.key);
  mediaNode.parentNode.removeChild(mediaNode);
});

mediaList.addEventListener('click', (e) => {
  var mediaNode = document.getElementById(e.target.dataset.mediaTarget);

  // UPDATE REVEIW
  if (e.target.classList.contains('edit')) {
    var list = mediaNode.querySelectorAll('[data-media-content-ref]');
    Array.prototype.forEach.call(list, function (item) {
      let mediaIdRef = eval(item.dataset.mediaContentRef);
      mediaIdRef.value = item.dataset.mediaContent;
    });

    mediaHiddenId.value = mediaNode.id;
  }

  // DELETE REVEIW
  if (e.target.classList.contains('delete')) {
    var id = mediaNode.id;
    db.ref('medialist/' + id).remove();
  }
});

function mediaListTemplate(id,{title, description, type, medium, imagePath}) {
  return `
    <div class="card__image">
        <img src="${imagePath}" alt="" data-media-content-ref="mediaImage" data-media-content="${imagePath}" class='image-path'>
    </div>
    <div class="card__content">
      <h3 class="card__title" data-media-content-ref="mediaTitle" data-media-content="${title}">${title}</h3>
      <div data-media-content-ref="mediaDescription" data-media-content="${description}" class="card__description">
        <p>${description}</p>
      </div>
      <span class="chip chip--with-label" data-media-content-ref="mediaType" data-media-content="${type}">
        <span class="chip__label">T</span>
        <span class="chip__text">${type}</span>
      </span>
      <span class="chip chip--with-label" data-media-content-ref="mediaMedium" data-media-content="${medium}">
        <span class="chip__label">M</span>
        <span class="chip__text">${medium}</span>
      </span>
    </div>
    <div class="card__actions">
      <button data-media-target="${id}" class="button button--danger delete">Delete</button>
      <button data-media-target="${id}" class="button edit">Edit</button>
    </div>
  `
};
