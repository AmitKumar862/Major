const API_URL = 'https://api.github.com/users/';

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const mainContent = document.getElementById('main-content');
const errorMsg = document.getElementById('error-msg');
const errorText = errorMsg.querySelector('span');
const reposContainer = document.getElementById('repos-container');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const username = searchInput.value.trim();

    if (username === '') {
        showError('Please enter a username to search.');
        return;
    }

    resetUI();
    setLoading(true);

    try {
        const userResponse = await fetch(API_URL + username);

        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                throw new Error(`User "${username}" is not on Github.`);
            } else {
                throw new Error(`Signal Lost: ${userResponse.statusText}`);
            }
        }

        const userData = await userResponse.json();
        displayProfile(userData);

        const reposResponse = await fetch(`${API_URL}${username}/repos?sort=updated&per_page=12`);
        const reposData = await reposResponse.json();
        displayRepos(reposData);

        mainContent.classList.remove('hidden');

    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

function resetUI() {
    errorMsg.classList.add('hidden');
    mainContent.classList.add('hidden');
    reposContainer.innerHTML = '';
}

function setLoading(isLoading) {
    if (isLoading) {
        // Change icon to a spinner
        searchBtn.innerHTML = '<i class="fas fa-satellite fa-spin"></i> Scanning...';
        searchBtn.disabled = true;
        searchBtn.style.opacity = "0.7";
    } else {
        searchBtn.innerHTML = '<i class="fas fa-rocket"></i> Launch';
        searchBtn.disabled = false;
        searchBtn.style.opacity = "1";
    }
}

function displayProfile(user) {
    document.getElementById('avatar').src = user.avatar_url;
    document.getElementById('name').textContent = user.name || user.login;
    document.getElementById('username').innerHTML = `@${user.login} <i class="fas fa-external-link-alt"></i>`;
    document.getElementById('username').href = user.html_url;
    
    const bioEl = document.getElementById('bio');
    bioEl.textContent = user.bio || 'No transmission received (Bio empty).';
    
    document.getElementById('followers').textContent = user.followers.toLocaleString();
    document.getElementById('following').textContent = user.following.toLocaleString();
    
    const locationEl = document.getElementById('location');
    const locationContainer = document.getElementById('location-container');
    if (user.location) {
        locationEl.textContent = user.location;
        locationContainer.classList.remove('hidden');
    } else {
         locationContainer.classList.add('hidden');
    }
}

function displayRepos(repos) {
    if (repos.length === 0) {
        reposContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">
                <i class="fas fa-wind" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No missions (repositories) found.</p>
            </div>`;
        return;
    }

    repos.forEach(repo => {
        const repoCard = document.createElement('div');
        repoCard.classList.add('repo-card');

        const description = repo.description ? repo.description : 'No mission details provided.';
        const lang = repo.language ? `<span style="margin-left: 15px"><i class="fas fa-terminal"></i> ${repo.language}</span>` : '';

        repoCard.innerHTML = `
            <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
            <p class="repo-description">${description}</p>
            <div class="repo-footer">
                <div class="repo-stat">
                    <i class="fas fa-star"></i> 
                    <span>${repo.stargazers_count.toLocaleString()}</span>
                </div>
                ${lang}
            </div>
        `;

        reposContainer.appendChild(repoCard);
    });
}

function showError(message) {
    errorText.textContent = message;
    errorMsg.classList.remove('hidden');
}