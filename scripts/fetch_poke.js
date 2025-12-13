const BASE_URL = "https://pokeapi.co/api/v2/pokemon"; 
let activeData = [];
let pokeCount = 100;
let pokeOffset = 80;
let pokeDetailData = []; 

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

async function loopActiveData() {
    for (let i = 0; i < activeData.length; i++) {
        const pokeEntry = activeData[i];
        const pokDetail = await useAPI(pokeEntry.url);
        const speciesUrl = pokDetail.species.url;
        const speciesData = await useAPI(speciesUrl);
        const chainUrl = speciesData.evolution_chain.url;
        const chainData = await useAPI(chainUrl);
        const evolutionChainArray = await getEvolutionChainData(chainData.chain);
        pokeDetailData.push(filledDataArray(pokeEntry, pokDetail, evolutionChainArray));
        // console.log(pokeDetailData);
    }
};

function filledDataArray(pokeEntry, pokDetail, evolutionChainArray) {
        let tmpData = {
            "name": pokeEntry.name,
            "weight": pokDetail.weight,
            "height": pokDetail.height,
            "image": pokDetail.sprites.other["official-artwork"].front_default,
            "base_experience": pokDetail.base_experience,
            "stats" : pokDetail.stats,
            "types" : pokDetail.types,
            "abilities" : pokDetail.abilities,
            "evolution_chain": evolutionChainArray 
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

    console.log(getImgUrl(0));

   renderPrevCard();
};

function renderPrevCard() {
    let pokeTypesTempl = "";
    
    document.getElementById('prev_card').innerHTML = ""
    for (let index = 0; index < activeData.length; index++) {
        const pokeName = activeData[index].name;
        const imgUrl = getImgUrl(index);
        pokeTypesTempl = renderTypesTempl(index);
        let tmpHtml = getPrevCardTempl(index, pokeName, imgUrl, pokeTypesTempl)
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

function renderPokeBoxes() {
    for (let index = 0; index < activeData.length; index++) {
        const element = activeData[index];
        
    }
}
