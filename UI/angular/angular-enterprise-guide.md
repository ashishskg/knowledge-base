## Angular 17–21 Enterprise Guide

**Audience**: Beginners → Senior Engineers → Architects  
**Goal**: Deep, practical guide to designing, building, and operating **modern, enterprise-grade Angular applications** (Angular 17–21).

---

## Table of Contents

- **Section 1**: Introduction to Angular  
- **Section 2**: Angular Architecture  
- **Section 3**: Angular Project Structure  
- **Section 4**: Angular CLI  
- **Section 5**: Angular Components  
- **Section 6**: Angular Templates  
- **Section 7**: Angular Directives  
- **Section 8**: Angular Decorators (Complete Guide)  
- **Section 9**: Angular Dependency Injection  
- **Section 10**: Angular Services  
- **Section 11**: Angular Routing  
- **Section 12**: Angular Forms  
- **Section 13**: Angular HTTP Client  
- **Section 14**: Angular Signals (Angular 17+)  
- **Section 15**: Angular Standalone Components  
- **Section 16**: Angular Change Detection  
- **Section 17**: Angular State Management  
- **Section 18**: Angular Performance Optimization  
- **Section 19**: Angular Testing  
- **Section 20**: Angular Security  
- **Section 21**: Angular with Microservices  
- **Section 22**: Angular Enterprise Architecture  
- **Section 23**: Angular Deployment  
- **Section 24**: Angular Interview Questions  
- **Section 25**: Angular Cheat Sheet  

Each section is structured with:

1. **Definition**  
2. **Why it is needed**  
3. **Internal working**  
4. **Syntax explanation**  
5. **Code examples**  
6. **Best practices**  
7. **Performance considerations**  
8. **Common mistakes**  
9. **Enterprise use cases**  
10. **Interview questions**  

---

## Section 1: Introduction to Angular

### 1.1 What is Angular?

1. **Definition**  
   Angular is a **TypeScript-based, component-driven frontend framework** for building scalable web applications. It provides batteries-included tooling (CLI), powerful routing, dependency injection, forms, HTTP, and modern reactive primitives (signals, RxJS) in a single cohesive ecosystem.

2. **Why it is needed**  
   - **Consistency**: Opinionated structure and conventions for large teams.  
   - **Scalability**: Built-in DI, modules/standalone APIs, lazy loading, and strong typing.  
   - **Productivity**: CLI scaffolding, strict type checking, built-in tooling.  
   - **Enterprise focus**: Long-term support, stable APIs, and comprehensive feature set.

3. **Internal working**  
   - Compiles templates + TypeScript to **highly optimized JavaScript** using the Angular compiler.  
   - Uses **change detection** (Zone.js + signals + OnPush strategy) to sync UI with application state.  
   - Relies on a hierarchical **dependency injection container** to provide services.  
   - Uses **router** to map URLs to components and lazy-loaded feature areas.

4. **Syntax explanation**  
   - **TypeScript + decorators** (e.g., `@Component`, `@Injectable`).  
   - **HTML-based templates** with Angular syntax: `{{ }}`, `[ ]`, `( )`, `[( )]`, `*ngIf`, `*ngFor`.  
   - **Configuration** via `app.config.ts` or route-level configs for standalone APIs (Angular 15+).

5. **Code example**

```ts
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Welcome to Angular 17–21</h1>
    <app-dashboard></app-dashboard>
  `,
  standalone: true,
  imports: []
})
export class AppComponent {}
```

6. **Best practices**
   - Use **TypeScript strict mode** and Angular strict templates.  
   - Prefer **standalone components** for new projects (Angular 15+).  
   - Keep components **presentational**, push business logic into **services**.

7. **Performance considerations**
   - Use **OnPush change detection** for performance-critical components.  
   - Enable **production builds** with optimizations (`ng build --configuration production`).  
   - Prefer **signals** and **RxJS streams** to manage state and avoid unnecessary re-renders.

8. **Common mistakes**
   - Putting all logic in components instead of services.  
   - Ignoring lazy loading; creating a **single huge bundle**.  
   - Not leveraging TypeScript types (using `any` everywhere).

9. **Enterprise use cases**
   - Internal business portals, CRMs, ERPs.  
   - Complex line-of-business apps with many screens and workflows.  
   - Large teams requiring **standardized architecture** and long-term support.

10. **Interview questions**
   - What are the main advantages of using Angular in enterprise applications?  
   - How does Angular differ conceptually from a view library like React?  
   - Why is Angular’s opinionated nature beneficial for large teams?

---

### 1.2 Angular Architecture (High Level)

**Diagram**

```text
Browser (DOM, Events, History API)
        |
        v
  Angular Runtime & Framework
        |
        +-----------------------------+
        |                             |
        v                             v
  Components (Views)           Dependency Injection
        |                             |
        v                             v
  Templates & Directives        Services (Business Logic)
        |                             |
        +--------------+--------------+
                       v
                 HttpClient / Router
                       |
                       v
                    Backend APIs
