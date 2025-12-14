const BASE_URL = "https://pokeapi.co/api/v2/pokemon"; 
let activePokeData = [];
let pokeCount = 10;
let pokeOffset = 0;
let pokeDetailData = []; 
let pokeEvoChain = [];
let activePokeID = 0;
let allPokemons = [];
let activePokeIndex = 0;


async function onloadFunction() {
    let pokData = await useAPI(); 
    activePokeData = pokData["results"];

    await loopActivePokeData();
    await loadAllPokeNames();
    renderPreviewCard();
};

async function loopActivePokeData() {
    pokeDetailData = []; 
    for (let i = 0; i < activePokeData.length; i++) {
        const pokeEntry = activePokeData[i];
        const pokDetail = await useAPI(pokeEntry.url);
        pokeDetailData.push(filledDataArray(pokeEntry, pokDetail));
    }
};

async function useAPI(path) {
    const apiData = await loadData(path); 
    return apiData;
};

async function loadData(path = BASE_URL + "?limit=" + pokeCount +"&offset=" + pokeOffset) {
    try {
        let response = await fetch(path); 
        if (!response.ok) {
            throw new Error(`HTTP Fehler! Status: ${response.status} bei URL: ${path}`);
        }
        return await response.json(); 
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
        return null; 
    }
};

function filledDataArray(pokeEntry, pokDetail) {
        let tmpData = {
            "pokeId" : getPokeIdFromUrl(pokeEntry.url),
            "name": pokeEntry.name,
            "weight": pokDetail.weight,
            "height": pokDetail.height,
            "image": pokDetail.sprites.other["official-artwork"].front_default,
            "base_experience": pokDetail.base_experience,
            "stats" : pokDetail.stats,
            "types" : pokDetail.types,
            "abilities" : pokDetail.abilities,
        }
        return tmpData;
};

async function renderPreviewCard() {
    let pokeTypesTempl = "";
    
    document.getElementById('prev_card').innerHTML = ""
    for (let index = 0; index < activePokeData.length; index++) {
        const pokeName = activePokeData[index].name;
        const pokeNumber = getPokeIdFromUrl(activePokeData[index].url)
        const imgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + pokeNumber + ".png";
        pokeTypesTempl = renderTypesTempl(index);

        let tmpHtml = getPrevCardTempl(index, pokeName, imgUrl, pokeTypesTempl, pokeNumber)
        document.getElementById('prev_card').innerHTML += tmpHtml
    }
    
};

