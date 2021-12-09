/////////////////////////////////////// CLASS PRODUCTS ///////////////////////////////////////

class Products {

    async getProducts () {
        // contentful
        const client = contentful.createClient({
            space: "k85fc407hkln",
            accessToken: "MGtE9k6vvyxh5EpV1Hik0CPu_H2cARmpSTKK4fKxS2U"
        });
        // Contentful data 
        const data = await client.getEntries({
            content_type: "modifiedGuitarHouse"
        });
        // Get products from data
        const products = data.items.map(item => {
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

    setupProducts (products) {
        this.displayProducts(products);
        this.displayFilterBtns(products);
        this.setFilterBtns();
        this.setSingleProduct(products);
    }

    displayProducts (products) {
        const productsDOM = document.querySelector('.products-container');
        productsDOM.innerHTML = products.map(product => {
            return `<article class="product" data-brand="${product.brand}">
                            <div class="product-image-wrapper">
                                <img src="${product.images[0]}" alt="${product.title}">
                                <div class ="product-btns-wrapper">
                                    <button class="add-to-cart-btn" data-id="${product.id}">
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

    displayFilterBtns (products) {
        const filterBtnsDOM = document.querySelector('.filter-btns');
        const brands = products.reduce((initial, product) => {
            if (!initial.includes(product.brand)) {
                initial.push(product.brand);
            }
            return initial;
        }, ['all']);
        filterBtnsDOM.innerHTML = brands.map(brand => {
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

    setSingleProduct (products) {
        const singleProductOverlay = document.querySelector('.single-product-overlay');
        const singleProductDOM = document.querySelector('.single-product');
        const singleProductBtns = document.querySelectorAll('.product-info-btn');
        let step = 0;

        singleProductBtns.forEach(button => button.addEventListener('click', () => {
            const singleProduct = products.find(item => item.id === button.dataset.id);
            this.displaySingleProduct(singleProduct, singleProductDOM);
        }));

        singleProductDOM.addEventListener('click', event => {
            if (event.target.closest('.single-product-close-btn')) {
                document.body.style.overflow = '';
                singleProductOverlay.classList.remove('show');
                step = 0;
            } else if (event.target.closest('.left-navigate-btn')) {
                const images = document.querySelectorAll('.single-product-images-container > *');
                step--;
                if (step < 0) step = images.length - 1;
                setActiveImage(images, step);
            } else if (event.target.closest('.right-navigate-btn')) {
                const images = document.querySelectorAll('.single-product-images-container > *');
                step++;
                if (step > images.length - 1) step = 0;
                setActiveImage(images, step);
            } else if (event.target.closest('.single-product-images-container > *')) {
                const image = event.target.closest('.single-product-images-container > *');
                const images = [...document.querySelectorAll('.single-product-images-container > *')];
                step = images.indexOf(image);
                setActiveImage(images, step);
            }
        });

        function setActiveImage (images, step) {
            const mainImage = document.querySelector('.single-product-image img');
            mainImage.src = images[step].src;
            images.forEach((item, index) => {
                if (index === step) item.classList.add('active');
                else item.classList.remove('active');
            });
        }
    }

    displaySingleProduct (product, productDOM) {
        productDOM.innerHTML = `<button class="single-product-close-btn">
                                    <i class="fas fa-window-close"></i>
                                </button>
                                <h3>${product.title}</h3>
                                <div class="single-product-image">
                                    <img src="${product.images[0]}" alt="${product.title}">
                                    <div class="navigate-btns">
                                        <button class="left-navigate-btn">
                                            <i class="fas fa-chevron-circle-left"></i>
                                        </button>
                                        <button class="right-navigate-btn">
                                            <i class="fas fa-chevron-circle-right"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="single-product-images-container">${product.images.map((item, index) => {
                                    return `<img src="${item}" alt="${product.title}" class="${index === 0 ? 'active' : ''}">`
                                }).join('')}</div>
                                <h4><span>About</span></h4>
                                <p>${product.description}</p>
                                <div class="single-product-price">
                                    Original price: <span>$${product.price}</span>
                                </div>`;
        document.body.style.overflow = 'hidden';
        productDOM.parentElement.classList.add('show');
    }

}

export default Products;