```

- **Definition**: Angular architecture is **component-based**, supported by **dependency injection**, **routing**, **forms**, and **state management**.  
- **Why needed**: Provides a **repeatable mental model** and **consistent layering** for complex systems.

Key conceptual layers:
- **Presentation**: Components, templates, pipes.  
- **Domain / Application**: Services, facades, state management.  
- **Infrastructure**: HttpClient, caching, adapter services.  
- **Cross-cutting**: Auth, logging, configuration, error handling, guards, interceptors.

---

### 1.3 Angular vs React vs Vue (Enterprise Perspective)

1. **Definition / Positioning**
   - **Angular**: Full framework (routing, DI, forms, HTTP, CLI, signals).  
   - **React**: UI library; relies on ecosystem for routing, state, forms.  
   - **Vue**: Progressive framework with simpler learning curve, smaller ecosystem.

2. **Why enterprises choose Angular**
   - **Single vendor** (Google) with LTS and clear roadmap.  
   - **Standardized stack** – easier onboarding, consistent patterns.  
   - **Opinionated** architecture simplifies decisions for large teams.

3. **Internal differences**
   - **Rendering model**: Angular uses change detection + signals; React uses virtual DOM; Vue uses reactive proxies.  
   - **Typing**: Angular is built on **TypeScript first**; React/Vue also support TS but not as core.  
   - **Tooling**: Angular CLI vs custom build chains for React/Vue.

4. **Interview questions**
   - Compare Angular and React from an architecture and tooling perspective.  
   - How does Angular’s DI system compare to what’s commonly used in React?

---

### 1.4 Evolution: Angular 2 → 21 & Modern Features

Key milestones relevant to **Angular 17–21**:

- **Angular 2–8**: Component model, modules, RxJS, initial CLI, AOT compiler.  
- **Angular 9–12**: Ivy renderer, smaller bundles, better type checking.  
- **Angular 13–14**: TypeScript upgrades, improved forms typing, strict modes.  
- **Angular 15**: **Standalone APIs** (`standalone: true`), functional route guards/resolvers.  
- **Angular 16**: Initial **signals** API (developer preview), server-side improvements.  
- **Angular 17**: **Deferrable views**, improved SSR, stable signals.  
- **Angular 18–21** (trend):  
  - Further **signal integration** into core tooling and libraries.  
  - Enhanced SSR/SSG pipelines.  
  - Improved build tooling and DX (ESBuild-based builders, etc.).  

Modern features to know:
- **Standalone components & APIs** (no need for heavy NgModules in new code).  
- **Signals-based reactivity** for fine-grained change detection.  
- **Functional providers and configs** via `app.config.ts`.  
- **Deferrable views** for partial lazy loading inside templates.

---

## Section 2: Angular Architecture (Detailed)

### 2.1 High-Level Architecture Diagram

```text
+-------------------------------------------------------------+
|                        Browser                              |
|  (DOM, Events, History, Storage)                           |
+-------------------------|-----------------------------------+
                          v
                   Angular Runtime
                          |
        +-----------------+-----------------+
        |                                   |
        v                                   v
  Application Bootstrap               Dependency Injection
 (main.ts, app.config.ts)            (Providers, Injectors)
        |                                   |
        v                                   v
  Root Component (`AppComponent`)      Services (Business Logic)
        |                                   |
        v                                   v
  Routed Views & Feature Areas      HttpClient, State, Utilities
 (Router, Lazy Modules/Standalone)        |
        |                                  v
        v                             Backend / APIs
  Templates, Directives, Pipes
