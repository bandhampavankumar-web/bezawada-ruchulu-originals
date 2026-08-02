// Bezawada Ruchulu Originals (BRO) - Interactive Script

// Shopping Cart State
let cart = [];

// Initialize Cart on Load
document.addEventListener("DOMContentLoaded", () => {
  // Load Cart from LocalStorage
  const savedCart = localStorage.getItem("bro-cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }

  // Initial render of cart & badge count
  renderCart();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  // Cart Drawer Toggle
  const cartToggleBtn = document.getElementById("cartToggleBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartDrawerOverlay = document.getElementById("cartDrawerOverlay");

  if (cartToggleBtn) cartToggleBtn.addEventListener("click", openCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener("click", closeCart);

  // Add to Cart Buttons (Main list buttons & Quick small links)
  document.body.addEventListener("click", (e) => {
    // Quick mini add link / button click
    if (e.target.classList.contains("add-to-cart-quick") || e.target.classList.contains("add-to-cart-btn") || e.target.closest(".add-to-cart-quick") || e.target.closest(".add-to-cart-btn")) {
      const btn = e.target.closest(".add-to-cart-quick") || e.target.closest(".add-to-cart-btn");
      if (btn) {
        const id = btn.getAttribute("data-id");
        const name = btn.getAttribute("data-name");
        const price = parseFloat(btn.getAttribute("data-price"));
        const img = btn.getAttribute("data-img");
        const weight = btn.getAttribute("data-weight") || "";

        addToCart({ id, name, price, img, weight });
        openCart(); // Show cart after adding
      }
    }
  });

  // Cart Qty Adjustments and Delete
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".qty-btn") || e.target.closest(".delete-item-btn");
      if (!btn) return;

      const itemId = btn.getAttribute("data-id");

      if (btn.classList.contains("qty-minus")) {
        updateQty(itemId, -1);
      } else if (btn.classList.contains("qty-plus")) {
        updateQty(itemId, 1);
      } else if (btn.classList.contains("delete-item-btn") || btn.closest(".delete-item-btn")) {
        removeFromCart(itemId);
      }
    });
  }

  // Checkout Button
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkoutWhatsApp);
  }



  // Live Search Filtering
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      filterProducts(term);
    });
  }

  // Mobile Nav Drawer Toggle
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const navMenu = document.getElementById("navMenu");
  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener("click", () => {
      navMenu.classList.toggle("mobile-open");
      const isMobileOpen = navMenu.classList.contains("mobile-open");
      mobileNavToggle.innerHTML = isMobileOpen 
        ? '<span class="material-symbols-outlined">close</span>' 
        : '<span class="material-symbols-outlined">menu</span>';
    });

    // Close mobile nav when clicking on navigation links
    navMenu.addEventListener("click", (e) => {
      if (e.target.classList.contains("nav-link")) {
        navMenu.classList.remove("mobile-open");
        mobileNavToggle.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        
        // Mark link as active
        document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
        e.target.classList.add("active");
      }
    });
  }

  // Newsletter Form Google Sheet integration
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector(".newsletter-input");
      const submitBtn = newsletterForm.querySelector(".newsletter-btn");
      const email = emailInput.value.trim();
      
      if (!email) return;

      submitBtn.disabled = true;
      emailInput.disabled = true;

      const scriptURL = "https://script.google.com/macros/s/AKfycbxI89I_XiuxP3phOxyNixQdYPoayANaolh9mSO8KINPLLY13rGElC7ZQWDUZ-YATdx-4Q/exec";

      fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email })
      })
      .then(() => {
        alert("Thank you for subscribing! Your email has been added to our newsletter sheet.");
        newsletterForm.reset();
      })
      .catch((error) => {
        console.error("Error subscribing:", error);
        alert("Oops! Something went wrong. Please try again later.");
      })
      .finally(() => {
        submitBtn.disabled = false;
        emailInput.disabled = false;
      });
    });
  }

  // Sweets & Delicacies Carousel Controller (Option A: Tabs + Swiping)
  const carouselTrack = document.getElementById("sweetsCarouselTrack");
  const tabBtns = document.querySelectorAll(".carousel-tab-btn");
  
  if (carouselTrack && tabBtns.length > 0) {
    let currentSlide = 0;

    // Switch slide function
    const goToSlide = (slideIndex) => {
      currentSlide = slideIndex;
      carouselTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
      
      // Update active tab styles
      tabBtns.forEach((btn, idx) => {
        if (idx === slideIndex) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    };

    // Attach click listeners to tabs
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const slideIndex = parseInt(btn.getAttribute("data-slide"), 10);
        goToSlide(slideIndex);
      });
    });

    // Touch Swiping Logic
    let startX = 0;
    let endX = 0;
    const minSwipeDistance = 50; // pixels

    carouselTrack.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    carouselTrack.addEventListener("touchmove", (e) => {
      endX = e.touches[0].clientX;
    }, { passive: true });

    carouselTrack.addEventListener("touchend", () => {
      const swipeDistance = endX - startX;
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance < 0 && currentSlide < 1) {
          // Swiped left -> next slide
          goToSlide(1);
        } else if (swipeDistance > 0 && currentSlide > 0) {
          // Swiped right -> prev slide
          goToSlide(0);
        }
      }
      // Reset coordinates
      startX = 0;
      endX = 0;
    });
  }
}

// Open / Close Cart Drawer
function openCart() {
  const cartDrawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartDrawerOverlay");
  if (cartDrawer && overlay) {
    cartDrawer.classList.add("open");
    overlay.style.display = "block";
  }
}

