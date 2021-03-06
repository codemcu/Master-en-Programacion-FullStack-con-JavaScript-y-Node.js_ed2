var inputIngredients = [];
var recipes;
var cartItems = [];

document.getElementsByClassName("form-inline")[0].addEventListener("submit", function(ev) {
    ev.preventDefault();
});
document.getElementById("add-ingredient-btn").addEventListener("click", function() {
    addIngredientToList(awesomeInput.value);
});
document.getElementById("search-recipes-btn").addEventListener("click", searchRecipesByIngredients);
document.getElementsByClassName("recipes")[0].addEventListener("click", showRecipeDetails);
document.getElementsByClassName("missed-ingredients")[0].addEventListener("click", addToCart);

function createCartItem(item){
    var itemsDropdown = document.getElementsByClassName("dropdown-menu")[0];
    var div = document.createElement("div");
    div.classList.add("dropdown-item-text");
    var itemImage = createImage(item.imageUrl);
    itemImage.classList.add("ingredient");
    var itemName = document.createElement("span");
    var itemText = document.createTextNode(item.name);
    var icon = document.createElement("i");
    icon.classList.add("fas");
    icon.classList.add("fa-window-close");
    icon.classList.add("ml-5");
    icon.dataset.name = item.name;

    itemName.appendChild(itemText);
    div.appendChild(itemImage);
    div.appendChild(itemName);
    div.appendChild(icon);
    itemsDropdown.appendChild(div);
}

function addToCart(ev){
    var itemName = ev.target.dataset.name;
    if(!ingredientExistsInCart(itemName)){
        var item = {
            name: itemName,
            imageUrl: ingredientImageUrl + itemName.replace(" ", "-") + ".jpg"
        };
        cartItems.push(item);
        var cartItemsIndicator = document.querySelector(".fa-shopping-cart > span");
        cartItemsIndicator.classList.add("counter");
        cartItemsIndicator.classList.remove("hidden");
    	cartItemsIndicator.innerText = cartItems.length;

        createCartItem(item);
    }
}

var awesomeInput = document.getElementById("add-ingredient-input");
var awesomeInstance = new Awesomplete(awesomeInput);
awesomeInput.addEventListener("keyup", autocomplete);
awesomeInput.addEventListener("awesomplete-select", function(selection){
    addIngredientToList(selection.text.value);
});

function updateSuggestions(suggestions) {
    var list = JSON.parse(suggestions).map(function(i) { return i.name; });
    awesomeInstance.list = list;
}

function autocomplete(ev) {
    if (ev.keyCode >= 65 && ev.keyCode <= 90){
        var url = autocompleteUrl + "?query=" + awesomeInput.value;
        requestData(url, updateSuggestions);
    }
}

function searchRecipesByIngredients() {
    if (inputIngredients.length > 0) {
        var ingredients = inputIngredients.join("%2C");
        var fillIngredients = true;
        var limitLicense = false;
        var number = 20;
        var ranking = 2;

        var parameters = "?ingredients=" + ingredients + "&fillIngredients=" + fillIngredients + "&limitLicense=" + limitLicense + "&number=" + number + "&ranking=" + ranking;
        var completeUrl = searchRecipesUrl.concat(parameters);

        requestData(completeUrl, displayRecipesInView);
    }
    else {
        console.log("Error searching for recipes. There are no ingredients to use.");
    }
}

function findRecipeByImageUrl(ev){
    var recipeId = ev.target.dataset.id;
    return recipes.find(recipe => {
        return recipe.id == recipeId;
    });
}

function showRecipeDetails(ev){
    if (isTargetValid(ev)) {
        var recipe = findRecipeByImageUrl(ev);
        if(recipe){
            showModal(recipe);
        }
    }
}

function isTargetValid(ev) {
    return ev.target.className === "recipe-image" || ev.target.className === "recipe-name";
}

function showModal(recipe) {
    fillModal(recipe);
    $("#exampleModal").modal("toggle");
}

function fillModal(recipe) {
    fillRecipeImage(recipe.id);
    fillRecipeDetails(recipe);
}

function fillRecipeImage(recipeId){
    var recipeImage = document.querySelector(".modal-body .recipe-image");
    recipeImage.src = recipeImageUrl + recipeId + "-636x393.jpg";
}

function fillRecipeDetails(recipe) {
    fillRecipeName(recipe);
    fillUnusedIngredients(recipe);
    fillMissingIngredients(recipe);
    var url = recipeInstructionsUrl + recipe.id + "/information";
    requestData(url, fillRecipeInstructions);
}

function fillRecipeName(recipe) {
    var name = document.querySelector(".recipe-details");
    removeChildrenFromNode(name);
    var title = document.createElement("h1");
    var textNode = document.createTextNode(recipe.title);
    title.appendChild(textNode);
    name.appendChild(title);
}