```

---

### 2.2 Core Building Blocks

#### Browser

1. **Definition**: The runtime environment that executes JavaScript, manages the DOM, events, and networking.  
2. **Why needed**: Angular sits on top of the browser APIs and interacts via DOM updates, events, and HTTP.  
3. **Internal working**: Angular uses browser APIs (DOM, fetch/XMLHttpRequest, History API) indirectly via its abstractions.  
4. **Enterprise use**: Browser compatibility matrices, polyfills, and progressive enhancement strategies.

#### Angular Application

1. **Definition**: A collection of components, services, and configurations bootstrapped via `bootstrapApplication` (standalone) or `platformBrowserDynamic` (legacy).  
2. **Why needed**: Encapsulates the entire UI, routing, DI graph, and configuration in a coherent unit.  
3. **Internal working**: Angular initializes the **root injector**, configures the router, and renders the root component into `index.html`.

#### Components

1. **Definition**: The basic UI building blocks in Angular; each component consists of:  
   - TypeScript class (logic)  
   - HTML template (view)  
   - Styles (CSS/SCSS)  
   - Metadata (`@Component` decorator)  
2. **Why needed**: Encapsulate and reuse UI and behavior; enable composition.

#### Services

1. **Definition**: Classes that encapsulate **business logic, APIs, cross-cutting concerns** and are provided via Angular DI.  
2. **Why needed**: Maintain separation of concerns; components focus on UI.

#### Modules (Legacy & for backward compatibility)

1. **Definition**: Constructs that group related components, directives, pipes, and providers (`@NgModule`).  
2. **Modern note**: With Angular 15+, prefer **standalone APIs**, but legacy `NgModule` is still widely used and supported.

#### Router

1. **Definition**: The Angular router maps URLs to components and manages navigation, guards, lazy loading, and route data.  
2. **Why needed**: SPA navigation, deep linking, and browser history integration.

---

### 2.3 Enterprise Architecture Layers

```text
+------------------------------+
|        Presentation          |
|  (Components, Templates, UI) |
+------------------------------+
|        Application           |
| (Facades, Use Cases, Guards) |
+------------------------------+
|           Domain             |
|   (Business Logic, Models)   |
+------------------------------+
|         Infrastructure       |
| (HttpClient, Adapters, APIs) |
+------------------------------+
|       Cross-Cutting          |
| (Auth, Logging, Config, etc) |
+------------------------------+
```

Best practice is to **explicitly model these layers** in folder structure and dependency rules (e.g., with Nx).

---

### 2.4 Interview Questions (Architecture)

- Explain the role of the Angular DI system in the overall architecture.  
- How would you structure an Angular app for a 50+ developer team?  
- How do standalone components impact overall application architecture?

---

## Section 3: Angular Project Structure

### 3.1 Angular CLI Default Structure

```text
my-app/
  ├─ src/
  │   ├─ app/
  │   │   ├─ app.component.ts
  │   │   ├─ app.component.html
  │   │   └─ app.routes.ts (or app.module.ts in older style)
  │   ├─ assets/
  │   ├─ environments/
  │   │   ├─ environment.ts
  │   │   └─ environment.prod.ts
  │   ├─ main.ts
  │   └─ styles.css
  ├─ angular.json
  ├─ package.json
  ├─ tsconfig.json
  └─ ... other config files
```

---

### 3.2 Key Files

#### `main.ts`

1. **Definition**: Application **entry point** – bootstraps the Angular app.  
2. **Modern syntax (standalone)**:

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(appRoutes)]
}).catch(err => console.error(err));
```

3. **Enterprise tip**: Extract providers into `app.config.ts` for reusability.

#### `app.config.ts`

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

Then in `main.ts`:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

#### `angular.json`

1. **Definition**: Workspace configuration describing **projects**, **architect targets** (build, serve, test, lint, etc.), and **options**.  
2. **Why important**: Controls build configurations, file replacements, budgets, optimization, and more.

Example snippet:

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "bundle",
                  "name": "main",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

---

### 3.3 Enterprise Folder Structure (Example)

```text
src/
  app/
    core/                 # Singletons & cross-cutting
      auth/
      services/
      interceptors/
      guards/
      config/
      core.providers.ts
    shared/               # Reusable UI & utilities
      components/
      directives/
      pipes/
      models/
    features/             # Feature areas
      dashboard/
      orders/
      customers/
    state/                # Global state (NgRx/Signals)
    app.component.ts
    app.routes.ts
  assets/
  environments/
```

**Best practices**
- Keep `core` small and only for true singletons.  
- Use `shared` for **dumb/presentational components** and utilities.  
- Each feature folder owns its **routing, components, services, state**.

**Interview questions**
- How would you organize a large Angular codebase to support 20–30 feature teams?  
- What belongs in `core` vs `shared`?

---

## Section 4: Angular CLI

### 4.1 Overview

1. **Definition**: `@angular/cli` is the official **command-line interface** to scaffold, develop, test, and build Angular apps.  
2. **Why needed**: Standardizes tooling, enforces workspace structure, enables powerful builders.

---

### 4.2 Common Commands

1. **`ng new`**
   - **Definition**: Creates a new Angular workspace and application.  
   - **Syntax**: `ng new my-app --standalone --routing --style=scss`  
   - **Best practices**: Use `--standalone` for new apps; enable `--routing`; choose consistent styling (e.g., SCSS).

2. **`ng serve`**
   - **Definition**: Builds and serves the app with live reload.  
   - **Syntax**: `ng serve` or `ng serve my-app --port 4201`.

3. **`ng build`**
   - **Definition**: Compiles the app into the `dist/` folder.  
   - **Syntax**: `ng build --configuration production`.  
   - **Performance**: Use production configuration with optimizations, budgets, and ahead-of-time compilation.

4. **`ng generate`**
   - **Component**: `ng generate component features/orders/order-list --standalone`.  
   - **Service**: `ng generate service core/services/order`.  
   - **Guard**: `ng generate guard core/guards/auth`.

