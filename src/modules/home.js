import supabaseClient from "../backend/supabase/index.js";

const showAllProducts = document.getElementById("showAllProducts");
const showDetails = document.getElementById("showProductDetails");

// let isInWishlist;

// Function to show all products
async function fetchProducts(searchQuery = "") {
  const { data: products, error } = await supabaseClient
    .from("products")
    .select("product_id, name, description, category_id, price, image_url");

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  const cardsContainer = document.querySelector(".cards-container");
  cardsContainer.innerHTML = ""; // Clear existing products

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  filteredProducts.forEach((product) => {
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

// Event listener for search button
document.getElementById("search-button").addEventListener("click", () => {
  const searchQuery = document.getElementById("search-input").value;
  fetchProducts(searchQuery);
});

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

  // Check if the product is already in the wishlist

  const {
    data: {
      session: {
        user: { id: currentUserId },
      },
    },
  } = await supabaseClient.auth.getSession();

  console.log(currentUserId);

  const { data: wishlistData, error: wishlistError } = await supabaseClient
    .from("wishlists")
    .select()
    .eq("product_id", id)
    .eq("user_id", currentUserId);

  if (wishlistError) {
    console.error("Error checking wishlist:", wishlistError);
    return;
  }

  let isInWishlist = wishlistData ? true : false;

  // Create the detail card HTML
  const detailCard = document.createElement("div");
  detailCard.classList.add(
    "max-w-lg",
    "mx-auto",
    "bg-white",
    "rounded-xl",
    "shadow-md",
    "overflow-hidden",
    "md:max-w-2xl",
    "lg:max-w-6xl"
  );

  detailCard.innerHTML = `
    <div class="lg:flex ">
      <div class="md:shrink-0">
        <img class="h-full w-full object-cover md:h-full lg:w-96" src="${
          data.image_url
        }" alt="${data.name}">
      </div>
      <div class="p-8">
        
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
        <div class="mt-4 flex items-center justify-between">
        <div>
          <button id="decreaseQty" class="bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-500">-</button>
          <span id="quantityDisplay" class="mx-4 text-xl">${quantity}</span>
          <button id="increaseQty" class="bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-500">+</button>
        </div>
        
        <div>

        <!-- Wishlist heart icon -->
        <div class="mt-4">
        <div id="isWishedDiv" class="block"><button id="isWished"><svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6 ">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg></button></div>
        
          
          
          <div id="isNotWishedDiv" class="block"><button id="isNotWished"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181"/></svg></button></div>
          
          
        </div>
        </div>
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
  document.getElementById("addToCart").addEventListener("click", async () => {
    console.log(`Added ${quantity} of product ${data.name} to cart.`);
    console.log(`Total price: $${totalPrice.toFixed(2)}`);

    // Implement add to cart logic here
    const { error: insertError } = await supabaseClient.from("carts").insert([
      {
        product_id: id,
        user_id: currentUserId,
        quantity,
        subprice: basePrice,
        total_price: totalPrice.toFixed(2),
      },
    ]);

    if (insertError) {
      console.error("Error adding to cart:", insertError);
    } else {
      // Show celebration pop-up
      showCelebrationPopup();
    }
  });

  // show heart
  function showHeart() {
    const isWishedDiv = document.getElementById("isWishedDiv");
    const isNotWishedDiv = document.getElementById("isNotWishedDiv");
    if (isInWishlist) {
      // Remove from wishlist
      isWishedDiv.classList.add("hidden");
      isNotWishedDiv.classList.remove("hidden");
    } else {
      // Add to wishlist
      isWishedDiv.classList.remove("hidden");
      isNotWishedDiv.classList.add("hidden");
    }
  }

  showHeart();

  // Add event listener for adding wishlist
  document.getElementById("isNotWished").addEventListener("click", async () => {
    const isWishedDiv = document.getElementById("isWishedDiv");
    const isNotWishedDiv = document.getElementById("isNotWishedDiv");

    const { error: insertError } = await supabaseClient
      .from("wishlists")
      .insert([{ product_id: id, user_id: currentUserId }]);

    if (insertError) {
      console.error("Error adding to wishlist:", insertError);
    } else {
      isWishedDiv.classList.remove("hidden");
      isNotWishedDiv.classList.add("hidden");
      isInWishlist = !isInWishlist;
      showHeart();
      alert("added to wishlist successfully!");
    }
  });

  // Add event listener for removing wishlist
  document.getElementById("isWished").addEventListener("click", async () => {
    const isWishedDiv = document.getElementById("isWishedDiv");
    const isNotWishedDiv = document.getElementById("isNotWishedDiv");

    const { error: deleteError } = await supabaseClient
      .from("wishlists")
      .delete()
      .eq("product_id", id)
      .eq("user_id", currentUserId);

    if (deleteError) {
      console.error("Error removing from wishlist:", deleteError);
    } else {
      isWishedDiv.classList.add("hidden");
      isNotWishedDiv.classList.remove("hidden");
      isInWishlist = !isInWishlist;
      showHeart();
      alert("removed from wishlist successfully!");
    }
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
    // showHeart();
  } else {
    fetchProducts();
  }
};
