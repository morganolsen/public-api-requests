/***
 * Public API Requests
 * Treehouse Techdegree Project 5
 * 
 * Author: Morgan Olsen
 */

const gallery = document.querySelector("#gallery");
let users = [];

// Alter this value in order to load more or fewer users.
const usersToLoad = 12;


/***
 * Places a search form on the page and creates event listeners for
 * the input and submit events.
 */
function addSearchForm() {
    const container = document.querySelector(".search-container");
    container.innerHTML = `
        <form action="#" method="get">
            <input type="search" id="search-input" class="search-input" placeholder="Search...">
            <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
        </form>
    `;

    document.querySelector("#search-input").addEventListener('input', performSearch);
    document.querySelector("form").addEventListener('submit', e => {
        e.preventDefault();
        performSearch();
    });
}

/***
 * Performs a search by taking the input of #search-input
 * and comparing it to the names of the users.
 * Displays users shown based on names.
 * Displays error message if no users were found.
 */
function performSearch()
{
    let newUsers = [];
    const search = document.querySelector("#search-input").value;
    users.forEach(user => {
        const name = `${user.name.first} ${user.name.last}`;
        if(name.toLowerCase().search(search.toLowerCase()) >= 0)
        {
            newUsers.push(user);
        }
    });
    gallery.innerHTML = '';
    newUsers.forEach((result, index) => {
        addCard(result, index);
    });

    if(!newUsers.length){
        gallery.innerHTML = '<h2>Your search returned no results.</h2>';
    }

}

/**
 * Formats the DOB string retreived from the random users API
 * into a readable date of birth.
 * @param {string} string - The string retreived
 * @returns {string} - The formatted date of birth
 */
function formatBirthday(string)
{
    const dob = string.substring(0, 10);
    const split = dob.split('-');

    return `${split[1]}/${split[2]}/${split[0]}`;
}

/**
 * Formats the phone number into the proper format.
 * @param {string} string - The unformatted phone number
 * @returns {string} - The formatted phone number
 */
function formatPhone(string)
{
    const regex = /\D+(\d{3})\D+(\d{3})\D+(\d{4})/;
    const array = regex.exec(string);
    return `(${array[1]}) ${array[2]}-${array[3]}`;
}

/**
 * Creates a modal window with information about the person provided.
 * 
 * @param {object} person - The user to display information about
 * @param {number} index - The index of the user in the users array.
 */
function createModal(person, index) {
    const body = document.querySelector("body");
    const modal = document.createElement("div");
    modal.className = 'modal-container';
    body.appendChild(modal);
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal">
                <button type="button" id="modal-close-btn" class="modal-close-btn">X</button>
                <div class="modal-info-container">
                    <img class="modal-img" src="${person.picture.large}" alt="profile picture">
                    <h3 id="name" class="modal-name cap">${person.name.first} ${person.name.last}</h3>
                    <p class="modal-text">${person.email}</p>
                    <p class="modal-text cap">${person.location.city}</p>
                    <hr>
                    <p class="modal-text">${formatPhone(person.phone)}</p>
                    <p class="modal-text">${person.location.street.number} ${person.location.street.name}, ${person.location.city}, ${person.location.state} ${person.location.postcode}</p>
                    <p class="modal-text">Birthday: ${formatBirthday(person.dob.date)}</p>
                </div>
            </div>
            <div class="modal-btn-container">
                <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
                <button type="button" id="modal-next" class="modal-next btn">Next</button>
            </div>
        </div>
    `;

    document.querySelector(".modal-container").addEventListener('click', e => {
        if(e.target.className === 'modal-container' || e.target.className === 'modal-close-btn'){
            modal.remove();
        }
    });

    document.querySelector("#modal-next").addEventListener('click', e => {
        modal.remove();
        let newindex = index + 1;
        if(newindex == usersToLoad)
        {
            newindex = 0;
        }
        createModal(users[newindex], newindex);
    });

    document.querySelector("#modal-prev").addEventListener('click', e => {
        modal.remove();
        let newindex = index - 1;
        if(newindex < 0)
        {
            newindex = usersToLoad - 1;
        }
        createModal(users[newindex], newindex);
    });
}


/**
 * Adds a user card to the view.
 * 
 * @param {object} person - The user object of the user to add.
 * @param {number} index - The index of the user object in the users array.
 */
function addCard(person, index) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
        <div class="card-img-container">
            <img class="card-img" src="${person.picture.medium}" alt="profile picture">
        </div>
        <div class="card-info-container">
            <h3 id="name" class="card-name cap">${person.name.first} ${person.name.last}</h3>
            <p class="card-text">${person.email}</p>
            <p class="card-text cap">${person.location.city}, ${person.location.state}</p>
        </div>
    `;
    gallery.appendChild(div);

    div.addEventListener('click', () => createModal(person, index)); 
}

/**
 * Adds the "Loading..." placeholder text that shows until the users have loaded.
 */
function addLoadingText() {
    const loadingText = document.createElement("h2");
    loadingText.id = 'loading-text';
    loadingText.textContent = 'Loading...';
    gallery.appendChild(loadingText);
}

/**
 * Loads the user cards for the users in the supplied json.
 * 
 * @param {object} json - The JSON of the users to load.
 */
function loadUsers(json)
{
    users = json.results;
    users.forEach((result, index) => {
        addCard(result, index);
    });
}

/**
 * Shows the user an error message and logs the error to the console.
 * 
 * @param {error} e 
 */
function displayError(e){
    gallery.innerHTML = `
        <h2 style="color:red">An error occurred while trying to load the users. Please try again later.</h2>
    `;
    console.error(e);
}

/**
 * Fetches the users from the randomuser database and calls the appropriate actions.
 */
async function fetchUsers() {
    await fetch(`https://randomuser.me/api/?nat=us&results=${usersToLoad}`)
        .then(result => result.json())
        .then(json => loadUsers(json))
        .catch(e => displayError(e))
        .finally(() => {
            document.querySelector("#loading-text").remove();
        });
}

// Initiate the script.
addSearchForm();
addLoadingText();
fetchUsers();