5. **`ng test` / `ng e2e`**
   - Run unit tests and end-to-end tests (depending on builder setup).

---

### 4.3 Build Configurations

1. **Definition**: Named configurations (e.g., `development`, `production`, `staging`) under `architect.build.configurations`.  
2. **Why needed**: Different **optimizations, environments, and file replacements** per environment.

Example:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ],
    "optimization": true,
    "sourceMap": false,
    "budgets": [
      {
        "type": "initial",
        "maximumWarning": "2mb",
        "maximumError": "5mb"
      }
    ]
  }
}
```

**Common mistakes**
- Ignoring **bundle budgets** in `angular.json`.  
- Not differentiating `development` vs `production` configs.

**Interview questions**
- How do you configure different environments in an Angular app?  
- What is the role of builders and architect targets in Angular CLI?

---

## Section 5: Angular Components

### 5.1 Definition & Purpose

1. **Definition**: Components are **view models** responsible for rendering part of the UI and handling user interaction.  
2. **Why needed**: They structure the UI into reusable, testable, and composable pieces.

---

### 5.2 `@Component` Decorator & Metadata

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  standalone: true
})
export class UserCardComponent {
  // component logic
}
```

- **`selector`**: HTML tag used to render the component.  
- **`template` / `templateUrl`**: Inline or external HTML.  
- **`styles` / `styleUrls`**: Inline or external styles.  
- **`standalone`**: Whether the component is standalone (no NgModule).

**Best practices**
- Use **standalone components** for new features.  
- Keep components **small** and focused on a single responsibility.  
- Avoid heavy business logic; delegate to services.

---

### 5.3 Component Lifecycle

Key lifecycle hooks:
- `ngOnInit` – initialization logic.  
- `ngOnChanges` – responds to `@Input` changes.  
- `ngAfterViewInit` – view children initialized.  
- `ngOnDestroy` – cleanup (unsubscribe, detach listeners).

```ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-live-counter',
  template: `Count: {{ count }}`,
  standalone: true
})
export class LiveCounterComponent implements OnInit, OnDestroy {
  @Input() start = 0;
  count = 0;
  private sub?: Subscription;

  ngOnInit() {
    this.count = this.start;
    // Example interval subscription
    // this.sub = interval(1000).subscribe(() => this.count++);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
```

**Performance considerations**
- Use `ngOnDestroy` to **avoid memory leaks**.  
- Prefer `OnPush` change detection for optimized re-rendering.

**Common mistakes**
- Doing heavy computations directly in template bindings.  
- Forgetting to unsubscribe from manual RxJS subscriptions.

**Interview questions**
- Explain the Angular component lifecycle.  
- When would you use `ngAfterViewInit` vs `ngOnInit`?

---

## Section 6: Angular Templates

### 6.1 Interpolation

- **Definition**: Embedding **component data** into HTML using `{{ }}`.  

```html
<h1>Welcome, {{ userName }}</h1>
```

**Common mistakes**: Running expensive functions inside `{{ }}` – move to a `getter` or precomputed property.

---

### 6.2 Property Binding

- **Syntax**: `[property]="expression"`.

```html
<img [src]="user.avatarUrl" [alt]="user.name" />
```

---

### 6.3 Event Binding

- **Syntax**: `(event)="handler($event)"`.

```html
<button (click)="onSave()">Save</button>
```

---

### 6.4 Two-Way Binding

- **Syntax**: `[(ngModel)]="property"` (template-driven) or **reactive forms** for complex cases.

```html
<input [(ngModel)]="user.email" />
```

**Best practices**
- Use **reactive forms** in enterprise apps. `[(ngModel)]` is fine for simple forms.

**Interview questions**
- Explain the difference between interpolation and property binding.  
- Why might you avoid `[(ngModel)]` in complex enterprise forms?

---

## Section 7: Angular Directives

### 7.1 Types of Directives

1. **Structural directives**: Change DOM structure (`*ngIf`, `*ngFor`, `*ngSwitch`).  
2. **Attribute directives**: Change appearance/behavior of existing elements (`ngClass`, `ngStyle`, custom directives).

---

### 7.2 Structural Directives

#### `*ngIf`

```html
<div *ngIf="isLoggedIn">Welcome back!</div>
```

#### `*ngFor`

```html
<li *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</li>
```

**Internal working**: Angular transforms `*directive` syntax into an `<ng-template>` behind the scenes and manages embedded views.

---

### 7.3 Attribute Directives

#### `ngClass` / `ngStyle`

```html
<div [ngClass]="{ 'error': hasError }" [ngStyle]="{ color: hasError ? 'red' : 'black' }">
  Status message
</div>
```

---

### 7.4 Custom Directive Example

```ts
import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlight = 'yellow';

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    this.el.nativeElement.style.backgroundColor = this.appHighlight;
  }
}
```

