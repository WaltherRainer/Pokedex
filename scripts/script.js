let activePokeData = [];
let pokeCount = 20;
let pokeOffset = 0;
let pokeDetailData = []; 
let pokeEvoChain = [];
let activePokeID = 0;
let allPokemons = [];
let activePokeIndex = 0; 
let scrollPosition = 0;

const modal = document.querySelector("[data_modal]");
const overlay = document.querySelector("[data_overlay]")
const searchInput = document.querySelector("[search_input]")

searchInput.addEventListener("input", () => {
    if (searchInput.value.length >= 3) {
        searchForPokeName(searchInput.value);
        searchInput.classList.add('has-content');
    }
    else if (searchInput.value.length > 0) {
        searchInput.classList.remove('has-content');
    }
    else {
        onloadFunction();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        closeModal();
    }
});

modal.addEventListener("click", e => {
  const dialogDimensions = modal.getBoundingClientRect()
  if (
    e.clientX < dialogDimensions.left ||
    e.clientX > dialogDimensions.right ||
    e.clientY < dialogDimensions.top ||
    e.clientY > dialogDimensions.bottom
  ) {
    closeModal()
  }
});

async function onloadFunction() {
    document.body.classList.add('no-scroll');
    document.getElementById('loading_spinner').innerHTML = getLoadingSpinnerTempl();
    let pokData = await useAPI(); 
    activePokeData = pokData["results"];
    await loopActivePokeData();
    await loadAllPokeNames();
    document.getElementById('loading_spinner').innerHTML = "";
    document.body.classList.remove('no-scroll');
    renderPreviewCard();
};

function showMore() {
    let qty = parseInt(document.getElementById('qty_to_show').value)
    if (qty < 1) {
        qty = 20
        document.getElementById('qty_to_show').value = 20
    }
    else if (qty > 100) {
        qty = 100
        document.getElementById('qty_to_show').value = 100
    }
    pokeCount = pokeCount + qty;
    document.getElementById('prev_card').innerHTML = "";
    getMoreData(pokeCount - qty);
};

async function getMoreData(count) {
    activePokeData = [];
    document.body.classList.add('no-scroll');
    document.getElementById('loading_spinner').innerHTML = getLoadingSpinnerTempl();
    for (let index = 0; index < pokeCount; index++) {
        const tmpObj = allPokemons[index];
        activePokeData.push(tmpObj);
    }
    await loopActivePokeData(count);
    document.getElementById('loading_spinner').innerHTML = "";
    document.body.classList.remove('no-scroll');
    renderPreviewCard();
    console.log(activePokeData);
    console.log(pokeDetailData);
};

const showDialog = () => {
  document.getElementById('dialog').classList.add('show')
  const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
  const body = document.body;
  body.style.height = '100vh';
  body.style.overflowY = 'hidden';
};

const closeDialog = () => {
  const body = document.body;
  const scrollY = body.style.top;
  body.style.position = '';
  body.style.top = '';
  body.style.height = '';
  body.style.overflowY = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
  document.getElementById('dialog').classList.remove('show');
};

window.addEventListener('scroll', () => {
  document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
});

function openDistModal(index) {
    showDialog()
    loadModalCard(index);
    modal.showModal();
};

async function loadModalCard(dataIndex) {
    activePokeIndex = dataIndex
    await fillPokeEvoChain(dataIndex);
    renderModalCardMain(dataIndex);
    renderModalCardStats(dataIndex);
    renderEvoChain();
};

function closeModal() {
    closeDialog();
    modal.close();
};

