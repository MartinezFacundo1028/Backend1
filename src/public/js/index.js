const socket = io();
const form = document.getElementById('add-product-form');
const productList = document.getElementById('lista-productos');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        img: document.getElementById('img').value,
        stock: document.getElementById('stock').value,
        code: document.getElementById('code').value
    };
    socket.emit('addProduct', newProduct);
});

function deleteProduct(productId) {
    socket.emit('deleteProduct', productId);
}
socket.on('productsUpdated', (products) => {
    productList.innerHTML = '';
    products.forEach(product => {
        const li = document.createElement('li');
        li.id = `product-${product.id}`;
        li.innerHTML = `
            <strong>${product.title}</strong>: ${product.description} - $${product.price} (Stock: ${product.stock})
            <button onclick="deleteProduct(${product.id})">Eliminar</button>
        `;
        productList.appendChild(li);
    });
});
