export class FormValidator {
    constructor(formElementId) {
        this.form = document.getElementById(formElementId);
        this.fields = {};
        this.errors = {};
        this.isValid = false;
        
        if (!this.form) {
            console.warn(`FormValidator: Forma ${formElementId} no encontrada`);
        }
    }

    // Registrar un campo con reglas de validación
    register(fieldName, rules = { required: false, minLength: 0, pattern: null }) {
        this.fields[fieldName] = rules;
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        if (input) {
            input.addEventListener('input', () => this.validateField(fieldName));
            input.addEventListener('blur', () => this.validateField(fieldName));
        }
        return this;
    }

    validateField(fieldName) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        const rules = this.fields[fieldName];
        const value = input ? input.value.trim() : '';
        let error = null;

        if (rules.required && !value) {
            error = 'Este campo es requerido';
        } else if (rules.minLength && value.length < rules.minLength) {
            error = `Mínimo ${rules.minLength} caracteres`;
        } else if (rules.pattern && !rules.pattern.test(value)) {
            error = 'Formato inválido';
        }

        if (error) {
            this.errors[fieldName] = error;
            this.showError(input, error);
        } else {
            delete this.errors[fieldName];
            this.clearError(input);
        }

        this.checkFormValidity();
        return !error;
    }

    showError(input, message) {
        if (!input) return;
        input.classList.add('error-border');
        let errorEl = input.nextElementSibling;
        if (!errorEl || !errorEl.classList.contains('error-msg')) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-msg';
            errorEl.style.color = 'var(--color-danger)';
            errorEl.style.fontSize = '12px';
            errorEl.style.marginTop = '4px';
            input.parentNode.insertBefore(errorEl, input.nextSibling);
        }
        errorEl.innerText = message;
    }

    clearError(input) {
        if (!input) return;
        input.classList.remove('error-border');
        const errorEl = input.nextElementSibling;
        if (errorEl && errorEl.classList.contains('error-msg')) {
            errorEl.remove();
        }
    }

    checkFormValidity() {
        const hasErrors = Object.keys(this.errors).length > 0;
        const allRegisteredChecked = Object.keys(this.fields).every(f => {
            const el = this.form.querySelector(`[name="${f}"]`);
            if(!el) return false;
            if(this.fields[f].required && !el.value.trim()) return false;
            return true;
        });

        this.isValid = !hasErrors && allRegisteredChecked;
        const submitBtn = this.form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = !this.isValid;
        }
    }

    onSubmit(callback) {
        if (!this.form) return;
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            let allValid = true;
            Object.keys(this.fields).forEach(f => {
                if (!this.validateField(f)) allValid = false;
            });
            
            if (allValid) {
                const formData = new FormData(this.form);
                const data = Object.fromEntries(formData.entries());
                callback(data);
            } else {
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            }
        });
    }
}
