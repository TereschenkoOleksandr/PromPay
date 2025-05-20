// Search functionality
const searchInput = document.querySelector('.search-container input');
const searchButton = document.querySelector('.search-container button');
const productCards = document.querySelectorAll('.product-card');

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    
    productCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Cart functionality
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cartModal');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const totalAmountElement = document.getElementById('totalAmount');
const cartCountElement = document.querySelector('.cart-count');

// Favorites functionality
const favoritesIcon = document.querySelector('.favorites-icon');
const favoritesModal = document.getElementById('favoritesModal');
const closeFavoritesBtn = document.querySelector('.close-favorites');
const favoritesItemsContainer = document.querySelector('.favorites-items');
const favoritesCountElement = document.querySelector('.favorites-count');

// Orders functionality
const ordersIcon = document.querySelector('.orders-icon');
const ordersModal = document.getElementById('ordersModal');
const closeOrdersBtn = document.querySelector('.close-orders');
const ordersItemsContainer = document.querySelector('.orders-items');

let cart = [];
let favorites = [];

// Load user balance from localStorage
function loadBalance() {
    const savedBalance = localStorage.getItem('user_balance');
    const balanceLabel = document.getElementById('balanceLabel');
    
    if (balanceLabel) {
        let balance = parseFloat(savedBalance) || 10000; // Default to 10000 if no balance saved
        localStorage.setItem('user_balance', balance); // Ensure balance is in localStorage
        balanceLabel.textContent = 'Баланс: ' + balance.toLocaleString('uk-UA') + ' грн';
    }
}

// Load cart and favorites from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function loadFavorites() {
    const savedFavorites = localStorage.getItem('favoritesItems');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }
}

// Save cart and favorites to localStorage
function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(cart));
}

function saveFavorites() {
    localStorage.setItem('favoritesItems', JSON.stringify(favorites));
}

// Initial load and render
loadCart();
loadFavorites();
loadBalance(); // Load balance on page load

// Update favorite buttons on product cards based on loaded favorites
document.querySelectorAll('.product-card').forEach(card => {
    const favoriteBtn = card.querySelector('.favorite-btn');
    const productName = favoriteBtn.dataset.name;
    
    const isFavorite = favorites.some(item => item.name === productName);
    
    if (isFavorite) {
        favoriteBtn.classList.add('active');
    }
});

updateCart(); // Update UI based on loaded cart
updateFavorites(); // Update UI based on loaded favorites

// Open cart modal
cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    cartModal.classList.add('show');
    updateCart();
    saveCart(); // Save cart after adding item
});

// Close cart modal
closeCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('show');
});

// Open favorites modal
favoritesIcon.addEventListener('click', (e) => {
    e.preventDefault();
    favoritesModal.classList.add('show');
});

// Close favorites modal
closeFavoritesBtn.addEventListener('click', () => {
    favoritesModal.classList.remove('show');
});

// Close modals when clicking outside
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('show');
    }
});

favoritesModal.addEventListener('click', (e) => {
    if (e.target === favoritesModal) {
        favoritesModal.classList.remove('show');
    }
});

// Handle quantity selection in product cards
document.querySelectorAll('.product-card').forEach(card => {
    const minusBtn = card.querySelector('.quantity-btn.minus');
    const plusBtn = card.querySelector('.quantity-btn.plus');
    const quantityInput = card.querySelector('.quantity-input');
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    const favoriteBtn = card.querySelector('.favorite-btn');

    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) {
            quantityInput.value = currentValue + 1;
        }
    });

    quantityInput.addEventListener('change', () => {
        let value = parseInt(quantityInput.value);
        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > 99) {
            value = 99;
        }
        quantityInput.value = value;
    });

    addToCartBtn.addEventListener('click', () => {
        const productName = addToCartBtn.dataset.name;
        const productPrice = parseFloat(addToCartBtn.dataset.price);
        const quantity = parseInt(quantityInput.value);
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                name: productName,
                price: productPrice,
                quantity: quantity
            });
        }
        
        // Reset quantity to 1 after adding to cart
        quantityInput.value = 1;
        
        updateCart();
        saveCart(); // Save cart after adding item
    });

    favoriteBtn.addEventListener('click', () => {
        const productName = favoriteBtn.dataset.name;
        const productPrice = parseFloat(favoriteBtn.dataset.price);
        
        const existingFavorite = favorites.find(item => item.name === productName);
        
        if (existingFavorite) {
            favorites = favorites.filter(item => item.name !== productName);
            favoriteBtn.classList.remove('active');
        } else {
            favorites.push({
                name: productName,
                price: productPrice
            });
            favoriteBtn.classList.add('active');
        }
        
        updateFavorites();
        saveFavorites(); // Save favorites after adding/removing
    });
});

function formatPriceUAH(price) {
    if (!price || price === 0) return '0 грн';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' грн';
}

