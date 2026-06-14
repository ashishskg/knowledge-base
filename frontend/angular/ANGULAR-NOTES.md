# Angular Notes (Basic → Advanced)

This is a practical, category-wise reference for **Angular templates, directives, forms, modules/standalone APIs, routing, DI**, and common patterns.

## Important note about “Angular 21”
I can’t reliably claim exact Angular 21-only APIs without your installed version/docs, but everything below is **modern Angular** (works across recent Angular versions) and covers the concepts you asked for: `if/for`, directives, `NgModule`, template “tags”, forms, etc.

---

## Table of contents
- [1) Project structure (mental model)](#1-project-structure-mental-model)
- [2) Components basics](#2-components-basics)
- [3) Template “tags” (Angular elements)](#3-template-tags-angular-elements)
- [4) Binding syntax (core)](#4-binding-syntax-core)
- [5) Structural directives (*ngIf, *ngFor, ngSwitch)](#5-structural-directives-ngif-ngfor-ngswitch)
- [6) Attribute directives (ngClass, ngStyle, ngModel)](#6-attribute-directives-ngclass-ngstyle-ngmodel)
- [7) Pipes](#7-pipes)
- [8) Forms](#8-forms)
- [9) Modules: NgModule (classic)](#9-modules-ngmodule-classic)
- [10) Standalone APIs (modern)](#10-standalone-apis-modern)
- [11) Routing (router-outlet, routerLink)](#11-routing-router-outlet-routerlink)
- [12) Dependency Injection (DI)](#12-dependency-injection-di)
- [13) Component communication](#13-component-communication)
- [14) HTTP](#14-http)
- [15) Styling & best practices](#15-styling--best-practices)

---

## 1) Project structure (mental model)
- **Component**: `*.component.ts/html/css` (UI + logic)
- **Service**: reusable logic (often injected)
- **Module (NgModule)**: groups declarations/imports (classic)
- **Standalone**: components/directives/pipes can be used without NgModule (modern)
- **Router**: maps URLs to components

---

## 2) Components basics

### Minimal standalone component
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Hello Angular</h1>
    <p>Counter: {{ count }}</p>
    <button type="button" (click)="inc()">+1</button>
  `,
})
export class AppComponent {
  count = 0;
  inc() { this.count += 1; }
}
```

### Template file style
```ts
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}
```

---

## 3) Template “tags” (Angular elements)
These are **Angular-specific template elements** you will see in apps.

### 3.1) `<ng-container>`
- A **logical wrapper** that does **not render** an element in the DOM.
```html
<ng-container *ngIf="isLoggedIn">
  <a routerLink="/profile">Profile</a>
  <button type="button" (click)="logout()">Logout</button>
</ng-container>
```

### 3.2) `<ng-template>`
- Defines a **template block** (not rendered immediately). Often used with `*ngIf` `else`.
```html
<ng-template #loading>
  <p>Loading...</p>
</ng-template>

<div *ngIf="data; else loading">
  {{ data.name }}
</div>
```

### 3.3) `<ng-content>`
- **Content projection** (slot) inside a component.

**card.component.html**
```html
<div class="card">
  <header class="card__header">
    <ng-content select="[card-title]"></ng-content>
  </header>
  <section class="card__body">
    <ng-content></ng-content>
  </section>
</div>
```

**usage**
```html
<app-card>
  <h2 card-title>Title here</h2>
  <p>Body content here</p>
</app-card>
```

### 3.4) `<router-outlet>`
- Placeholder where the router renders matched components.
```html
<nav>
  <a routerLink="/">Home</a>
  <a routerLink="/settings">Settings</a>
</nav>
<router-outlet></router-outlet>
```

---

## 4) Binding syntax (core)

### 4.1) Interpolation `{{ }}`
```html
<p>Hello {{ userName }}</p>
```

### 4.2) Property binding `[prop]`
```html
<img [src]="avatarUrl" [alt]="userName" />
<button [disabled]="isSaving">Save</button>
```

### 4.3) Event binding `(event)`
```html
<button type="button" (click)="save()">Save</button>
<input (input)="onQuery(($event.target as HTMLInputElement).value)" />
```

### 4.4) Two-way binding `[(ngModel)]` (template-driven forms)
```html
<input [(ngModel)]="email" name="email" />
```

### 4.5) Class/style bindings
```html
<div [class.active]="isActive"></div>
<div [style.padding.px]="12"></div>
```

---

## 5) Structural directives (*ngIf, *ngFor, ngSwitch)
Structural directives change the **DOM structure**.

### 5.1) `*ngIf`
```html
<p *ngIf="isAdmin">Admin tools enabled</p>
```

`else` block:
```html
<ng-template #guest>
  <p>Please sign in.</p>
</ng-template>

<div *ngIf="user; else guest">
  Welcome, {{ user.name }}
</div>
```

### 5.2) `*ngFor`
```html
<ul>
  <li *ngFor="let item of items">{{ item }}</li>
</ul>
```

With `index` + `trackBy` (performance):
```html
<li *ngFor="let u of users; index as i; trackBy: trackById">
  {{ i + 1 }}. {{ u.name }}
</li>
```

```ts
trackById(_: number, u: { id: string }) { return u.id; }
```

### 5.3) `ngSwitch`
```html
<div [ngSwitch]="status">
  <p *ngSwitchCase="'loading'">Loading...</p>
  <p *ngSwitchCase="'error'">Error!</p>
  <p *ngSwitchDefault>Ready</p>
</div>
```

---

## 6) Attribute directives (ngClass, ngStyle, ngModel)
Attribute directives change appearance/behavior of an existing element.

### 6.1) `ngClass`
```html
<div [ngClass]="{ active: isActive, disabled: isDisabled }">...</div>
<div [ngClass]="['chip', size]">...</div>
```

### 6.2) `ngStyle`
```html
<div [ngStyle]="{ 'padding.px': 12, 'border-radius.px': 14 }">...</div>
```

### 6.3) `ngModel` (template-driven)
Requires importing `FormsModule`.
```html
<input [(ngModel)]="name" name="name" required />
<p *ngIf="name">Hello {{ name }}</p>
```

---

## 7) Pipes

### 7.1) Built-in pipes examples
```html
<p>{{ price | currency:'USD' }}</p>
<p>{{ today | date:'medium' }}</p>
<p>{{ name | uppercase }}</p>
```

### 7.2) Custom pipe
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(fullName: string): string {
    return fullName
      .split(' ')
      .filter(Boolean)
      .map(p => p[0]?.toUpperCase())
      .join('');
  }
}
```

Usage:
```html
<p>{{ 'Ashish Kumar' | initials }}</p>
```

---

## 8) Forms

### 8.1) Template-driven forms (`NgForm`)
Requires `FormsModule`.

```html
<form #f="ngForm" (ngSubmit)="submit(f)">
  <label>
    Email
    <input name="email" ngModel required email />
  </label>

  <button type="submit" [disabled]="f.invalid">Submit</button>
