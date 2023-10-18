const cart = {
    ids: [],
    orderPrice: 0
}
const products = [];
let productsShowed = 0;

(async function getProducts() {
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
        });
    loadProducts();
})();

document.getElementById('sidebar-box').addEventListener("click", () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.offsetLeft === 0) {
        // Hide sidebar
        sidebar.style.left = `-${sidebar.offsetWidth}px`;
    }
    else {
        // Show sidebar
        sidebar.style.left = "0";
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
            message.style.top = '-100px';
        }, 2000);
    }
})

document.getElementById('message').addEventListener('click', (event) => {
    event.target.style.top = '-100px';
});

function updateProductsCount() {
    const productsCount = document.getElementById('products-count');
    productsCount.style.display = 'initial';
    productsCount.innerText = `${cart.ids.length}`;
    if (cart.ids.length === 0) {
        productsCount.style.display = '';
    }
}

function updateCartPrice(amount) {
    cart.orderPrice += amount;
    cart.orderPrice = Number(parseFloat(cart.orderPrice).toFixed(2));
    document.getElementById('order-price').innerText = `${cart.orderPrice}$`;
}

function loadProducts() {
    // Display additional 9 products
    const productsToDisplay = products.slice(productsShowed, productsShowed + 9);
    productsToDisplay.forEach(productObj => {
        displayProduct(productObj, false);
    })
    productsShowed += 9;

    // If the scrollbar didn't appear
    if (document.getElementById('goods').clientHeight === document.getElementById('goods').scrollHeight) {
        loadProducts();
    }
}

document.getElementById('goods').addEventListener('scroll', (event) => {
    // If you have reached the end of the list of products
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 0.5) {
        loadProducts();
    }
});

function displayProduct(productObj, isCart) {
    const delProduct = function(cartProduct) {
        document.getElementById(`cart-good${cartProduct.id}`).remove();
        document.getElementById(`product-amount-container${cartProduct.id}`).style.display = 'none';
        document.getElementById(`buy-button${cartProduct.id}`).style.display = '';
        cart.ids.splice(cart.ids.indexOf(cartProduct.id), 1);

        updateProductsCount();
        updateCartPrice(-cartProduct.price * cartProduct.cartAmount);
    }

    const changeCountProduct = function(productObj, isIncreased) {
        // Decrease/increase the quantity of ordered goods
        productObj.cartAmount += 2 * isIncreased - 1;

        document.getElementById(`amount-price${productObj.id}`).innerText = `${productObj.cartAmount}pc. x ${productObj.price}$`;
        document.getElementById(`total-price${productObj.id}`).innerText = `= ${(productObj.cartAmount * productObj.price).toFixed(2)}$`;
        document.getElementById(`cart-amount${productObj.id}`).innerText = `${productObj.cartAmount}pc.`;
        document.getElementById(`product-amount${productObj.id}`).innerText = `${productObj.cartAmount}pc.`;

        if (productObj.cartAmount === 0) {
            delProduct(productObj);
        }
        updateCartPrice(productObj.price * (2 * isIncreased - 1));
    }

    const addToCart = function(productObj) {
        const foundProduct = cart.ids.find(id => productObj.id === id);
        if (!foundProduct) {
            updateCartPrice(productObj.price);
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

    const product = document.createElement('div');
    product.classList.add('product');

    const productImg = document.createElement('div');
    productImg.classList.add('product-img');
    productImg.style.backgroundImage = `url("${productObj.image}")`;

    const starsGray = document.createElement('p');
    starsGray.innerText = '★★★★★';
    starsGray.style.color = 'darkgray';

    const starsGold = document.createElement('p');
    const maskSize = productObj.rateValue / 5 * 100;
    starsGold.classList.add('rate-mask');
    starsGold.innerText = '★★★★★';
    starsGold.style.maskSize = `${maskSize}%`;
    starsGold.style.webkitMaskSize = `${maskSize}%`;

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
    productTitle.classList.add('text');
    productTitle.style.fontSize = '18px';
    productTitle.style.fontWeight = 'bold';
    productTitle.innerText = productObj.title;

    const decreaseProduct = document.createElement('button');
    decreaseProduct.classList.add('change-count-product');
    decreaseProduct.innerText = "–";
    decreaseProduct.addEventListener('click', () => {
        changeCountProduct(productObj, false);
    });

    const amount = document.createElement('p');
    amount.classList.add('amount');

    const increaseProduct = document.createElement('button');
    increaseProduct.classList.add('change-count-product');
    increaseProduct.innerText = "+";
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

        const deleteProduct = document.createElement('button');
        deleteProduct.classList.add('delete-product');
        deleteProduct.innerText = "X";
        deleteProduct.addEventListener('click', () => {
            delProduct(productObj);
        });

        const productDescriptionLink = document.createElement('a');
        productDescriptionLink.innerText = `${productObj.description}`;
        productDescriptionLink.href = `#${productObj.id}`;

        const productDescription = document.createElement('div');
        productDescription.classList.add('text');
        productDescription.appendChild(productDescriptionLink);

        const amountPrice = document.createElement('div');
        amountPrice.id = `amount-price${productObj.id}`;
        amountPrice.innerText = `1pc. x ${productObj.price}$`;

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
        if (productObj.id % 2 === 0) {
            product.classList.add('column-2');
        }
        if (productObj.id % 3 === 0) {
            product.classList.add('column-3');
        }

        amount.id = `product-amount${productObj.id}`;
        amountContainer.id = `product-amount-container${productObj.id}`;
        amountContainer.style.display = 'none';

        const productDescription = document.createElement('p');
        productDescription.classList.add('text');
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