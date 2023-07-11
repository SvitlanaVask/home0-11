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
            setTimeout(() => {
              Notify.info(
                `We're sorry, but you've reached the end of search results.`
              );
            }, 2000);
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