async function loadAllPokeNames() {
    let allPokeObj = await useAPI('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
    allPokemons = allPokeObj['results'];
    // console.log(searchForPokeName("pol"))
    console.table(activePokeData);
}

async function loadSearchResInToActData(searchResults) {
    activePokeData = searchResults;
    await loopActivePokeData();
    await loadAllPokeNames();
    renderPreviewCard();
}

function searchForPokeName(pokeName) {
    // let pokeName = document.getElementById('search_string').value;
    let searchResults = [];
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
    if (Array.isArray(searchResults) && searchResults.length) {
        pokeDetailData = [];
        activePokeData = [];
        loadSearchResInToActData(searchResults);
    }
}


async function getEvolutionChainData(chainData) {
    let evolutionArray = [];
    async function traverseChain(chain) {
        const pokeName = chain.species.name;
        const detailUrl = BASE_URL + "/" + pokeName;
        const detailData = await useAPI(detailUrl);
        let imageUrl = null;
        if (detailData && detailData.sprites && detailData.sprites.other && detailData.sprites.other["official-artwork"]) {
            imageUrl = detailData.sprites.other["official-artwork"].front_default;
        }
        evolutionArray.push({ name: pokeName, image_url: imageUrl});
        for (const nextEvolution of chain.evolves_to) {
            await traverseChain(nextEvolution);
        }
    }
    await traverseChain(chainData);
    return evolutionArray;
};

async function loadModalCard(dataIndex) {
    activePokeIndex = dataIndex
    await fillPokeEvoChain(dataIndex);
    renderModalCardMain(dataIndex);
    renderModalCardStats(dataIndex);
    renderEvoChain();
};

async function renderEvoChain() {
    const evoChain = pokeEvoChain[0];
    let evoChainHtml = ""
    for (let index = 0; index < evoChain.length; index++) {
        const pokeName = evoChain[index].name;
        const imgUrl = evoChain[index].image_url;
        evoChainHtml += getEvoTempl(pokeName, imgUrl);
        if (index < evoChain.length - 1) {
            evoChainHtml += getEvoArrowtempl();
        }
    }
    document.getElementById('poke_evo_chain').innerHTML = evoChainHtml;
};

function renderModalCardStats(id) {
    let hp = pokeDetailData[id].stats[0].base_stat;
    let attack = pokeDetailData[id].stats[1].base_stat;
    let defense = pokeDetailData[id].stats[2].base_stat;
    let specAtt = pokeDetailData[id].stats[3].base_stat;
    let specDef = pokeDetailData[id].stats[4].base_stat;
    let speed = pokeDetailData[id].stats[5].base_stat;
    let statsHtml = getStatsTempl(hp, attack, defense, specAtt, specDef, speed)
    document.getElementById('poke_stats_bars').innerHTML = statsHtml;
}

function renderModalCardMain(dataIndex) {
    const pokeNumber = pokeDetailData[dataIndex].pokeId;
    const pokeName = pokeDetailData[dataIndex].name;
    const pokeImgUrl = pokeDetailData[dataIndex].image;
    const typesHtml = renderTypesTempl(dataIndex);
    const pokeHeight = pokeDetailData[dataIndex].height;
    const pokeWeight = pokeDetailData[dataIndex].weight;
    const pokeBaseExp = pokeDetailData[dataIndex].base_experience;
    const pokeAbilities = getAbilitiesString(dataIndex);
    document.getElementById('poke_number').innerHTML = `#${pokeNumber}`;
    document.getElementById('poke_name').innerHTML = `${pokeName}`;
    document.getElementById('poke_modal_img').innerHTML = `<img class="large_image" src="${pokeImgUrl}" alt="">`;
    document.getElementById('poke_type_symbols').innerHTML = typesHtml;
    document.getElementById('poke_height').innerHTML = pokeHeight;
    document.getElementById('poke_weight').innerHTML = pokeWeight;
    document.getElementById('poke_base_exp').innerHTML = pokeBaseExp;
    document.getElementById('poke_abilities').innerHTML = pokeAbilities;
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
}

async function fillPokeEvoChain(dataIndex) {
        pokeEvoChain = [];
        const pokeEntry = activePokeData[dataIndex];
        const pokDetail = await useAPI(pokeEntry.url);
        const speciesUrl = pokDetail.species.url;
        const speciesData = await useAPI(speciesUrl);
        const chainUrl = speciesData.evolution_chain.url;
        const chainData = await useAPI(chainUrl);
        const evolutionChainArray = await getEvolutionChainData(chainData.chain);
        pokeEvoChain.push(evolutionChainArray);
}

function showMore(qty = 10) {
    pokeCount += qty;
    onloadFunction();
}

function renderTypesTempl(dataIndex) {
    let myArray = pokeDetailData[dataIndex].types
    let pokeTypesTempl = "";
    for (let index = 0; index < myArray.length; index++) {        
        let typeName = myArray[index].type.name;
            pokeTypesTempl += getTypeTempl(typeName)
    }
    return pokeTypesTempl
}

function getImgUrl(pokeName) {
    
}

console.log(getPokeIdFromUrl('https://pokeapi.co/api/v2/pokemon/50/'));

function getPokeIdFromUrl(url) {
    const urlObject = new URL(url);
    const pathName = urlObject.pathname;
    const segments = pathName.split('/');
    const id = segments.filter(segment => segment !== '').pop();
    return parseInt(id);
}

async function nextPoke() {
    if (activePokeData.length > activePokeIndex + 1) {
        await loadModalCard(activePokeIndex + 1);
    }
};

async function prevPoke() {
    if (activePokeIndex > 0) {
        await loadModalCard(activePokeIndex - 1);
    }
};
