const cart = {
    ids: [],
    orderPrice: 0
}
const products = [];
let productsShowed = 0;

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
            cart.ids.forEach(id => {
                cartProducts.push(products.find(el => el.id === id));
            });
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

document.getElementById('message').addEventListener('click', (event) => {
    event.target.style.top = '-100px';
})

document.getElementById('goods-visible').addEventListener('scroll', (event) => {
    // If you have reached the end of the list of products
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 0.5) {
        loadProducts();
    }
})

async function getProducts() {
    await axios.get('https://fakestoreapi.com/products/')
        .then(function (response) {
            response.data.forEach(productObj => {
                products.push({
                    id: productObj.id,
                    image: productObj.image,
                    title: productObj.title,
                    description: productObj.description,
                    price: productObj.price,
                    rateValue: productObj.rating.rate,
                    rateCount: productObj.rating.count,
                    cartAmount: 0
                });
            })
        })
        .catch(function (error) {
            console.log(error);
        })
    loadProducts();
}

getProducts()

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

function updateCartPrice(amount) {
    cart.orderPrice += amount;
    cart.orderPrice = Math.round(cart.orderPrice * 100) / 100;
    document.getElementById('order-price').innerText = `${cart.orderPrice}$`;
}

function delProduct(cartProduct) {
    // Removing an HTML product element from the cart
    document.getElementById(`cart-good${cartProduct.id}`).remove();

    // Stop displaying the quantity of the product
    document.getElementById(`product-amount-container${cartProduct.id}`).style.display = 'none';

    // Display the product purchase button
    document.getElementById(`buy-button${cartProduct.id}`).style.display = '';

    // Remove the product id from the cart
    cart.ids.splice(cart.ids.indexOf(cartProduct.id), 1);

    updateProductsCount();
    updateCartPrice(-cartProduct.price * cartProduct.cartAmount);
}

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

function loadProducts() {
    // Display additional 9 products
    const productsToDisplay = products.slice(productsShowed, productsShowed + 9);
    productsToDisplay.forEach(productObj => {
        displayProduct(productObj, false);
    })
    productsShowed += 9;

    // If the scrollbar didn't appear
    if (document.getElementById('goods-visible').clientHeight === document.getElementById('goods-visible').scrollHeight) {
        loadProducts();
    }
}

function addToCart(productObj) {
    const foundProduct = cart.ids.find(id => productObj.id === id);

    // If there is no such product in the cart
    if (!foundProduct) {
        updateCartPrice(productObj.price);
        updateProductsCount();
        displayProduct(productObj, true);
        cart.ids.push(productObj.id);
        productObj.cartAmount = 1;
        document.getElementById(`buy-button${productObj.id}`).style.display = 'none';
        document.getElementById(`product-amount-container${productObj.id}`).style.display = '';
        document.getElementById(`product-amount${productObj.id}`).innerText = '1pc.';
        document.getElementById(`cart-amount${productObj.id}`).innerText = '1pc.';
        updateProductsCount();
    }
}

