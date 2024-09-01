import { GetFavorites, AddToFavorites, RemoveFromFavorites } from "./utils/local-storage.js";
import { request } from "./services/api-service.js";
import iconsPath from "../img/icons.svg";

const btnCloseModal = document.querySelector("[data-modal-close]");
const modalWindow = document.querySelector(".modal"); // Modal without backdrop
const modal = document.querySelector("[data-modal]"); // Modal with backdrop
const btnAddFavorites = document.querySelector(".btn-modal-add-fav");

let exerciseID = ''; // ID of the exercise
    // const btnOpenModal = document.querySelectorAll("[data-modal-open]");
    // for (let i = 0; i < btnOpenModal.length; i++) {
    //     btnOpenModal[i].addEventListener("click", (event) => {
    //         const btn = event.target;
    //         exerciseID = btn.value;
    //         LoadModalData(exerciseID);
    //     });  
    // }
    
async function LoadModalData(_id) {
    exerciseID = _id;
    const exerciseData = await request(`exercises/${exerciseID}`);
    LoadElementsData(exerciseData);
    
    // Add to favorites btn functions
    
    // Check local storage if it contains exercise
    // localStorage.setItem("favorites", JSON.stringify([1])); // For test
    if (GetFavorites().indexOf(exerciseID) >= 0) {
        btnAddFavorites.classList.add("fav-added");
        document.querySelector(".btn-fav-text").textContent = "Remove from favorites";
        document.querySelector(".icon-fav-btn-use").setAttribute("href", `${iconsPath}#icon-trash`);
    }
    else {
        btnAddFavorites.classList.remove("fav-added");
        document.querySelector(".btn-fav-text").textContent = "Add to favorites";
        document.querySelector(".icon-fav-btn-use").setAttribute("href", `${iconsPath}#icon-heart`);
    }

    AddBtnFavListener();
    
    modal.classList.toggle("hidden");
    OnOpen();
};


function LoadElementsData(exerciseData) {
    document.querySelector(".img-modal-exercise").src = exerciseData.gifUrl;
    document.querySelector(".title-modal").textContent = exerciseData.name.trim();
    document.querySelector(".desc-text").textContent = exerciseData.description.trim();
    
    // Stars fill color
    document.querySelector(".rating-value").textContent = exerciseData.rating;
    // Full stars
    const stars = document.querySelectorAll(".icon-modal-star");
    const wholePartRating = Math.floor(exerciseData.rating);
    for (let i = 0; i < stars.length; i++) {
        stars[i].classList.remove("gold");
        stars[i].classList.remove("gold-half");
        if (i < wholePartRating)
            stars[i].classList.add("gold");
    }

    // Half star
    if (exerciseData.rating - Math.floor(exerciseData.rating) !== 0) {
        const fractionPartRating = Math.floor((exerciseData.rating - wholePartRating) * 100);
        const gradientStops = document.querySelectorAll(".gradient-middle");
        for (let i = 0; i < gradientStops.length; i++)
            gradientStops[i].setAttribute("offset", `${fractionPartRating}%`);
        stars[wholePartRating].classList.add("gold-half");
    }

    // Stats
    const statsList = document.querySelector(".stats-list");
    statsList.innerHTML = "";
    innerHTMLStats = "";
    if(exerciseData.target !== "")
        AddStat("Target", exerciseData.target);
    if(exerciseData.bodyPart !== "")
        AddStat("BodyPart", exerciseData.bodyPart);
    if(exerciseData.equipment !== "")
        AddStat("Equipment", exerciseData.equipment);
    if(exerciseData.popularity !== "")
        AddStat("Popular", exerciseData.popularity);
    if(exerciseData.burnedCalories !== "")
        AddStat("Burned Calories", exerciseData.burnedCalories + "/" + exerciseData.time + " min");
    statsList.insertAdjacentHTML("beforeend", innerHTMLStats);

}

