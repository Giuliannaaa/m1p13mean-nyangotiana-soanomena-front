import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['../login/login.component.css']
})
export class ForgotPasswordComponent {
    authService = inject(AuthService);
    fb = inject(FormBuilder);

    forgotPasswordForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    message: string = '';
    errorMessage: string = '';
    isLoading: boolean = false;

    onSubmit() {
        if (this.forgotPasswordForm.valid) {
            this.isLoading = true;
            this.message = '';
            this.errorMessage = '';
            this.authService.forgotPassword(this.forgotPasswordForm.value.email).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.message = 'If an account exists with this email, you will receive a password reset link shortly.';
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
                }
            });
        }
    }
}
