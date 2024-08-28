import supabaseClient from "../backend/supabase/index.js";

const showAllProducts = document.getElementById("showAllProducts");
const showDetails = document.getElementById("showProductDetails");

// Function to show all products
async function fetchProducts() {
  const { data: products, error } = await supabaseClient
    .from("products")
    .select("product_id, name, description, category_id, price, image_url");

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  const cardsContainer = document.querySelector(".cards-container");
  cardsContainer.innerHTML = ""; // Clear existing products

  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("card", "group", "relative");

    // on click show details
    card.addEventListener("click", () =>
      showProductDetails(product.product_id)
    );

    card.innerHTML = `
      <div
        class="card-img aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80"
      >
        <img
          src="${product.image_url}"
          alt="${product.description}"
          class="h-full w-full object-cover object-center lg:h-full lg:w-full"
        />
      </div>
      <div class="card-details mt-4 flex justify-between">
        <div>
          <h3 class="card-details__title text-sm text-gray-700">
            <a href="#">
              <span aria-hidden="true" class="absolute inset-0"></span>
              ${product.name}
            </a>
          </h3>
        </div>
        <p class="card-details__price text-sm font-bold text-gray-900">
          $${product.price}
        </p>
      </div>
    `;
    cardsContainer.appendChild(card);
  });
}

// Function to show product details
const showProductDetails = async (id) => {
  showAllProducts.classList.add("hidden");
  showDetails.classList.remove("hidden");

  const { data, error } = await supabaseClient
    .from("products")
    .select("product_id, name, description, category_id, price, image_url")
    .eq("product_id", id)
    .single();

  if (error) {
    console.error("Error fetching product details:", error);
    return;
  }

  // Save product ID to localStorage
  localStorage.setItem("currentProduct", id);

  // Clear the previous content of showDetails div
  showDetails.innerHTML = "";

  // Initial quantity and base price
  let quantity = 1;
  const basePrice = data.price;
  let totalPrice = basePrice;

  // Function to update quantity and price display
  const updateDisplay = () => {
    document.getElementById("quantityDisplay").innerText = quantity;
    document.getElementById("totalPrice").innerText = `$${totalPrice.toFixed(
      2
    )}`;
  };

  // Create the detail card HTML
  const detailCard = document.createElement("div");
  detailCard.classList.add(
    "max-w-lg",
    "mx-auto",
    "bg-white",
    "rounded-xl",
    "shadow-md",
    "overflow-hidden",
    "md:max-w-2xl"
  );

  detailCard.innerHTML = `
    <div class="md:flex">
      <div class="md:shrink-0">
        <img class="h-full w-full object-cover md:h-full md:w-48" src="${
          data.image_url
        }" alt="${data.name}">
      </div>
      <div class="p-8">
        <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">${
          data.category_id
        }</div>
        <h1 class="block mt-1 text-lg leading-tight font-medium text-black">${
          data.name
        }</h1>
        <p class="mt-2 text-gray-500">${
          data.description ? data.description : "No description available."
        }</p>
        <p id="totalPrice" class="mt-4 text-2xl font-bold text-gray-900">$${totalPrice.toFixed(
          2
        )}</p>
        
        <!-- Quantity control -->
        <div class="mt-4 flex items-center">
          <button id="decreaseQty" class="bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-500">-</button>
          <span id="quantityDisplay" class="mx-4 text-xl">${quantity}</span>
          <button id="increaseQty" class="bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-500">+</button>
        </div>
        
        <!-- Add to cart button -->
        <button id="addToCart" class="mt-4 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700">
          Add to Cart
        </button>

        <!-- Return to All Products button -->
        <button id="returnToAll" class="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-400">
          Return to All Products
        </button>
      </div>
    </div>
  `;

  // Append the detail card to the showDetails div
  showDetails.appendChild(detailCard);

  // Add event listeners for quantity control
  document.getElementById("increaseQty").addEventListener("click", () => {
    quantity += 1;
    totalPrice = basePrice * quantity;
    updateDisplay();
  });

  document.getElementById("decreaseQty").addEventListener("click", () => {
    if (quantity > 1) {
      quantity -= 1;
      totalPrice = basePrice * quantity;
      updateDisplay();
    }
  });

  // Add event listener for adding to cart
  document.getElementById("addToCart").addEventListener("click", () => {
    console.log(`Added ${quantity} of product ${data.name} to cart.`);
    console.log(`Total price: $${totalPrice.toFixed(2)}`);

    // Implement add to cart logic here

    // Show celebration pop-up
    showCelebrationPopup();
  });

  // Add event listener for returning to all products
  document.getElementById("returnToAll").addEventListener("click", () => {
    // Clear localStorage and show all products
    localStorage.removeItem("currentProduct");
    showDetails.classList.add("hidden");
    showAllProducts.classList.remove("hidden");
    showDetails.innerHTML = "";
  });
};

// Celebration popup
function showCelebrationPopup() {
  // Create pop-up container
  const popup = document.createElement("div");
  popup.classList.add(
    "fixed",
    "inset-0",
    "flex",
    "items-center",
    "justify-center",
    "bg-gray-800",
    "bg-opacity-75"
  );

  // Pop-up content
  popup.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-sm text-center">
      <h2 class="text-2xl text-green-500 font-bold mb-4">Success!</h2>
      <p class="mb-6">Your items have been successfully added to your cart!</p>
      <div class="space-x-4">
        <button id="goToCart" class="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600">Go to Cart</button>
        <button id="seeOtherProducts" class="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-400">See Other Products</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Event listener for "Go to Cart" button
  document.getElementById("goToCart").addEventListener("click", () => {
    window.location.href = "/src/pages/Cart/index.html"; // Redirect to the cart page
  });

  // Event listener for "See Other Products" button
  document.getElementById("seeOtherProducts").addEventListener("click", () => {
    // Clear localStorage and show all products
    localStorage.removeItem("currentProduct");
    showDetails.classList.add("hidden");
    showAllProducts.classList.remove("hidden");
    popup.remove(); // Remove the popup
  });
  showDetails.innerHTML = "";
}

// Check if a product ID is stored in localStorage
window.onload = () => {
  const storedProductId = localStorage.getItem("currentProduct");
  if (storedProductId) {
    showProductDetails(storedProductId);
  } else {
    fetchProducts();
  }
};