**Best practices**
- Keep directives small and focused on **DOM behavior**.  
- Prefer signals or inputs instead of directly mutating component state in directives.

**Interview questions**
- What’s the difference between structural and attribute directives?  
- How does Angular transform `*ngIf` under the hood?

---

## Section 8: Angular Decorators (Complete Guide)

### 8.1 Class-Level Decorators

#### `@Component`, `@Directive`, `@Pipe`, `@Injectable`

1. **Definition**: Decorators **attach metadata** used by Angular at compile/runtime.  
2. **Why needed**: Angular relies on this metadata for DI, compilation, templates, and registration.

Examples:

```ts
@Component({ /* ... */ })
export class MyComponent {}

@Directive({ selector: '[appFoo]', standalone: true })
export class FooDirective {}

@Pipe({ name: 'capitalize', standalone: true })
export class CapitalizePipe { /* ... */ }

@Injectable({ providedIn: 'root' })
export class UserService { /* ... */ }
```

**Best practices**
- Use `providedIn: 'root'` for singletons; feature-level providers for domain-scoped services.

---

### 8.2 Property & Parameter Decorators

#### `@Input` & `@Output`

```ts
@Component({
  selector: 'app-user-card',
  template: `
    <div (click)="handleClick()">
      {{ user.name }}
    </div>
  `,
  standalone: true
})
export class UserCardComponent {
  @Input() user!: { id: number; name: string };
  @Output() select = new EventEmitter<number>();

  handleClick() {
    this.select.emit(this.user.id);
  }
}
```

#### `@HostListener` & `@HostBinding`

```ts
@Directive({
  selector: '[appHoverHighlight]',
  standalone: true
})
export class HoverHighlightDirective {
  @HostBinding('style.backgroundColor') bgColor?: string;

  @HostListener('mouseenter')
  onEnter() {
    this.bgColor = 'lightblue';
  }

  @HostListener('mouseleave')
  onLeave() {
    this.bgColor = undefined;
  }
}
```

#### View & Content Queries

- `@ViewChild`, `@ViewChildren`: Access child components/elements **in the component’s view**.  
- `@ContentChild`, `@ContentChildren`: Access projected content in `ng-content`.

```ts
@Component({
  selector: 'app-panel',
  template: `
    <h2 #header>Panel</h2>
    <ng-content></ng-content>
  `,
  standalone: true
})
export class PanelComponent implements AfterViewInit {
  @ViewChild('header') headerEl!: ElementRef<HTMLHeadingElement>;

  ngAfterViewInit() {
    console.log(this.headerEl.nativeElement.textContent);
  }
}
```

**Common mistakes**
- Accessing `@ViewChild` data in `ngOnInit` instead of `ngAfterViewInit`.  
- Overusing query decorators instead of proper **input/output** APIs.

**Interview questions**
- When would you use `@HostBinding` instead of regular property binding?  
- Explain the difference between `@ViewChild` and `@ContentChild`.

---

## Section 9: Angular Dependency Injection

### 9.1 Definition & Purpose

1. **Definition**: Angular’s **DI system** provides a way to register and request dependencies (services, values) in a structured, hierarchical manner.  
2. **Why needed**: Promotes loose coupling, testability, and reusable services.

---

### 9.2 Providers & Injectors

```ts
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ...
}
```

- **Root injector**: Global, app-wide singletons.  
- **Component-level providers**: New instances per component subtree.

```ts
@Component({
  selector: 'app-feature-shell',
  template: `<router-outlet></router-outlet>`,
  providers: [FeatureService],
  standalone: true
})
export class FeatureShellComponent {}
```

**Hierarchical injectors**

```text
Root Injector
  |
  +-- FeatureShellComponent Injector
        |
        +-- ChildComponent Injector
```

**Best practices**
- Use root providers for **pure stateless or truly global services**.  
- Scope domain-specific services to **feature components** or **routes** for isolation.

**Interview questions**
- Explain hierarchical injectors and how they can be used to scope state.  
- How do you provide a service only for a specific lazy-loaded route?

---

## Section 10: Angular Services

### 10.1 Definition & Purpose

1. **Definition**: Services encapsulate **business logic, state, and integration** concerns, separate from UI.  
2. **Why needed**: Promote reuse and clean separation between layers.

---

### 10.2 Example Service

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/orders');
  }
}
```

**Best practices**
- Keep services **focused**; consider **facade services** per feature to encapsulate complex state.  
- Avoid storing **global mutable state** in random services – use dedicated state management.

**Interview questions**
- What distinguishes a service from a component in terms of responsibilities?  
- How would you structure services for a large-order-management module?

---

## Section 11: Angular Routing

### 11.1 Router Architecture

```text
URL → Router → Route Configuration → Component / Lazy-Loaded Route
             ↘ Guards / Resolvers / Interceptors
