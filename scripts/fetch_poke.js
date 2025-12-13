const BASE_URL = "https://pokeapi.co/api/v2/pokemon"; 
let activeData = [];
let pokeCount = 10;
let pokeOffset = 0;
let pokeDetailData = []; 
let pokeEvoChain = [];

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

async function useAPI(path) {
    const apiData = await loadData(path); 
    return apiData;
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
        evolutionArray.push({
            name: pokeName,
            image_url: imageUrl
        });
        for (const nextEvolution of chain.evolves_to) {
            await traverseChain(nextEvolution);
        }
    }
    await traverseChain(chainData);
    return evolutionArray;
};

function loadModalCard(id) {
    fillPokeEvoChain(id);
    renderModalCard(id);
}

function renderModalCard(id) {
    const pokeNumber = id + 1 + pokeOffset;
    const pokeName = pokeDetailData[id].name;
    // document.getElementById('poke_number').innerHTML = `#${pokeNumber}`
    // document.getElementById('poke_name').innerHTML = `${pokeName}`
}


async function fillPokeEvoChain(id) {
        const pokeEntry = activeData[id];
        const pokDetail = await useAPI(pokeEntry.url);
        const speciesUrl = pokDetail.species.url;
        const speciesData = await useAPI(speciesUrl);
        const chainUrl = speciesData.evolution_chain.url;
        const chainData = await useAPI(chainUrl);
        const evolutionChainArray = await getEvolutionChainData(chainData.chain);
        pokeEvoChain.push(evolutionChainArray);
}

async function loopActiveData() {
    for (let i = 0; i < activeData.length; i++) {
        const pokeEntry = activeData[i];
        const pokDetail = await useAPI(pokeEntry.url);


        // const speciesUrl = pokDetail.species.url;
        // const speciesData = await useAPI(speciesUrl);
        // const chainUrl = speciesData.evolution_chain.url;
        // const chainData = await useAPI(chainUrl);
        // const evolutionChainArray = await getEvolutionChainData(chainData.chain);


        pokeDetailData.push(filledDataArray(pokeEntry, pokDetail));
        // console.log(pokeDetailData);
    }
};

function filledDataArray(pokeEntry, pokDetail) {
        let tmpData = {
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

async function onloadFunction() {
    let pokData = await useAPI(); 
    
    activeData = pokData["results"];
    await loopActiveData();
    // console.table(activeData);
    // console.table(activeData.length);
    console.table(pokeDetailData);
    // console.table(pokeDetailData[7].evolution_chain);
    // console.table(pokeDetailData[7].types.length);

    // console.log(getImgUrl(0));

   renderPrevCard();
   

//    console.log(pokeEvoChain);
};

async function renderPrevCard() {
    let pokeTypesTempl = "";
    
    document.getElementById('prev_card').innerHTML = ""
    for (let index = 0; index < activeData.length; index++) {
        const pokeName = activeData[index].name;
        const imgUrl = getImgUrl(index);
        const pokeNumber = index + 1 + pokeOffset 
        pokeTypesTempl = renderTypesTempl(index);
        let tmpHtml = getPrevCardTempl(index, pokeName, imgUrl, pokeTypesTempl, pokeNumber)
        document.getElementById('prev_card').innerHTML += tmpHtml
    }
    
};

function getImgUrl(id) {
    return pokeDetailData[id].image;
}

function renderTypesTempl(id) {
    let myArray = pokeDetailData[id].types
    let pokeTypesTempl = "";
    for (let index = 0; index < myArray.length; index++) {        
        let typeName = myArray[index].type.name;
            pokeTypesTempl += getTypeTempl(typeName)
    }
    return pokeTypesTempl
}