function fillUnusedIngredients(recipe){
    var unusedIngredientsElement = document.getElementsByClassName("unused-ingredients")[0];
    removeChildrenFromNode(unusedIngredientsElement);
    for(var ingredient of recipe.unusedIngredients) {
        var li = document.createElement("li");
        li.innerText = ingredient.name;

        unusedIngredientsElement.appendChild(li);
    }
}

function fillMissingIngredients(recipe){
    var missedIngredientsElement = document.getElementsByClassName("missed-ingredients")[0];
    removeChildrenFromNode(missedIngredientsElement);
    for(var ingredient of recipe.missedIngredients) {
        var li = document.createElement("li");
        li.innerText = ingredient.originalString;
        var icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add("fa-cart-plus");
        icon.dataset.name = ingredient.name;

        li.appendChild(icon);
        missedIngredientsElement.appendChild(li);
    }
}

function fillRecipeInstructions(data){
    var recipe = JSON.parse(data);
    if (recipe.instructions) {
        var recipeSteps = document.getElementsByClassName("recipe-steps")[0];
        removeChildrenFromNode(recipeSteps);
        var instructions = document.createTextNode(recipe.instructions);
        recipeSteps.appendChild(instructions);
    }
}

function displayRecipesInView(data){
    recipes = JSON.parse(data);
    var numberOfCols = 3;

    var container = document.getElementsByClassName("container")[0];
    removeChildrenFromNode(container);

    var sectionTitle = document.createElement("h1");
    var textNode = document.createTextNode("Some recipes you can try");
    sectionTitle.appendChild(textNode);

    chunkedData = chunkArray(recipes, numberOfCols);

    var rowElement = createRow();
    for(var colIndex = 0; colIndex < numberOfCols; colIndex++) {
        var colElement = createColumn();
        fillColumnWithRecipes(colIndex, colElement, numberOfCols, chunkedData[colIndex]);
        rowElement.appendChild(colElement);
    }

    container.appendChild(sectionTitle);
    container.appendChild(rowElement);
}

function createOverlay(){
    var overlayElement = document.createElement("div");
    overlayElement.classList.add("overlay");
    overlayElement.classList.add("mx-auto");
    overlayElement.classList.add("my-1");
    return overlayElement;
}

function fillColumnWithRecipes(colIndex, colElement, numberOfCols, data) {
    var numberOfRecipesInCol = data.length;
    for(var i = 0; i < numberOfRecipesInCol; i++) {
        var overlayElement = createOverlay();
        var imgElement = createImage(data[i].image);
        imgElement.classList.add("recipe-image");
        imgElement.dataset.id = data[i].id;
        overlayElement.appendChild(imgElement);
        var nameElement = createName(data[i].title);
        nameElement.dataset.id = data[i].id;
        overlayElement.appendChild(nameElement);
        colElement.appendChild(overlayElement);
    }
}

function createRow() {
    var rowElement = document.createElement("div");
    rowElement.classList.add("row");
    return rowElement;
}

function createColumn() {
    var colElement = document.createElement("div");
    colElement.classList.add("col-lg-4");
    colElement.classList.add("p-0");
    return colElement;
}

function createImage(imageUrl) {
    var imgElement = document.createElement("img");
    imgElement.src = imageUrl;
    return imgElement;
}

function createName(name){
    var nameElement = document.createElement("p");
    nameElement.classList.add("recipe-name");
    var nameText = document.createTextNode(name);
    nameElement.appendChild(nameText);
    return nameElement;
}

function addIngredientToList(newIngredient){
    var ingredientsContainer = document.getElementsByClassName("input-ingredients")[0];
    if(inputIngredients.length === 0) {
        document.querySelector(".input-ingredients > h1").classList.add("d-none");
    }

    if (!ingredientExists(newIngredient)){
        inputIngredients.push(newIngredient);

        var div = document.createElement("div");
        var img = document.createElement("img");
        img.classList.add("ingredient");
        img.src = ingredientImageUrl + newIngredient.replace(" ", "-") + ".jpg";
        var p = document.createElement("p");
        var textNode = document.createTextNode(newIngredient);
        p.appendChild(textNode);
        div.appendChild(img);
        div.appendChild(p);
        ingredientsContainer.appendChild(div);
    }
    else {
        console.log("The entered ingredient already exists in the list");
    }
}

function ingredientExists(ingredient) {
    var exists = inputIngredients.indexOf(ingredient);
    return (exists !== -1) ? true : false;
}

function ingredientExistsInCart(ingredient) {
    var list = cartItems.map(function(i) { return i.name; });
    var exists = list.indexOf(ingredient);
    return (exists !== -1) ? true : false;
}
