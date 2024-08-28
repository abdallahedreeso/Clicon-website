import supabaseClient from "../backend/supabase/index.js";

(async function showOrders() {

    let orders = await retrieveUserData('orders','user_id');

    let newOrdersListBody = document.createElement('tbody');
    let orderItems = [];

    for (const order of orders) {
        const { order_id, order_status, date, user_id } = order;

        let order_products = await getDataById('order_products', 'order_id',order_id);
        let sum = 0;
        let newItemsListBody = document.createElement('tbody'); 
        newItemsListBody.className = 'items-list-body';

        for (const product of order_products) {
            const { product_id, quantity } = product;
            let productData = await getDataById('products', 'product_id', product_id);
            const { name, price, image_url } = productData[0];

            let newItemsListRow = document.querySelector('.items').cloneNode(true);
            let newItemsListRowCell = newItemsListRow.firstElementChild;
            let dataInItemsList = [image_url, name, quantity, '$' + price, '$' + (price * quantity)];

            for (let i = 0; i < dataInItemsList.length; i++) {
                if (i === 0) {
                    let productImage = document.createElement('img');
                    productImage.src = dataInItemsList[0];
                    productImage.className = 'w-16 max-w-full max-h-full';
                    newItemsListRowCell.appendChild(productImage);
                } else {
                    newItemsListRowCell.innerText = dataInItemsList[i];
                }
                newItemsListRowCell = newItemsListRowCell.nextElementSibling;
            }

            newItemsListBody.appendChild(newItemsListRow);
            sum += price * quantity;
        }

        let totalRow = document.createElement('tr');
        let title = document.createElement('td');
        let total = document.createElement('td');

        totalRow.className = 'bg-white border-b font-semibold text-black  hover:bg-gray-50';
        title.className = 'px-6 py-4 text-lg';
        total.className = 'px-6 py-4';

        title.colSpan = '4';
        title.innerText = "Total";
        total.innerText = '$' + sum.toFixed(2);

        totalRow.append(title, total);
        newItemsListBody.appendChild(totalRow);
        orderItems.push({ id: order_id, body: newItemsListBody });

        let newOrdersListRow = document.querySelector('.order').cloneNode(true);
        let newOrdersListRowCell = newOrdersListRow.firstElementChild;
        let dataInOrder = [order_id, order_status, date, '$' + sum.toFixed(2)];

        for (let i = 0; i < dataInOrder.length; i++) {
            newOrdersListRowCell.innerText = dataInOrder[i];
            newOrdersListRowCell = newOrdersListRowCell.nextElementSibling;
        }

        // Set the color based on the order status
        newOrdersListRow.querySelector('td:nth-child(2)').style.color = order_status === 'pending' ? 'orange' : order_status === 'accepted' ? 'green' : 'red';

        let actionsCell = document.createElement('td');
        let detailsBtn = document.createElement('button');

        actionsCell.className = "flex space-x-4 px-6 py-4 w-full";
        detailsBtn.className = "font-medium text-blue-600 hover:underline accept w-full";
        
        detailsBtn.innerText = "View details";

        detailsBtn.order_id = order_id;

        detailsBtn.addEventListener('click', () => {
            let itemsList = orderItems.find(obj => obj.id === detailsBtn.order_id);
            document.querySelector('.items-list-body').replaceWith(itemsList.body);
            document.querySelector('.orders-table').hidden = true;
            document.querySelector('.items-table').hidden = false;
        });

        actionsCell.appendChild(detailsBtn); 
        newOrdersListRow.appendChild(actionsCell);
        newOrdersListBody.appendChild(newOrdersListRow);
    }

    let returnBtn = document.querySelector('.returnBtn');
    returnBtn.addEventListener('click', () => {
        document.querySelector('.orders-table').hidden = false;
        document.querySelector('.items-table').hidden = true;
    });

    document.querySelector('.orders-list-body').replaceWith(newOrdersListBody);
})();

async function getDataById(table,idColumn, id) {
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

async function retrieveUserData(table,idColumn) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userId = user.id;
    const { data, error } = await supabaseClient
    .from(table)
    .select()
    .eq(idColumn,userId)
    if (error) {
        console.error("Error fetching data from " + table + ":", error);
        return;
    }
    return data
}