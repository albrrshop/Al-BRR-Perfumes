/* ============================================================
   Features: Cart, WhatsApp Checkout, PhonePe Integration, Reveal Logic
   ============================================================ */

// 1. Initialize Cart (LocalStorage key: liza_cart)
let cart = JSON.parse(localStorage.getItem('Al-BRR_cart')) || [];

// 2. Quantity Change Function (Home & Products Page)
function changeQty(btn, amount) {
    const input = btn.parentElement.querySelector('input');
    let val = parseInt(input.value);
    if (val + amount >= 1) {
        input.value = val + amount;
    }
}

// 3. Add to Cart Logic (Feedback Animation ke saath)
function addToCartWithQty(name, price, img, btn) {
    const qtyInput = btn.parentElement.querySelector('.qty-selector input');
    const qty = parseInt(qtyInput.value);

    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({
            name: name,
            price: parseInt(price),
            img: img,
            qty: qty
        });
    }

    saveCart();

    // Premium Feedback Animation
    const originalText = btn.innerText;
    btn.innerText = "ADDED TO BAG";
    btn.style.background = "#d4af37";
    btn.style.color = "#000";

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "none";
        btn.style.color = "#fff";
        qtyInput.value = 1;
    }, 1500);
}

// 4. Save & Update Logic
function saveCart() {
    localStorage.setItem('Al-BRR_cart', JSON.stringify(cart));
    updateNavCartCount();
    if (document.body.classList.contains('cart-page')) {
        renderCartItems();
    }
}

// 5. Update Navigation Cart Count (Har page par update hota hai)
function updateNavCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartLinks = document.querySelectorAll('.cart-link');
    cartLinks.forEach(link => {
        link.innerText = `CART (${totalQty})`;
    });
}

// 6. Render Cart Items (Sirf Cart Page ke liye)
function renderCartItems() {
    const container = document.querySelector('.cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:50px; opacity:0.5; font-size:0.9rem; letter-spacing:2px;">YOUR BAG IS CURRENTLY EMPTY.</p>`;
        updateSummary(0);
        return;
    }

    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        html += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3 style="font-family:'Bodoni Moda', serif;">${item.name}</h3>
                    <p>₹${item.price.toLocaleString()} x ${item.qty}</p>
                </div>
                <div style="font-weight:600; margin-right: 20px; color:#d4af37;">₹${itemTotal.toLocaleString()}</div>
                <button class="remove-x-btn" onclick="removeItem(${index})" title="Remove Item">&times;</button>
            </div>
        `;
    });

    container.innerHTML = html;
    updateSummary(subtotal);
    updatePhonePeLink(subtotal); // Payment details update karein
}

// 7. Update Summary and Total Displays
function updateSummary(total) {
    const subtotalDisplay = document.querySelector('.summary-line:nth-of-type(1) span:last-child');
    const grandTotalDisplay = document.querySelector('.summary-line.total span:last-child');

    if (subtotalDisplay) subtotalDisplay.innerText = `₹${total.toLocaleString()}`;
    if (grandTotalDisplay) grandTotalDisplay.innerText = `₹${total.toLocaleString()}`;
}

// 8. PhonePe Integration Logic (Amount fetch karega)
function updatePhonePeLink(total) {
    const ppLink = document.getElementById('phonepe-link');
    if (ppLink && total > 0) {
        const upiId = "9146516144@ybl";
        const merchantName = "Al BRR Perfumes";

        // UPI Intent URI jo PhonePe app ko trigger karega
        const phonePeUri = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=Liza%20Perfumes%20Order`;

        ppLink.href = phonePeUri;

        // Desktop vs Mobile Handling
        ppLink.onclick = function (e) {
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (!isMobile) {
                e.preventDefault();
                alert("Please open this link on your Mobile Device with PhonePe installed, or Scan the QR Code below to pay ₹" + total.toLocaleString());
            }
        };
    }
}

// 9. Remove Item from Cart
function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
}

// 10. Checkout via WhatsApp
function checkout() {
    if (cart.length === 0) {
        alert("Please add items to your bag first.");
        return;
    }

    let message = "✨ *AL BRR PERFUMES - NEW ORDER* ✨\n";
    message += "--------------------------------------\n";

    let grandTotal = 0;
    cart.forEach((item, i) => {
        const lineTotal = item.price * item.qty;
        grandTotal += lineTotal;
        message += `*${i + 1}. ${item.name}*\n   Qty: ${item.qty} | Price: ₹${lineTotal.toLocaleString()}\n`;
    });

    message += "--------------------------------------\n";
    message += `💰 *TOTAL AMOUNT: ₹${grandTotal.toLocaleString()}*\n`;
    message += "--------------------------------------\n";
    message += "📍 *Please confirm delivery details.*";

    const whatsappUrl = `https://wa.me/919284411036?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// 11. Global Initialization (On Load)
document.addEventListener('DOMContentLoaded', () => {
    updateNavCartCount();

    // Check if on cart page
    if (document.body.classList.contains('cart-page') || document.querySelector('.cart-items')) {
        renderCartItems();
    }

    // Scroll Reveal Initializations
    const cards = document.querySelectorAll(".product-card, .social-card, .value-item, .cart-item");
    cards.forEach(card => card.classList.add("reveal-on-scroll"));
    reveal();
});

// 12. Scroll Reveal Animation Logic
function reveal() {
    var reveals = document.querySelectorAll(".reveal-on-scroll");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener("scroll", reveal);

// 13. Horizontal Drag Scroll Logic (Home Page Hero Slider)
const slider = document.querySelector('.horizontal-scroll');
let isDown = false;
let startX;
let scrollLeft;

if (slider) {
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => { isDown = false; });
    slider.addEventListener('mouseup', () => { isDown = false; });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Buy Now Function - Direct WhatsApp Redirect
function buyNowWhatsApp(name, price, btn) {
    const qtyInput = btn.parentElement.querySelector('.qty-selector input');
    const qty = parseInt(qtyInput.value);
    const phoneNumber = "919284411036";

    const message = `Hello Al BRR PERFUMES, I want to buy this immediately:%0A%0A*Product:* ${name}%0A*Price:* ₹${price}%0A*Quantity:* ${qty}%0A%0A Please guide me with the next steps.`;

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
}

// --- PRODUCT FILTERING LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const searchBox = document.querySelector('.search-box');

    // 1. Category Filter Functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Active class switch
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.textContent.toLowerCase();

            productCards.forEach(card => {
                const productDesc = card.querySelector('.p-desc').textContent.toLowerCase();
                const productNotes = card.querySelector('.notes-preview').textContent.toLowerCase();

                // Agar 'All' hai toh sab dikhao, nahi toh category check karo
                if (category === 'all' || productDesc.includes(category) || productNotes.includes(category)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 2. Search Box Functionality
    if (searchBox) {
        searchBox.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            productCards.forEach(card => {
                const productName = card.querySelector('h3').textContent.toLowerCase();
                const productDesc = card.querySelector('.p-desc').textContent.toLowerCase();

                if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});

// CSS Animation for smooth filtering (Add this to your style.css if not present)
/*
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
*/

function toggleMenu() {
    const nav = document.querySelector(".nav-links");
    nav.classList.toggle("active");
}
