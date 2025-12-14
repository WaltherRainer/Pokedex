function getPrevCardTempl(index, pokeName, imgUrl, typesTempl, id) {
    return `
        <div class="grid_content">
            <div onclick="openDistModal(${index})" class="container card_background">
                <div class="animated_div">
                    <div class="title">#${id}</div>
                    <div class="card">
                        <p>${pokeName}</p>
                        <img class="image" src="${imgUrl}" alt="Pokemon mit dem Namen: ${pokeName}">
                        ${typesTempl}
                    </div>
                </div>
            </div>
        </div>
    `
}

function getTypeTempl(typeName) {
    return `
        <div class="type_icon type-${typeName}" href="">${typeName}</div>
    `
}

function getStatsTempl(hp, attack, defense, specAtt, specDef, speed) {
    return `
        <div class="progress_bar" data-label="hp ${hp}" style="--width: ${hp}"></div>
        <div class="progress_bar" data-label="attack ${attack}" style="--width: ${attack}"></div>
        <div class="progress_bar" data-label="defense ${defense}" style="--width: ${defense}"></div>
        <div class="progress_bar" data-label="special-attack ${specAtt}" style="--width: ${specAtt}"></div>
        <div class="progress_bar" data-label="special-defense ${specDef}" style="--width: ${specDef}"></div>
        <div class="progress_bar" data-label="speed ${speed}" style="--width: ${speed}"></div>
    `
}

function getEvoTempl(pokeName, imgUrl) {
    return `
        <div class="evo_item">
            <img class="tab_image" src="${imgUrl}">
            <h5>${pokeName}</h5>
        </div>
    `
}

function getEvoArrowtempl() {
    return `
        <img src="./assets/icons/chevron-double-right.svg">
    `
}

