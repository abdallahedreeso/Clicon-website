import supabaseClient from "../backend/supabase/index.js";
(async function showOrders() {

    let wishes = await retrieveUserData('wishlists', 'user_id');

    let newWishListBody = document.createElement('tbody');

    for (const wish of wishes) {
        const { product_id, user_id, wishlist_id } = wish;

        let products = await getDataById('products', 'product_id', product_id);

        for (const product of products) {
            const { name, price, image_url, quantity } = product;
            let newWishListRow = document.querySelector('.items').cloneNode(true);
            let newWishListRowCell = newWishListRow.firstElementChild;
            let removeBtn = document.createElement('button');
            let buyBtn = document.createElement('button');
            let dataInItemsList = [image_url, name, 'out of stock', '$' + price];
            let status = newWishListRow.querySelector('td:nth-child(3)');
            for (let i = 0; i < dataInItemsList.length; i++) {
                if (i === 0) {
                    let productImage = document.createElement('img');
                    productImage.src = dataInItemsList[0];
                    productImage.className = 'w-16 max-w-full max-h-full';
                    newWishListRowCell.appendChild(productImage);
                } else {
                    newWishListRowCell.innerText = dataInItemsList[i];
                }
                newWishListRowCell = newWishListRowCell.nextElementSibling;
            }
            if (quantity > 0) {
                status.innerText = 'in stock';
                status.classList.add('text-green-600');
            } else {
                status.classList.add('text-red-600');
            }
            buyBtn.className = "font-medium text-blue-600 px-6 py-4 hover:underline w-full";
            buyBtn.innerText = "buy";
            buyBtn.product_id = product_id;
            buyBtn.addEventListener('click', async () => {
                window.location.href = '/src/pages/Home/index.html';
            });
            removeBtn.className = "font-medium text-red-600 px-6 py-4 hover:underline w-full";
            removeBtn.innerText = "remove";
            removeBtn.wish_id = wishlist_id;
            removeBtn.addEventListener('click', () => {
                removeDataById('wishlists', 'wishlist_id', wishlist_id);
                removeBtn.parentNode.parentNode.remove();
            });
            if (quantity > 0) {
                newWishListRow.querySelector('td:nth-child(5)').append(buyBtn, removeBtn);
            } else {
                newWishListRow.querySelector('td:nth-child(5)').appendChild(removeBtn);
            }
            newWishListBody.appendChild(newWishListRow);
        }
    }
    document.querySelector('.wish-list-body').replaceWith(newWishListBody);
})();

async function getDataById(table, idColumn, id) {
    const { data, error } = await supabaseClient
        .from(table)
        .select()
        .eq(idColumn, id);
    if (error) {
        console.error("Error fetching data from " + table + ":", error);
        return;
    }
    return data;

}
async function removeDataById(table, idColumn, id) {
    const response = await supabaseClient
        .from(table)
        .delete()
        .eq(idColumn, id);
    console.log(response);

}

async function retrieveUserData(table, idColumn) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userId = user.id;
    const { data, error } = await supabaseClient
        .from(table)
        .select()
        .eq(idColumn, userId)
    if (error) {
        console.error("Error fetching data from " + table + ":", error);
        return;
    }
    return data
}