function displayProduct(productObj, isCart) {
    const product = document.createElement('div');
    product.classList.add('product');

    const productImg = document.createElement('div');
    productImg.classList.add('product-img');
    productImg.style.backgroundImage = `url("${productObj.image}")`;

    const starsGray = document.createElement('img');
    starsGray.src = 'images/stars_gray.webp';
    starsGray.alt = '';

    const starsGold = document.createElement('img');
    // Calculate the size of the transparency mask for golden stars
    starsGold.classList.add('rate-mask');
    starsGold.style.maskSize = `calc(129px * ${productObj.rateValue} / 5) 30px`;
    starsGold.style.webkitMaskSize = `calc(129px * ${productObj.rateValue} / 5) 30px`;
    starsGold.src = 'images/stars_gold.webp'
    starsGold.alt = '';

    const rate = document.createElement('div');
    rate.classList.add('rate');
    rate.appendChild(starsGray);
    rate.appendChild(starsGold);

    const rateCount = document.createElement('p');
    rateCount.classList.add('rate-count');
    rateCount.innerText = `(${productObj.rateCount})`;

    const rating = document.createElement('div');
    rating.classList.add('rating');
    rating.appendChild(rate);
    rating.appendChild(rateCount);

    const productTitle = document.createElement('p');
    productTitle.classList.add('product-title');
    productTitle.classList.add('text-wrapper');
    productTitle.innerText = productObj.title;

    const decreaseProduct = document.createElement('button');
    decreaseProduct.classList.add('change-count-product');
    decreaseProduct.style.backgroundImage = "url('/images/minus.webp')";
    decreaseProduct.addEventListener('click', () => {
        changeCountProduct(productObj, false);
    });

    const amount = document.createElement('p');
    amount.classList.add('amount');

    const increaseProduct = document.createElement('button');
    increaseProduct.classList.add('change-count-product');
    increaseProduct.style.backgroundImage = "url('/images/plus.webp')";
    increaseProduct.addEventListener('click', () => {
        changeCountProduct(productObj, true);
    })

    const amountContainer = document.createElement('div');
    amountContainer.classList.add('amount-container');
    amountContainer.appendChild(decreaseProduct);
    amountContainer.appendChild(amount);
    amountContainer.appendChild(increaseProduct);

    if (isCart) {
        product.id = `cart-good${productObj.id}`;
        amount.id = `cart-amount${productObj.id}`;

        const deleteProduct = document.createElement('div');
        deleteProduct.classList.add('delete-product');
        deleteProduct.addEventListener('click', () => {
            delProduct(productObj);
        });

        const productDescriptionLink = document.createElement('a');
        productDescriptionLink.innerText = `${productObj.description}`;
        productDescriptionLink.href = `#${productObj.id}`;

        const productDescription = document.createElement('div');
        productDescription.classList.add('product-description');
        productDescription.classList.add('text-wrapper');
        productDescription.appendChild(productDescriptionLink);

        const amountPrice = document.createElement('div');
        amountPrice.id = `amount-price${productObj.id}`;
        amountPrice.innerText = `1pc. x ${productObj.price}$`

        const totalPrice = document.createElement('div');
        totalPrice.id = `total-price${productObj.id}`;
        totalPrice.innerText = `= ${productObj.price}$`;

        const productPrice = document.createElement('div');
        productPrice.classList.add('product-price');
        productPrice.appendChild(amountPrice);
        productPrice.appendChild(totalPrice);

        product.appendChild(deleteProduct);
        product.appendChild(productImg);
        product.appendChild(rating);
        product.appendChild(rateCount);
        product.appendChild(productTitle);
        product.appendChild(productDescription);
        product.appendChild(productPrice);
        product.appendChild(amountContainer);

        document.getElementById('cart-goods').appendChild(product);
    } else {
        product.id = `${productObj.id}`;
        amount.id = `product-amount${productObj.id}`;
        amountContainer.id = `product-amount-container${productObj.id}`;
        amountContainer.style.display = 'none';

        const productDescription = document.createElement('p');
        productDescription.classList.add('product-description');
        productDescription.classList.add('text-wrapper');
        productDescription.innerText = `${productObj.description}`;

        const productPrice = document.createElement('p');
        productPrice.classList.add('product-price');
        productPrice.innerText = `${productObj.price}$`;
        productPrice.style.fontSize = '16px';

        const buyButton = document.createElement('button');
        buyButton.classList.add('buy-button');
        buyButton.id = `buy-button${productObj.id}`
        buyButton.innerText = 'Add to cart';
        buyButton.addEventListener('click', () => {
            addToCart(productObj);
        });

        product.appendChild(productImg);
        product.appendChild(rating);
        product.appendChild(rateCount);
        product.appendChild(productTitle);
        product.appendChild(productDescription);
        product.appendChild(productPrice);
        product.appendChild(buyButton);
        product.appendChild(amountContainer);

        document.getElementById('goods').appendChild(product);
    }
}