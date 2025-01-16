const socket = io();
const form = document.getElementById('add-product-form');
const productList = document.getElementById('lista-productos');
const cartCountElement = document.getElementById('cart-count');

// Función para actualizar el contador del carrito
function updateCartCount(count) {
    cartCountElement.textContent = count;
}

// Escuchar el evento de actualización del carrito
socket.on('cartUpdated', (cart) => {
    updateCartCount(cart.length); // Suponiendo que cart es un array de productos
});

// Manejo del formulario para agregar productos
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        stock: document.getElementById('stock').value,
        code: document.getElementById('code').value,
        category: document.getElementById('category').value
    };
    socket.emit('addProduct', newProduct);
    
    // Limpiar el formulario
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('price').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('code').value = '';
    document.getElementById('category').value = '';

    window.location.reload();
});

socket.on('productsUpdated', (products) => {
    console.log('Productos actualizados recibidos:', products);
    products.forEach(product => {
        const li = document.createElement('li');
        li.id = `product-${product._id}`;
        li.innerHTML = `
            <strong>${product.title}</strong>: ${product.description} - $${product.price} (Stock: ${product.stock})
            <button onclick="deleteProduct('${product._id}')">Eliminar</button>
        `;
    });
});

async function addToCart(productId) {
    console.log(`Agregando producto con Id:${productId}, no se ha implementado la lógica para agregar al carrito, porque no pedia la consigna hacerlo desde aca`);
}

function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        socket.emit('deleteProduct', productId);
        
        const productElement = document.getElementById(`product-${productId}`);
        if (productElement) {
            productElement.remove();
        }
    }
}

function viewDetails(productId) {
    window.location.href = `api/products/product/${productId}`;
}

function changePage(pageNumber) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('page', pageNumber);
    window.location.href = `?${urlParams.toString()}`;
} 