function updateCart() {
    // Update cart items display
    cartItemsContainer.innerHTML = '';
    let total = 0;
    const cartTotalRow = document.getElementById('cartTotalRow');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#444; font-size:1.2rem; margin:2rem 0;">Кошик порожній</p>';
        totalAmountElement.textContent = '';
        if (cartTotalRow) cartTotalRow.style.display = 'none';
        return;
    }
    if (cartTotalRow) cartTotalRow.style.display = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatPriceUAH(item.price)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-index="${index}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" data-index="${index}">+</button>
            </div>
            <button class="remove-item" data-index="${index}">×</button>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Update total amount
    totalAmountElement.textContent = formatPriceUAH(total);
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.classList.toggle('show', totalItems > 0);
}

function updateFavorites() {
    // Update favorites items display
    favoritesItemsContainer.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesItemsContainer.innerHTML = '<p style="text-align:center; color:#444; font-size:1.2rem; margin:2rem 0;">Обраних товарів ще немає</p>';
    }
    
    favorites.forEach((item, index) => {
        const favoriteItemElement = document.createElement('div');
        favoriteItemElement.className = 'favorite-item';
        favoriteItemElement.innerHTML = `
            <div class="favorite-item-info">
                <h4>${item.name}</h4>
                <p>${formatPriceUAH(item.price)}</p>
            </div>
            <button class="remove-item" data-index="${index}">×</button>
        `;
        
        favoritesItemsContainer.appendChild(favoriteItemElement);
    });
    
    // Update favorites count
    favoritesCountElement.textContent = favorites.length;
    favoritesCountElement.classList.toggle('show', favorites.length > 0);
}

// Handle quantity changes and item removal in cart
cartItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('quantity-btn')) {
        const index = parseInt(e.target.dataset.index);
        if (e.target.classList.contains('plus')) {
            cart[index].quantity += 1;
        } else if (e.target.classList.contains('minus')) {
            cart[index].quantity -= 1;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
        }
        updateCart();
        saveCart(); // Save cart after quantity change or removal
    } else if (e.target.classList.contains('remove-item')) {
        const index = parseInt(e.target.dataset.index);
        cart.splice(index, 1);
        updateCart();
        saveCart(); // Save cart after removal
    }
});

// Handle item removal in favorites
favoritesItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        const index = parseInt(e.target.dataset.index);
        const removedItem = favorites[index];
        favorites.splice(index, 1);
        
        // Update favorite button state
        const favoriteBtn = document.querySelector(`.favorite-btn[data-name="${removedItem.name}"]`);
        if (favoriteBtn) {
            favoriteBtn.classList.remove('active');
        }
        
        updateFavorites();
        saveFavorites(); // Save favorites after removal from modal
    }
});

// Function to update frozen funds display
function updateFrozenFundsDisplay() {
    const frozenFunds = parseFloat(localStorage.getItem('frozenFunds') || '0');
    const frozenFundsLabel = document.getElementById('frozenFundsLabel');
    if (frozenFundsLabel) {
        frozenFundsLabel.textContent = `Заморожені кошти: ${frozenFunds.toLocaleString()} грн`;
    }
}

// Function to freeze funds
function freezeFunds(amount) {
    const currentFrozen = parseFloat(localStorage.getItem('frozenFunds') || '0');
    const newFrozen = currentFrozen + amount;
    localStorage.setItem('frozenFunds', newFrozen.toString());
    updateFrozenFundsDisplay();
}

// Function to unfreeze funds
function unfreezeFunds(amount) {
    const currentFrozen = parseFloat(localStorage.getItem('frozenFunds') || '0');
    const newFrozen = Math.max(0, currentFrozen - amount);
    localStorage.setItem('frozenFunds', newFrozen.toString());
    updateFrozenFundsDisplay();
}

// Modify the checkout button click handler in the cart modal
document.querySelector('.checkout-btn').addEventListener('click', function() {
    const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace(/[^\d]/g, ''));
    if (totalAmount > 0) {
        window.location.href = 'order.html';
    }
});

// Open orders modal
ordersIcon.addEventListener('click', (e) => {
    e.preventDefault();
    ordersModal.classList.add('show');
    updateOrders();
});

// Close orders modal
closeOrdersBtn.addEventListener('click', () => {
    ordersModal.classList.remove('show');
});

// Close orders modal when clicking outside
ordersModal.addEventListener('click', (e) => {
    if (e.target === ordersModal) {
        ordersModal.classList.remove('show');
    }
});

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    ordersItemsContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersItemsContainer.innerHTML = '<p style="text-align:center; color:#444; font-size:1.2rem; margin:2rem 0;">У вас ще немає замовлень</p>';
        return;
    }
    
    orders.forEach((order, index) => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-number">Замовлення ${index + 1}</div>
                    <div class="order-date">${formatDate(order.date)}</div>
                </div>
                <div class="order-status">Замовлення прийнято</div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>${(item.price * item.quantity).toLocaleString()} грн</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                Загальна сума: ${order.total.toLocaleString()} грн
            </div>
        `;
        ordersItemsContainer.appendChild(orderElement);
    });
}

// Add to the page load handler
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    loadFavorites();
    loadBalance();
    updateCart();
    updateFavorites();
    updateFrozenFundsDisplay();
}); 