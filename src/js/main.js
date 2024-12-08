const aside = document.querySelector('aside');
aside.classList.add('open');

const asideButton = document.querySelector('#closeAside');
asideButton.style.left = '340px';
aside.style.transform = 'translateX(-332px)'; // Move aside out of view initially
aside.classList.remove('open');
aside.classList.add('closed');
asideButton.style.left = '8px';

asideButton.addEventListener('click', () => {
    if (aside.classList.contains('open')) {
        aside.classList.remove('open');
        aside.classList.add('closed');
        aside.style.transform = 'translateX(-332px)';
        asideButton.style.left = '8px';
        asideButton.querySelector('img').style.transform = 'rotate(0deg)';
    } else {
        aside.classList.remove('closed');
        aside.classList.add('open');
        aside.style.transform = 'translateX(0)';
        asideButton.style.left = '340px';
        asideButton.querySelector('img').style.transform = 'rotate(180deg)';
    }
});

const earthMCMap = document.querySelector('.earthmcMap');
earthMCMap.src = 'https://map.earthmc.net/';
const threeDButton = document.querySelector('.threed');
threeDButton.addEventListener('click', () => {
    if (earthMCMap.src.includes('3d.earthmc.net')) {
        earthMCMap.src = 'https://map.earthmc.net/';
        threeDButton.textContent = '3D';
    } else {
        earthMCMap.src = 'https://3d.earthmc.net/';
        threeDButton.textContent = '2D';
    }
});


const EarthMCAPIEndpoint = `https://api.earthmc.net/v2/aurora`;
const MCHeadsAPIEndpoint = `https://mc-heads.net/`;

const searchButton = document.querySelector('.searchButton');
const searchInput = document.querySelector('.input');

const dataBox = document.querySelector('.data');

const getSelectedRadio = () => {
    const radios = document.querySelectorAll('.radio-inputs input[type="radio"]');
    for (const radio of radios) {
        if (radio.checked) {
            return radio.id;
        }
    }
    return null;
};

async function getNationData(nationName) {
    const response = await fetch(`${EarthMCAPIEndpoint}/nations/${nationName}`);
    const data = await response.json();

    aside.style.overflowY = 'auto';

    try {
       dataBox.innerHTML = `
        <div class="nationData">
            <span id="nation">
                <h2>${data.name}</h2>
                <p>(${data.stats.numTownBlocks} Chunks)</p>
            </span>
            ${data.board ? `<em>${data.board}</em>` : ''}
            <label id="dataLabel" for="capital">Capital:</label>
            <p>${data.capital}</p>
            <label id="dataLabel" for="king">King:</label>
            <span><img src="${MCHeadsAPIEndpoint}/avatar/${data.king}/16"><p id="king">${data.king}</p></span>
            <label id="dataLabel" for="balance">Balance:</label>
            <p>${data.stats.balance} Gold</p>
            <label id="dataLabel" for="towns">Towns:</label>
            <p>${data.stats.numTowns} Towns</p>
            <label id="dataLabel" for="ranks">Ranks:</label>
            ${Object.entries(data.ranks).map(([rank, players]) => `
                <div class="rank">
                    <p>${rank}:</p>
                    ${players.map(player => `<span><img src="${MCHeadsAPIEndpoint}/avatar/${player}/16"><p>${player}</p></span>`).join('')}
                </div>
            `).join('')}
            <label id="dataLabel" for="residents">Residents:</label>
            <p>${data.stats.numResidents} Players</p>
            <label id="dataLabel" for="moreInfo">More Info:</label>
            <div id="moreInfo">
                ${data.towns ? `<button class="show-towns">Show Towns</button>` : ''}
                ${data.stats.numResidents ? `<button class="show-res">Show Residents</button>` : ''}
                ${data.allies ? `<button class="show-allies">Show Allies</button>` : ''}
                ${data.enemies ? `<button class="show-enemies">Show Enemies</button>` : ''}
            </div>
        </div>
       `

        const showTownsButton = document.querySelector('.show-towns');
        const showResidentsButton = document.querySelector('.show-res');
        const showAlliesButton = document.querySelector('.show-allies');
        const showEnemiesButton = document.querySelector('.show-enemies');

        const handleTowns = () => createModal(data.towns, 'towns');
        const handleResidents = () => createModal(data.residents, 'residents');
        const handleAllies = () => createModal(data.allies, 'allies');
        const handleEnemies = () => createModal(data.enemies, 'enemies');

        if (showTownsButton) {
            showTownsButton.removeEventListener('click', handleTowns);
            showTownsButton.addEventListener('click', handleTowns);
        }
        if (showResidentsButton) {
            showResidentsButton.removeEventListener('click', handleResidents);
            showResidentsButton.addEventListener('click', handleResidents);
        }
        if (showAlliesButton) {
            showAlliesButton.removeEventListener('click', handleAllies);
            showAlliesButton.addEventListener('click', handleAllies);
        }
        if (showEnemiesButton) {
            showEnemiesButton.removeEventListener('click', handleEnemies);
            showEnemiesButton.addEventListener('click', handleEnemies);
        }

       earthMCMap.src = `https://map.earthmc.net/?zoom=4&x=${data.spawn.x - 100}&z=${data.spawn.z}`;

       
    } catch (error) {
        dataBox.innerHTML = `
            <p>There was an error fetching the data for ${nationName}.</p>
        `;
        console.error('Error:', error);
    }
    return data;
}

