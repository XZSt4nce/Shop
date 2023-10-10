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

const sidebar = document.getElementById('sidebar');
const cartGoods = document.getElementById('cart-goods');
const goodsVisible = document.getElementById('goods-visible');
const goods = document.getElementById('goods');
const message = document.getElementById('message');
const cart = []; // Хранит id товаров, которые добавлены в корзину

let isSidebarOpen = false
let isMessageNotOpen = true;
let orderPrice = 0; // Цена заказа
let products = []; // Загруженный список доступных продуктов
let productsNotOut = true; // Ещё остались продукты, которые можно дозагрузить в products

loadProducts();

document.getElementById('sidebar-box').addEventListener("click", () => {
    if (isSidebarOpen) {
        sidebar.style.left = `-${sidebar.offsetWidth}px`;
        isSidebarOpen = false;
    }
    else {
        sidebar.style.left = "0";
        isSidebarOpen = true;
    }
});

document.getElementById('order').addEventListener('click', () => {
    if (isMessageNotOpen) {
        isMessageNotOpen = false;
        const backIds = cart.filter(id => id);
        if (backIds.length === 0) {
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

goodsVisible.addEventListener('scroll', (event) => {
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

function delProduct(id, element, productsAmount, productsBuyContainer) {
    const product = products[id];
    orderPrice -= product.cartAmount * product.price;
    updateCartPrice();
    product.cartAmount = 0;
    cartGoods.removeChild(element);
    productsAmount.style.display = 'none';
    productsBuyContainer.style.display = '';
    cart.splice(cart.indexOf(id), 1);
}

function decProduct(id, amountPrice, totalPrice, cartAmount, productsAmount, productsBuyContainer) {
    const cartProduct = products[id];
    cartProduct.cartAmount--;
    productsAmount.children[1].innerText = `${cartProduct.cartAmount}pc.`;
    if (cartProduct.cartAmount === 0) {
        delProduct(id, cartAmount.parentNode.parentNode, productsAmount, productsBuyContainer);
    }
    amountPrice.innerText = `${cartProduct.cartAmount}pc. x ${cartProduct.price}$`;
    totalPrice.innerText = `= ${cartProduct.cartAmount * cartProduct.price}$`;
    cartAmount.innerText = `${cartProduct.cartAmount}pc.`;
    orderPrice -= cartProduct.price;
    updateCartPrice();
}

function incProduct(id, amountPrice, totalPrice, cartAmount, productsAmount) {
    const cartProduct = products[id];
    cartProduct.cartAmount++;
    productsAmount.children[1].innerText = `${cartProduct.cartAmount}pc.`;
    amountPrice.innerText = `${cartProduct.cartAmount}pc. x ${cartProduct.price}$`;
    totalPrice.innerText = `= ${Math.round(cartProduct.cartAmount * cartProduct.price * 100) / 100}$`;
    cartAmount.innerText = `${cartProduct.cartAmount}pc.`;
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
            const product = document.createElement('div');
            product.id = productObj.id;
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
            let cartProduct;

            product.classList.add('product');
            productImg.classList.add('product-img');
            productImg.style.backgroundImage = `url("${productObj.img}")`;
            rating.classList.add('rating');
            rate.classList.add('rate');
            starsGray.src = 'images/stars_gray.png';
            starsGray.height = 30;
            starsGray.alt = '';
            starsGold.classList.add('rate-mask');
            starsGold.style.maskSize = `calc(129px * ${productObj.rate} / 5) 30px`;
            starsGold.style.webkitMaskSize = `calc(129px * ${productObj.rate} / 5) 30px`;
            starsGold.src = 'images/stars_gold.png'
            starsGold.height = 30;
            starsGold.alt = '';
            rateCount.classList.add('rate-count');
            rateCount.innerText = `(${productObj.rateCount})`;
            productTitle.classList.add('product-title');
            productTitle.innerText = productObj.title;
            productDescription.classList.add('product-description');
            productDescription.innerText = productObj.description;
            productPrice.classList.add('product-price');
            productPrice.innerText = `${productObj.price}$`;
            productPrice.style.fontSize = '16px';
            buyContainer.classList.add('buy-container');
            buyContainer.innerText = 'Add to cart';
            amountContainer.classList.add('amount-container');
            amountContainer.style.display = 'none';
            decreaseProduct.classList.add('decrease-product');
            amount.classList.add('amount');
            increaseProduct.classList.add('increase-product');

            buyContainer.addEventListener('click', () => {
                cartProduct = addToCart(productObj.id, amountContainer, buyContainer);
                buyContainer.style.display = 'none';
                amount.innerText = '1pc.';
                amountContainer.style.display = '';
                cart[productObj.id] = productObj.backId;
            });

            decreaseProduct.addEventListener('click', () => {
                decProduct(productObj.id, cartProduct.amountPrice, cartProduct.totalPrice, cartProduct.cartAmount, amountContainer, buyContainer);
            });

            increaseProduct.addEventListener('click', () => {
                incProduct(productObj.id, cartProduct.amountPrice, cartProduct.totalPrice, cartProduct.cartAmount, amountContainer, buyContainer);
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

            goods.appendChild(product);
        })
        if (goodsVisible.clientHeight === goodsVisible.scrollHeight) {
            loadProducts();
        }
    }
}

function addToCart(id, productsAmount, productsBuyContainer) {
    if (products[id].cartAmount === 0) {
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
        const productObj = products[id];

        product.classList.add('product');
        deleteProduct.classList.add('delete-product');
        productImg.classList.add('product-img');
        productImg.style.backgroundImage = `url("${productObj.img}")`;
        productTitle.classList.add('product-title');
        productTitle.classList.add('text-wrapper');
        productTitle.innerText = productObj.title;
        productDescription.classList.add('product-description');
        productDescription.classList.add('text-wrapper');
        productDescriptionLink.innerText = productObj.description;
        productDescriptionLink.href = `#${id}`;
        productPrice.classList.add('product-price');
        amountPrice.innerText = `1pc. x ${productObj.price}$`
        orderPrice += productObj.price;
        updateCartPrice();
        totalPrice.innerText = `= ${productObj.price}$`;
        amountContainer.classList.add('amount-container');
        decreaseProduct.classList.add('decrease-product');
        amount.classList.add('amount');
        amount.innerText = '1pc.';
        increaseProduct.classList.add('increase-product');

        deleteProduct.addEventListener('click', () => {
            delProduct(id, product, productsAmount, productsBuyContainer);
        });
        decreaseProduct.addEventListener('click', () => {
            decProduct(id, amountPrice, totalPrice, amount, productsAmount, productsBuyContainer);
        });
        increaseProduct.addEventListener('click', () => {
            incProduct(id, amountPrice, totalPrice, amount, productsAmount, productsBuyContainer);
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

        cartGoods.appendChild(product);
        products[id].cartAmount++;
        return {
            amountPrice: amountPrice,
            totalPrice: totalPrice,
            cartAmount: amount
        };
    }
    return -1;
}