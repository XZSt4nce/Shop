class Product {
    constructor(id, img, title, description, price, rate, rateCount, backId) {
        this.id = id;
        this.img = img;
        this.title = title;
        this.description = description;
        this.price = price;
        this.rate = rate;
        this.rateCount = rateCount;
        this.cartAmount = 0;
        this.backId = backId;
    }
}

const cart = []; // Хранит id товаров, которые добавлены в корзину
let isSidebarOpen = false
let isMessageNotOpen = true;
let orderPrice = 0; // Цена заказа
let products = []; // Загруженный список доступных продуктов
let productsCount = 0; // Количество уникальных товаров, добавленных в корзину
let productsNotOut = true; // Ещё остались продукты, которые можно дозагрузить в products

loadProducts();

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
        const backIds = cart.filter(id => id);
        console.log(backIds)
        if (productsCount === 0) {
            message.style.background = 'red';
            message.innerText = 'The order is empty!';
        } else {
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

document.getElementById('goods-visible').addEventListener('scroll', (event) => {
    if (productsNotOut) {
        if (event.target.scrollTop + event.target.offsetHeight === event.target.scrollHeight) {
            loadProducts();
        }
    }
})

function updateCartPrice() {
    orderPrice = Math.round(orderPrice * 100) / 100;
    document.getElementById('order-price').innerText = `${orderPrice}$`;
}

function buy(event, id, backId) {
    addToCart(id, document.getElementById(`ac${id}`), event.target);
    event.target.style.display = 'none';
    document.getElementById(`pam${id}`).innerText = '1pc.';
    document.getElementById(`pac${id}`).style.display = '';
    cart[id] = backId;
}

function delProduct(id) {
    const product = products[id];
    orderPrice -= product.cartAmount * product.price;
    updateCartPrice();
    product.cartAmount = 0;
    document.getElementById(`cg${id}`).remove();
    document.getElementById(`pac${id}`).style.display = 'none';
    document.getElementById(`bc${id}`).style.display = '';
    cart.splice(cart.indexOf(id), 1);
    productsCount--;
    document.getElementById('products-count').innerText = `${productsCount}`;
    if (productsCount === 0) {
        document.getElementById('products-count').style.display = '';
    }
}

function decProduct(id) {
    products[id].cartAmount--;
    document.getElementById(`ap${id}`).innerText = `${products[id].cartAmount}pc. x ${products[id].price}$`;
    document.getElementById(`tp${id}`).innerText = `= ${products[id].cartAmount * products[id].price}$`;
    document.getElementById(`cam${id}`).innerText = `${products[id].cartAmount}pc.`;
    document.getElementById(`pam${id}`).innerText = `${products[id].cartAmount}pc.`;
    if (products[id].cartAmount === 0) {
        delProduct(id);
    }
    orderPrice -= products[id].price;
    updateCartPrice();
}

function incProduct(id) {
    const cartProduct = products[id];
    cartProduct.cartAmount++;
    document.getElementById(`pam${id}`).innerText = `${cartProduct.cartAmount}pc.`;
    document.getElementById(`ap${id}`).innerText = `${cartProduct.cartAmount}pc. x ${cartProduct.price}$`;
    document.getElementById(`tp${id}`).innerText = `= ${Math.round(cartProduct.cartAmount * cartProduct.price * 100) / 100}$`;
    document.getElementById(`cam${id}`).innerText = `${cartProduct.cartAmount}pc.`;
    orderPrice += cartProduct.price;
    updateCartPrice()
}

async function loadProducts() {
    if (productsNotOut) {
        const productsLength = products.length + 1;
        let additionProducts = [];
        for(let i = productsLength; i < productsLength + 3; i++) {
            await axios.get(`https://fakestoreapi.com/products/${i}`)
                .then(function (response) {
                    const data = response.data;
                    if (data === '') {
                        productsNotOut = false;
                        return;
                    }
                    const product = new Product(
                        products.length + additionProducts.length,
                        data['image'],
                        data['title'],
                        data['description'],
                        data['price'],
                        data['rating']['rate'],
                        data['rating']['count'],
                        data['id']
                    )
                    additionProducts.push(product);
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
        products = [...products, ...additionProducts];

        additionProducts.forEach(productObj => {
            document.getElementById('goods').innerHTML += `
                <div id="${productObj.id}" class="product">
                    <div class="product-img" style="background-image: url('${productObj.img}');"></div>
                    <div class="rating">
                        <div class="rate">
                            <img src="images/stars_gray.png" height="30" alt="">
                            <img class="rate-mask" src="images/stars_gold.png" height="30" alt="" style="-webkit-mask-size: calc(129px * ${productObj.rate} / 5) 30px; mask-size: calc(129px * ${productObj.rate} / 5) 30px;">
                        </div>
                        <div class="rate-count">
                            (${productObj.rateCount})
                        </div>
                    </div>
                    <div class="product-title">
                        ${productObj.title}
                    </div>
                    <div class="product-description">
                        ${productObj.description}
                    </div>
                    <div class="product-price" style="font-size: 16px;">
                        ${productObj.price}$
                    </div>
                    <button class="buy-container" id="bc${productObj.id}" onclick="buy(event, ${productObj.id}, ${productObj.backId})">
                        Add to cart
                    </button>
                    <div class="amount-container" id="pac${productObj.id}" style="display: none">
                        <button class="change-count-product" style="background-image: url('/images/minus.png');" onclick="decProduct(${productObj.id})"></button>
                        <div class="amount" id="pam${productObj.id}">
                            1pc.
                        </div>
                        <button class="change-count-product" style="background-image: url('/images/plus.png');" onclick="incProduct(${productObj.id})"></button>
                    </div>
                </div>
            `;
        })

        if (document.getElementById('goods-visible').clientHeight === document.getElementById('goods-visible').scrollHeight) {
            await loadProducts();
        }
    }
}

function addToCart(id) {
    if (products[id].cartAmount === 0) {
        orderPrice += products[id].price;
        updateCartPrice();

        document.getElementById('cart-goods').innerHTML += `
            <div class="product" id="cg${id}">
                <div class="delete-product" onclick="delProduct(${id})"></div>
                <div class="product-img" style="background-image: url('${products[id].img}')"></div>
                <div class="product-title text-wrapper">
                    <a href="#${id}" style="text-decoration: none; color: black;">
                        ${products[id].title}
                    </a>
                </div>
                <div class="product-description text-wrapper">
                    <a href="#${id}">
                        ${products[id].description}
                    </a>
                </div>
                <div class="product-price">
                    <div id="ap${id}">
                        1pc. x ${products[id].price}$
                    </div>
                    <div id="tp${id}">
                        = ${products[id].price}$
                    </div>
                </div>
                <div class="amount-container">
                    <button class="change-count-product" style="background-image: url('/images/minus.png');" onclick="decProduct(${id})"></button>
                    <div class="amount" id="cam${id}">
                        1pc.
                    </div>
                    <button class="change-count-product" style="background-image: url('/images/plus.png');" onclick="incProduct(${id})"></button>
                </div>
            </div>
        `;

        products[id].cartAmount++;
        productsCount++;
        document.getElementById('products-count').innerText = `${productsCount}`;
        document.getElementById('products-count').style.display = 'initial';
    }
}