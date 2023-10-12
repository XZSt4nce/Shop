const cart = {
    ids: [], // id товаров, которые добавлены в корзину
    orderPrice: 0 // Цена заказа
}

let isSidebarOpen = false
let isMessageNotOpen = true;
let products = []; // Загруженный список доступных продуктов

getProducts();

document.getElementById('sidebar-box').addEventListener("click", () => {
    if (isSidebarOpen) {
        document.getElementById('sidebar').style.left = `-${document.getElementById('sidebar').offsetWidth}px`;
        isSidebarOpen = false;
    }
    else {
        document.getElementById('sidebar').style.left = "0";
        isSidebarOpen = true;
    }
});

document.getElementById('order').addEventListener('click', () => {
    const message = document.getElementById('message');
    if (isMessageNotOpen) {
        isMessageNotOpen = false;
        if (cart.ids.length === 0) {
            message.style.background = 'red';
            message.innerText = 'The order is empty!';
        } else {
            const cartProducts = [];
            for (let i = 0; i < cart.ids.length; i++) {
                cartProducts.push(getProductById(cart.ids[i]));
            }
            console.log(cartProducts);
            message.style.background = 'springgreen';
            message.innerText = 'The order has been placed. Thank you for your purchase!';
        }
        message.style.top = '10px';
        setTimeout(() => {
            message.style.top = '-100px'
        }, 2000);
        setTimeout(() => {isMessageNotOpen = true}, 2500);
    }
})

document.getElementById('goods-visible').addEventListener('scrollend', () => {
    loadProducts();
})

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

function getProductById(id) {
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            return products[i];
        }
    }
    return -1;
}

function updateCartPrice() {
    cart.orderPrice = Math.round(cart.orderPrice * 100) / 100;
    document.getElementById('order-price').innerText = `${cart.orderPrice}$`;
}

function buy(productObj) {
    addToCart(productObj);
    cart.ids.push(productObj.id);
    productObj.cartAmount = 1;
    document.getElementById('products-count').innerText = `${cart.ids.length}`;
    document.getElementById(`buy-container${productObj.id}`).style.display = 'none';
    document.getElementById(`product-amount${productObj.id}`).innerText = '1pc.';
    document.getElementById(`product-amount-container${productObj.id}`).style.display = '';
}

function delProduct(cartProduct) {
    document.getElementById(`cart-good${cartProduct.id}`).remove();
    document.getElementById(`product-amount-container${cartProduct.id}`).style.display = 'none';
    document.getElementById(`buy-container${cartProduct.id}`).style.display = '';
    cart.ids.splice(cart.ids.indexOf(cartProduct.id), 1);
    document.getElementById('products-count').innerText = `${cart.ids.length}`;
    if (cart.ids.length === 0) {
        document.getElementById('products-count').style.display = '';
    }
    cart.orderPrice -= cartProduct.price * cartProduct.cartAmount;
    updateCartPrice();
}

function decProduct(cartProduct) {
    cartProduct.cartAmount--;
    document.getElementById(`amount-price${cartProduct.id}`).innerText = `${cartProduct.cartAmount}pc. x ${cartProduct.price}$`;
    document.getElementById(`total-price${cartProduct.id}`).innerText = `= ${cartProduct.cartAmount * cartProduct.price}$`;
    document.getElementById(`cart-amount${cartProduct.id}`).innerText = `${cartProduct.cartAmount}pc.`;
    document.getElementById(`product-amount${cartProduct.id}`).innerText = `${cartProduct.cartAmount}pc.`;
    if (cartProduct.cartAmount === 0) {
        delProduct(cartProduct);
    }
    cart.orderPrice -= cartProduct.price;
    updateCartPrice();
}

function incProduct(cartProduct) {
    cartProduct.cartAmount++;
    document.getElementById(`product-amount${cartProduct.id}`).innerText = `${cartProduct.cartAmount}pc.`;
    document.getElementById(`amount-price${cartProduct.id}`).innerText = `${cartProduct.cartAmount}pc. x ${cartProduct.price}$`;
    document.getElementById(`total-price${cartProduct.id}`).innerText = `= ${Math.round(cartProduct.cartAmount * cartProduct.price * 100) / 100}$`;
    document.getElementById(`cart-amount${cartProduct.id}`).innerText = `${cartProduct.cartAmount}pc.`;
    cart.orderPrice += cartProduct.price;
    updateCartPrice()
}

function loadProducts() {
    const productsShowed = document.getElementById('goods').children.length;
    for(let i = productsShowed; i < productsShowed + 3; i++) {
        displayProduct(products[i]);
    }

    if (document.getElementById('goods-visible').clientHeight === document.getElementById('goods-visible').scrollHeight) {
        loadProducts();
    }
}

function addToCart(productObj) {
    if (!cart.ids.includes(productObj.id)) {
        cart.orderPrice += productObj.price;
        updateCartPrice();
        document.getElementById('products-count').innerText = `${cart.ids.length}`;
        document.getElementById('products-count').style.display = 'initial';

        displayCartProduct(productObj);
    }
}

function displayProduct(productObj) {
    const product = document.createElement('div');
    const productImg = document.createElement('div');
    const rating = document.createElement('div');
    const rate = document.createElement('div');
    const starsGray = document.createElement('img');
    const starsGold = document.createElement('img');
    const rateCount = document.createElement('div');
    const productTitle = document.createElement('div');
    const productDescription = document.createElement('a');
    const productPrice = document.createElement('div');
    const buyContainer = document.createElement('button');
    const amountContainer = document.createElement('div');
    const decreaseProduct = document.createElement('button');
    const amount = document.createElement('div');
    const increaseProduct = document.createElement('button');

    product.classList.add('product');
    product.id = productObj.id;

    productImg.classList.add('product-img');
    productImg.style.backgroundImage = `url("${productObj.image}")`;

    rating.classList.add('rating');

    rate.classList.add('rate');

    starsGray.src = 'images/stars_gray.webp';
    starsGray.height = 30;
    starsGray.alt = '';

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

    productDescription.innerText = productObj.description;
    productDescription.classList.add('product-description');
    productDescription.classList.add('text-wrapper');

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
        decProduct(productObj);
    });

    increaseProduct.addEventListener('click', () => {
        incProduct(productObj);
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

    productDescriptionLink.innerText = productObj.description;
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
        decProduct(productObj);
    });
    increaseProduct.addEventListener('click', () => {
        incProduct(productObj);
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
    document.getElementById('products-count').innerText = `${cart.ids.length}`;
    document.getElementById('products-count').style.display = 'initial';
}
//         <div class="product-img" style="background-image: url('${products[id].image}')"></div>
//         <div class="product-title text-wrapper">
//             <a href="#${id}" style="text-decoration: none; color: black;">
//                 ${products[id].title}
//             </a>
//         </div>
//         <div class="product-description text-wrapper">
//             <a href="#${id}">
//                 ${products[id].description}
//             </a>
//         </div>
//         <div class="product-price">
//             <div id="ap${id}">
//                 1pc. x ${products[id].price}$
//             </div>
//             <div id="tp${id}">
//                 = ${products[id].price}$
//             </div>
//         </div>
//         <div class="amount-container">
//             <button class="change-count-product" style="background-image: url('/images/minus.webp');" onclick="decProduct(${id})"></button>
//             <div class="amount" id="cart-amount${id}">
//                 1pc.
//             </div>
//             <button class="change-count-product" style="background-image: url('/images/plus.webp');" onclick="incProduct(${id})"></button>
//         </div>
//     </div>
// `;