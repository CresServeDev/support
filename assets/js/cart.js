// Shopping Cart Management System
class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartCount();
        this.addButtonsToProducts();
        this.bindEvents();
        if (window.location.pathname.includes('cart.html')) {
            this.renderCart();
        }
        if (window.location.pathname.includes('check-out.html')) {
            this.renderCheckout();
        }
    }

    // Automatically add Add to Cart and Buy Now buttons to all shop items
    addButtonsToProducts() {
        const shopItems = document.querySelectorAll('.shop__item');
        shopItems.forEach((item, index) => {
            // Add data-product-id if not present
            if (!item.dataset.productId) {
                item.dataset.productId = `product-${index + 1}`;
            }

            // Check if buttons already exist
            const content = item.querySelector('.shop__content');
            if (content && !content.querySelector('.shop__buttons')) {
                // Add buttons after price
                const price = content.querySelector('.price');
                if (price) {
                    const buttonsDiv = document.createElement('div');
                    buttonsDiv.className = 'shop__buttons';
                    buttonsDiv.style.cssText = 'margin-top: 15px; display: flex; gap: 10px;';
                    buttonsDiv.innerHTML = `
                        <a href="#" class="tg-btn add-to-cart-btn" style="flex: 1; text-align: center; padding: 10px; font-size: 14px;">Add to Cart</a>
                        <a href="#" class="tg-btn tg-btn-three buy-now-btn" style="flex: 1; text-align: center; padding: 10px; font-size: 14px;">Buy Now</a>
                    `;
                    price.parentNode.insertBefore(buttonsDiv, price.nextSibling);
                }
            }

            // Update cart icon to be add-to-cart button
            const cartIcon = item.querySelector('.shop__action li:nth-child(2) a');
            if (cartIcon && !cartIcon.classList.contains('add-to-cart-btn')) {
                cartIcon.href = '#';
                cartIcon.classList.add('add-to-cart-btn');
                cartIcon.title = 'Add to Cart';
            }
        });
    }

    // Load cart from localStorage
    loadCart() {
        const cart = localStorage.getItem('shoppingCart');
        return cart ? JSON.parse(cart) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    // Generate unique ID for cart items
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add item to cart
    addToCart(product, buttonElement = null) {
        // Validate product data
        if (!product || !product.name || !product.price) {
            this.showNotification('Invalid product data!', 'error');
            return false;
        }

        if (product.price <= 0) {
            this.showNotification('Invalid product price!', 'error');
            return false;
        }

        const quantity = parseInt(product.quantity) || 1;
        if (quantity <= 0 || quantity > 100) {
            this.showNotification('Invalid quantity! Please enter a value between 1 and 100.', 'error');
            return false;
        }

        // Show loading state on button
        const btn = buttonElement || document.activeElement?.closest('.add-to-cart-btn, .buy-now-btn');
        if (btn) {
            btn.classList.add('btn-loading');
            btn.style.pointerEvents = 'none';
            
            setTimeout(() => {
                btn.classList.remove('btn-loading');
                btn.style.pointerEvents = '';
            }, 500);
        }

        const existingItem = this.cart.find(item => 
            item.id === product.id && 
            item.size === (product.size || '') && 
            item.color === (product.color || '')
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > 100) {
                this.showNotification('Maximum quantity limit reached (100 items per product)!', 'error');
                return false;
            }
            existingItem.quantity = newQuantity;
            this.showNotification(`✓ ${product.name} - Quantity updated to ${newQuantity}`, 'success');
        } else {
            const cartItem = {
                cartId: this.generateId(),
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                originalPrice: parseFloat(product.originalPrice || product.price),
                image: product.image || 'assets/img/shop/shop_img01.png',
                quantity: quantity,
                size: product.size || '',
                color: product.color || '',
                category: product.category || ''
            };
            this.cart.push(cartItem);
            this.showNotification(`✓ ${product.name} added to cart!`, 'success');
        }

        this.saveCart();
        return true;
    }

    // Remove item from cart
    removeFromCart(cartId) {
        const item = this.cart.find(item => item.cartId === cartId);
        if (!item) return;

        // Animate removal
        const row = document.querySelector(`[data-cart-id="${cartId}"]`)?.closest('tr');
        if (row) {
            row.classList.add('cart-item-remove');
            setTimeout(() => {
                this.cart = this.cart.filter(item => item.cartId !== cartId);
                this.saveCart();
                if (window.location.pathname.includes('cart.html')) {
                    this.renderCart();
                }
                if (window.location.pathname.includes('check-out.html')) {
                    this.renderCheckout();
                }
                this.showNotification(`${item.name} removed from cart!`, 'info');
            }, 300);
        } else {
            this.cart = this.cart.filter(item => item.cartId !== cartId);
            this.saveCart();
            if (window.location.pathname.includes('cart.html')) {
                this.renderCart();
            }
            if (window.location.pathname.includes('check-out.html')) {
                this.renderCheckout();
            }
            this.showNotification('Product removed from cart!', 'info');
        }
    }

    // Update item quantity
    updateQuantity(cartId, quantity) {
        const item = this.cart.find(item => item.cartId === cartId);
        if (item) {
            const newQuantity = parseInt(quantity);
            
            if (isNaN(newQuantity) || newQuantity <= 0) {
                this.removeFromCart(cartId);
                return;
            }

            if (newQuantity > 100) {
                this.showNotification('Maximum quantity limit is 100 items!', 'error');
                // Reset to max
                item.quantity = 100;
            } else {
                item.quantity = newQuantity;
            }

            this.saveCart();
            if (window.location.pathname.includes('cart.html')) {
                this.renderCart();
            }
            if (window.location.pathname.includes('check-out.html')) {
                this.renderCheckout();
            }
        }
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get cart subtotal (before discounts)
    getSubtotal() {
        return this.getTotal();
    }

    // Get cart count
    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Update cart count badge
    updateCartCount() {
        const count = this.getCartCount();
        const badges = document.querySelectorAll('.cart-count, .header-cart-count');
        badges.forEach(badge => {
            badge.textContent = count;
            if (count > 0) {
                badge.style.display = 'flex';
                badge.style.animation = 'pulse 0.3s ease';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    // Render cart page
    renderCart() {
        const tbody = document.querySelector('.cart__table tbody');
        if (!tbody) return;

        // Clear existing items (except the actions row)
        const existingRows = tbody.querySelectorAll('tr:not(.cart__actions)');
        existingRows.forEach(row => {
            row.classList.add('cart-item-remove');
            setTimeout(() => row.remove(), 300);
        });

        if (this.cart.length === 0) {
            setTimeout(() => {
                const emptyRow = document.createElement('tr');
                emptyRow.className = 'cart-empty-row';
                emptyRow.innerHTML = `
                    <td colspan="6" class="cart-empty">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17V13M9 19.5C9 20.3 8.3 21 7.5 21C6.7 21 6 20.3 6 19.5C6 18.7 6.7 18 7.5 18C8.3 18 9 18.7 9 19.5ZM20 19.5C20 20.3 19.3 21 18.5 21C17.7 21 17 20.3 17 19.5C17 18.7 17.7 18 18.5 18C19.3 18 20 18.7 20 19.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h3>Your cart is empty</h3>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <a href="shop.html" class="tg-btn">Continue Shopping</a>
                    </td>
                `;
                tbody.insertBefore(emptyRow, tbody.querySelector('.cart__actions'));
            }, 300);
            this.updateCartTotals();
            return;
        }

        // Add items with animation
        setTimeout(() => {
            this.cart.forEach((item, index) => {
                const row = document.createElement('tr');
                row.className = 'cart-item-enter';
                row.style.animationDelay = `${index * 0.1}s`;
                row.innerHTML = `
                    <td class="product__thumb" data-label="">
                        <a href="shop-details.html"><img src="${item.image || 'assets/img/shop/shop_img01.png'}" alt="${item.name}" onerror="this.src='assets/img/shop/shop_img01.png'"></a>
                    </td>
                    <td class="product__name" data-label="Product">
                        <a href="shop-details.html">${item.name}</a>
                        ${item.size ? `<span style="display: block; font-size: 12px; color: #999; margin-top: 5px;">Size: ${item.size}</span>` : ''}
                        ${item.color ? `<span style="display: block; font-size: 12px; color: #999;">Color: ${item.color}</span>` : ''}
                    </td>
                    <td class="product__price" data-label="Price">$${item.price.toFixed(2)}</td>
                    <td class="product__quantity" data-label="Quantity">
                        <div class="cart-plus-minus">
                            <button type="button" class="qty-minus" data-cart-id="${item.cartId}" title="Decrease quantity">-</button>
                            <input type="text" value="${item.quantity}" data-cart-id="${item.cartId}" min="1" readonly>
                            <button type="button" class="qty-plus" data-cart-id="${item.cartId}" title="Increase quantity">+</button>
                        </div>
                    </td>
                    <td class="product__subtotal" data-label="Subtotal">$${(item.price * item.quantity).toFixed(2)}</td>
                    <td class="product__remove" data-label="">
                        <a href="#" class="remove-item" data-cart-id="${item.cartId}" title="Remove item">×</a>
                    </td>
                `;
                tbody.insertBefore(row, tbody.querySelector('.cart__actions'));
            });
        }, 300);

        this.updateCartTotals();
    }

    // Update cart totals
    updateCartTotals() {
        const subtotal = this.getSubtotal();
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        // Update subtotal
        const subtotalElements = document.querySelectorAll('.cart-subtotal, .cart__collaterals-wrap .list-wrap li:first-child span');
        subtotalElements.forEach(el => {
            if (el.tagName === 'SPAN') {
                el.textContent = `$${subtotal.toFixed(2)}`;
            }
        });

        // Update shipping
        const shippingInfo = document.querySelector('.shipping-info');
        if (shippingInfo) {
            if (subtotal > 100) {
                shippingInfo.innerHTML = `Shipping <span style="color: #4CAF50; font-weight: 600;">FREE</span>`;
            } else {
                const remaining = (100 - subtotal).toFixed(2);
                shippingInfo.innerHTML = `Shipping <span>$${shipping.toFixed(2)}</span> <small style="color: #999; display: block; font-size: 12px; margin-top: 5px;">Add $${remaining} more for free shipping!</small>`;
            }
        }

        // Update tax
        const taxElements = document.querySelectorAll('.tax-amount');
        taxElements.forEach(el => {
            el.textContent = `$${tax.toFixed(2)}`;
        });

        // Update total
        const totalElements = document.querySelectorAll('.cart-total, .cart__collaterals-wrap .list-wrap li:last-child span.amount');
        totalElements.forEach(el => {
            el.textContent = `$${total.toFixed(2)}`;
        });
    }

    // Render checkout page
    renderCheckout() {
        const orderList = document.querySelector('.order__info-wrap .list-wrap');
        if (!orderList) return;

        // Clear existing items (except title row)
        const existingItems = orderList.querySelectorAll('li:not(.title)');
        existingItems.forEach(item => item.remove());

        if (this.cart.length === 0) {
            orderList.innerHTML = `
                <li class="title">Product <span>Subtotal</span></li>
                <li style="text-align: center; padding: 40px; color: #999;">
                    <p>Your cart is empty.</p>
                    <a href="shop.html" class="tg-btn" style="margin-top: 15px; display: inline-block;">Continue Shopping</a>
                </li>
                <li>Subtotal <span>$0.00</span></li>
                <li>Total <span>$0.00</span></li>
            `;
            return;
        }

        this.cart.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong>${item.name}</strong>
                        ${item.size ? `<div style="font-size: 12px; color: #999; margin-top: 3px;">Size: ${item.size}</div>` : ''}
                        ${item.color ? `<div style="font-size: 12px; color: #999;">Color: ${item.color}</div>` : ''}
                        <div style="font-size: 12px; color: #999; margin-top: 3px;">Qty: ${item.quantity}</div>
                    </div>
                    <span style="font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
            orderList.appendChild(li);
        });

        const subtotal = this.getSubtotal();
        const shipping = subtotal > 100 ? 0 : 10;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        const subtotalLi = document.createElement('li');
        subtotalLi.innerHTML = `Subtotal <span>$${subtotal.toFixed(2)}</span>`;
        orderList.appendChild(subtotalLi);

        const shippingLi = document.createElement('li');
        if (subtotal > 100) {
            shippingLi.innerHTML = `Shipping <span style="color: #4CAF50; font-weight: 600;">FREE</span>`;
        } else {
            shippingLi.innerHTML = `Shipping <span>$${shipping.toFixed(2)}</span>`;
        }
        orderList.appendChild(shippingLi);

        const taxLi = document.createElement('li');
        taxLi.innerHTML = `Tax <span>$${tax.toFixed(2)}</span>`;
        orderList.appendChild(taxLi);

        const totalLi = document.createElement('li');
        totalLi.style.cssText = 'border-top: 2px solid #e0e0e0; padding-top: 15px; margin-top: 10px;';
        totalLi.innerHTML = `Total <span style="font-size: 20px; font-weight: 700; color: #2196F3;">$${total.toFixed(2)}</span>`;
        orderList.appendChild(totalLi);
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        if (window.location.pathname.includes('cart.html')) {
            this.renderCart();
        }
        if (window.location.pathname.includes('check-out.html')) {
            this.renderCheckout();
        }
    }

    // Bind events
    bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn, .add-to-cart')) {
                e.preventDefault();
                const btn = e.target.closest('.add-to-cart-btn, .add-to-cart');
                const product = this.getProductData(btn);
                if (product) {
                    this.addToCart(product, btn);
                }
            }

            // Buy now buttons
            if (e.target.closest('.buy-now-btn, .buy-now')) {
                e.preventDefault();
                const btn = e.target.closest('.buy-now-btn, .buy-now');
                const product = this.getProductData(btn);
                if (product) {
                    if (this.addToCart(product, btn)) {
                        // Add small delay for better UX
                        setTimeout(() => {
                            window.location.href = 'check-out.html';
                        }, 500);
                    }
                }
            }

            // Remove item
            if (e.target.closest('.remove-item')) {
                e.preventDefault();
                const cartId = e.target.closest('.remove-item').dataset.cartId;
                if (confirm('Are you sure you want to remove this item?')) {
                    this.removeFromCart(cartId);
                }
            }

            // Quantity controls
            if (e.target.closest('.qty-plus')) {
                const cartId = e.target.closest('.qty-plus').dataset.cartId;
                const item = this.cart.find(item => item.cartId === cartId);
                if (item) {
                    this.updateQuantity(cartId, item.quantity + 1);
                }
            }

            if (e.target.closest('.qty-minus')) {
                const cartId = e.target.closest('.qty-minus').dataset.cartId;
                const item = this.cart.find(item => item.cartId === cartId);
                if (item) {
                    this.updateQuantity(cartId, item.quantity - 1);
                }
            }

            // Quantity input change (cart page)
            if (e.target.matches('.cart-plus-minus input[data-cart-id]')) {
                const input = e.target;
                const cartId = input.dataset.cartId;
                const quantity = parseInt(input.value) || 1;
                this.updateQuantity(cartId, quantity);
            }

            // Quantity controls on product details page
            if (e.target.closest('.qty-plus') && !e.target.closest('.qty-plus').dataset.cartId) {
                const input = e.target.closest('.cart-plus-minus')?.querySelector('input[name="quantity"]');
                if (input) {
                    const currentVal = parseInt(input.value) || 1;
                    input.value = currentVal + 1;
                }
            }

            if (e.target.closest('.qty-minus') && !e.target.closest('.qty-minus').dataset.cartId) {
                const input = e.target.closest('.cart-plus-minus')?.querySelector('input[name="quantity"]');
                if (input) {
                    const currentVal = parseInt(input.value) || 1;
                    if (currentVal > 1) {
                        input.value = currentVal - 1;
                    }
                }
            }

            // Update cart button
            if (e.target.closest('.update__cart-btn button')) {
                e.preventDefault();
                this.showNotification('Cart updated!', 'success');
            }

            // Apply coupon
            if (e.target.closest('.cart__actions-form button, .coupon__code-form button')) {
                e.preventDefault();
                const form = e.target.closest('form');
                const couponInput = form.querySelector('input[type="text"]');
                const couponCode = couponInput?.value.trim().toUpperCase();
                
                if (!couponCode) {
                    this.showNotification('Please enter a coupon code', 'error');
                    return;
                }

                // Simulate coupon validation
                const validCoupons = ['SAVE10', 'DISCOUNT20', 'WELCOME15'];
                if (validCoupons.includes(couponCode)) {
                    const discount = couponCode === 'SAVE10' ? 10 : couponCode === 'DISCOUNT20' ? 20 : 15;
                    this.showNotification(`Coupon "${couponCode}" applied! ${discount}% discount`, 'success');
                    couponInput.style.borderColor = '#4CAF50';
                    couponInput.style.backgroundColor = '#f1f8f4';
                } else {
                    this.showNotification('Invalid coupon code', 'error');
                    couponInput.style.borderColor = '#f44336';
                    couponInput.style.backgroundColor = '#ffebee';
                    setTimeout(() => {
                        couponInput.style.borderColor = '';
                        couponInput.style.backgroundColor = '';
                    }, 2000);
                }
            }

            // Place order button
            if (e.target.closest('.order__info-wrap .tg-btn, .checkout-btn')) {
                e.preventDefault();
                this.handleCheckout();
            }
        });

        // Cart plus minus input
        document.addEventListener('input', (e) => {
            if (e.target.matches('.cart-plus-minus input')) {
                const input = e.target;
                const cartId = input.dataset.cartId;
                const quantity = parseInt(input.value) || 1;
                if (quantity > 0) {
                    this.updateQuantity(cartId, quantity);
                }
            }
        });
    }

    // Get product data from button/element
    getProductData(element) {
        const shopItem = element.closest('.shop__item');
        if (!shopItem) {
            // Try to get from product details page
            const productDetails = document.querySelector('.product-details, .shop-details');
            if (productDetails) {
                return this.getProductDataFromDetails(productDetails);
            }
            return null;
        }

        const name = shopItem.querySelector('.shop__content .title a')?.textContent.trim() || 
                    shopItem.querySelector('.shop__content .title')?.textContent.trim() || 'Product';
        const priceText = shopItem.querySelector('.shop__content .price')?.textContent || '';
        const price = this.extractPrice(priceText);
        const originalPrice = this.extractOriginalPrice(priceText);
        const image = shopItem.querySelector('.shop__thumb img')?.src || '';
        const category = shopItem.querySelector('.shop__content .tag')?.textContent.trim() || '';
        const id = shopItem.dataset.productId || this.generateId();

        // Get quantity if available
        const quantityInput = element.closest('form')?.querySelector('input[name="quantity"]') || 
                              document.querySelector('input[name="quantity"]');
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

        return {
            id,
            name,
            price,
            originalPrice: originalPrice || price,
            image,
            quantity,
            category
        };
    }

    // Get product data from product details page
    getProductDataFromDetails(element) {
        const name = element.querySelector('.product-title, h1, .title')?.textContent.trim() || 'Product';
        const priceText = element.querySelector('.price, .product-price')?.textContent || '';
        const price = this.extractPrice(priceText);
        const originalPrice = this.extractOriginalPrice(priceText);
        const image = element.querySelector('.product-image img, .shop__thumb img')?.src || 
                     document.querySelector('.product-gallery img')?.src || '';
        const id = element.dataset.productId || window.location.pathname.split('/').pop().replace('.html', '');
        
        // Get quantity
        const quantityInput = element.querySelector('input[name="quantity"]') || 
                            document.querySelector('input[type="number"]');
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

        // Get size and color if available
        const size = element.querySelector('select[name="size"], input[name="size"]:checked')?.value || '';
        const color = element.querySelector('select[name="color"], input[name="color"]:checked')?.value || '';

        return {
            id,
            name,
            price,
            originalPrice: originalPrice || price,
            image,
            quantity,
            size,
            color
        };
    }

    // Extract price from text
    extractPrice(text) {
        const match = text.match(/\$?(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
    }

    // Extract original price (strikethrough price)
    extractOriginalPrice(text) {
        const delMatch = text.match(/<del>.*?\$(\d+\.?\d*)/);
        return delMatch ? parseFloat(delMatch[1]) : null;
    }

    // Handle checkout
    handleCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }

        // Validate form
        const form = document.querySelector('.customer__form-wrap');
        if (form) {
            const validationResult = this.validateCheckoutForm(form);
            if (!validationResult.isValid) {
                this.showNotification(validationResult.message, 'error');
                // Scroll to first error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
                return;
            }
        }

        // Show loading state
        const checkoutBtn = document.querySelector('.checkout-btn, .order__info-wrap .tg-btn');
        if (checkoutBtn) {
            checkoutBtn.classList.add('btn-loading');
            checkoutBtn.disabled = true;
        }

        // Simulate order processing
        this.showNotification('Processing your order...', 'info');
        
        setTimeout(() => {
            // Calculate totals
            const subtotal = this.getSubtotal();
            const shipping = subtotal > 100 ? 0 : 10;
            const tax = subtotal * 0.08;
            const total = subtotal + shipping + tax;

            // Save order (you can extend this to send to server)
            const order = {
                id: this.generateId(),
                orderNumber: 'ORD-' + Date.now().toString().slice(-8),
                date: new Date().toISOString(),
                items: [...this.cart],
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                total: total,
                status: 'pending',
                customer: this.getFormData()
            };
            
            // Save order history
            const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            orderHistory.push(order);
            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
            localStorage.setItem('lastOrder', JSON.stringify(order));
            
            this.clearCart();
            
            if (checkoutBtn) {
                checkoutBtn.classList.remove('btn-loading');
                checkoutBtn.disabled = false;
            }
            
            this.showNotification(`Order #${order.orderNumber} placed successfully! Redirecting...`, 'success');
            
            setTimeout(() => {
                // Redirect to order tracking page with order details
                const email = order.customer?.email || '';
                window.location.href = `order-tracking.html?order=${order.orderNumber}&email=${encodeURIComponent(email)}`;
            }, 2000);
        }, 1500);
    }

    // Validate checkout form
    validateCheckoutForm(form) {
        let isValid = true;
        let errorMessage = 'Please fix the following errors:';
        const errors = [];

        // Required fields mapping
        const requiredFields = {
            'first-name': 'First name',
            'last-name': 'Last name',
            'country-name': 'Country',
            'street-address': 'Street address',
            'town-name': 'Town/City',
            'district-name': 'District',
            'zip-code': 'ZIP Code',
            'phone': 'Phone number',
            'email': 'Email address'
        };

        // Clear previous errors
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
            const errorMsg = field.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });

        // Validate required fields
        Object.keys(requiredFields).forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            if (field) {
                const value = field.value.trim();
                
                if (!value) {
                    isValid = false;
                    field.classList.add('error');
                    this.showFieldError(field, `${requiredFields[fieldId]} is required`);
                    errors.push(requiredFields[fieldId]);
                } else {
                    field.classList.remove('error');
                    field.classList.add('success');
                }
            }
        });

        // Validate email
        const emailField = form.querySelector('#email');
        if (emailField && emailField.value.trim()) {
            const email = emailField.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                isValid = false;
                emailField.classList.add('error');
                emailField.classList.remove('success');
                this.showFieldError(emailField, 'Please enter a valid email address');
                errors.push('Invalid email');
            } else {
                emailField.classList.remove('error');
                emailField.classList.add('success');
            }
        }

        // Validate phone
        const phoneField = form.querySelector('#phone');
        if (phoneField && phoneField.value.trim()) {
            const phone = phoneField.value.trim();
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
                isValid = false;
                phoneField.classList.add('error');
                phoneField.classList.remove('success');
                this.showFieldError(phoneField, 'Please enter a valid phone number');
                errors.push('Invalid phone');
            } else {
                phoneField.classList.remove('error');
                phoneField.classList.add('success');
            }
        }

        // Validate ZIP code
        const zipField = form.querySelector('#zip-code');
        if (zipField && zipField.value.trim()) {
            const zip = zipField.value.trim();
            if (zip.length < 4 || zip.length > 10) {
                isValid = false;
                zipField.classList.add('error');
                zipField.classList.remove('success');
                this.showFieldError(zipField, 'ZIP code must be between 4 and 10 characters');
                errors.push('Invalid ZIP code');
            } else {
                zipField.classList.remove('error');
                zipField.classList.add('success');
            }
        }

        if (!isValid) {
            errorMessage = errors.length > 0 
                ? `Please fix: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`
                : 'Please fill in all required fields correctly';
        }

        return { isValid, message: errorMessage };
    }

    // Show field error message
    showFieldError(field, message) {
        // Remove existing error message
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    }

    // Get form data
    getFormData() {
        const form = document.querySelector('.customer__form-wrap');
        if (!form) return {};

        const data = {};
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            if (field.id && field.value) {
                data[field.id] = field.value.trim();
            }
        });
        return data;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.cart-notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification-${type}`;
        
        // Add icon based on type
        let icon = '';
        if (type === 'success') {
            icon = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        } else if (type === 'error') {
            icon = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        } else {
            icon = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 9.99999C18.3334 5.39762 14.6024 1.66666 10 1.66666C5.39765 1.66666 1.66669 5.39762 1.66669 9.99999C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 6.66666V10M10 13.3333H10.0084" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
        
        notification.innerHTML = `
            <span style="display: flex; align-items: center;">${icon}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto remove after delay
        const delay = type === 'error' ? 4000 : type === 'success' ? 3000 : 3000;
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, delay);
    }
}