async function renderPreviewCard() {
    let pokeTypesTempl = "";
    document.getElementById('prev_card').innerHTML = "";
    if (Array.isArray(activePokeData) && activePokeData.length) {
        for (let index = 0; index < activePokeData.length; index++) {
            const pokeName = activePokeData[index].name;
            const pokeNumber = getPokeIdFromUrl(activePokeData[index].url);
            const imgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + pokeNumber + ".png";
            pokeTypesTempl = renderTypesTempl(index);
            let tmpHtml = getPrevCardTempl(index, pokeName, imgUrl, pokeTypesTempl, pokeNumber);
            document.getElementById('prev_card').innerHTML += tmpHtml;
        }
    }
    else {
        document.getElementById('prev_card').innerHTML = `<div class="no_search_results">no matches!</div>`;
    }
};

function renderModalCardStats(dataIndex) {
    let hp = pokeDetailData[dataIndex].stats[0].base_stat;
    let attack = pokeDetailData[dataIndex].stats[1].base_stat;
    let defense = pokeDetailData[dataIndex].stats[2].base_stat;
    let specAtt = pokeDetailData[dataIndex].stats[3].base_stat;
    let specDef = pokeDetailData[dataIndex].stats[4].base_stat;
    let speed = pokeDetailData[dataIndex].stats[5].base_stat;
    let statsHtml = getStatsTempl(hp, attack, defense, specAtt, specDef, speed)
    document.getElementById('poke_stats_bars').innerHTML = statsHtml;
};

function renderModalCardMain(dataIndex) {
    document.getElementById('poke_number').innerHTML = `#${pokeDetailData[dataIndex].pokeId}`;
    document.getElementById('poke_name').innerHTML = `${pokeDetailData[dataIndex].name}`;
    document.getElementById('poke_modal_img').innerHTML = `<img class="large_image" src="${pokeDetailData[dataIndex].image}" alt="">`;
    document.getElementById('poke_type_symbols').innerHTML = renderTypesTempl(dataIndex);
    document.getElementById('poke_height').innerHTML = pokeDetailData[dataIndex].height;
    document.getElementById('poke_weight').innerHTML = pokeDetailData[dataIndex].weight;
    document.getElementById('poke_base_exp').innerHTML = pokeDetailData[dataIndex].base_experience;
    document.getElementById('poke_abilities').innerHTML = getAbilitiesString(dataIndex);
};

function getAbilitiesString(dataIndex) {
    const myArray = pokeDetailData[dataIndex].abilities;
    let myString = "";
    for (let index = 0; index < myArray.length; index++) {
        if (!myArray[index].is_hidden) {
            myString += myArray[index].ability.name
        }
        return myString
    }
};

function searchForPokeName(pokeName) {
    let searchResults = [];
    pokeDetailData = [];
    activePokeData = [];
    for (let index = 0; index < allPokemons.length; index++) {
        const tmpName = allPokemons[index].name;
        if (tmpName.includes(pokeName)) {
            let resultData = {
                "pokeId" : getPokeIdFromUrl(allPokemons[index].url),
                "name": tmpName,
                "url": allPokemons[index].url,
                }
            searchResults.push(resultData);
        }
    }
    loadSearchResInToActData(searchResults);
};



function renderTypesTempl(dataIndex) {
    let myArray = pokeDetailData[dataIndex].types;
    let pokeTypesTempl = "";
    for (let index = 0; index < myArray.length; index++) {        
        let typeName = myArray[index].type.name;
        pokeTypesTempl += getTypeTempl(typeName);
    }
    return pokeTypesTempl;
};

function getPokeIdFromUrl(url) {
    const urlObject = new URL(url);
    const pathName = urlObject.pathname;
    const segments = pathName.split('/');
    const id = segments.filter(segment => segment !== '').pop();
    return parseInt(id);
};

async function nextPoke() {
    if (activePokeData.length > activePokeIndex + 1) {
        await loadModalCard(activePokeIndex + 1);
    }
    else {
        activePokeIndex = 0
        await loadModalCard(activePokeIndex);
    }
};

async function prevPoke() {
    if (activePokeIndex > 0) {
        await loadModalCard(activePokeIndex - 1);
    }
    else {
        activePokeIndex = activePokeData.length - 1;
        await loadModalCard(activePokeIndex);
    }
    
};
