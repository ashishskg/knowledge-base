## TypeScript 5.x Enterprise Guide

**Audience**: Beginners → Senior Engineers → Software Architects  
**Goal**: Deep, practical guide for designing, building, and operating **enterprise-grade systems with TypeScript** across frontend (Angular) and backend (Node.js).

---

## Table of Contents

- **Section 1**: Introduction to TypeScript  
- **Section 2**: Installing and Configuring TypeScript  
- **Section 3**: TypeScript Basic Syntax (Variables)  
- **Section 4**: Data Types in TypeScript  
- **Section 5**: Arrays and Tuples  
- **Section 6**: Functions  
- **Section 7**: Interfaces  
- **Section 8**: Type Aliases  
- **Section 9**: Enums  
- **Section 10**: Classes in TypeScript  
- **Section 11**: Generics  
- **Section 12**: Advanced Types  
- **Section 13**: Utility Types  
- **Section 14**: TypeScript Modules  
- **Section 15**: Decorators  
- **Section 16**: TypeScript with Async Programming  
- **Section 17**: TypeScript with Node.js  
- **Section 18**: TypeScript with Angular  
- **Section 19**: TypeScript Design Patterns  
- **Section 20**: TypeScript Performance and Best Practices  
- **Section 21**: TypeScript Project Architecture  
- **Section 22**: TypeScript Debugging and Tooling  
- **Section 23**: TypeScript Interview Questions  
- **Section 24**: TypeScript Cheat Sheet  

Each major concept is described with:

1. **Definition**  
2. **Why it is needed**  
3. **Syntax explanation**  
4. **Internal behavior**  
5. **Code examples**  
6. **Best practices**  
7. **Performance considerations**  
8. **Common mistakes**  
9. **Enterprise use cases**  
10. **Interview questions**  

---

## Section 1: Introduction to TypeScript

### 1.1 What is TypeScript?

1. **Definition**  
   TypeScript is a **typed superset of JavaScript** that adds **static typing, interfaces, generics, and tooling** on top of standard JavaScript. It **compiles down to plain JavaScript**, running wherever JS runs (browsers, Node.js, serverless, etc.).

2. **Why it is needed**  
   - **Catch bugs at compile time** instead of production.  
   - **Improve IDE support** (autocomplete, refactors, jump-to-definition).  
   - **Enable large-scale engineering** with explicit contracts and types.  
   - **Document intent** in code through types.

3. **Syntax explanation**  
   - JavaScript **plus** type annotations: `let x: number = 1;`.  
   - Additions like `interface`, `type`, `enum`, `readonly`, `abstract`, generics (`<T>`).

4. **Internal behavior**  
   - The TypeScript compiler (`tsc`) **erases types** and outputs JavaScript.  
   - Type information exists **only at compile time**, not at runtime.  
   - TypeScript performs **static analysis**, not runtime enforcement.

5. **Code example**

```ts
// TypeScript
function greet(name: string): string {
  return `Hello, ${name}`;
}

const message = greet('Alice'); // OK
// const errorMessage = greet(123); // Compile-time error
```

6. **Best practices**
   - Always enable **`strict`** mode in `tsconfig.json`.  
   - Model domain concepts with **types/interfaces**, not `any`.

7. **Performance considerations**
   - TypeScript adds **no runtime cost** (types are erased).  
   - Build time overhead is the main cost; can be optimized with project references, incremental builds, and `tsc --build`.

8. **Common mistakes**
   - Assuming TypeScript enforces types at runtime.  
   - Overusing `any` and undoing type safety.

9. **Enterprise use cases**
   - Large codebases with hundreds of developers.  
   - Shared libraries across teams and services.  
   - Public SDKs where **type definitions** are part of the contract.

10. **Interview questions**
   - What problems does TypeScript solve that JavaScript alone does not?  
   - Does TypeScript change the runtime behavior of your code? Explain.

---

### 1.2 Why TypeScript Was Created

1. **Definition**  
   TypeScript was created by Microsoft to **address the complexity of large-scale JavaScript applications**, especially in enterprise settings.

2. **Why it is needed**  
   - JavaScript was designed for **small scripts**, not 100k+ LOC systems.  
   - Lack of types leads to runtime errors and fragile refactors.  
   - Dynamic code is hard to reason about as the codebase grows.

3. **Syntax explanation**  
   - TypeScript builds on **existing JS syntax**, minimizing friction for JS developers.

