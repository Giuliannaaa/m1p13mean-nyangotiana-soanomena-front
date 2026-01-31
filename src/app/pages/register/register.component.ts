import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['../login/login.component.css'] // Reuse login styles
})
export class RegisterComponent {
    authService = inject(AuthService);
    router = inject(Router);
    fb = inject(FormBuilder);

    registerForm: FormGroup = this.fb.group({
        lastname: ['', [Validators.required]],
        firstname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        role: [false]
    });

    errorMessage: string = '';
    isLoading: boolean = false;

    onSubmit() {
        if (this.registerForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';

            const registrationData = { ...this.registerForm.value };
            // If the checkbox is checked, set role to 'Boutique'
            if (registrationData.role) {
                registrationData.role = 'Boutique';
            }

            this.authService.register(registrationData).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = err.error?.message || 'Registration failed. Try again.';
                }
            });
        }
    }
}
