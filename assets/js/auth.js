class AuthManager {
    constructor() {
        this.supabase = null;
        this.loginForm = null;
        this.registerForm = null;
        this.resetForm = null;
        this.loadingButtons = new Set();
        this.init();
    }

    init() {
        if (!window.supabase) {
            console.warn('Supabase library not found. auth.js requires @supabase/supabase-js to be loaded.');
            return;
        }

        const config = window.__SUPABASE_CONFIG__ || {};
        if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('YOUR-PROJECT')) {
            console.warn('Supabase credentials missing. Update assets/js/supabase-config.js with real values.');
            return;
        }

        this.supabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.cacheForms();
        this.attachListeners();
    }

    cacheForms() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.resetForm = document.getElementById('resetForm');
    }

    attachListeners() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        if (this.resetForm) {
            this.resetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleReset();
            });
        }
    }

    async handleLogin() {
        const email = this.loginForm.querySelector('input[name="email"]').value.trim();
        const password = this.loginForm.querySelector('input[name="password"]').value.trim();

        if (!email || !password) {
            this.showStatus(this.loginForm, 'error', 'Email and password are required.');
            return;
        }

        this.toggleLoading(this.loginForm, true);

        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

        this.toggleLoading(this.loginForm, false);

        if (error) {
            this.showStatus(this.loginForm, 'error', error.message || 'Unable to sign in.');
            return;
        }

        this.showStatus(this.loginForm, 'success', 'Login successful! Redirecting...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    async handleRegister() {
        const email = this.registerForm.querySelector('input[name="email"]').value.trim();
        const password = this.registerForm.querySelector('input[name="password"]').value.trim();
        const termsAccepted = this.registerForm.querySelector('input[name="terms"]').checked;

        if (!email || !password) {
            this.showStatus(this.registerForm, 'error', 'Email and password are required.');
            return;
        }

        if (!termsAccepted) {
            this.showStatus(this.registerForm, 'error', 'Please accept the terms of use.');
            return;
        }

        this.toggleLoading(this.registerForm, true);

        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/login.html`
            }
        });

        this.toggleLoading(this.registerForm, false);

        if (error) {
            this.showStatus(this.registerForm, 'error', error.message || 'Unable to create account.');
            return;
        }

        if (data?.user?.identities?.length === 0) {
            this.showStatus(this.registerForm, 'info', 'This email is already registered. Try signing in.');
            return;
        }

        this.showStatus(this.registerForm, 'success', 'Account created! Check your inbox to confirm your email.');
        this.registerForm.reset();
    }

    async handleReset() {
        const email = this.resetForm.querySelector('input[name="email"]').value.trim();
        const notRobot = this.resetForm.querySelector('input[name="notRobot"]').checked;

        if (!email) {
            this.showStatus(this.resetForm, 'error', 'Email is required.');
            return;
        }

        if (!notRobot) {
            this.showStatus(this.resetForm, 'error', 'Please confirm you are not a robot.');
            return;
        }

        this.toggleLoading(this.resetForm, true);

        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login.html`
        });

        this.toggleLoading(this.resetForm, false);

        if (error) {
            this.showStatus(this.resetForm, 'error', error.message || 'Unable to send reset instructions.');
            return;
        }

        this.showStatus(this.resetForm, 'success', 'Reset link sent! Check your email.');
        this.resetForm.reset();
    }

    toggleLoading(form, isLoading) {
        const button = form.querySelector('button[type="submit"]');
        if (!button) return;

        if (isLoading) {
            this.loadingButtons.add(button);
            button.disabled = true;
            button.classList.add('btn-loading');
            button.dataset.originalText = button.dataset.originalText || button.innerHTML;
            button.innerHTML = 'Please wait...';
        } else if (this.loadingButtons.has(button)) {
            button.disabled = false;
            button.classList.remove('btn-loading');
            button.innerHTML = button.dataset.originalText || 'Submit';
            this.loadingButtons.delete(button);
        }
    }

    showStatus(form, type, message) {
        let statusBox = form.querySelector('.form-status');
        if (!statusBox) {
            statusBox = document.createElement('div');
            statusBox.className = 'form-status';
            form.prepend(statusBox);
        }

        statusBox.className = `form-status form-status-${type}`;
        statusBox.textContent = message;
        statusBox.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});


