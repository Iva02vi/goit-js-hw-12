import axios from "axios";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector('form');
const searchInput = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more-btn');

let page = 1;
let perPage = 40;

const searchParams = new URLSearchParams({
  key: '41708261-c154389f16c12e10553f8f229',
    q: '',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
});

const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    gallery.innerHTML = '';
    loadMoreBtn.style.display = 'none';
    const searchValue = searchInput.value.trim();
    searchInput.value = '';
    if (!searchValue) {
        iziToast.error({
            message: "Please enter your search query",
            position: "topRight",
        });
        return;
    } else {
        searchParams.set('q', searchValue);
        loader.style.display = 'block';
        page = 1;
        searchParams.set('page', page);
        renderImages();
    };
});

const fetchImages = async () => {
    const response = await axios.get(`https://pixabay.com/api/?${searchParams}`);
    return response.data;
};

const renderImages = () => fetchImages()
    .then(({ hits }) => {
        if (hits && hits.length > 0) {
            const markup = hits
                .map(hit => {
                    const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = hit;
                    return `<li class="gallery-item">
                            <a class="gallery-link" href="${largeImageURL}">
                                <img
                                    class="gallery-image"
                                    src="${webformatURL}"
                                    alt="${tags}"
                                />
                                <ul class="img-description">
                                    <li class="img-description-item">Likes<span class="img-description-item-num">${likes}</span></li>
                                    <li class="img-description-item">Views<span class="img-description-item-num">${views}</span></li>
                                    <li class="img-description-item">Comments<span class="img-description-item-num">${comments}</span></li>
                                    <li class="img-description-item">Downloads<span class="img-description-item-num">${downloads}</span></li>
                                </ul>
                            </a>
                        </li>`
                })
                .join("");
            gallery.insertAdjacentHTML("beforeend", markup);
            lightbox.refresh();
            loadMoreBtn.style.display = 'block';
            endCheck();

            if (page !== 1) {
                scrollGallery();
            };
        } else {
            iziToast.error({
                message: 'Sorry, there are no images matching your search query. Please try again!',
                position: 'topRight',
            });
        };
    })
    .catch(error => {
        iziToast.error({
            message: `${error}`,
            position: 'topRight',
        });
    })
    .finally(() => {
        loader.style.display = 'none';
    });

loadMoreBtn.addEventListener("click", async () => {
    page += 1;
    searchParams.set('page', page);
    loadMoreBtn.style.display = 'none';
    loader.style.display = 'block';
    renderImages();
}
);

const endCheck = () => {
    fetchImages()
        .then(response => {
            const totalPages = Math.ceil(response.totalHits / perPage);
            if (page >= totalPages) {
                iziToast.error({
                    message: "We're sorry, but you've reached the end of search results.",
                    position: 'topRight',
                });
                loadMoreBtn.style.display = 'none';
            }
        })
        .catch(error => {
            iziToast.error({
                message: `${error}`,
                position: 'topRight',
            });
        });
}

const scrollGallery = async () => {
    const imgItem = document.querySelector('.gallery-item');
    const imgHeight = imgItem.getBoundingClientRect().height;
    window.scrollBy({
        top: imgHeight * 2,
        behavior: "smooth",
    });
};