// Initialize cart when DOM is ready
let cart;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cart = new ShoppingCart();
    });
} else {
    cart = new ShoppingCart();
}

// Add real-time form validation
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.customer__form-wrap');
    if (form) {
        // Real-time validation for email
        const emailField = form.querySelector('#email');
        if (emailField) {
            emailField.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        this.classList.add('error');
                        this.classList.remove('success');
                        if (!this.parentElement.querySelector('.error-message')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message';
                            errorDiv.textContent = 'Please enter a valid email address';
                            this.parentElement.appendChild(errorDiv);
                        }
                    } else {
                        this.classList.remove('error');
                        this.classList.add('success');
                        const errorMsg = this.parentElement.querySelector('.error-message');
                        if (errorMsg) errorMsg.remove();
                    }
                }
            });
        }

        // Real-time validation for phone
        const phoneField = form.querySelector('#phone');
        if (phoneField) {
            phoneField.addEventListener('blur', function() {
                const phone = this.value.trim();
                if (phone) {
                    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
                        this.classList.add('error');
                        this.classList.remove('success');
                        if (!this.parentElement.querySelector('.error-message')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message';
                            errorDiv.textContent = 'Please enter a valid phone number';
                            this.parentElement.appendChild(errorDiv);
                        }
                    } else {
                        this.classList.remove('error');
                        this.classList.add('success');
                        const errorMsg = this.parentElement.querySelector('.error-message');
                        if (errorMsg) errorMsg.remove();
                    }
                }
            });
        }

        // Real-time validation for required fields
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                if (this.value.trim()) {
                    this.classList.remove('error');
                    this.classList.add('success');
                    const errorMsg = this.parentElement.querySelector('.error-message');
                    if (errorMsg) errorMsg.remove();
                } else {
                    this.classList.add('error');
                    this.classList.remove('success');
                }
            });

            field.addEventListener('input', function() {
                if (this.value.trim() && this.classList.contains('error')) {
                    this.classList.remove('error');
                    this.classList.add('success');
                    const errorMsg = this.parentElement.querySelector('.error-message');
                    if (errorMsg) errorMsg.remove();
                }
            });
        });
    }
});