</form>

<p>Valid: {{ f.valid }}</p>
```

```ts
import { NgForm } from '@angular/forms';

submit(f: NgForm) {
  console.log(f.value);
}
```

### 8.2) Reactive forms
Requires `ReactiveFormsModule`.

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
  });

  submit() {
    if (this.form.invalid) return;
    console.log(this.form.value);
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <label>
    Email
    <input type="email" formControlName="email" />
  </label>

  <label>
    Password
    <input type="password" formControlName="password" />
  </label>

  <button type="submit" [disabled]="form.invalid">Login</button>
</form>
```

### 8.3) Common form directives/tokens
- `ngForm`, `ngModel`, `ngModelGroup`
- `formGroup`, `formControlName`, `formArrayName`

---

## 9) Modules: NgModule (classic)
Even in modern Angular, you’ll see NgModules in many codebases.

### 9.1) AppModule example
```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### 9.2) Declarations vs imports
- `declarations`: components/directives/pipes you own (classic)
- `imports`: modules/standalone things you use

---

## 10) Standalone APIs (modern)

### 10.1) Standalone component imports
```ts
@Component({
  standalone: true,
  imports: [CommonModule],
  template: `...`
})
export class FeatureComponent {}
```

`CommonModule` provides common directives like `NgIf`, `NgFor`, etc.

### 10.2) Bootstrap without NgModule
```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent);
```

---

## 11) Routing (router-outlet, routerLink)

### 11.1) Routes
```ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SettingsComponent } from './settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
];
```

### 11.2) Router directives (template)
- `routerLink`
- `routerLinkActive`
- `<router-outlet>`

Example:
```html
<a routerLink="/settings" routerLinkActive="active">Settings</a>
```

---

## 12) Dependency Injection (DI)

### 12.1) Injectable service
```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn() { return true; }
}
```

### 12.2) Inject into a component
```ts
import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-status',
  standalone: true,
  template: `Logged in: {{ auth.isLoggedIn() }}`
})
export class AuthStatusComponent {
  constructor(public auth: AuthService) {}
}
```

---

## 13) Component communication

### 13.1) Input
```ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span class="badge">{{ text }}</span>`
})
export class BadgeComponent {
  @Input() text = '';
}
```

Usage:
```html
<app-badge [text]="'New'" />
```

### 13.2) Output
```ts
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-like',
  standalone: true,
  template: `<button type="button" (click)="liked.emit()">Like</button>`
})
export class LikeComponent {
  @Output() liked = new EventEmitter<void>();
}
```

Usage:
```html
<app-like (liked)="onLiked()"></app-like>
```

---

## 14) HTTP
Requires `HttpClient`.

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<Array<{ id: string; name: string }>>('/api/users');
  }
}
```

---

## 15) Styling & best practices
- Prefer **semantic HTML** in templates.
- Use `trackBy` for large `*ngFor` lists.
- Avoid heavy logic in templates; move it to component methods/signals.
- Use `async` pipe for observables in templates.

Example `async` pipe:
```html
<ul>
  <li *ngFor="let u of users$ | async">{{ u.name }}</li>
</ul>
```

---

## Quick reference: Angular “tags” and directives you asked for

### Angular template elements (“tags”)
- `ng-container`
- `ng-template`
- `ng-content`
- `router-outlet`

### Structural directives
- `*ngIf`
- `*ngFor`
- `*ngSwitchCase`, `*ngSwitchDefault` with `[ngSwitch]`

### Attribute directives
- `[ngClass]`
- `[ngStyle]`

### Forms directives
- `ngForm` (template-driven)
- `ngModel`
- `[formGroup]`, `formControlName` (reactive)

### Module/standalone
- `@NgModule` (classic)
- `standalone: true`, `imports: [...]`, `bootstrapApplication` (modern)
