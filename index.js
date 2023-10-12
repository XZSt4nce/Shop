/**
 * A product
 * @typedef {Object} product
 * @property {uint} id - Product id
 * @property {image} image - Product image
 * @property {string} title - Product title
 * @property {number} description - Product description
 * @property {number} price - Product price
 * @property {number} rateValue - Average product rating
 * @property {number} rateCount - Quantity of the product ratings
 * @property {number} cartAmount - Quantity of the product added to the cart
*/

/**
 * Info about cart
 * @const {{ ids: *[uint], orderPrice: uint}}
 */
const cart = {
    ids: [], // ids of the products that are added to the cart
    orderPrice: 0
}
/**
 * Loaded list of available products
 * @const {*[]}
 */
const products = [];

getProducts()

document.getElementById('sidebar-box').addEventListener("click", () => {
    if (document.getElementById('sidebar').offsetLeft === 0) {
        // Hide sidebar
        document.getElementById('sidebar').style.left = `-${document.getElementById('sidebar').offsetWidth}px`;
    }
    else if (document.getElementById('sidebar').offsetLeft === -document.getElementById('sidebar').offsetWidth) {
        // Show sidebar
        document.getElementById('sidebar').style.left = "0";
    }
});

document.getElementById('order').addEventListener('click', () => {
    const message = document.getElementById('message');
    // If the message is hidden
    if (message.offsetTop === -100) {
        // If the cart is empty
        if (cart.ids.length === 0) {
            message.style.background = 'red';
            message.innerText = 'The order is empty!';
        } else {
            // Output of ordered goods to the console
            const cartProducts = [];
            for (let i = 0; i < cart.ids.length; i++) {
                cartProducts.push(getProductById(cart.ids[i]));
            }
            console.log(cartProducts);

            message.style.background = 'springgreen';
            message.innerText = 'The order has been placed. Thank you for your purchase!';
        }
        // Show message
        message.style.top = '10px';

        // Hide message after 2 seconds
        setTimeout(() => {
            message.style.top = '-100px'
        }, 2000);
    }
})

document.getElementById('goods-visible').addEventListener('scroll', (event) => {
    // If you have reached the end of the list of products
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
        loadProducts();
    }
})

/**
 * @async
 * This function pulls out a json object with products
 */
async function getProducts() {
    await axios.get('https://fakestoreapi.com/products/')
        .then(function (response) {
            response.data.forEach(productObj => {
                products.push({
                    id: productObj['id'],
                    image: productObj['image'],
                    title: productObj['title'],
                    description: productObj['description'],
                    price: productObj['price'],
                    rateValue: productObj['rating']['rate'],
                    rateCount: productObj['rating']['count'],
                    cartAmount: 0
                });
            })
        })
        .catch(function (error) {
            console.log(error);
        })
    loadProducts();
}

/**
 * This function displays the quantity of unique products on the sidebar-box
 */
function updateProductsCount() {
    // Display the quantity of products on the sidebar-box button
    document.getElementById('products-count').style.display = 'initial';

    // Change the quantity of products on the sidebar-box button
    document.getElementById('products-count').innerText = `${cart.ids.length}`;

    // If the cart is empty
    if (cart.ids.length === 0) {
        // Stop displaying the quantity of products on the sidebar-box button
        document.getElementById('products-count').style.display = '';
    }
}

/**
 * This function returns the product object by the entered id
 *
 * @param {uint} id - Product id
 * @return {product} The product object
 * @return {uint} -1 if product id does not exist.
 *
 * @example
 *     getProductById(0)
 */
function getProductById(id) {
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            return products[i];
        }
    }
    return -1;
}

/**
 * This function updates the order price
 * @param {int} amount The amount that is added or subtracted from the order price
 */
function updateCartPrice(amount) {
    cart.orderPrice += amount;
    cart.orderPrice = Math.round(cart.orderPrice * 100) / 100;
    document.getElementById('order-price').innerText = `${cart.orderPrice}$`;
}

/**
 * This function adds an item to the cart
 * @param {product} productObj Added product
 */
function buy(productObj) {
    addToCart(productObj);
    cart.ids.push(productObj.id);
    productObj.cartAmount = 1;
    document.getElementById(`buy-container${productObj.id}`).style.display = 'none';
    document.getElementById(`product-amount${productObj.id}`).innerText = '1pc.';
    document.getElementById(`product-amount-container${productObj.id}`).style.display = '';
    updateProductsCount();
}

/**
 * This function removes an item from the cart
 * @param {product} cartProduct Product in the cart
 */
