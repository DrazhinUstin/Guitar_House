import Products from "./modules/products.js";
import Cart from "./modules/cart.js";
import UI from "./modules/ui.js";

document.addEventListener('DOMContentLoaded', () => {
    // Create objects
    const product = new Products();
    const cart = new Cart();
    const ui = new UI();
    // Dynamically get products and launch the application
    product.getProducts().then(products => {
        product.setupProducts(products);
        cart.setupCart(products);
        ui.startUI();
    }).catch(error => {
        console.log(error);
    });
});

window.addEventListener("load", UI.hidePreloader);