function createModal(data, type) {
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <span class="close">&times;</span>
        <div class="group">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="search-icon"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
            <input id="modalSearch" class="input" type="search" placeholder="Search..." name="modalSearchbar" />
        </div>
        <div class="modalData"></div>  
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close');
    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    const modalData = document.querySelector('.modalData');
    const renderData = (items) => {
        if (type === 'allies') {
            modalData.innerHTML = items.map(ally => `<p>${ally.replace(/_/g, ' ')}</p>`).join('');
        }
        if (type === 'enemies') {
            modalData.innerHTML = items.map(enemy => `<p>${enemy.replace(/_/g, ' ')}</p>`).join('');
        }
        if (type === 'towns') {
            modalData.innerHTML = items.map(town => `<p>${town}</p>`).join('');
        }
        if (type === 'residents') {
            modalData.innerHTML = items.map(resident => `<span><img src="${MCHeadsAPIEndpoint}/avatar/${resident}/36"><p>${resident}</p></span>`).join('');
        }
        if (type === 'friends') {
            modalData.innerHTML = items.map(friend => `<span><img src="${MCHeadsAPIEndpoint}/avatar/${friend}/36"><p>${friend}</p></span>`).join('');
        }
    };

    renderData(data);

    const modalSearch = modal.querySelector('#modalSearch');
    modalSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredData = data.filter(item => 
            item.toLowerCase().replace(/_/g, ' ').includes(searchTerm)
        );
        renderData(filteredData);
    });
}

async function getTownData(townName) {
    const response = await fetch(`${EarthMCAPIEndpoint}/towns/${townName}`);
    const data = await response.json();

    aside.style.overflowY = 'auto';

    try {
        dataBox.innerHTML = `
            <div class="townData">
                <span id="town">
                    <h2>${data.name}</h2>
                    <p>(${data.stats.numTownBlocks}/${data.stats.maxTownBlocks} Chunks)</p>
                </span>
                <label id="dataLabel" for="nation">Nation:</label>
                <p>${data.nation.replace(/_/g, ' ')}</p>
                <label id="dataLabel" for="mayor">Mayor:</label>
                <span><img src="${MCHeadsAPIEndpoint}/avatar/${data.mayor}/16"><p id="mayor">${data.mayor}</p></span>
                <label id="dataLabel" for="founder">Founder:</label>
                <span><img src="${MCHeadsAPIEndpoint}/avatar/${data.founder}/16"><p id="founder">${data.founder}</p></span>
                <label id="dataLabel" for="balance">Balance:</label>
                <p>${data.stats.balance} Gold</p>
                <label id="dataLabel" for="status">Status:</label>
                <div class="status">
                    <p>Public: ${data.status.isPublic ? '✓' : '✗'}</p>
                    <p>Open: ${data.status.isOpen ? '✓' : '✗'}</p>
                    <p>Capital: ${data.status.isCapital ? '✓' : '✗'}</p>
                    <p>For Sale: ${data.status.isForSale ? '✓' : '✗'}</p>
                </div>
                <label id="dataLabel" for="residents">Residents:</label>
                <p>${data.stats.numResidents} Players</p>
                <label id="dataLabel" for="moreInfo">More Info:</label>
                <div id="moreInfo">
                    ${data.residents ? `<button class="show-res">Show Residents</button>` : ''}
                    ${data.trusted ? `<button class="show-trusted">Show Trusted</button>` : ''}
                </div>
            </div>
        `;

        const showResidentsButton = document.querySelector('.show-res');
        const showTrustedButton = document.querySelector('.show-trusted');

        const handleResidents = () => createModal(data.residents, 'residents');
        const handleTrusted = () => createModal(data.trusted, 'residents');

        if (showResidentsButton) {
            showResidentsButton.removeEventListener('click', handleResidents);
            showResidentsButton.addEventListener('click', handleResidents);
        }
        if (showTrustedButton) {
            showTrustedButton.removeEventListener('click', handleTrusted);
            showTrustedButton.addEventListener('click', handleTrusted);
        }

        earthMCMap.src = `https://map.earthmc.net/?zoom=4&x=${data.coordinates.spawn.x - 100}&z=${data.coordinates.spawn.z}`;

    } catch (error) {
        dataBox.innerHTML = `
            <p>There was an error fetching the data for ${townName}.</p>
        `;
        console.error('Error:', error);
    }
    return data;
}

