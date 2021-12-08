/////////////////////////////////////// VARIABLES ///////////////////////////////////////

// contentful
const client = contentful.createClient({
    space: "k85fc407hkln",
    accessToken: "MGtE9k6vvyxh5EpV1Hik0CPu_H2cARmpSTKK4fKxS2U"
});
// preloader
const preloader = document.querySelector(".preloader");
// cart
const cartOverlay = document.querySelector('.cart-overlay');
const cartContent = document.querySelector('.cart-items');
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart-btn');
const clearCartBtn = document.querySelector('.clear-cart-btn');
// product-info
const infoOverlay = document.querySelector('.product-info-overlay');
const productInfo = document.querySelector('.product-info');
// products
const productsArea = document.querySelector('.products-container');
const filterBtnsArea = document.querySelector('.filter-btns');
// navigation
const navBar = document.querySelector('nav');
const navMenu = document.querySelector('.nav-menu');
const menuToggleBtn = document.querySelector('.nav-menu-toggle-btn');
const sctollLinks = document.querySelectorAll('.scroll-link');
// This value we will get dynamically
let cartItems;

/////////////////////////////////////// CLASS PRODUCTS ///////////////////////////////////////

class Products {

    async getProducts () {
        // Contentful data 
        const result = await client.getEntries({
            content_type: "modifiedGuitarHouse"
        });
        // Get products from data
        const products = result.items.map(item => {
            const {sys: {id}, fields: {brand, title, price, description}} = item;
            const images = item.fields.images.map(image => image.fields.file.url);
            return {id, brand, title, price, description, images};
        });
        // Sort products and return     
        return products.sort((a, b) => {
            if (a.brand > b.brand) return 1;
            if (a.brand < b.brand) return -1;
            return 0;
        });  
    }

}

/////////////////////////////////////// CLASS UI ///////////////////////////////////////

class UI {

    displayFilterBtns (products) {
        const brands = products.reduce((initial, product) => {
            if (!initial.includes(product.brand)) {
                initial.push(product.brand);
            }
            return initial;
        }, ['all']);
        filterBtnsArea.innerHTML = brands.map(brand => {
            return `<button data-brand = "${brand}">${brand}</button>`;
        }).join('');
    }