```

---

### 11.2 Route Configuration (Standalone)

```ts
// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES)
  }
];
```

**Lazy loading**

```ts
// features/orders/orders.routes.ts
import { Routes } from '@angular/router';
import { OrdersShellComponent } from './orders-shell.component';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    component: OrdersShellComponent
  }
];
```

**Best practices**
- Each feature defines its **own route config**.  
- Use **route guards** for auth/permissions validation.

**Interview questions**
- How do you configure lazy-loaded routes in standalone Angular apps?  
- What are route guards, and how would you implement role-based access?

---

## Section 12: Angular Forms

### 12.1 Template-Driven Forms

```html
<form #f="ngForm" (ngSubmit)="onSubmit(f.value)">
  <input name="email" ngModel required email />
  <button type="submit" [disabled]="f.invalid">Submit</button>
</form>
```

**Pros**: Simple for small forms.  
**Cons**: Harder to scale, test, and strongly type.

---

### 12.2 Reactive Forms

```ts
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  standalone: true
})
export class LoginFormComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

**Best practices**
- Use **reactive forms** for enterprise applications.  
- Encapsulate validation logic in **custom validators** and reusable form controls.

**Interview questions**
- Difference between template-driven and reactive forms?  
- How do you write a custom validator?

---

## Section 13: Angular HTTP Client

### 13.1 Definition & Purpose

1. **Definition**: `HttpClient` is Angular’s abstraction over XHR/fetch for making HTTP requests.  
2. **Why needed**: Provides typed requests, interceptors, and RxJS integration.

---

### 13.2 Example REST Calls

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Customer {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerApi {
  constructor(private http: HttpClient) {}

  list(): Observable<Customer[]> {
    return this.http.get<Customer[]>('/api/customers');
  }

  create(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>('/api/customers', customer);
  }
}
```

**Interceptors**

```ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(cloned);
};
```

**Interview questions**
- What are HTTP interceptors and how do they work?  
- How would you handle global error handling for HTTP requests?

---

## Section 14: Angular Signals (Angular 17+)

### 14.1 Definition & Purpose

1. **Definition**: Signals are **fine-grained reactive primitives** representing values that can change over time.  
2. **Why needed**: Provide more predictable and efficient reactivity than global change detection.

---

### 14.2 Core APIs

```ts
import { signal, computed, effect } from '@angular/core';

const count = signal(0);
const double = computed(() => count() * 2);

effect(() => {
  console.log('Count changed:', count(), 'Double:', double());
});

count.set(1); // triggers effect
count.update(c => c + 1);
```

**Performance**: Only consumers of a signal re-render, unlike broad change detection passes.

**Replacing some RxJS use cases**
- Local component state: signals are often simpler than Subjects/BehaviorSubjects.  
- Derived values: `computed` replaces many `map`/`combineLatest` cases.

**Common mistakes**
- Mixing signals and RxJS without clear boundaries.  
- Forgetting to **read** signals with `()` in templates or code.

**Interview questions**
- What are signals, and how do they compare to RxJS Observables?  
- When would you still prefer RxJS over signals?

---

## Section 15: Angular Standalone Components

### 15.1 Definition & Purpose

1. **Definition**: Components, directives, and pipes declared with `standalone: true`, which can be imported directly, without NgModules.  
2. **Why needed**: Simplifies mental model and reduces boilerplate.

```ts
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ProfileComponent {}
```

**Benefits**
- No need for feature `NgModule` in new code.  
- Clearer dependency graph via `imports`.

**Interview questions**
- How do standalone components change feature module design?  
- Can you mix standalone components with NgModules in the same app?

---

## Section 16: Angular Change Detection

### 16.1 Zone.js & Change Detection

1. **Definition**: Zone.js patches async APIs and notifies Angular when to run change detection.  
2. **Why needed**: Automatically keeps templates in sync with data.

**Strategies**
- `Default`: Checks the whole component tree when something might have changed.  
- `OnPush`: Checks only when inputs change, events trigger, or signals update.

```ts
@Component({
  selector: 'app-fast-list',
  templateUrl: './fast-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class FastListComponent {}
```

**Performance tips**
- Use `OnPush` and **immutable data**.  
- Use `trackBy` with `*ngFor`.

**Interview questions**
- How does `OnPush` change detection work?  
- What is the impact of Zone.js on performance?

---

## Section 17: Angular State Management

### 17.1 Options

1. **RxJS + Services**  
2. **NgRx (Redux-style)**  
3. **Signals-based state** (Angular 17+)

**Enterprise patterns**
- Use **NgRx** for complex, cross-cutting global state, auditing, and dev tools.  
- Use **signals or simple RxJS** for local/feature-level state.

**Signals store example**

```ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly _items = signal<{ id: number; price: number }[]>([]);

  readonly items = this._items.asReadonly();
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.price, 0)
  );

  addItem(item: { id: number; price: number }) {
    this._items.update(items => [...items, item]);
  }
}
```

**Interview questions**
- When would you choose NgRx vs a signals-based store?  
- How do you organize state in a multi-team monorepo?

---

## Section 18: Angular Performance Optimization

### 18.1 Techniques

- **Lazy loading** routes and feature areas.  
- **Code splitting** via dynamic imports.  
- **Tree shaking** with production builds.  
- **Server-side rendering (SSR)** + hydration (Angular Universal).

**SSR Diagram**

```text
Client Request → Node.js SSR Server → Pre-rendered HTML
        |                                  |
        v                                  v
     Browser receives HTML        Angular bootstraps & hydrates