function delProduct(cartProduct) {
    // Removing an HTML product element from the cart
    document.getElementById(`cart-good${cartProduct.id}`).remove();

    // Stop displaying the quantity of the product
    document.getElementById(`product-amount-container${cartProduct.id}`).style.display = 'none';

    // Display the product purchase button
    document.getElementById(`buy-container${cartProduct.id}`).style.display = '';

    // Remove the product id from the cart
    cart.ids.splice(cart.ids.indexOf(cartProduct.id), 1);

    updateProductsCount();
    updateCartPrice(-cartProduct.price * cartProduct.cartAmount);
}

/**
 * This function decreases/increases the quantity of a specific product
 * @param {product} productObj Product object
 * @param {boolean} isIncreased Increase if true, otherwise decrease
 */
function changeCountProduct(productObj, isIncreased) {
    // Decrease/increase the quantity of ordered goods
    productObj.cartAmount += 2 * isIncreased - 1;

    // (quantity X price) is indicated in the cart
    document.getElementById(`amount-price${productObj.id}`).innerText = `${productObj.cartAmount}pc. x ${productObj.price}$`;

    // The total price for the entire quantity of a particular product is indicated in the cart
    document.getElementById(`total-price${productObj.id}`).innerText = `= ${Math.round(productObj.cartAmount * productObj.price * 100) / 100}$`;

    // How many specific items are ordered in the cart
    document.getElementById(`cart-amount${productObj.id}`).innerText = `${productObj.cartAmount}pc.`;

    // How many specific items are ordered in the list of products
    document.getElementById(`product-amount${productObj.id}`).innerText = `${productObj.cartAmount}pc.`;

    // If 0 specific items are ordered
    if (productObj.cartAmount === 0) {
        delProduct(productObj);
    }

    updateCartPrice(productObj.price * (2 * isIncreased - 1))
}

/**
 * This function loads products into the list of products
 */
function loadProducts() {
    // Display additional 3 products
    const productsShowed = document.getElementById('goods').children.length;
    for(let i = productsShowed; i < productsShowed + 3; i++) {
        try{
            displayProduct(products[i]);
        }
        catch {
            break;
        }
    }

    // If the scrollbar didn't appear
    if (document.getElementById('goods-visible').clientHeight === document.getElementById('goods-visible').scrollHeight) {
        loadProducts();
    }
}

/**
 * This function adds a product to the cart
 * @param {product} productObj Product object
 */
function addToCart(productObj) {
    // If there is no such product in the cart
    if (!cart.ids.includes(productObj.id)) {
        updateCartPrice(productObj.price);
        updateProductsCount();
        displayCartProduct(productObj);
    }
}

/**
 * This function displays the product in the product list
 * @param {product} productObj Product object
 */
function displayProduct(productObj) {
    const product = document.createElement('div');
    const productImg = document.createElement('div');
    const rating = document.createElement('div');
    const rate = document.createElement('div');
    const starsGray = document.createElement('img');
    const starsGold = document.createElement('img');
    const rateCount = document.createElement('div');
    const productTitle = document.createElement('div');
    const productDescription = document.createElement('div');
    const productPrice = document.createElement('div');
    const buyContainer = document.createElement('button');
    const amountContainer = document.createElement('div');
    const decreaseProduct = document.createElement('button');
    const amount = document.createElement('div');
    const increaseProduct = document.createElement('button');

    product.classList.add('product');
    product.id = `${productObj.id}`;

    productImg.classList.add('product-img');
    productImg.style.backgroundImage = `url("${productObj.image}")`;

    rating.classList.add('rating');

    rate.classList.add('rate');

    starsGray.src = 'images/stars_gray.webp';
    starsGray.height = 30;
    starsGray.alt = '';

    // Calculate the size of the transparency mask for golden stars
    starsGold.classList.add('rate-mask');
    starsGold.style.maskSize = `calc(129px * ${productObj.rateValue} / 5) 30px`;
    starsGold.style.webkitMaskSize = `calc(129px * ${productObj.rateValue} / 5) 30px`;
    starsGold.src = 'images/stars_gold.webp'
    starsGold.height = 30;
    starsGold.alt = '';

    rateCount.classList.add('rate-count');
    rateCount.innerText = `(${productObj.rateCount})`;

    productTitle.classList.add('product-title');
    productTitle.classList.add('text-wrapper');
    productTitle.innerText = productObj.title;

    productDescription.classList.add('product-description');
    productDescription.classList.add('text-wrapper');
    productDescription.innerText = `${productObj.description}`;

    productPrice.classList.add('product-price');
    productPrice.innerText = `${productObj.price}$`;
    productPrice.style.fontSize = '16px';

    buyContainer.classList.add('buy-container');
    buyContainer.id = `buy-container${productObj.id}`
    buyContainer.innerText = 'Add to cart';

    amountContainer.classList.add('amount-container');
    amountContainer.id = `product-amount-container${productObj.id}`;
    amountContainer.style.display = 'none';

    decreaseProduct.classList.add('change-count-product');
    decreaseProduct.style.backgroundImage = "url('/images/minus.webp')";

    amount.classList.add('amount');
    amount.id = `product-amount${productObj.id}`;

    increaseProduct.classList.add('change-count-product');
    increaseProduct.style.backgroundImage = "url('/images/plus.webp')";


    buyContainer.addEventListener('click', () => {
        buy(productObj);
    });

    decreaseProduct.addEventListener('click', () => {
        changeCountProduct(productObj, false);
    });

    increaseProduct.addEventListener('click', () => {
        changeCountProduct(productObj, true);
    })

    amountContainer.appendChild(decreaseProduct);
    amountContainer.appendChild(amount);
    amountContainer.appendChild(increaseProduct);

    rate.appendChild(starsGray);
    rate.appendChild(starsGold);

    rating.appendChild(rate);
    rating.appendChild(rateCount);

    product.appendChild(productImg);
    product.appendChild(rating);
    product.appendChild(productTitle);
    product.appendChild(productDescription);
    product.appendChild(productPrice);
    product.appendChild(buyContainer);
    product.appendChild(amountContainer);

    document.getElementById('goods').appendChild(product);
}

