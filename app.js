//variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// cart
let cart = [];
let buttonsDom = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let { items: data } = await fetch("./products.json").then((data) =>
        data.json()
      );
      let newData = data.map(
        ({
          sys: { id },
          fields: {
            price,
            title,
            image: {
              fields: {
                file: { url },
              },
            },
          },
        }) => ({ id, price, title, url })
      );
      return newData;
    } catch (error) {
      console.log("Error Fetching !!");
    }
  }
}
// display products
class UI {
  displayProducts(products) {
    // 1first Method
    productsDOM.innerHTML = products
      .map(
        ({ id, price, title, url }) => `
      <article class="product">
          <div class="img-container">
            <img
              src="${url}"
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id="${id}">
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${title}</h3>
          <h4>${price}</h4>
        </article>
      `
      )
      .join("");
    // *************
    // 2 seconde Method
    // let result = "";
    // products.forEach(({ id, price, title, url }) => {
    //   result += `
    //   <article class="product">
    //       <div class="img-container">
    //         <img
    //           src="${url}"
    //           alt="product"
    //           class="product-img"
    //         />
    //         <button class="bag-btn" data-id="${price}">
    //           <i class="fas fa-shopping-cart"></i>
    //           add to bag
    //         </button>
    //       </div>
    //       <h3>${title}</h3>
    //       <h4>${price}</h4>
    //     </article>
    //   `;
    // });
    // productsDOM.innerHTML = result;
    //////////
  }
  getBagButtons() {
    let buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDom = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In The Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (e) => {
        e.target.innerText = "In The Cart";
        e.target.disabled = true;
        ///Get products from products;
        let item = Storage.getProductStorage(id);
        ///setItem in Cart
        let newItem = { ...item, amount: 1 };
        cart = [...cart, newItem];
        ///SetCart to LocalStorage
        Storage.setToLocalStorage("cart", cart);

        this.setCartItem(cart);
        this.displayItemCart(newItem);
        this.showCart();
      });
    });
    // console.log(buttons);
  }
  setCartItem(cart) {
    let totalItem = 0;
    let totalPrice = 0;
    cart.forEach((item) => {
      totalItem += item.amount;
      totalPrice += item.amount * item.price;
    });
    cartItems.innerText = totalItem;
    cartTotal.innerText = parseFloat(totalPrice.toFixed(2));
  }
  displayItemCart({ id, price, title, url, amount }) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
            <img src="${url}" alt="product" />
            <div>
              <h4>${title}</h4>
              <h5>$${price}</h5>
              <span class="remove-item" data-id="${id}">remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id="${id}"></i>
              <p class="item-amount">${amount}</p>
              <i class="fas fa-chevron-down" data-id="${id}"></i>
            </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartDOM.classList.add("showCart");
    cartOverlay.classList.add("transparentBcg");
  }
  removeCart() {
    cartDOM.classList.remove("showCart");
    cartOverlay.classList.remove("transparentBcg");
  }
  setApp() {
    cart = Storage.getCart();
    this.setCartItem(cart);
    cart.forEach((item) => this.displayItemCart(item));
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.removeCart);
    cartOverlay.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      this.removeCart();
    });
    // console.log(cartContent);
  }
  cartLogic() {
    cartDOM.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      console.log("hi");
    });
    clearCartBtn.addEventListener("click", (ev) => {
      ev.stopImmediatePropagation();
      this.clearCartBtn();
    });
    cartContent.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      if (e.target.classList.contains("remove-item")) {
        let id = e.target.dataset.id;
        e.target.parentElement.parentElement.remove();
        this.removeItem(id);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let id = e.target.dataset.id;
        let chevronUp = e.target;
        let item = cart.find((item) => item.id == id);
        item.amount += 1;
        this.setCartItem(cart);
        Storage.setToLocalStorage("cart", cart);
        chevronUp.nextElementSibling.innerText = item.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let chevronDown = e.target;
        let id = chevronDown.dataset.id;
        let item = cart.find((item) => item.id == id);
        item.amount -= 1;

        if (item.amount <= 0) {
          e.target.parentElement.parentElement.remove();
          this.removeItem(id);
        }
        this.setCartItem(cart);
        Storage.setToLocalStorage("cart", cart);
        // previousElementSibling
        chevronDown.previousElementSibling.innerText = item.amount;
      }
    });
  }
  clearCartBtn() {
    let cartId = cart.map((item) => item.id);
    cartId.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      // cartContent.children[0].remove();
      cartContent.removeChild(cartContent.children[0]);
    }
    this.removeCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id != id);
    this.setCartItem(cart);
    Storage.setToLocalStorage("cart", cart);
    let button = this.getSingleButton(id);
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to Cart`;
    button.disabled = false;
    console.log(cart);
  }
  getSingleButton(id) {
    return buttonsDom.find((btn) => btn.dataset.id == id);
  }
}
//local storage
class Storage {
  static setToLocalStorage(name, products) {
    localStorage.setItem(name, JSON.stringify(products));
  }
  static getProductStorage(id) {
    return JSON.parse(localStorage.getItem("products")).find(
      (product) => product.id == id
    );
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setApp();
  products
    .getProducts()
    .then((data) => {
      ui.displayProducts(data);
      Storage.setToLocalStorage("products", data);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