async function getResidentData(username) {
    aside.style.overflowY = 'auto';

    try {
        const response = await fetch(`${EarthMCAPIEndpoint}/residents/${username}`);
        const data = await response.json();
        let rank = 'None';

        if (data.town) {
            const townResponse = await fetch(`${EarthMCAPIEndpoint}/towns/${data.town}`);
            const townData = await townResponse.json();
            const townMayor = townData.mayor;

            const nationResponse = await fetch(`${EarthMCAPIEndpoint}/nations/${townData.nation}`);
            const nationData = await nationResponse.json();
            const nationKing = nationData.king;

            if (data.name === nationKing) {
                rank = 'King';
            } else if (data.name === townMayor) {
                rank = 'Mayor';
            } else {
                try {
                    rank = data.ranks.townRanks[0];
                } catch {
                    rank = 'None';
                }
            }

            earthMCMap.src = `https://map.earthmc.net/?zoom=4&x=${townData.coordinates.spawn.x - 100}&z=${townData.coordinates.spawn.z}`;
        }

        dataBox.innerHTML = `
            <div class="playerData">
            <h2>${data.title ? data.title + ' ' : ''}${data.name} ${data.surname ? data.surname + ' ' : ''}</h2>
            <p>[${data.town} │ ${data.nation.replace(/_/g, ' ')}]</p>
            ${data.about ? `<p>${data.about}</p>` : ''}
            <label id="dataLabel" for="rank">Rank:</label>
            <p id="rank">${rank}</p>
            <label id="dataLabel" for="balance">Balance:</label>
            <p id="balance">${data.stats.balance} Gold</p>
            ${data.friends ? `
                <label id="dataLabel" for="friends">Friends:</label>
                <p id="friends">${data.friends.length} Players</p>
                <label id="dataLabel" for="moreInfo">More Info:</label>
                <div id="moreInfo">
                <button class="show-friends">Show Friends</button>
                </div>
            ` : ''}
            </div>

            <div class="playerSkin">
            <h2>${data.name}</h2>
            <div class="playerStatus"></div>
            <img src="${MCHeadsAPIEndpoint}/body/${data.name}/right" alt="${data.name}" />
            </div>
        `;

        const showFriendsButton = document.querySelector('.show-friends');

        if (showFriendsButton && data.friends) {
            showFriendsButton.removeEventListener('click', () => createModal(data.friends, 'friends'));
            showFriendsButton.addEventListener('click', () => createModal(data.friends, 'friends'));
        }

        const playerStatus = document.querySelector('.playerStatus');
        playerStatus.style.backgroundColor = data.status.isOnline ? '#40d840' : '#ff5c5c';

        return data;
    } catch (error) {
        dataBox.innerHTML = `
            <p>There was an error fetching the data for ${username}.</p>
        `;
        console.error('Error:', error);
    }
}

const handleSearch = () => {
    if (getSelectedRadio() === 'nations') {
        getNationData(searchInput.value.replace(/\s+/g, '_'));
    }
    if (getSelectedRadio() === 'towns') {
        getTownData(searchInput.value.replace(/\s+/g, '_'));
    }
    if (getSelectedRadio() === 'residents') {
        getResidentData(searchInput.value.replace(/\s+/g, '_'));
    }
};

searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});