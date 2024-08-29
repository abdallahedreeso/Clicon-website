import supabaseClient from "../backend/supabase/index.js";


// Responsive Nav
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

 window.CounterClick=function(button, click) {
    // Find the closest parent div and then locate the input element within it
    const parentDiv = button.closest('.flex');

    // Find the input element that shows the current count
    const totalClicks = parentDiv.querySelector('.counter-input');
    var currentValue = parseInt(totalClicks.value); // Get current value from the input field
    var sumValue = currentValue + click;
    
    // Prevent the count from going negative
    if (sumValue < 0) {
        sumValue = 0;
    }
    
    // Update the input field with the new value
    totalClicks.value = sumValue; 
    
    // Get the price for this item from the second column (td:nth-child(2))
    var priceElement = parentDiv.closest('tr').querySelector('td:nth-child(2)');
    var price = parseFloat(priceElement.innerText.replace('$', ''));

    // Update the subtotal for this item in the last column (td.subtotal)
    var subTotal = parentDiv.closest('tr').querySelector('.subtotal');
    subTotal.textContent = "$" + (sumValue * price);

    // Update the total for the cart
    updateCartTotal();
}

function updateCartTotal() {
    // Get all the subtotal elements
    var subTotalElements = document.querySelectorAll('.subtotal');
    var total = 0;

    // Calculate the total by summing up all the subtotals
    subTotalElements.forEach(function(subTotalElement) {
        var subTotalValue = parseFloat(subTotalElement.innerText.replace('$', ''));
        total += subTotalValue;
    });

    // Update the total value in the Cart Totals section
    document.querySelector('.cart-total').textContent = "$" + total;
    document.querySelector('.cart-subtotal').textContent = "$" + total;
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartTotal(); // Initialize the cart total on page load
});

//Popup Window
document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.querySelector('.bg-black');
    const popup = document.getElementById('popup');
    const closeButton = document.getElementById('close-popup');

    // Show the popup
    checkoutButton.addEventListener('click', () => {
        popup.classList.remove('hidden');
    });

    // Hide the popup
    closeButton.addEventListener('click', () => {
        popup.classList.add('hidden');
    });
});


//------------------------------------------------------------------------//

async function fetchCartItems() {
    const { data: cartItems, error } = await supabaseClient
        .from('carts')
        .select('product_id')
        .eq('user_id', '333722dd-10bf-4429-9f38-f2922fb3725c');  
    
    if (error) {
        console.error('Error fetching cart items:', error);
        return;
    }

    const productIds = cartItems.map(item => item.product_id);

    const { data: products, error: productError } = await supabaseClient
        .from('products')
        .select('name, price, quantity, image_url')
        .in('product_id', productIds);
    
    if (productError) {
        console.error('Error fetching products:', productError);
        return;
    }

    displayCartItems(products);
}

function displayCartItems(products) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = ''; // Clear any existing content

    let cartSubtotal = 0;

    products.forEach(product => {
        var totalPrice = product.price * 1;
        cartSubtotal += totalPrice;

        const row = document.createElement('tr');
        row.classList.add('border-t');

        row.innerHTML = `
            <td class="py-4">
                <img src="${product.image_url}" alt="${product.name}" class="inline-block h-20 w-20">
                <span class="ml-4">${product.name}</span>
          </td>
          <td class="py-4">$${product.price.toFixed(2)}</td>
            <td class="py-4">
              <div class="flex items-center">
                  <button onclick="CounterClick(this, -1)" class="text-gray-500 hover:text-gray-900 px-2">-</button>
                  <input type="text" value="1" class="counter-input w-12 text-center bg-gray-100 border border-gray-300 rounded-md">
                   <button onclick="CounterClick(this, 1)" class="text-gray-500 hover:text-gray-900 px-2">+</button>
               </div>
         </td>
          <td class="py-4 subtotal">$${totalPrice.toFixed(2)}</td>
       `;
       var totalPrice = product.price * product.quantity;

    tbody.appendChild(row);
      });

    document.querySelector('.cart-subtotal').textContent = `$${cartSubtotal.toFixed(2)}`;
    document.querySelector('.cart-total').textContent = `$${cartSubtotal.toFixed(2)}`;
}

fetchCartItems();





