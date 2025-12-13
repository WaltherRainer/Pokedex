function getPrevCardTempl(index, pokeName, imgUrl, typesTempl) {
    return `
        <div class="grid_content">
            <div onclick="openDistModal(${index})" class="container card_background">
                <div class="animated_div">
                    <div class="title">#${index + 1}</div>
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

