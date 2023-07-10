import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const inputRef = document.querySelector('input');
const formRef = document.querySelector('.search-form');
const galleryRef = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};

formRef.addEventListener('submit', onImageSearch);
galleryRef.addEventListener('click', onImageOpen);

let observer = new IntersectionObserver(onLoad, options);
let page = 1;
let query;

function onLoad(entries, observer) {
  entries.forEach(entry => {
    console.log(entry);
    if (entry.isIntersecting) {
      page += 1;
      fetchImage(query, page)
        .then(data => {
          renderCardMarkup(data.hits);
          if (page === Math.ceil(data.totalHits / 40)) {
            observer.unobserve(guard);
            Notify.info(
              `We're sorry, but you've reached the end of search results.`
            );
            return;
          }
        })
        .catch(err => console.log(err));
    }
  });
}

function onImageSearch(evt) {
  evt.preventDefault();
  query = inputRef.value;
  galleryRef.innerHTML = '';
  inputRef.value = '';
  page = 1;

  if (!query.trim()) {
    Notify.info(`Please, enter your search query`);

    return;
  } else {
    fetchImage(query, page)
      .then(data => {
        // console.log(data);
        if (data.total === 0) {
          Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
          );
          return;
        }
        renderCardMarkup(data.hits);

        observer.observe(guard);
      })
      .catch(error => console.log(error));
  }
}

function fetchImage(query, page) {
  const API_KEY = '38103415-9a2b8d11501b0e8a3e6d8d0b6';
  const BASE_URL = 'https://pixabay.com/api/';
  return fetch(
    `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  ).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
}

function renderCardMarkup(arr) {
  const markup = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
    <div class="photo-card">
      <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes:</b> ${likes}
        </p>
        <p class="info-item">
          <b>Views:</b> ${views}
        </p>
        <p class="info-item">
          <b>Comments:</b> ${comments}
        </p>
        <p class="info-item">
          <b>Downloads:</b> ${downloads}
        </p>
      </div>
    </div>`
    )
    .join('');
  galleryRef.insertAdjacentHTML('beforeend', markup);
}

function onImageOpen(evt) {
  evt.preventDefault();

  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 150,
  });
}