4. **Internal behavior**  
   - TypeScript uses a **structural type system** (type compatibility by shape, not by explicit declarations).

5. **Code example – structural typing**

```ts
interface Person {
  name: string;
}

const user = { name: 'Bob', age: 30 };
const p: Person = user; // OK: has at least 'name: string'
```

6. **Best practices**
   - Embrace **structural typing** to design flexible APIs.  
   - Use **interfaces and types** as contracts between layers.

7. **Performance considerations**
   - Type system complexity can **slow compilation** if abused (e.g., deeply nested conditionals), but runtime performance is unaffected.

8. **Common mistakes**
   - Misunderstanding structural vs nominal typing (assuming `implements` is required).

9. **Enterprise use cases**
   - Shared interface contracts between frontend and backend.  
   - Enforcing API contracts across microservices via shared types.

10. **Interview questions**
   - What is structural typing, and how does TypeScript use it?  
   - How does TypeScript help with refactoring large codebases?

---

### 1.3 TypeScript vs JavaScript

**Comparison Table**

| Aspect              | JavaScript                          | TypeScript                                             |
|---------------------|-------------------------------------|--------------------------------------------------------|
| Typing              | Dynamic                             | Static + optional                                     |
| Tooling             | Basic                               | Rich (intellisense, refactors, navigation)           |
| Error detection     | Runtime                             | Compile-time + runtime                                |
| Language features   | ES spec                             | ES + types, enums, decorators (stage 2+), generics   |
| Ecosystem           | Huge                                | Superset of JS + DefinitelyTyped                     |
| Learning curve      | Low                                 | Moderate (types, generics, config)                   |

**Interview questions**
- Can TypeScript do anything at runtime that JavaScript cannot?  
- Why might a startup still choose plain JavaScript over TypeScript?

---

### 1.4 TypeScript Compilation Process & Architecture

**High-level diagram**

```text
TypeScript Source (.ts / .tsx)
          |
          v
   TypeScript Compiler (tsc)
   - Parse
   - Type Check
   - Transform
          |
          v
JavaScript Output (.js) + Type Declarations (.d.ts)
```

1. **Definition**  
   Compilation is the process of turning `.ts` files into `.js` (and optionally `.d.ts`) files.

2. **Why it is needed**  
   Browsers and Node.js understand **JavaScript**, not TypeScript.  

3. **Syntax explanation (CLI)**

```bash
tsc index.ts        # compile one file
tsc                 # compile project using tsconfig.json
```

4. **Internal behavior**
   - **Parsing**: Builds an AST (abstract syntax tree).  
   - **Type checking**: Validates types, reports errors.  
   - **Emit**: Generates JavaScript according to `target`/`module`.

5. **Code example**

```ts
// greet.ts
function greet(name: string) {
  console.log('Hello', name);
}

greet('World');
```

```js
// greet.js (emitted)
function greet(name) {
  console.log('Hello', name);
}
greet('World');
```

6. **Best practices**
   - Treat TypeScript errors as **build blockers** (no `// @ts-ignore` unless justified).  
   - Use **declaration emit** (`declaration: true`) for libraries.

7. **Performance considerations**
   - Use **incremental** and **composite** projects for monorepos.  
   - Prefer **isolatedModules** when using `tsc` with Babel/webpack.

8. **Common mistakes**
   - Relying on webpack/Babel without `tsc --noEmit` type-checking in CI.  
   - Ignoring compiler errors in favor of “build green”.

9. **Enterprise use cases**
   - CI pipelines running `tsc --build` across multiple packages.  
   - Published libraries shipping `.d.ts` files to consumers.

10. **Interview questions**
   - What steps does the TypeScript compiler perform?  
   - How does `target` and `module` in `tsconfig` affect emitted code?

---

## Section 2: Installing and Configuring TypeScript

### 2.1 Installing TypeScript

1. **Definition**  
   Install TypeScript via **npm** or **yarn** as a dev dependency.

2. **Why it is needed**  
   - Compiler (`tsc`) and language services are delivered as an npm package.

3. **Syntax**

```bash
npm install --save-dev typescript
# or
yarn add -D typescript
```

4. **Internal behavior**
   - Installs the `tsc` CLI in `node_modules/.bin`.  
   - IDE picks up TypeScript version from your workspace.

5. **Best practices**
   - Pin TypeScript version per repo (e.g., `^5.5.0`).  
   - Avoid relying on **global** TypeScript installs.

