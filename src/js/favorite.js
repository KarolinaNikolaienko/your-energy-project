import { renderExercises } from './exercises.js';
import { LoadListenersForOpenModal } from './modal.js';
import { GetFavorites, RemoveFromFavorites } from './utils/local-storage.js';
import { request } from './services/api-service.js';

const modal = document.querySelector('[data-modal]');

document.addEventListener('DOMContentLoaded', async function () {
  const noFavoritesMessage = document.getElementById('no-favorites');
  let cardList = document.querySelector('.exercises-container');
  let favoritesIDs = GetFavorites();

  async function fetchFavoriteData(favoritesIDs) {
    const favoritesData = await Promise.all(
      favoritesIDs.map(async id => {
        try {
          return await request(`exercises/${id}`);
        } catch (error) {
          console.error(`Error fetching data for ID ${id}:`, error);
          return null;
        }
      })
    );
    return favoritesData.filter(exercise => exercise !== null);
  }

  async function displayFavorites() {
    if (!cardList) {
      console.error('No element found with the class "exercises-container".');
      return;
    }

    cardList.innerHTML = '';

    if (favoritesIDs.length === 0) {
      noFavoritesMessage.style.display = 'block';
    } else {
      noFavoritesMessage.style.display = 'none';

      const favoritesData = await fetchFavoriteData(favoritesIDs);
      renderExercises({ results: favoritesData }, true);
      LoadListenersForOpenModal();
      attachDeleteListeners();
    }
  }

  function attachDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.icon-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const exerciseID = button.getAttribute('data-id');
        RemoveFromFavorites(exerciseID);
        favoritesIDs = GetFavorites();
        displayFavorites();
      });
    });
  }

  window.addEventListener('click', function (event) {
    if (event.target === modal || event.target.closest('[data-modal-close]')) {
      modal.classList.add('hidden');
      favoritesIDs = GetFavorites();
      displayFavorites();
    }
  });

  await displayFavorites();
});
