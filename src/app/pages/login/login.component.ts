import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    authService = inject(AuthService);
    router = inject(Router);
    fb = inject(FormBuilder);

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    errorMessage: string = '';
    isLoading: boolean = false;

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';
            this.authService.login(this.loginForm.value).subscribe({
                next: () => {
                    this.isLoading = false;
                    const role = this.authService.getRole() || '';
                    this.authService.redirectBasedOnRole(role);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = err.error?.message || 'Invalid email or password';
                }
            });
        }
    }
}