/**
 * This function displays the product in the cart
 * @param {product} productObj Product object
 */
function displayCartProduct(productObj) {
    const product = document.createElement('div');
    const deleteProduct = document.createElement('div');
    const productImg = document.createElement('div');
    const productTitle = document.createElement('div');
    const productDescription = document.createElement('div');
    const productDescriptionLink = document.createElement('a');
    const productPrice = document.createElement('div');
    const amountPrice = document.createElement('div');
    const totalPrice = document.createElement('div');
    const amountContainer = document.createElement('div');
    const decreaseProduct = document.createElement('button');
    const amount = document.createElement('div');
    const increaseProduct = document.createElement('button');

    product.classList.add('product');
    product.id = `cart-good${productObj.id}`;

    deleteProduct.classList.add('delete-product');

    productImg.classList.add('product-img');
    productImg.style.backgroundImage = `url("${productObj.image}")`;

    productTitle.classList.add('product-title');
    productTitle.classList.add('text-wrapper');
    productTitle.style.textDecoration = 'none';
    productTitle.innerText = productObj.title;

    productDescription.classList.add('product-description');
    productDescription.classList.add('text-wrapper');

    productDescriptionLink.innerText = `${productObj.description}`;
    productDescriptionLink.href = `#${productObj.id}`;

    productPrice.classList.add('product-price');

    amountPrice.id = `amount-price${productObj.id}`;
    amountPrice.innerText = `1pc. x ${productObj.price}$`

    totalPrice.id = `total-price${productObj.id}`;
    totalPrice.innerText = `= ${productObj.price}$`;

    amountContainer.classList.add('amount-container');

    decreaseProduct.classList.add('change-count-product');
    decreaseProduct.style.backgroundImage = "url('/images/minus.webp')";

    amount.classList.add('amount');
    amount.id = `cart-amount${productObj.id}`;
    amount.innerText = '1pc.';

    increaseProduct.classList.add('change-count-product');
    increaseProduct.style.backgroundImage = "url('/images/plus.webp')";

    deleteProduct.addEventListener('click', () => {
        delProduct(productObj);
    });
    decreaseProduct.addEventListener('click', () => {
        changeCountProduct(productObj, false);
    });
    increaseProduct.addEventListener('click', () => {
        changeCountProduct(productObj, true);
    });

    productDescription.appendChild(productDescriptionLink);

    productPrice.appendChild(amountPrice);
    productPrice.appendChild(totalPrice);

    amountContainer.appendChild(decreaseProduct);
    amountContainer.appendChild(amount);
    amountContainer.appendChild(increaseProduct);

    product.appendChild(deleteProduct);
    product.appendChild(productImg);
    product.appendChild(productTitle);
    product.appendChild(productDescription);
    product.appendChild(productPrice);
    product.appendChild(amountContainer);

    document.getElementById('cart-goods').appendChild(product);
    updateProductsCount();
}