function closeCart() {
  const cartDrawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartDrawerOverlay");
  if (cartDrawer && overlay) {
    cartDrawer.classList.remove("open");
    overlay.style.display = "none";
  }
}

// Add Item to Cart State
function addToCart(newItem) {
  const existingItemIndex = cart.findIndex(item => item.id === newItem.id);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: newItem.id,
      name: newItem.name,
      price: newItem.price,
      img: newItem.img,
      weight: newItem.weight,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  animateCartIcon();
}

// Remove Item
function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCart();
  renderCart();
}

// Update Quantity
function updateQty(itemId, delta) {
  const itemIndex = cart.findIndex(item => item.id === itemId);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart();
    renderCart();
  }
}

// Save to LocalStorage
function saveCart() {
  localStorage.setItem("bro-cart", JSON.stringify(cart));
}

// Render Shopping Cart Items & Summary
function renderCart() {
  const container = document.getElementById("cartItemsContainer");
  const cartCountBadge = document.getElementById("cartCountBadge");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const freeDeliveryNotice = document.getElementById("freeDeliveryNotice");

  if (!container) return;

  // Clear previous items
  container.innerHTML = "";

  let totalCount = 0;
  let subtotal = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart-msg">Your bag is currently empty.</p>';
  } else {
    cart.forEach(item => {
      totalCount += item.quantity;
      subtotal += item.price * item.quantity;

      const itemEl = document.createElement("div");
      itemEl.classList.add("cart-item");
      itemEl.innerHTML = `
        <div class="cart-item-img-wrapper">
          <img class="cart-item-img" src="${item.img}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          ${item.weight ? `<p class="font-label-sm cart-item-weight">${item.weight}</p>` : ''}
          <p class="cart-item-price">₹${item.price}</p>
        </div>
        <div class="cart-item-controls">
          <button class="delete-item-btn" data-id="${item.id}" aria-label="Remove item">
            <span class="material-symbols-outlined">delete</span>
          </button>
          <div class="qty-control">
            <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
          </div>
        </div>
      `;
      container.appendChild(itemEl);
    });
  }

  // Update Badge Count
  if (cartCountBadge) {
    cartCountBadge.textContent = totalCount;
  }

  // Update Subtotal
  if (cartSubtotal) {
    cartSubtotal.textContent = `₹${subtotal}`;
  }

  // Update Free Delivery Message
  if (freeDeliveryNotice) {
    if (subtotal === 0) {
      freeDeliveryNotice.textContent = "Add ₹1000 for Free Delivery";
    } else if (subtotal >= 1000) {
      freeDeliveryNotice.textContent = "🎉 You've unlocked Free Delivery!";
      freeDeliveryNotice.style.color = "var(--color-primary)";
    } else {
      const remaining = 1000 - subtotal;
      freeDeliveryNotice.textContent = `Add ₹${remaining} more for Free Delivery`;
      freeDeliveryNotice.style.color = "var(--color-secondary)";
    }
  }
}

// Cart Icon Micro-animation
function animateCartIcon() {
  const badge = document.getElementById("cartCountBadge");
  if (badge) {
    badge.style.transform = "scale(1.4)";
    setTimeout(() => {
      badge.style.transform = "scale(1)";
    }, 200);
  }
}

// Live Search Box Filtering Logic
function filterProducts(term) {
  // 1. Filter Podi (Spice Powders)
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach(card => {
    const searchTags = card.getAttribute("data-name") || "";
    if (searchTags.includes(term)) {
      card.style.display = card.classList.contains("catalog-row-item") ? "grid" : "flex";
    } else {
      card.style.display = "none";
    }
  });

  // 2. Filter Sweets
  const sweetCards = document.querySelectorAll(".sweet-card");
  sweetCards.forEach(card => {
    const searchTags = card.getAttribute("data-name") || "";
    if (searchTags.includes(term)) {
      card.style.display = card.classList.contains("catalog-row-item") ? "grid" : "flex";
    } else {
      card.style.display = "none";
    }
  });

  // 3. Filter Delicacy items
  const delicacyItems = document.querySelectorAll(".delicacy-item");
  delicacyItems.forEach(item => {
    const searchTags = item.getAttribute("data-name") || "";
    if (searchTags.includes(term)) {
      item.style.display = item.classList.contains("catalog-row-item") ? "grid" : "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// Checkout Formulator (WhatsApp)
function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert("Your cart is empty. Please add some products before checking out!");
    return;
  }

  let message = "Hello Bezawada Ruchulu Originals! I would like to place an order for the following items:\n\n";
  let total = 0;

  cart.forEach((item, index) => {
    const itemCost = item.price * item.quantity;
    total += itemCost;
    message += `${index + 1}. ${item.name} (${item.weight}) x ${item.quantity} - ₹${itemCost}\n`;
  });

  const deliveryCharge = total >= 1000 ? 0 : 200;
  message += `\nSubtotal: ₹${total}`;
  message += `\nDelivery Charge: ${deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}`;
  message += `\nTotal Amount: ₹${total + deliveryCharge}`;
  message += "\n\n-------------------------\n";
  message += "Please deliver to the following details:\n";
  message += "Name:\n";
  message += "Address:\n";
  message += "Phone Number:\n";
  message += "Alternate Contact (Optional):";

  // URL Encode
  const encodedText = encodeURIComponent(message);
  const waURL = `https://wa.me/919061839999?text=${encodedText}`;

  // Open WhatsApp in new tab
  window.open(waURL, "_blank");
}