    setFilterBtns () {
        const buttons = document.querySelectorAll('.filter-btns > *');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const brand = button.dataset.brand;
                const products = document.querySelectorAll('.product');
                if (brand === 'all') {
                    products.forEach(product => product.style.display = 'block');
                } else {
                    products.forEach(product => {
                        if (product.dataset.brand === brand) {
                            product.style.display = 'block';
                        } else {
                            product.style.display = 'none';
                        }
                    });
                }
            });
        });
    }

    displayProducts (products) {
        productsArea.innerHTML = products.map(product => {
            return `<article class="product" data-brand="${product.brand}">
                            <div class="product-image-wrapper">
                                <img src="${product.images[0]}" alt="${product.title}">
                                <div class ="product-btns-wrapper">
                                    <button class="product-btn" data-id="${product.id}">
                                        <i class="fas fa-shopping-cart"></i>
                                        Add to cart
                                    </button>
                                    <button class="product-info-btn" data-id="${product.id}">
                                        <i class="fas fa-question-circle"></i>
                                        Info
                                    </button>                                    
                                </div>    
                            </div>
                            <h3>${product.title}</h3>
                            <h4>$${product.price}</h4>
                        </article>`;
        }).join('');
    }

    setProductsBtns (products) {
        const buttons = document.querySelectorAll('.product-btn');
        buttons.forEach(button => {
            // Check product buttons after getting products
            const inCart = cartItems.find(item => item.id === button.dataset.id);
            if (inCart) {
                button.textContent = 'in cart';
                button.disabled = true; 
            }
            // Assign handlers to product buttons
            button.addEventListener('click', () => {
                button.textContent = 'in cart';
                button.disabled = true;
                const product = products.find(item => item.id === button.dataset.id);
                const cartItem = {...product, amount: 1};
                cartItems.push(cartItem);
                this.checkEmptyCart();
                this.addCartItem(cartItem);
                this.defineCartTotal();
                Storage.saveCartItems(cartItems);
                cartOverlay.classList.add('show');
            });
        });
    }

    displayCart () {
        cartItems = Storage.getCartItems();
        cartItems.forEach(item => {
            this.addCartItem(item);
        });
        this.checkEmptyCart();
        this.defineCartTotal();
    }

    checkEmptyCart () {
        if (!cartItems.length) {
            cartContent.innerHTML = '<div class="empty-cart">No items...</div>';
            return;
        } 
        const div = document.querySelector('.empty-cart');
        if (div) div.remove();
    } 

    addCartItem (cartItem) {
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
        cartContent.append(article);
    }

    removeCartItem (id) {
        cartItems = cartItems.filter(item => item.id !== id);
        this.checkEmptyCart();
        this.defineCartTotal();
        this.restoreProductBtn(id);
        Storage.saveCartItems(cartItems);
    }

    restoreProductBtn (id) {
        const buttons = [...document.querySelectorAll('.product-btn')];
        const button = buttons.find(button => button.dataset.id === id);
        button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to cart';
        button.disabled = false;          
    }

    defineCartTotal () {
        let totalAmount = 0;
        let totalPrice = 0;
        cartItems.forEach(item => {
            totalAmount += item.amount;
            totalPrice += item.price * item.amount;
        });
        document.querySelector('.cart-items-count').textContent = totalAmount;
        document.querySelector('.cart-total').textContent = `$${totalPrice.toFixed(2)}`;
    }

    setCartItemBtns (event) {
        if (event.target.closest('.cart-item-remove-btn')) {
            const button = event.target.closest('.cart-item-remove-btn');
            button.parentElement.parentElement.remove();
            this.removeCartItem(button.dataset.id);
        }
        if (event.target.closest('.cart-item-increase-btn')) {
            const button = event.target.closest('.cart-item-increase-btn');
            const cartItem = cartItems.find(item => item.id === button.dataset.id);
            cartItem.amount++;
            button.nextElementSibling.textContent = cartItem.amount;
            this.defineCartTotal();
            Storage.saveCartItems(cartItems);
        }
        if (event.target.closest('.cart-item-decrease-btn')) {
            const button = event.target.closest('.cart-item-decrease-btn');
            const cartItem = cartItems.find(item => item.id === button.dataset.id);
            cartItem.amount--;
            if (cartItem.amount === 0) {
                button.parentElement.parentElement.remove();
                this.removeCartItem(button.dataset.id);
                return;                
            }             
            button.previousElementSibling.textContent = cartItem.amount;
            this.defineCartTotal();
            Storage.saveCartItems(cartItems);         
        }
    }

    startAPP () {
        // Listeners for cart logic
        cartBtn.addEventListener('click', () => {
            cartOverlay.classList.add('show');
        });
        closeCartBtn.addEventListener('click', () => {
            cartOverlay.classList.remove('show');
        });
        clearCartBtn.addEventListener('click', () => {
            cartItems.forEach(item => this.removeCartItem(item.id));
        });
        cartContent.addEventListener('click', this.setCartItemBtns.bind(this));      
        // Listeners for navigation
        menuToggleBtn.addEventListener('click', this.setMenuToggle);
        sctollLinks.forEach(link => link.addEventListener('click', this.setScrollingLinks.bind(this)));
        // Launch product info
        this.setProductInfo();  
        // Launch slider
        this.setSlider();
        // Set year
        this.setYear();
    }

    setMenuToggle () {
        menuToggleBtn.classList.toggle('anim');
        if (menuToggleBtn.classList.contains('anim')) {
            let menuHeight = 0;
            navMenu.querySelectorAll('a').forEach(elem => menuHeight += elem.offsetHeight);
            navMenu.style.height = `${menuHeight}px`;                
        } else {
            navMenu.style.height = '';
        }
    }

    setScrollingLinks (event) {
        event.preventDefault();
        if (menuToggleBtn.classList.contains('anim')) this.setMenuToggle();        
        const id = event.target.getAttribute('href').slice(1);
        const elem = document.getElementById(id);
        const position = elem.offsetTop - navBar.offsetHeight;
        window.scrollTo(0, position);
    }

    setInfoBtns (products) {
        const buttons = document.querySelectorAll('.product-info-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const product = products.find(item => item.id === button.dataset.id);
                productInfo.innerHTML = `<button class="info-close-btn">
                                            <i class="fas fa-window-close"></i>
                                        </button>
                                        <h3>${product.title}</h3>
                                        <div class="info-image-wrapper">
                                            <img src="${product.images[0]}" alt="${product.title}">
                                            <div class="info-navigate-btns">
                                                <button class="left-info-btn">
                                                    <i class="fas fa-chevron-circle-left"></i>
                                                </button>
                                                <button class="right-info-btn">
                                                    <i class="fas fa-chevron-circle-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="info-images-container">${product.images.map(item => `<img src="${item}" alt="${product.title}">`).join('')}</div>
                                        <h4><span>About</span></h4>
                                        <p class="info-text">${product.description}</p>
                                        <p class="info-price">
                                            Original price: <span>$${product.price}</span>
                                        </p>`;
                const images =  document.querySelectorAll('.info-images-container > *');
                this.setImagesOpacity(images, 0);
                document.body.style.overflow = 'hidden';
                infoOverlay.classList.add('show');
            });
        });
    }

    setProductInfo () {
        let step = 0;
        // Set product info listener 
        productInfo.addEventListener('click', event => {
            if (event.target.closest('.info-close-btn')) {
                document.body.style.overflow = '';
                infoOverlay.classList.remove('show');
                step = 0;
            }
            if (event.target.closest('.left-info-btn')) {
                const images = document.querySelectorAll('.info-images-container > *');
                step--;
                if (step < 0) step = images.length - 1;
                this.setImageSrc(images, step);
            }
            if (event.target.closest('.right-info-btn')) {
                const images = document.querySelectorAll('.info-images-container > *');
                step++;
                if (step > images.length - 1) step = 0;
                this.setImageSrc(images, step);
            }
            if (event.target.closest('.info-images-container > *')) {
                const image = event.target.closest('.info-images-container > *');
                const images = [...document.querySelectorAll('.info-images-container > *')];
                step = images.indexOf(image);
                this.setImageSrc(images, step);
            }
        });
    }

    setImageSrc (images, step) {
        const image = document.querySelector('.info-image-wrapper img');
        image.src = images[step].src;
        this.setImagesOpacity(images, step);
    }

    setImagesOpacity (images, step) {
        images.forEach((image, index) => {
            if (index === step) image.style.opacity = '1';
            else image.style.opacity = '';
        });
    }    

    setSlider () {
        const leftSliderBtn = document.querySelector('.left-slider-btn');
        const rightSliderBtn = document.querySelector('.right-slider-btn');
        const slides = document.querySelectorAll('.slide');
        let slideStep = 0;
        // Set slides positiones
        slides.forEach((slide, index) => slide.style.left = `${index * 100}%`);
        // Slider buttons listeners 
        rightSliderBtn.addEventListener('click', () => {
            slideStep++;
            if (slideStep > slides.length - 1) slideStep = 0;
            slides.forEach(slide => slide.style.transform = `translateX(-${slideStep * 100}%)`);
        });
        leftSliderBtn.addEventListener('click', () => {
            slideStep--;
            if (slideStep < 0) slideStep = slides.length - 1;
            slides.forEach(slide => slide.style.transform = `translateX(-${slideStep * 100}%)`);
        });        
    }

    setYear () {
        const year = new Date().getFullYear();
        document.querySelector('.date').textContent = year;
    }

}

/////////////////////////////////////// CLASS STORAGE ///////////////////////////////////////

class Storage {

    static saveCartItems (cartItems) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    static getCartItems () {
        return localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    }

}

/////////////////////////////////////// DOMContentLoaded EVENT ///////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    // Creating objects
    const product = new Products();
    const ui = new UI();
    // Dynamically get products and launch the application
    product.getProducts().then(products => {
        ui.displayFilterBtns(products);
        ui.displayProducts(products);
        ui.displayCart();
        ui.setFilterBtns();
        ui.setProductsBtns(products);
        ui.setInfoBtns(products);
        ui.startAPP();
    }).catch(error => {
        console.log(error);
    });
});

/////////////////////////////////////// LOAD EVENT FOR PRELOADER ///////////////////////////////////////

window.addEventListener("load", () => {
    preloader.classList.add("hide");
});