function AddBtnFavListener() {
    btnAddFavorites.addEventListener("click", (event) => {
        // event.preventDefault();
        const btn = event.currentTarget;
        btn.classList.toggle("fav-added");
        
        if (btn.classList.contains("fav-added")) {
            AddToFavorites(exerciseID);
            document.querySelector(".btn-fav-text").textContent = "Remove from favorites";
            document.querySelector(".icon-fav-btn-use").setAttribute("href", `${iconsPath}#icon-trash`);
        }
        else {
            RemoveFromFavorites(exerciseID);
            document.querySelector(".btn-fav-text").textContent = "Add to favorites";
            document.querySelector(".icon-fav-btn-use").setAttribute("href", `${iconsPath}#icon-heart`);
        }

        event.stopImmediatePropagation();
    });
}

let innerHTMLStats = "";
function AddStat(title, value) {
    innerHTMLStats += `<li class="stats-item">
              <p class="stats-title">${title}</p>
              <p class="stats-value">${value}</p>
            </li>`;
}

export function LoadListenersForOpenModal() {
    const btnOpenModal = document.querySelectorAll("[data-modal-open]");
    for (let i = 0; i < btnOpenModal.length; i++) {
        btnOpenModal[i].addEventListener("click", (event) => {
        const btn = event.currentTarget;
            LoadModalData(btn.value);
        });
    }
}

// Modal close functions
btnCloseModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    OnClose();
});

modal.addEventListener("click", (event) => {
    let rect = "";
    // If exercise modal window open
    if (!modalWindow.classList.contains("hidden")) 
        rect = modalWindow.getBoundingClientRect();
    else if (!modalAddRatingWindow.classList.contains("hidden"))
        rect = modalAddRatingWindow.getBoundingClientRect();

    if (rect) {
        // Define if cursor is in modal window
        const isInWindow = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
        if (!isInWindow) {
            // If exercise modal opened
            if (!modalWindow.classList.contains("hidden")) {
                modal.classList.add("hidden");
                OnClose();
            }
            // If Give a rating modal opened
            else if (!modalAddRatingWindow.classList.contains("hidden") && !giveRatingIsPressed) {
                modalAddRatingWindow.classList.add("hidden");
                modalWindow.classList.remove("hidden");
            }
            giveRatingIsPressed = false;
        }
    }
});

function escapeKeyDown(event) {
    if (event.key === "Escape") {
        // If exercise modal opened
        if (!modalWindow.classList.contains("hidden")) {
            modal.classList.add("hidden");
            OnClose();
        }
        // If Give a rating modal opened
        else if (!modalAddRatingWindow.classList.contains("hidden")) {
            modalAddRatingWindow.classList.add("hidden");
            modalWindow.classList.remove("hidden");
            // OnClose();
        }
    }
}

function OnOpen() {
    document.addEventListener("keydown", escapeKeyDown);
    document.querySelector("body").classList.add("modal-open");
    document.querySelector('.scroll-up-button').style.visibility = 'hidden';
}

function OnClose() {
    document.removeEventListener("keydown", escapeKeyDown);
    document.querySelector("body").classList.remove("modal-open");
    document.querySelector('.scroll-up-button').style.visibility = 'visible';
}

// Give a rating button
const modalAddRatingWindow = document.querySelector(".add-rating-modal"); // Modal Give a rating
const btnOpenRatingModal = document.querySelector("[data-add-rating-open]");
let giveRatingIsPressed = false;

btnOpenRatingModal.addEventListener("click", (event) => {
    giveRatingIsPressed = true;
    modalAddRatingWindow.classList.remove("hidden");
    modalWindow.classList.add("hidden");
    OnOpen();
    event.stopImmediatePropagation();
});

// Give a rating modal
const btnCloseRatingModal = document.querySelector("[data-add-rating-close]");

// Rating modal close functions
btnCloseRatingModal.addEventListener("click", (event) => {
    modalAddRatingWindow.classList.add("hidden");
    modalWindow.classList.remove("hidden");
    // OnClose();
    event.stopImmediatePropagation();
});

function LoadRatingModal() {
    const radioBtns = document.querySelectorAll("add-rating-radio-btn");
}
