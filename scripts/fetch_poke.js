const BASE_URL = "https://pokeapi.co/api/v2/pokemon"; 

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

async function loadAllPokeNames() {
    let allPokeObj = await useAPI('https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0');
    allPokemons = allPokeObj['results'];
}

async function loadSearchResInToActData(searchResults) {
    activePokeData = searchResults;
    await loopActivePokeData();
    await loadAllPokeNames();
    renderPreviewCard();
};

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
};

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




