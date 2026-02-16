// Order Tracking System
class OrderTracking {
    constructor() {
        this.orderHistory = [];
        this.currentOrder = null;
        this.init();
    }

    init() {
        this.loadOrderHistory();
        this.renderOrderHistory();
        this.attachEventListeners();
        this.checkURLParams();
    }

    // Load order history from localStorage
    loadOrderHistory() {
        const history = localStorage.getItem('orderHistory');
        if (history) {
            this.orderHistory = JSON.parse(history).sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
        }
    }

    // Get order by number and email
    getOrder(orderNumber, email) {
        return this.orderHistory.find(order => 
            order.orderNumber === orderNumber.toUpperCase() && 
            order.customer?.email?.toLowerCase() === email.toLowerCase()
        );
    }

    // Get order status timeline
    getOrderTimeline(order) {
        const statuses = [
            { status: 'pending', label: 'Order Placed', icon: '📦', date: order.date },
            { status: 'confirmed', label: 'Order Confirmed', icon: '✓', date: this.addDays(order.date, 1) },
            { status: 'processing', label: 'Processing', icon: '⚙️', date: this.addDays(order.date, 2) },
            { status: 'shipped', label: 'Shipped', icon: '🚚', date: this.addDays(order.date, 3) },
            { status: 'delivered', label: 'Delivered', icon: '✅', date: this.addDays(order.date, 5) }
        ];

        const currentStatusIndex = this.getStatusIndex(order.status);
        
        return statuses.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return {
                ...status,
                isCompleted,
                isCurrent,
                date: status.date
            };
        });
    }

    // Get status index
    getStatusIndex(status) {
        const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        return statusOrder.indexOf(status) || 0;
    }

    // Add days to date
    addDays(dateString, days) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date.toISOString();
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Get status badge HTML
    getStatusBadge(status) {
        const statusConfig = {
            pending: { class: 'status-pending', label: 'Pending', icon: '⏳' },
            confirmed: { class: 'status-confirmed', label: 'Confirmed', icon: '✓' },
            processing: { class: 'status-processing', label: 'Processing', icon: '⚙️' },
            shipped: { class: 'status-shipped', label: 'Shipped', icon: '🚚' },
            delivered: { class: 'status-delivered', label: 'Delivered', icon: '✅' },
            cancelled: { class: 'status-cancelled', label: 'Cancelled', icon: '❌' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return `<span class="order-status-badge ${config.class}">${config.icon} ${config.label}</span>`;
    }

    // Render order history
    renderOrderHistory() {
        const historyList = document.getElementById('orderHistoryList');
        if (!historyList) return;

        if (this.orderHistory.length === 0) {
            historyList.innerHTML = `
                <div class="order-history-empty">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h4>No orders yet</h4>
                    <p>You haven't placed any orders yet. Start shopping to see your order history here.</p>
                    <a href="shop.html" class="tg-btn">Start Shopping</a>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.orderHistory.slice(0, 5).map(order => {
            return `
                <div class="order-history-item" data-order-number="${order.orderNumber}">
                    <div class="order-history-item__header">
                        <div class="order-info">
                            <h4>Order #${order.orderNumber}</h4>
                            <p class="order-date-small">${this.formatDate(order.date)}</p>
                        </div>
                        <div class="order-meta">
                            ${this.getStatusBadge(order.status)}
                            <span class="order-total">$${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="order-history-item__footer">
                        <div class="order-items-count">
                            ${order.items.length} item${order.items.length > 1 ? 's' : ''}
                        </div>
                        <button class="tg-btn tg-btn-three view-order-btn" data-order-number="${order.orderNumber}">
                            View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Attach view order buttons
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderNumber = e.target.getAttribute('data-order-number');
                const order = this.orderHistory.find(o => o.orderNumber === orderNumber);
                if (order) {
                    this.displayOrderDetails(order);
                }
            });
        });
    }

    // Display order details
    displayOrderDetails(order) {
        this.currentOrder = order;
        
        // Show order details section
        const detailsWrap = document.getElementById('orderDetailsWrap');
        if (detailsWrap) {
            detailsWrap.style.display = 'block';
            detailsWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Update order header
        document.getElementById('displayOrderNumber').textContent = `Order #${order.orderNumber}`;
        document.getElementById('displayOrderDate').textContent = `Placed on ${this.formatDate(order.date)}`;
        document.getElementById('orderStatusBadge').innerHTML = this.getStatusBadge(order.status);

        // Render timeline
        this.renderTimeline(order);

        // Render order items
        this.renderOrderItems(order);

        // Render shipping address
        this.renderShippingAddress(order);

        // Render order summary
        this.renderOrderSummary(order);
    }

    // Render timeline
    renderTimeline(order) {
        const timeline = document.getElementById('orderTimeline');
        if (!timeline) return;

        const timelineData = this.getOrderTimeline(order);
        
        timeline.innerHTML = timelineData.map((item, index) => {
            return `
                <div class="timeline-item ${item.isCompleted ? 'completed' : ''} ${item.isCurrent ? 'current' : ''}">
                    <div class="timeline-marker">
                        <span class="timeline-icon">${item.icon}</span>
                    </div>
                    <div class="timeline-content">
                        <h5>${item.label}</h5>
                        <p>${this.formatDate(item.date)}</p>
                    </div>
                    ${index < timelineData.length - 1 ? '<div class="timeline-line"></div>' : ''}
                </div>
            `;
        }).join('');
    }

    // Render order items
    renderOrderItems(order) {
        const tbody = document.getElementById('orderItemsTable');
        if (!tbody) return;

        tbody.innerHTML = order.items.map(item => {
            return `
                <tr>
                    <td>
                        <div class="order-item-info">
                            <img src="${item.image || 'assets/img/shop/shop_img01.png'}" alt="${item.name}" onerror="this.src='assets/img/shop/shop_img01.png'">
                            <div>
                                <h5>${item.name}</h5>
                                ${item.size ? `<span class="item-attr">Size: ${item.size}</span>` : ''}
                                ${item.color ? `<span class="item-attr">Color: ${item.color}</span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td><strong>$${(item.price * item.quantity).toFixed(2)}</strong></td>
                </tr>
            `;
        }).join('');
    }

    // Render shipping address
    renderShippingAddress(order) {
        const addressDiv = document.getElementById('shippingAddress');
        if (!addressDiv || !order.customer) return;

        const customer = order.customer;
        addressDiv.innerHTML = `
            <p><strong>${customer['first-name'] || ''} ${customer['last-name'] || ''}</strong></p>
            <p>${customer['street-address'] || ''}</p>
            ${customer['street-address-two'] ? `<p>${customer['street-address-two']}</p>` : ''}
            <p>${customer['town-name'] || ''}, ${customer['district-name'] || ''} ${customer['zip-code'] || ''}</p>
            <p>${customer['country-name'] || ''}</p>
            <p style="margin-top: 15px;">
                <strong>Email:</strong> ${customer.email || 'N/A'}<br>
                <strong>Phone:</strong> ${customer.phone || 'N/A'}
            </p>
        `;
    }

    // Render order summary
    renderOrderSummary(order) {
        document.getElementById('orderSubtotal').textContent = `$${order.subtotal.toFixed(2)}`;
        document.getElementById('orderShipping').textContent = order.shipping > 0 ? `$${order.shipping.toFixed(2)}` : 'FREE';
        document.getElementById('orderTax').textContent = `$${order.tax.toFixed(2)}`;
        document.getElementById('orderTotal').textContent = `$${order.total.toFixed(2)}`;
    }

    // Attach event listeners
    attachEventListeners() {
        const form = document.getElementById('trackOrderForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTrackOrder();
            });
        }
    }

    // Handle track order
    handleTrackOrder() {
        const form = document.getElementById('trackOrderForm');
        const orderNumber = document.getElementById('order-number').value.trim().toUpperCase();
        const email = document.getElementById('track-email').value.trim().toLowerCase();

        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        form.querySelectorAll('input').forEach(el => el.classList.remove('error'));

        // Validate
        if (!orderNumber) {
            this.showError('order-number', 'Order number is required');
            return;
        }

        if (!email) {
            this.showError('track-email', 'Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('track-email', 'Please enter a valid email address');
            return;
        }

        // Find order
        const order = this.getOrder(orderNumber, email);
        
        if (order) {
            this.displayOrderDetails(order);
            this.showNotification('Order found!', 'success');
        } else {
            this.showNotification('Order not found. Please check your order number and email.', 'error');
            form.querySelectorAll('input').forEach(el => el.classList.add('error'));
        }
    }

    // Show error
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = field.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
        field.classList.add('error');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.order-tracking-notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `order-tracking-notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Check URL parameters
    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const orderNumber = urlParams.get('order');
        const email = urlParams.get('email');

        if (orderNumber && email) {
            document.getElementById('order-number').value = orderNumber;
            document.getElementById('track-email').value = email;
            
            // Auto-track if order exists
            setTimeout(() => {
                const order = this.getOrder(orderNumber, email);
                if (order) {
                    this.displayOrderDetails(order);
                }
            }, 500);
        }
    }
}

// Initialize order tracking when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.orderTracking = new OrderTracking();
    
    // Update cart count
    if (window.cartManager) {
        window.cartManager.updateCartCount();
    }
});