6. **Common mistakes**
   - Different TS versions in monorepos causing inconsistent behavior.

7. **Enterprise use cases**
   - Toolchain management via **pnpm**/**yarn workspaces** with consistent TS versions.

8. **Interview questions**
   - How do you ensure all developers use the same TypeScript version?

---

### 2.2 `tsconfig.json` Configuration

1. **Definition**  
   `tsconfig.json` is the configuration file that tells TypeScript **how** to compile your project.

2. **Why it is needed**  
   - Defines root files, compiler options, strictness, module system, and output directories.

3. **Key compiler options**

| Option            | Purpose                                                   |
|-------------------|-----------------------------------------------------------|
| `target`          | JavaScript version to emit (e.g., `ES2019`, `ES2022`)    |
| `module`          | Module system (`ESNext`, `CommonJS`, `NodeNext`)         |
| `strict`          | Enable all strict type-checking options                  |
| `esModuleInterop` | Interop between CommonJS and ES modules                  |
| `outDir`          | Directory for compiled JS                                |
| `rootDir`         | Expected root of TypeScript source files                 |

4. **Example `tsconfig.json` (backend Node.js project)**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

5. **Internal behavior**
   - `rootDir` and `outDir` determine how `.ts` maps to `.js` in output.  
   - `strict` enables options like `strictNullChecks`, `noImplicitAny`, etc.

6. **Best practices**
   - Always enable `strict: true`.  
   - Use `skipLibCheck: true` to speed up builds in large projects.  
   - For Node 18+, prefer `module: "NodeNext"` with ES modules.

7. **Performance considerations**
   - `skipLibCheck` reduces type-checking time.  
   - Use `incremental: true` and `tsbuildinfo` for faster rebuilds.

8. **Common mistakes**
   - Misconfigured `rootDir` causing weird file layout in `dist`.  
   - Disabling `strictNullChecks`, reintroducing null-related bugs.

9. **Enterprise use cases**
   - Shared `tsconfig.base.json` in monorepos for consistent options.  
   - Different `tsconfig` per package: `tsconfig.app.json`, `tsconfig.lib.json`.

10. **Interview questions**
   - What does `strict` do in `tsconfig.json`?  
   - When would you use `esModuleInterop`, and what problem does it solve?

---

## Section 3: TypeScript Basic Syntax (Variables)

### 3.1 `let`, `const`, `var`

1. **Definition**  
   - `var`: function-scoped variable (legacy).  
   - `let`: block-scoped, mutable variable.  
   - `const`: block-scoped, **cannot be reassigned**.

2. **Why it is needed**  
   - `let` and `const` fix historical scoping issues and improve readability and safety.

3. **Comparison table**

| Keyword | Scope           | Hoisting        | Reassignment | Temporal Dead Zone | Best Use Case                      |
|---------|-----------------|-----------------|-------------|--------------------|------------------------------------|
| `var`   | Function/global | Hoisted, `undefined` | Yes         | No                 | Legacy code only                   |
| `let`   | Block           | Hoisted, TDZ    | Yes         | Yes                | Mutable variables within a block   |
| `const` | Block           | Hoisted, TDZ    | No          | Yes                | Constants and object references    |

4. **Syntax & examples**

```ts
function example() {
  var a = 1;      // function-scoped
  let b = 2;      // block-scoped
  const c = 3;    // block-scoped, cannot be reassigned

  if (true) {
    var a = 10;   // same 'a'
    let b = 20;   // new 'b'
    // c = 30;    // Error: cannot reassign
  }

  console.log(a); // 10
  console.log(b); // 2
}
```

5. **Internal behavior**
   - `var` declarations are **hoisted** and initialized to `undefined`.  
   - `let`/`const` are hoisted but exist in the **temporal dead zone** until initialized.

6. **Best practices**
   - Use **`const` by default**, `let` when you must reassign.  
   - Avoid `var` in new code.

7. **Performance considerations**
   - Engines optimize `let`/`const` effectively; performance differences are negligible in typical apps.

8. **Common mistakes**
   - Reassigning `const` by mistake.  
   - Misunderstanding `const` with objects: `const obj` prevents reassignment of the reference, not mutation of properties.

9. **Enterprise use cases**
   - Using `const` for configuration constants, dependency injection tokens, etc.  
   - Consistent coding standards enforced by ESLint.

10. **Interview questions**
   - Explain the differences between `var`, `let`, and `const`.  
   - What is the temporal dead zone?

---

## Section 4: Data Types in TypeScript

### 4.1 Primitive Types

1. **Definition**
   - `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`.

2. **Why it is needed**
   - Primitive types model core data; TypeScript adds **static guarantees** on top.

3. **Syntax**

```ts
let username: string = 'alice';
let age: number = 30;
let isActive: boolean = true;
let notSet: null = null;
let maybe: undefined = undefined;
let uniqueId: symbol = Symbol('id');
let largeNumber: bigint = 9007199254740991n;
```

4. **Internal behavior**
   - At runtime, they behave as JavaScript primitives.  
   - TypeScript enforces correct usage at compile time.

5. **Type inference**

```ts
let count = 0;            // inferred as number
const apiUrl = '/api';    // inferred as string literal '/api'
```

6. **Best practices**
   - Rely on **type inference** where clear; explicitly type public APIs.  
   - Avoid using `Number`, `String` (wrapper objects) in types; use `number`, `string`.

7. **Performance considerations**
   - Using `bigint` can be slower; only use when necessary.

8. **Common mistakes**
   - Confusing `null` vs `undefined` semantics.  
   - Using primitive wrapper types (`String`) in annotations.

9. **Enterprise use cases**
   - Strongly typed DTOs between services.  
   - Ensuring numeric IDs vs string IDs are not accidentally mixed.

10. **Interview questions**
   - How does TypeScript’s type inference work for primitives?  
   - When would you use `bigint` in a production system?

---

## Section 5: Arrays and Tuples

### 5.1 Arrays

1. **Definition**  
   Ordered collections of elements of the same (or union) type.

2. **Why it is needed**  
   - Represent lists of items: users, products, logs.

3. **Syntax**

```ts
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ['Alice', 'Bob'];
const mixed: (string | number)[] = [1, 'two', 3];
```

4. **Internal behavior**
   - Compiles to JavaScript arrays; type info is erased.

5. **Best practices**
   - Prefer the `T[]` syntax in most codebases for readability.  
   - Use union element types for heterogeneous arrays with care.

6. **Common mistakes**
   - Using `any[]` instead of precise types.  

---

### 5.2 Tuples

1. **Definition**  
   Tuples are **fixed-length arrays** with specific types at each index.

2. **Why it is needed**  
   - Represent small fixed structures: coordinate pairs, key-value pairs, responses.

3. **Syntax**

```ts
let point: [number, number] = [10, 20];
let userEntry: [id: number, name: string] = [1, 'Alice'];
```

4. **Internal behavior**
   - At runtime, they are arrays; the structure enforcement is compile-time only.

5. **Code example**

```ts
function parseUser(input: string): [id: number, name: string] {
  const [idStr, name] = input.split(',');
  return [Number(idStr), name];
}
```

6. **Best practices**
   - Use **named tuple elements** for readability.  
   - Prefer interfaces for complex structures; use tuples for small, positional data.

7. **Interview questions**
   - When would you use a tuple instead of an interface?  
   - How do tuples differ from arrays in TypeScript?

---

## Section 6: Functions

### 6.1 Function Types

1. **Definition**  
   A function type describes the **parameter types** and **return type** of a function.

2. **Why it is needed**  
   - Enables type-safe callbacks, APIs, and higher-order functions.

3. **Syntax**

```ts
type BinaryOp = (a: number, b: number) => number;

const add: BinaryOp = (a, b) => a + b;
```

4. **Internal behavior**
   - Functions are JavaScript functions; TypeScript adds static type checks.

5. **Function declaration vs arrow function**

```ts
function multiply(a: number, b: number): number {
  return a * b;
}

const multiplyArrow = (a: number, b: number): number => a * b;
```

**Best practices**
- Use **arrow functions** for callbacks to preserve `this`.  
- Use named function declarations when you need hoisting or better stack traces.

---

### 6.2 Parameters

1. **Optional parameters**

```ts
function log(message: string, userId?: string) {
  console.log(message, userId ?? 'anonymous');
}
```

2. **Default parameters**

```ts
function connect(host = 'localhost', port = 5432) {
  // ...
}
```

3. **Rest parameters**

```ts
function sum(...values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}
```

4. **Return types**

```ts
function findUser(id: string): User | null {
  // ...
}
```

5. **Best practices**
   - Explicitly type **public function return types**.  
   - Use **union return types** to model success/error states clearly.

6. **Common mistakes**
   - Forgetting to handle `undefined` when using optional parameters.  
   - Using `any` in function signatures.

7. **Enterprise use cases**
   - Well-typed service and repository layers.  
   - Functional utilities with generic function types.

8. **Interview questions**
   - How do you type a function that takes any number of arguments of the same type?  
   - Why is it a good idea to annotate return types explicitly?

---

## Section 7: Interfaces

### 7.1 Basics

1. **Definition**  
   `interface` describes the **shape of an object**: required and optional properties, methods, index signatures.

2. **Why it is needed**  
   - Express contracts between modules, layers, and services.

3. **Syntax**

```ts
interface User {
  id: number;
  name: string;
  email?: string;        // optional
  readonly role: string; // readonly property
}
```

4. **Interface inheritance**

```ts
interface AuditedEntity {
  createdAt: Date;
  updatedAt: Date;
}

interface Customer extends AuditedEntity {
  id: string;
  name: string;
}
```

5. **Internal behavior**
   - Interfaces are **compile-time only**; no runtime representation.

6. **Best practices**
   - Use interfaces to describe public API shapes and domain models.  
   - Prefer **composition and extension** over large “god” interfaces.

7. **Common mistakes**
   - Using interfaces for complex conditional logic better suited to **type aliases**.

8. **Enterprise use cases**
   - API contracts, DTOs, domain entities, repository interfaces.  
   - Integration points with third-party systems.

9. **Interview questions**
   - How do you define optional and readonly properties in an interface?  
   - How do you extend multiple interfaces?

---

## Section 8: Type Aliases

### 8.1 `type` Keyword

1. **Definition**  
   `type` creates an alias for **any type**: primitives, unions, intersections, tuples, function types, etc.

2. **Why it is needed**  
   - Compose complex types from simpler pieces; name re-usable type combinations.

3. **Syntax**

```ts
type UserId = string & { readonly brand: unique symbol };
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type Callback<T> = (value: T) => void;
```

4. **Type alias vs interface**

| Feature                 | `interface`           | `type`                                    |
|-------------------------|----------------------|-------------------------------------------|
| Object shapes           | Yes                  | Yes                                       |
| Unions / intersections  | No (directly)        | Yes                                       |
| Merging (declaration)   | Yes                  | No                                        |
| Implements              | Yes                  | Yes (for object shapes)                   |

5. **Best practices**
   - Use **interfaces** for object shapes and public APIs.  
   - Use **type aliases** for unions, intersections, and complex composition.

6. **Common mistakes**
   - Overusing `type` for everything, losing declaration merging benefits.  
   - Confusing `type X = Y` as a “new type” at runtime.

7. **Enterprise use cases**
   - Domain-specific unions, e.g., `type Currency = 'USD' | 'EUR' | 'INR';`.  
   - `Result`/`Either` types for error handling.

8. **Interview questions**
   - When would you choose an interface over a type alias and vice versa?  
   - Can type aliases be extended?

---

## Section 9: Enums

### 9.1 Numeric and String Enums

1. **Definition**  
   Enums define a set of **named constants**.

2. **Why it is needed**  
   - Improve readability over raw literals; centralize allowed values.

3. **Numeric enum**

```ts
enum Status {
  Pending,    // 0
  InProgress, // 1
  Completed   // 2
}

const s: Status = Status.InProgress;
```

4. **String enum**

```ts
enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}
```

5. **Internal behavior**
   - Enums emit JavaScript objects; numeric enums create reverse mappings.  
   - String enums map keys to string values, no reverse mapping by default.

6. **Best practices**
   - Prefer **string literal unions** over enums in many modern codebases to reduce runtime overhead:  

```ts
type Role = 'admin' | 'user' | 'guest';
```

7. **Common mistakes**
   - Using enums where plain strings would suffice.  
   - Not understanding emitted code size of enums.

8. **Enterprise use cases**
   - Shared constants across services, especially with legacy code.  
   - Safety around status codes, roles, and flags.

9. **Interview questions**
   - Difference between numeric and string enums?  
   - Why might you use a union of string literals instead of an enum?

---

## Section 10: Classes in TypeScript

### 10.1 Class Syntax and Features

1. **Definition**  
   Classes model **objects with state and behavior**, extended with TypeScript features (access modifiers, readonly fields, abstract classes).

2. **Why it is needed**  
   - Familiar OO patterns for many teams; used heavily in Angular and enterprise backends.

3. **Syntax**

```ts
class User {
  public id: number;
  public name: string;
  protected email: string;
  private passwordHash: string;

  constructor(id: number, name: string, email: string, passwordHash: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  public checkPassword(hash: string): boolean {
    return this.passwordHash === hash;
  }
}
```

4. **Access modifiers**
   - `public` (default), `protected`, `private`.  
   - `readonly` fields cannot be reassigned after initialization.

5. **Inheritance**

```ts
class AdminUser extends User {
  constructor(id: number, name: string, email: string, passwordHash: string) {
    super(id, name, email, passwordHash);
  }

  canManageUsers(): boolean {
    return true;
  }
}
```

6. **Best practices**
   - Prefer **composition over inheritance** for behavior sharing.  
   - Keep classes small and focused; use interfaces where polymorphism is required.

7. **Common mistakes**
   - Overusing inheritance hierarchies (deep class trees).  
   - Exposing internal state with public mutable fields.

8. **Enterprise use cases**
   - Domain entities, services (especially in Angular).  
   - Adapters and gateways in layered architectures.

9. **Interview questions**
   - How do access modifiers work in TypeScript classes?  
   - When would you use an abstract class vs an interface?

---

## Section 11: Generics

### 11.1 Deep Dive into Generics

1. **Definition**  
   Generics allow writing **type-safe, reusable components** that work over a variety of types.

2. **Why it is needed**  
   - Reuse algorithms/data structures while preserving type information.

3. **Syntax**

```ts
function identity<T>(value: T): T {
  return value;
}

const n = identity<number>(42);
const s = identity('hello'); // type inferred as string
```

4. **Generic interfaces**

```ts
interface ApiResponse<T> {
  data: T;
  error?: string;
}

type UserResponse = ApiResponse<User>;
```

5. **Generic classes**

```ts
class Repository<T> {
  private items: T[] = [];

  add(item: T) {
    this.items.push(item);
  }

  findAll(): T[] {
    return [...this.items];
  }
}
```

6. **Constraints**

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

7. **Best practices**
   - Use descriptive generic names for readability: `TEntity`, `TResult`.  
   - Avoid overcomplicating type signatures; balance power with clarity.

8. **Common mistakes**
   - Generic overloads that become unmaintainable.  
   - Overusing `any` instead of correctly parameterizing generics.

9. **Enterprise use cases**
   - Reusable repositories, caches, and service layers.  
   - Utility types and frameworks (e.g., typed HTTP clients, form builders).

10. **Interview questions**
   - Explain generics and provide a real-world example.  
   - How do you constrain a generic type parameter?

---

## Section 12: Advanced Types

### 12.1 Unions and Intersections

1. **Union types**

```ts
type Result = { ok: true; value: string } | { ok: false; error: Error };
```

2. **Intersection types**

```ts
interface Timestamped {
  createdAt: Date;
}

interface SoftDeletable {
  deletedAt?: Date;
}

type AuditedEntity = Timestamped & SoftDeletable;
```

---

### 12.2 Type Guards & Narrowing

1. **Definition**  
   Type guards are **runtime checks** that tell TypeScript which type a value is.

2. **Syntax**

```ts
function isError(result: Result): result is { ok: false; error: Error } {
  return !result.ok;
}

function handle(result: Result) {
  if (isError(result)) {
    console.error(result.error);
  } else {
    console.log(result.value);
  }
}
```

3. **Built-in narrowing**
   - `typeof`, `instanceof`, `in` operator.

```ts
function printId(id: string | number) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}
```

4. **Best practices**
   - Use **discriminated unions** with a `kind` or `type` field for exhaustive checking.

5. **Interview questions**
   - Explain type guards and provide an example.  
   - What is a discriminated union?

---

## Section 13: Utility Types

### 13.1 Core Utility Types

1. **`Partial<T>`**

```ts
interface User {
  id: string;
  name: string;
  email: string;
}

type UserUpdate = Partial<User>;
```

2. **`Required<T>`**

```ts
type CompleteUser = Required<User>;
```

3. **`Readonly<T>`**

```ts
type ReadonlyUser = Readonly<User>;
```

4. **`Record<K, T>`**

```ts
type RolePermissions = Record<'admin' | 'user', string[]>;
```

5. **`Pick<T, K>` / `Omit<T, K>`**

```ts
type UserPublic = Pick<User, 'id' | 'name'>;
type UserWithoutEmail = Omit<User, 'email'>;
```

6. **`Exclude<T, U>` / `Extract<T, U>`**

```ts
type EventType = 'click' | 'focus' | 'keyup';
type KeyboardEventType = Extract<EventType, 'keyup'>;
type MouseEventType = Exclude<EventType, 'keyup'>;
```

7. **Best practices**
   - Use utility types to avoid duplicating shapes.  
   - Keep transformations simple and heavily unit-tested.

8. **Common mistakes**
   - Nested utility types that become unreadable.  
   - Abusing `Partial` for inputs where required fields matter.

9. **Enterprise use cases**
   - Tightly specifying DTOs for APIs (e.g., create vs update payloads).  
   - Building generic infrastructure libraries.

10. **Interview questions**
   - Explain `Pick`, `Omit`, and `Partial` with examples.  
   - When would you use `Record`?

---

## Section 14: TypeScript Modules

### 14.1 Module System

1. **Definition**  
   Modules are files that import/export values and types.

2. **Why it is needed**  
   - Encapsulate functionality, control visibility, and manage dependencies.

3. **Syntax**

```ts
// user.ts
export interface User {
  id: string;
}

export function createUser(id: string): User {
  return { id };
}

// index.ts
import { createUser } from './user';
```

4. **ES modules vs CommonJS**

| Aspect   | ES Modules (`module: "ESNext"`) | CommonJS (`module: "CommonJS"`) |
|----------|----------------------------------|----------------------------------|
| Syntax   | `import`/`export`               | `require`/`module.exports`      |
| Runtime  | Native in modern Node/browsers  | Legacy Node.js default          |

5. **Best practices**
   - Prefer **ES modules** for new Node.js projects.  
   - Avoid mixing default and named exports arbitrarily.

6. **Interview questions**
   - How do you export multiple items from a module?  
   - What is `esModuleInterop` for?

---

## Section 15: Decorators

### 15.1 Overview

1. **Definition**  
   Decorators are **annotations** (currently a stage proposal) that allow you to modify classes, methods, accessors, properties, or parameters.

2. **Why it is needed**  
   - Provide metadata and cross-cutting behavior (e.g., Angular’s `@Component`, `@Injectable`).

3. **Syntax (legacy/Angular style)**

```ts
function LogClass(constructor: Function) {
  console.log('Class decorated:', constructor.name);
}

@LogClass
class Example {}
```

4. **Internal behavior**
   - Compiled into JS calls that wrap/modify the target.  
   - Angular uses decorators heavily to attach metadata read by its runtime.

5. **Angular example**

```ts
@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html'
})
export class UserCardComponent {}
```

6. **Best practices**
   - Use decorators primarily within frameworks that support them (e.g., Angular).  
   - Avoid building custom decorator-heavy frameworks without understanding the proposal status.

7. **Common mistakes**
   - Assuming decorator metadata exists at runtime in all environments.  
   - Relying on experimental decorator semantics across TypeScript versions.

8. **Enterprise use cases**
   - Angular components, services, DI tokens.  
   - ORMs and validation frameworks using decorators (e.g., TypeORM, class-validator).

9. **Interview questions**
   - How does Angular use decorators?  
   - What are the trade-offs of using decorators in TypeScript?

---

## Section 16: TypeScript with Async Programming

### 16.1 Promises and `async/await`

1. **Definition**  
   Promises represent asynchronous operations; `async/await` provides a synchronous-looking syntax for them.

2. **Why it is needed**  
   - Readable, composable async code; error handling with `try/catch`.

3. **Syntax**

```ts
function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then(res => res.json());
}

async function showUser(id: string) {
  try {
    const user = await fetchUser(id);
    console.log(user.name);
  } catch (err) {
    console.error('Failed to load user', err);
  }
}
```

4. **Internal behavior**
   - `async` functions always return a Promise.  
   - `await` pauses execution until the Promise settles.

5. **Best practices**
   - Type async functions as `Promise<T>` with explicit `T`.  
   - Avoid `async` in performance-critical tight loops; prefer batching.

6. **Common mistakes**
   - Forgetting to `await` calls, leading to unhandled rejections.  
   - Not using `Promise.all` where parallelism is possible.

7. **Enterprise use cases**
   - Backend services calling multiple microservices in parallel.  
   - Frontend apps orchestrating multiple API calls.

8. **Interview questions**
   - How do `async`/`await` work under the hood?  
   - When would you use `Promise.all` vs `Promise.race`?

---

## Section 17: TypeScript with Node.js

### 17.1 Backend Development

1. **Definition**  
   Using TypeScript to build Node.js backends (REST APIs, microservices, workers).

2. **Example: Express API**

```ts
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

interface CreateUserBody {
  name: string;
  email: string;
}

app.post('/users', (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  const { name, email } = req.body;
  // ... create user
  res.status(201).json({ id: '1', name, email });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

3. **Best practices**
   - Use separate layers: controllers, services, repositories.  
   - Share DTO types between frontend and backend via a shared library.

4. **Common mistakes**
   - Using `any` in route handlers.  
   - Not validating request bodies (types do not validate at runtime).

5. **Enterprise use cases**
   - Typed microservices, BFFs (Backend-for-Frontend), GraphQL servers.

6. **Interview questions**
   - How do you use TypeScript with Node.js in production (build vs runtime)?  
   - How do you handle runtime validation of typed DTOs?

---

## Section 18: TypeScript with Angular

### 18.1 Integration

1. **Definition**  
   Angular is built on TypeScript and uses its features extensively: decorators, interfaces, generics.

2. **Key TypeScript features in Angular**
   - **Decorators**: `@Component`, `@Injectable`, `@Input`, `@Output`.  
   - **Generics**: `HttpClient<T>`, `Observable<T>`, forms.  
   - **Access modifiers**: `private`/`public` constructor parameters for DI.  
   - **Enums and union types**: statuses, modes, etc.

3. **Example**

```ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

4. **Best practices**
   - Strongly type component inputs/outputs.  
   - Use TypeScript to model Angular route data and state.

5. **Interview questions**
   - How does Angular leverage TypeScript’s type system?  
   - Why is TypeScript important for Angular templates and DI?

---

## Section 19: TypeScript Design Patterns

### 19.1 Singleton

```ts
class ConfigService {
  private static instance: ConfigService;

  private constructor(private readonly config: Record<string, string>) {}

  static getInstance() {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService({ env: 'prod' });
    }
    return ConfigService.instance;
  }
}
```

### 19.2 Factory

```ts
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message);
  }
}

class FileLogger implements Logger {
  log(message: string) {
    // write to file
  }
}

function createLogger(type: 'console' | 'file'): Logger {
  if (type === 'console') return new ConsoleLogger();
  return new FileLogger();
}
```

### 19.3 Observer

```ts
type Listener<T> = (value: T) => void;

class ObservableValue<T> {
  private listeners: Listener<T>[] = [];

  constructor(private _value: T) {}

  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
  }

  set value(v: T) {
    this._value = v;
    this.listeners.forEach(l => l(v));
  }
}
```

### 19.4 Strategy

```ts
interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardStrategy implements PaymentStrategy {
  pay(amount: number) {/* ... */}
}

