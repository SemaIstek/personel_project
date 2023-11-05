let amigrumiList = [],
  basketList = [];

  toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: "toast-bottom-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
  };

const toggleModal = () => {
  const basketModalEl = document.querySelector(".basket__modal");
  basketModalEl.classList.toggle("active");
};

const getAmigrumis = () => {
  fetch("./products.json")
  .then((res) => res.json())
  .then((amigrumis) => 
    (amigrumiList = amigrumis));
};

 getAmigrumis();


const createAmigrumiStars = (starRate) => {
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i)
      starRateHtml += `<i class="bi bi-star-fill active"></i>`;
    else starRateHtml += `<i class="bi bi-star-fill"></i>`;
  }

  return starRateHtml;
};

const createAmigrumiItemsHtml = () => {
  const amigrumiListEl = document.querySelector(".amigrumi__list");
  let amigrumiListHtml = "";
  amigrumiList.forEach((amigrumi, index) => {
    amigrumiListHtml += `<div class="col-5 ${index % 2 == 0 && "offset-2"} my-5">
    <div class="row amigrumi__card">
      <div class="col-6">
        <img
          class="img-fluid shadow"
          src="${amigrumi.imgSource}"
          width="258"
          height="300"
        />
      </div>
      <div class="col-6 d-flex flex-column justify-content-between">
        <div class="amigrumi__detail">
          <span class="fos gray fs-5">${amigrumi.author}</span><br />
          <span class="fs-4 fw-bold">${amigrumi.name}</span><br />
          <span class="amigrumi__star-rate">
            ${createAmigrumiStars(amigrumi.starRate)}
            <span class="gray">${amigrumi.reviewCount} reviews</span>
          </span>
        </div>
        <p class="amigrumi__description fos gray">
          ${amigrumi.description}
        </p>
        <div>
          <span class="black fw-bold fs-4 me-2">${amigrumi.price} CHF</span>
          ${
            amigrumi.oldPrice
              ? `<span class="fs-4 fw-bold old__price">${amigrumi.oldPrice}</span>`
              : ""
          }
        </div>
        <button class="btn__purple" onclick="addBookToBasket(${
          amigrumi.id
        })">ADD BASKET</button>
      </div>
    </div>
  </div>`;
  });

  amigrumiListEl.innerHTML = amigrumiListHtml;
};

const AMIGRUMI_TYPES = {
  ALL: "ALL",
  GIFTS: "GIFTS",
  TOYS: "TOYS",
  BAGS: "BAGS",
  PLUSHIES:"PLUSHIES"
};


const createAmigrumiTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  amigrumiList.forEach((amigrumi) => {
    if (filterTypes.findIndex((filter) => filter == amigrumi.type) == -1)
      filterTypes.push(amigrumi.type);
  });

  filterTypes.forEach((type, index) => {
    filterHtml += `<li class="${
      index == 0 ? "active" : null
    }" onclick="filterAmigrumi(this)" data-type="${type}">${
      AMIGRUMI_TYPES[type] || type
    }</li>`;
  });

  filterEl.innerHTML = filterHtml;
};

const filterAmigrumi = (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let amigrumiType = filterEl.dataset.type;
  
  if (amigrumiType != "ALL"){ 
    amigrumiList = amigrumiList.filter((amigrumi) => amigrumi.type == amigrumiType);}
  getAmigrumis();
  createAmigrumiItemsHtml();
};

const addBookToBasket = (amigrumiId) => {
  let findedAmigrumi = amigrumiList.find((amigrumi) => amigrumi.id == amigrumiId);
  if (findedAmigrumi) {
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id == amigrumiId
    );
    if (basketAlreadyIndex == -1) {
      let addedItem = { quantity: 1, product: findedAmigrumi };
      basketList.push(addedItem);
    } else {
      if (
        basketList[basketAlreadyIndex].quantity <
        basketList[basketAlreadyIndex].product.stock
      )
        basketList[basketAlreadyIndex].quantity += 1;
      else {
        toastr.error("Sorry, there is not enough stock.");
        return;
      }
    }
    listBasketItems();
    toastr.success("The product has been successfully added to the cart.");
  }
};


const listBasketItems = () => {
  localStorage.setItem("basketList", JSON.stringify(basketList));
  const basketListEl = document.querySelector(".basket__list");
  const basketCountEl = document.querySelector(".basket__count");
  basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;
  const totalPriceEl = document.querySelector(".total__price");

  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    basketListHtml += `<li class="basket__item">
        <img
          src="${item.product.imgSource}"
          width="100"
          height="100"
        />
        <div class="basket__item-info">
          <h3 class="book__name">${item.product.name}</h3>
          <span class="book__price">${item.product.price} CHF</span><br />
          <span class="book__remove" onclick="removeItemToBasket(${item.product.id})">Remove</span>
        </div>
        <div class="book__count">
          <span class="decrease" onclick="decreaseItemToBasket(${item.product.id})">-</span>
          <span class="my-5">${item.quantity}</span>
          <span class="increase" onclick="increaseItemToBasket(${item.product.id})">+</span>
        </div>
      </li>`;
  });

  basketListEl.innerHTML = basketListHtml
    ? basketListHtml
    : `<li class="basket__item">No items added to cart.</li>`;
  totalPriceEl.innerHTML =
    totalPrice > 0 ? "Total : " + totalPrice.toFixed(2) + " CHF" : null;
};


const removeItemToBasket = (amigrumiId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == amigrumiId
  );
  if (findedIndex != -1) {
    basketList.splice(findedIndex, 1);
  }
  listBasketItems();
};


const decreaseItemToBasket = (amigrumiId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == amigrumiId
  );
  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity != 1)
      basketList[findedIndex].quantity -= 1;
    else removeItemToBasket(amigrumiId);
    listBasketItems();
  }
};


const increaseItemToBasket = (amigrumiId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == amigrumiId
  );
  if (findedIndex != -1) {
    if (
      basketList[findedIndex].quantity < basketList[findedIndex].product.stock
    )
      basketList[findedIndex].quantity += 1;
    else toastr.error("Sorry, there is not enough stock.");
    listBasketItems();
  }
};


if (localStorage.getItem("basketList")) {
  basketList = JSON.parse(localStorage.getItem("basketList"));
  listBasketItems();
}

setTimeout(() => {
  createAmigrumiItemsHtml();
  createAmigrumiTypesHtml();
}, 100);
