import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './reset-password.component.html',
    styleUrls: ['../login/login.component.css']
})
export class ResetPasswordComponent implements OnInit {
    authService = inject(AuthService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);

    resetPasswordForm: FormGroup = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    token: string = '';
    message: string = '';
    errorMessage: string = '';
    isLoading: boolean = false;

    ngOnInit() {
        this.token = this.route.snapshot.queryParams['token'];
        if (!this.token) {
            this.errorMessage = 'Invalid or missing token.';
        }
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onSubmit() {
        if (this.resetPasswordForm.valid && this.token) {
            this.isLoading = true;
            this.message = '';
            this.errorMessage = '';
            this.authService.resetPassword(this.token, this.resetPasswordForm.value.password).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.message = 'Password reset successfully. Redirecting to login...';
                    setTimeout(() => this.router.navigate(['/login']), 3000);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = err.error?.message || 'Failed to reset password.';
                }
            });
        }
    }
}