class PaypalStrategy implements PaymentStrategy {
  pay(amount: number) {/* ... */}
}

class PaymentContext {
  constructor(private strategy: PaymentStrategy) {}
  execute(amount: number) {
    this.strategy.pay(amount);
  }
}
```

**Enterprise use**
- Encapsulate business rules (Strategy).  
- Pluggable implementations (Factory + DI).  
- Event systems and state management (Observer).

---

## Section 20: TypeScript Performance and Best Practices

### 20.1 Strict Typing, Immutability, Maintainability

1. **Strict typing**
   - Enables **confident refactoring** and fewer production bugs.

2. **Immutability**
   - Prefer immutable data structures; avoid deep mutations.  
   - Use `readonly` and helpers like `as const`.

3. **Maintainability**
   - Clear boundaries, layers, and typed contracts.

4. **Enterprise coding practices**
   - Shared ESLint + Prettier configs.  
   - Strict `tsconfig` across all repositories.  
   - Code reviews enforcing type-driven design.

5. **Performance considerations**
   - TypeScript itself has no runtime overhead, but advanced types can slow builds.  
   - Avoid extremely complex conditional types on hot paths.

---

## Section 21: TypeScript Project Architecture

### 21.1 Large Project Structures

**Frontend (Angular/React)**

```text
src/
  app/
    core/
    shared/
    features/
    state/
  typ
