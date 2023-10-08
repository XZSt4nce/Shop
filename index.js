class Product {
    constructor(id, img, title, description, price, rate, rateCount) {
        this.id = id;
        this.img = img;
        this.title = title;
        this.description = description;
        this.price = price;
        this.rate = rate;
        this.rateCount = rateCount;
        this.cartAmount = 0;
    }
}

const sidebar = document.getElementById('sidebar');
const sidebarBox = document.getElementById('sidebar-box');
const cartGoods = document.getElementById('cart-goods');
// const cart = []; // Хранит id товаров, которые добавлены в корзину

let isSidebarOpen = false
let orderPrice = 0; // Цена заказа
let products = []; // Загруженный список доступных продуктов
let productsNotOut = true; // Ещё остались продукты, которые можно дозагрузить в products

loadProducts();

sidebarBox.addEventListener("click", () => {
    if (isSidebarOpen) {
        sidebar.style.left = `-${sidebar.offsetWidth}px`;
        isSidebarOpen = false;
    }
    else {
        sidebar.style.left = "0";
        isSidebarOpen = true;
    }
});

async function loadProducts() {
    if (productsNotOut) {
        const productsLength = products.length + 1;
        let additionProducts = [];
        for(let i = productsLength; i < productsLength + 10; i++) {
            await axios.get(`https://fakestoreapi.com/products/${i}`)
                .then(function (response) {
                    const data = response.data;
                    if (data === '') {
                        productsNotOut = false;
                        return;
                    }
                    const product = new Product(
                        data['id'],
                        data['image'],
                        data['title'],
                        data['description'],
                        data['price'],
                        data['rating']['rate'],
                        data['rating']['count']
                    )
                    additionProducts.push(product);
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
        products = [...products, ...additionProducts];
    }
}

function updateCartPrice() {
    orderPrice = Math.round(orderPrice * 100) / 100;
    document.getElementById('order-price').innerText = `${orderPrice}₽`;
}

function delProduct(element, productsBuyContainer) {
    cartGoods.removeChild(element);
}

function decProduct(id, amountPrice, totalPrice, cartAmount, productsAmount) {

    const cartProduct = products[id];
    cartProduct.cartAmount--;
    // productsAmount.innerText = `${cartProduct.cartAmount}pc.`;
    if (cartProduct.cartAmount === 0) {
        // delProduct(cartAmount.parentNode.parentNode, productsAmount.parentNode);
        delProduct(cartAmount.parentNode.parentNode);
    }
    amountPrice.innerText = `${cartProduct.cartAmount}pc. x ${cartProduct.price}₽`;
    totalPrice.innerText = `= ${cartProduct.cartAmount * cartProduct.price}₽`;
    cartAmount.innerText = `${cartProduct.cartAmount}pc.`;
    orderPrice -= cartProduct.price;
    updateCartPrice();
}

function incProduct(id, amountPrice, totalPrice, cartAmount, productsAmount) {
    const cartProduct = products[id];
    cartProduct.cartAmount++;
    // productsAmount.innerText = `${cartProduct.cartAmount}pc.`;
    amountPrice.innerText = `${cartProduct.cartAmount}pc. x ${cartProduct.price}₽`;
    totalPrice.innerText = `= ${Math.round(cartProduct.cartAmount * cartProduct.price * 100) / 100}₽`;
    cartAmount.innerText = `${cartProduct.cartAmount}pc.`;
    orderPrice += cartProduct.price;
    updateCartPrice()
}

function addToCart(id, productsBuyContainer) {
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
        const cartAmount = document.createElement('div');
        const decreaseProduct = document.createElement('div');
        const amount = document.createElement('div');
        const increaseProduct = document.createElement('div');
        const productObj = products[id];

        product.classList.add('product');
        deleteProduct.classList.add('delete-product');
        productImg.classList.add('product-img');
        productImg.style.backgroundImage = `url("${productObj.img}")`;
        productTitle.classList.add('product-title');
        productTitle.innerText = productObj.title;
        productDescription.classList.add('product-description');
        productDescriptionLink.innerText = productObj.description;
        productDescriptionLink.href = `#${id}`;
        productPrice.classList.add('product-price');
        amountPrice.classList.add('amount-price');
        amountPrice.innerText = `1pc. x ${productObj.price}₽`
        orderPrice += productObj.price;
        updateCartPrice();
        totalPrice.classList.add('total-price');
        totalPrice.innerText = `= ${productObj.price}₽`;
        cartAmount.classList.add('cart-amount');
        decreaseProduct.classList.add('decrease-product');
        amount.classList.add('amount');
        amount.innerText = '1pc.';
        increaseProduct.classList.add('increase-product');

        deleteProduct.addEventListener('click', () => {
            delProduct(id, productsBuyContainer);
        });
        decreaseProduct.addEventListener('click', () => {
            decProduct(id, amountPrice, totalPrice, amount);
        });
        increaseProduct.addEventListener('click', () => {
            incProduct(id, amountPrice, totalPrice, amount);
        });

        productPrice.appendChild(amountPrice);
        productPrice.appendChild(totalPrice);

        cartAmount.appendChild(decreaseProduct);
        cartAmount.appendChild(amount);
        cartAmount.appendChild(increaseProduct);

        product.appendChild(deleteProduct);
        product.appendChild(productImg);
        product.appendChild(productTitle);
        product.appendChild(productDescription);
        product.appendChild(productPrice);
        product.appendChild(cartAmount);

        cartGoods.appendChild(product);

        products[id].cartAmount++;
    }
}