```

**Interview questions**
- How do you enable SSR in an Angular app?  
- What are deferrable views, and how do they help performance?

---

## Section 19: Angular Testing

### 19.1 Unit & Component Testing

**Tools**
- **Jasmine/Karma**: Default Angular test stack.  
- **Jest**: Popular alternative test runner.  
- **Testing Library**: For more user-focused tests.

```ts
import { TestBed } from '@angular/core/testing';
import { UserCardComponent } from './user-card.component';

describe('UserCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserCardComponent]
    });
  });

  it('should render user name', () => {
    const fixture = TestBed.createComponent(UserCardComponent);
    fixture.componentInstance.user = { id: 1, name: 'Alice' };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Alice');
  });
});
```

**Interview questions**
- How do you test components that use the router or HttpClient?  
- What are the trade-offs between Karma and Jest?

---

## Section 20: Angular Security

### 20.1 XSS Protection & Sanitization

- Angular **escapes bindings** by default.  
- Use `DomSanitizer` carefully when bypassing security for trusted content.

```ts
constructor(private sanitizer: DomSanitizer) {}

trustedHtml = this.sanitizer.bypassSecurityTrustHtml('<b>Safe</b>');
```

**Common mistakes**
- Using `[innerHTML]` with untrusted data.  
- Disabling Angular’s built-in sanitization.

---

### 20.2 Authentication & JWT

```ts
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  return next(
    token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req
  );
};
```

**Best practices**
- Store tokens in **HttpOnly cookies** when possible.  
- Implement **route guards** for protected routes.

**Interview questions**
- How does Angular help prevent XSS?  
- What are best practices for token storage in Angular apps?

---

## Section 21: Angular with Microservices

### 21.1 Frontend & Microservices Architecture

```text
Angular App → API Gateway → Microservices (User, Orders, Billing, ...)
```

**Best practices**
- Use an **API gateway** to aggregate microservices for the frontend.  
- Design the Angular app around **business domains** aligning with backend services.

**Interview questions**
- How do you design an Angular frontend to work with microservices?  
- What is BFF (Backend-for-Frontend), and when would you use it?

---

## Section 22: Angular Enterprise Architecture

### 22.1 Monorepos & Nx

- **Definition**: Single repository containing multiple apps/libraries.  
- **Why**: Shared code, consistent tooling, better refactoring.

```text
apps/
  admin-portal/
  customer-portal/
libs/
  ui/
  domain-orders/
  domain-customers/
  data-access/
