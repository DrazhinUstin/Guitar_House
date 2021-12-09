import Storage from "./storage.js";

/////////////////////////////////////// CLASS CART ///////////////////////////////////////

class Cart {

    setupCart (products) {
        const openCartBtn = document.querySelector('.cart-btn');
        const closeCartBtn = document.querySelector('.close-cart-btn');
        const clearCartBtn = document.querySelector('.clear-cart-btn');
        this.cartOverlay = document.querySelector('.cart-overlay');
        this.cartItemsDOM = document.querySelector('.cart-items');
        this.cartItems = Storage.getfromStorage('cartItems');
        if (this.cartItems.length) {
            this.cartItems.forEach(item => this.displayCartItem(item));
        } else {
            this.displayEmptyCart();
        }
        this.defineCartTotal();
        this.setAddToCartBtns(products);

        openCartBtn.addEventListener('click', () => {
            this.cartOverlay.classList.add('show');
        });

        closeCartBtn.addEventListener('click', () => {
            this.cartOverlay.classList.remove('show');
        });

        clearCartBtn.addEventListener('click', () => {
            this.cartItems.forEach(item => this.removeCartItem(item.id));
        });

        this.cartItemsDOM.addEventListener('click', this.cartItemsDOMListener.bind(this));
    }

    displayCartItem (cartItem) {
        const article = document.createElement('article');
        article.classList.add('cart-item');
        article.innerHTML = `<img src="${cartItem.images[0]}" alt="${cartItem.title}">
                            <div>
                                <h4>${cartItem.title}</h4>
                                <p>$${cartItem.price}</p>
                                <button class="cart-item-remove-btn" data-id = "${cartItem.id}">remove</button>    
                            </div>
                            <div>
                                <button class="cart-item-increase-btn" data-id = "${cartItem.id}">
                                    <i class="fas fa-chevron-up"></i>
                                </button>
                                <p class="cart-item-amount">${cartItem.amount}</p>
                                <button class="cart-item-decrease-btn" data-id = "${cartItem.id}">
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>`;
        this.cartItemsDOM.append(article);
    }

    displayEmptyCart () {
        this.cartItemsDOM.innerHTML = '<div class="empty-cart">No items...</div>';        
    }

    setAddToCartBtns (products) {
        const buttons = document.querySelectorAll('.add-to-cart-btn');
        buttons.forEach(button => {
            // Check add to cart btn after getting products
            const inCart = this.cartItems.find(item => item.id === button.dataset.id);
            if (inCart) {
                button.textContent = 'in cart';
                button.disabled = true; 
            }
            // Assign handlers to add to cart btn
            button.addEventListener('click', () => {
                button.textContent = 'in cart';
                button.disabled = true;
                const product = products.find(item => item.id === button.dataset.id);
                const cartItem = {...product, amount: 1};
                this.cartItems.push(cartItem);
                if (document.querySelector('.empty-cart')) document.querySelector('.empty-cart').remove();
                this.displayCartItem(cartItem);
                this.defineCartTotal();
                Storage.saveToStorage('cartItems', this.cartItems);
                this.cartOverlay.classList.add('show');
            });
        });
    }

    cartItemsDOMListener (event) {
        if (event.target.closest('.cart-item-remove-btn')) {
            const button = event.target.closest('.cart-item-remove-btn');
            button.parentElement.parentElement.remove();
            this.removeCartItem(button.dataset.id);
        }
        if (event.target.closest('.cart-item-increase-btn')) {
            const button = event.target.closest('.cart-item-increase-btn');
            const cartItem = this.cartItems.find(item => item.id === button.dataset.id);
            cartItem.amount++;
            button.nextElementSibling.textContent = cartItem.amount;
            this.defineCartTotal();
            Storage.saveToStorage('cartItems', this.cartItems);
        }
        if (event.target.closest('.cart-item-decrease-btn')) {
            const button = event.target.closest('.cart-item-decrease-btn');
            const cartItem = this.cartItems.find(item => item.id === button.dataset.id);
            cartItem.amount--;
            if (cartItem.amount === 0) {
                button.parentElement.parentElement.remove();
                this.removeCartItem(button.dataset.id);
                return;                
            }             
            button.previousElementSibling.textContent = cartItem.amount;
            this.defineCartTotal();
            Storage.saveToStorage('cartItems', this.cartItems);         
        }
    }

    removeCartItem (id) {
        this.cartItems = this.cartItems.filter(item => item.id !== id);
        if (!this.cartItems.length) this.displayEmptyCart();
        this.defineCartTotal();
        this.restoreAddToCartBtn(id);
        Storage.saveToStorage('cartItems', this.cartItems);
    }

    restoreAddToCartBtn (id) {
        const buttons = [...document.querySelectorAll('.add-to-cart-btn')];
        const button = buttons.find(button => button.dataset.id === id);
        button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to cart';
        button.disabled = false;          
    }

    defineCartTotal () {
        let totalAmount = 0;
        let totalPrice = 0;
        this.cartItems.forEach(item => {
            totalAmount += item.amount;
            totalPrice += item.price * item.amount;
        });
        document.querySelector('.cart-items-count').textContent = totalAmount;
        document.querySelector('.cart-total').textContent = `$${totalPrice.toFixed(2)}`;
    }

}

export default Cart;