const recipeForm = document.querySelector(".recipe-form");
const recipeName = document.getElementById("recipeName");
const ingredients = document.getElementById("user-ing");
const steps = document.getElementById("user-steps");
const imageURL = document.getElementById("user-img");
let displayArea = document.querySelector(".recipe-display");
let errorHandle = document.querySelector(".error");
const editBtn = document.querySelector(".edit-button");
const addFormBtn = document.getElementById("add-form-btn");
const formTitle = document.querySelector(".form-title");
let errorLoading = document.getElementById("error-loading");

// Array to store recipes
let recipes = [];

const API_BASE_URL = "http://127.0.0.1:8000";

// function to validate URL
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Load recipes from API on page load
async function loadRecipes() {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`);
    const data = await response.json();
    recipes = data;
    updateDisplay();
  } catch (error) {
    errorLoading.textContent = "Error loading recipes";
  }
}

// Initialize - loading recipes from API
loadRecipes();

// Event listener for form submission
recipeForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const editIndex = recipeForm.getAttribute("data-edit-index");

  let enteredRecipeName = recipeName.value;
  let enteredIngredients = ingredients.value;
  let enteredSteps = steps.value;
  let enteredImg = imageURL.value;

  try {
    // Validate that all fields are filled in
    if (
      !enteredRecipeName ||
      !enteredIngredients ||
      !enteredSteps ||
      !enteredImg
    ) {
      throw new Error("Please fill in all fields.");
    }

    if (!isValidURL(enteredImg)) {
      errorHandle.style.color = "red";
      errorHandle.textContent = "Invalid image URL";
      return;
    }

    let newRecipe = {
      name: enteredRecipeName,
      ingredients: enteredIngredients.split("\n"),
      steps: enteredSteps,
      image: enteredImg,
    };

    if (editIndex !== null) {
      // If editing (it has an index), update the recipe at the editIndex

      await updateRecipe(editIndex, newRecipe);
    } else {
      // If adding (it doesn't have an index), create a new recipe
      await createRecipe(newRecipe);
    }

    updateDisplay();

    errorHandle.textContent = formTitle.textContent.includes("Edit Recipe")
      ? "Recipe modified successfully!"
      : "Recipe added successfully!";
    errorHandle.style.color = "green";

    // Clear form fields
    recipeName.value = "";
    ingredients.value = "";
    steps.value = "";
    imageURL.value = "";

    // Clear edit index after submission
    recipeForm.removeAttribute("data-edit-index");

    // Restore button text and form title for adding new recipe
    addFormBtn.textContent = "Add Recipe";
    formTitle.textContent = "Add Recipe";
  } catch (error) {
    errorHandle.textContent = error.message;
    errorHandle.style.color = "red";
  }
});

// Create a new recipe via API
async function createRecipe(recipe) {
  try {
    await fetch(`${API_BASE_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipe),
    });
  } catch (error) {
    errorHandle.textContent = `Error creating recipe: ${error}`;
  }
}
// Update an existing recipe via API
async function updateRecipe(index, recipe) {
  try {
    await fetch(`${API_BASE_URL}/recipes/${recipes[index].id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipe),
    });
  } catch (error) {
    errorHandle.textContent = `Error updating recipe: ${error}`;
  }
}

// Delete a recipe via API
async function deleteRecipe(index) {
  try {
    await fetch(`${API_BASE_URL}/recipes/${recipes[index].id}`, {
      method: "DELETE",
    });
    // recipes = recipes.filter((recipe) => recipe.id !== recipeId);
    updateDisplay();
  } catch (error) {
    errorHandle.textContent = `Error deleting recipe: ${error}`;
  }
}

// Display a recipe on the page
function displayRecipe(recipe, index) {
  const formattedSteps = recipe.steps
    ? recipe.steps
        .split("\n")
        .map((step) => `<li>${step.trim()}</li>`)
        .join("")
    : "";

  const recipeHtml = `
    <div class="one-recipe">
    <button class="delete-button" data-index="${index}">
          <svg class ="delete-button-img" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
    </button>
      <h2 class="recipe-name">${recipe.name}</h2>
      <p class="recipe-ingredients"><span>ingredients: </span> ${recipe.ingredients}</p>
      <ol class="recipe-steps"><span> steps: </span> ${formattedSteps}</ol>
      <img src="${recipe.image}" alt="${recipe.name}">
      <button class="edit-button" data-index="${index}">Edit</button>
      
    </div>
  `;

  displayArea.innerHTML += recipeHtml;
}

// Event listener for delete button clicks
displayArea.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-button-img")) {
    const index = event.target.parentElement.dataset.index;
    // console.log(index);
    deleteRecipe(index);
  }
});

// Update the display with all recipes
function updateDisplay() {
  displayArea.innerHTML = ""; // Clear the display area
  recipes.forEach((recipe, index) => {
    displayRecipe(recipe, index); // Display each recipe from the array
  });
}

// Edit a recipe
displayArea.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-button")) {
    // console.log(event.target.dataset);
    const index = event.target.dataset.index;
    editRecipe(index);
  }
});

// Edit a recipe by index, changing the title and btn text content
function editRecipe(index) {
  const recipe = recipes[index];
  // console.log(recipe);

  recipeName.value = recipe.name;
  ingredients.value = recipe.ingredients;
  steps.value = recipe.steps;
  imageURL.value = recipe.image;

  addFormBtn.textContent = "Save";
  formTitle.textContent = "Edit Recipe";

  recipeForm.setAttribute("data-edit-index", index);
}