```

**Micro frontends & Module Federation**
- Use **Webpack Module Federation** (via Nx or custom) to compose separate Angular apps at runtime.  
- Useful when different teams own different vertical slices.

**Interview questions**
- Explain benefits and challenges of monorepos in Angular.  
- How do you implement micro frontends with Angular?

---

## Section 23: Angular Deployment

### 23.1 Production Builds

```bash
ng build --configuration production
```

Artifacts go into `dist/`, ready for static hosting.

### 23.2 Deploying to Nginx

- Copy `dist/my-app` to server.  
- Configure Nginx to serve static files and redirect all non-file routes to `index.html`.

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 23.3 Docker & Kubernetes

**Dockerfile (example)**

```dockerfile
FROM nginx:alpine
COPY ./dist/my-app /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
```

Deploy the Docker image in Kubernetes behind an **Ingress**.

**Interview questions**
- What is required to deploy an Angular SPA behind Nginx?  
- How do you configure Angular routing when using Docker/Kubernetes?

---

## Section 24: Angular Interview Questions

### 24.1 Beginner

- What is a component in Angular?  
- Explain interpolation and property binding.  
- What is the role of `@NgModule` vs a standalone component?

### 24.2 Intermediate

- How does dependency injection work in Angular?  
- Compare template-driven and reactive forms.  
- What is the difference between `@Input` and `@Output`?

### 24.3 Senior Developer

- How do you architect large Angular applications?  
- Explain change detection strategies and when to use `OnPush`.  
- Describe how you would implement global error handling and logging.

### 24.4 Frontend Architect

- How would you structure an Nx monorepo with multiple Angular apps?  
- Compare signals-based state management with NgRx for global state.  
- How do you design an Angular app to integrate with a microservices backend?

---

## Section 25: Angular Cheat Sheet

### 25.1 Common Decorators

| Decorator        | Purpose                              |
|------------------|--------------------------------------|
| `@Component`     | Define a UI component                |
| `@Directive`     | Define a behavior directive          |
| `@Pipe`          | Define a transformation pipe         |
| `@Injectable`    | Mark a class as DI injectable        |
| `@Input`         | Bind data into a component           |
| `@Output`        | Emit events from a component         |
| `@HostBinding`   | Bind a property to the host element  |
| `@HostListener`  | Listen to host element events        |
| `@ViewChild`     | Query a single view child            |
| `@ViewChildren`  | Query multiple view children         |
| `@ContentChild`  | Query projected content child        |
| `@ContentChildren`| Query multiple projected children   |

---

### 25.2 CLI Commands (Core)

| Command                         | Description                              |
|---------------------------------|------------------------------------------|
| `ng new <name>`                 | Create new workspace & app              |
| `ng serve`                      | Dev server with live reload             |
| `ng build --configuration prod` | Production build                         |
| `ng test`                       | Run unit tests                          |
| `ng lint`                       | Run linters                             |
| `ng e2e`                        | Run end-to-end tests (if configured)    |

---

### 25.3 `ng generate` Cheatsheet (Classes, Models, Interfaces, etc.)

> You can always abbreviate `generate` as `g` (e.g., `ng g c`).

| Purpose / Artifact                    | Long form command                                                                 | Short form                          |
|--------------------------------------|-----------------------------------------------------------------------------------|-------------------------------------|
| **Standalone component**             | `ng generate component users/user-card --standalone`                              | `ng g c users/user-card --standalone` |
| **Directive**                        | `ng generate directive shared/directives/auto-focus`                              | `ng g d shared/directives/auto-focus` |
| **Pipe**                             | `ng generate pipe shared/pipes/capitalize`                                        | `ng g p shared/pipes/capitalize`    |
| **Service (class + @Injectable)**    | `ng generate service core/services/user`                                          | `ng g s core/services/user`         |
| **Guard (class implementing CanX)**  | `ng generate guard core/guards/auth`                                              | `ng g g core/guards/auth`           |
| **Resolver**                         | `ng generate resolver core/resolvers/user`                                        | `ng g r core/resolvers/user`        |
| **Interface (pure TypeScript)**      | `ng generate interface shared/models/user`                                        | `ng g i shared/models/user`         |
| **Class (plain TS class)**           | `ng generate class shared/models/user`                                            | `ng g cl shared/models/user`        |
| **Enum**                             | `ng generate enum shared/models/user-role`                                        | `ng g e shared/models/user-role`    |
| **Type alias (with schematics)**     | _No built-in schematic_ → manually create `user.types.ts`                        | –                                   |
| **Model (convention)**              | Use **interface/class** schematics in a `models/` folder (see rows above)        | –                                   |
| **Standalone route (Angular 17+)**   | `ng generate route orders --standalone --path=orders`                             | `ng g route orders --standalone`    |
| **Module (legacy / compatibility)**  | `ng generate module features/orders`                                              | `ng g m features/orders`            |
| **Routing module**                   | `ng generate module app-routing --flat --module=app`                              | `ng g m app-routing --flat --module=app` |
| **Environment file**                 | `ng generate environment staging` (Angular 17+ env schematic)                     | `ng g env staging`                  |
| **Interceptor (class + provider)**   | `ng generate interceptor core/interceptors/auth`                                  | `ng g interceptor core/interceptors/auth` |
| **Resolver + route combo (Nx schem.)** | Depends on Nx plugins; typically use app-specific generators                     | –                                   |

**Notes**
- For **models/interfaces**: prefer a **shared `models/` folder** and use `ng g i` (interface) or `ng g cl` (class) so you keep all domain types together.
- For **Angular 17+ standalone** style, pass `--standalone` to components, pipes, directives, and routes to avoid creating or modifying NgModules.

---

### 25.4 RxJS Operators (Common)

| Operator      | Use Case                           |
|---------------|------------------------------------|
| `map`         | Transform values                   |
| `filter`      | Filter values                      |
| `switchMap`   | Flatten and switch inner streams   |
| `mergeMap`    | Flatten concurrently               |
| `concatMap`   | Flatten sequentially               |
| `catchError`  | Handle errors                      |
| `debounceTime`| Rate-limit user input              |
| `takeUntil`   | Complete on another observable     |

---

### 25.5 Signals API Quick Reference

```ts
const count = signal(0);        // create signal
count();                        // read
count.set(5);                   // write
count.update(c => c + 1);       // update

const double = computed(() => count() * 2);

effect(() => {
  console.log(count());
});
```

---

**Use this guide as both a learning path and a daily reference when designing, implementing, and reviewing Angular 17–21 enterprise applications.**

