# Programming Language Concepts — Hunt-Hub Backend

> Oral assessment presentation | TypeScript / Node.js project

---


## 1 — Static / Dynamic Typing

> TypeScript is statically typed. It compiles to JavaScript, which is dynamically typed. The types exist only at compile time — they are erased in the output.

### The static/dynamic boundary in action

📄 [`backend/src/utils/logError.ts`](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/utils/logError.ts)

```ts
export function logError(prefix: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? (err.stack ?? '') : '';
  console.error(prefix, msg, stack);
}
```

`err` is typed as `unknown` — with `strict: true`, TypeScript will not let you access `err.message` at compile time without first narrowing the type. The compiler enforces this.

`instanceof Error` is a **runtime check** — because types are erased in the compiled output, the only way to know what `err` actually is at runtime is to ask JavaScript directly.

After the check, TypeScript narrows the type: inside `err instanceof Error ? ...` the compiler now knows `err` is an `Error` and permits `.message` and `.stack`.

This is the static/dynamic boundary in one function: the static type system forces you to acknowledge uncertainty → you resolve it with a runtime check → dynamic JavaScript tells you the truth.

### Type erasure — before and after compilation

📄 [`backend/src/utils/logError.ts`](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/utils/logError.ts) vs [`backend/dist/src/utils/logError.js`](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/dist/src/utils/logError.js)

```ts
// TypeScript — compile time
export function logError(prefix: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? (err.stack ?? '') : '';
  console.error(prefix, msg, stack);
}
```

```js
// JavaScript — runtime
function logError(prefix, err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? ((_a = err.stack) !== null && _a !== void 0 ? _a : '') : '';
    console.error(prefix, msg, stack);
}
```

Two things happen in compilation:
- `: string`, `: unknown`, `: void` — all type annotations are gone
- `err.stack ?? ''` becomes `(_a = err.stack) !== null && _a !== void 0 ? _a : ''` — the compiler generates the runtime null check

One thing survives: **`instanceof Error`**. It is a runtime check, not a type annotation, so it is never erased. This makes the point precisely — TypeScript types disappear, JavaScript runtime checks do not.

**Key point:** TypeScript types are a compile-time safety net. At runtime you are back to dynamic JavaScript.

---

## 2 — Type Inference

> Type inference means the compiler deduces types automatically — you don't write them manually.

📄 [`backend/src/schemas/index.ts` lines 3–6](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/schemas/index.ts#L3-L6)

```ts
export const loginSchema = z.object({
  email:    z.email(),
  password: z.string().min(1),
});
```

TypeScript infers the type `{ email: string, password: string }` automatically from the Zod schema definition. You never write that type manually.

The same schema also validates data at runtime — one source of truth for both compile-time types and runtime checks.

**Key point:** Change the schema → the inferred type updates everywhere automatically. Nothing can get out of sync.

---

## 3 — Classes and Objects

> A class is a blueprint that defines state (fields) and behaviour (methods). An object is a concrete instance created from that blueprint with `new`.

📄 [`backend/src/utils/geofile-parsers.ts` lines 9–12 and 47–53](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/utils/geofile-parsers.ts#L9-L53)

```ts
// Class definition — the blueprint
export class ParseError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

// Class definition with a method
export class GeoJsonParser extends GeoFileParser {
  override async parse(buf: Buffer): Promise<string> {
    const content = buf.toString('utf-8');
    JSON.parse(content);
    return this.toGeometryCollection(content);
  }
}

// Object instantiation — creating a concrete instance from the blueprint
const parser = new GeoJsonParser();
await parser.parse(buf);
```

- `ParseError` is a class with a field (`status`) and a constructor that calls the parent via `super()`
- `GeoJsonParser` is a class with a method (`parse`) that defines behaviour
- `new GeoJsonParser()` creates an **object** — a concrete instance with its own copy of the method
- The class is the blueprint; the object is the thing that actually exists at runtime

**Key point:** TypeScript uses class-based syntax but compiles to JavaScript's prototype chains. Classes are syntactic sugar over prototype-based inheritance at the runtime level.

---

## 4 — Inheritance

> Inheritance lets a subclass reuse and extend the definition of a parent — the child gets everything the parent has and can override or add to it.

📄 [`backend/src/utils/geofile-parsers.ts` lines 9–90](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/utils/geofile-parsers.ts#L9-L90)

```ts
// Abstract parent — defines the contract, cannot be instantiated directly
export abstract class GeoFileParser {
  abstract parse(buf: Buffer): Promise<string>;

  protected toGeometryCollection(geojson: string): string {
    return toGeometryCollection(geojson);
  }
}

// Concrete subclasses — each inherits the contract and the helper method
export class GeoJsonParser extends GeoFileParser {
  override async parse(buf: Buffer): Promise<string> { ... }
}
export class KmlParser extends GeoFileParser {
  override async parse(buf: Buffer): Promise<string> { ... }
}
// + GpxParser, ShapefileParser, GeoPackageParser

// Inheriting from a built-in class
export class ParseError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
```

- `abstract class GeoFileParser` defines a contract — subclasses **must** implement `parse()` or the compiler rejects them
- `protected toGeometryCollection()` is a concrete method inherited by all subclasses for free
- The `override` keyword is a safety net — if the parent method is renamed or removed, the compiler flags it
- `ParseError extends Error` shows single inheritance from a built-in class

**Single vs multiple inheritance:** TypeScript allows a class to `extend` only one parent — this avoids the **diamond problem** (ambiguity when two parents share a common ancestor). You can `implement` multiple interfaces, but inherit from only one class.

**Key point:** Interface inheritance shares a contract only. Class inheritance shares both a contract and a concrete implementation.

---

## 5 — Polymorphism, Dynamic Dispatch & Late Binding

> One interface, many implementations. The runtime decides which one runs. This is subtype polymorphism — the most common OOP form.

📄 [`backend/src/utils/geofile-parsers.ts` lines 136–143](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/utils/geofile-parsers.ts#L136-L143)

```ts
export function createParser(filename: string): GeoFileParser {
  if (filename.endsWith('.geojson')) return new GeoJsonParser();
  if (filename.endsWith('.kml'))     return new KmlParser();
  if (filename.endsWith('.gpx'))     return new GpxParser();
  if (filename.endsWith('.zip'))     return new ShapefileParser();
  if (filename.endsWith('.gpkg'))    return new GeoPackageParser();
  throw new ParseError(400, 'Unsupported file type.');
}
```

The caller receives a `GeoFileParser` — the abstract type. It never imports the concrete subclass.

```ts
const parser = createParser(filename);
await parser.parse(buf); // which parse() runs? decided at runtime
```

- **Polymorphism:** one interface (`GeoFileParser`), five implementations — this is **subtype polymorphism**
- **Dynamic dispatch:** the runtime walks the prototype chain of the actual object and calls the right `parse()`
- **Late binding:** the link between the call site and the method code is resolved at runtime, not compile time

**Three kinds of polymorphism:**
- **Subtype** (shown here): a subclass can stand in for its parent type
- **Parametric** (generics): `Promise<string>`, `Record<string, number>` — the same code works for any type. Drizzle's query builder is full of this
- **Ad-hoc** (overloading): same function name, different parameter types — less common in TypeScript

**Key point:** Adding a new file format requires one new class and one new line in the factory. No callers change. That extensibility is only possible because of subtype polymorphism.

---

## 6 — Pure Functions & Referential Transparency

> A pure function always produces the same output for the same input and has no side effects.

📄 [`backend/src/utils/geofile-parsers.ts` lines 15–37](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/utils/geofile-parsers.ts#L15-L37)

```ts
export function toGeometryCollection(geojson: string): string {
  const parsed = JSON.parse(geojson);
  if (parsed.type === 'FeatureCollection') {
    return JSON.stringify({
      type: 'GeometryCollection',
      geometries: parsed.features.map((f: any) => f.geometry).filter(Boolean),
    });
  }
  // ...
}
```

- Same input string → always same output string
- No database calls, no file writes, no global state read or modified
- **Referentially transparent:** `toGeometryCollection(x)` can be replaced with its return value and the program behaves identically

**On `JSON.parse` and bad input:** `JSON.parse` throws on malformed input — but the exception is deterministic. The same bad input always throws the same error. A deterministic exception preserves referential transparency; impurity requires hidden state or side effects on the outside world. The function is still pure.

### Contrast — impure function

📄 [`backend/src/services/audit.ts` lines 49–60](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/services/audit.ts#L49-L60)

```ts
export async function audit({ userId, event, ip, metadata }: AuditOptions) {
  await db.insert(auditLogsTable).values({ userId, event, ip, metadata });
}
```

`audit()` writes to the database on every call — the same inputs change the world state each time. It is **not** pure.

**Key point:** Pure functions have no hidden dependencies and are trivial to test — pass an input, check the output, no mocking required.

---

## 7 — Anonymous Functions & Lambda Expressions

> A lambda is a function with no name, defined inline and passed as a value. Functions are first-class values in JavaScript/TypeScript.

📄 [`backend/src/controllers/manager/estate.ts` lines 32–37](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/controllers/manager/estate.ts#L32-L37)

```ts
const people = allPeople.sort((a, b) => {
  const roleOrder: Record<string, number> = { manager: 0, staff: 1, admin: 2, guest: 3 };
  const roleDiff = (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9);
  if (roleDiff !== 0) return roleDiff;
  return a.lastName.localeCompare(b.lastName);
});
```

`(a, b) => { ... }` is an anonymous function — no name, defined inline, passed directly to `.sort()` as an argument.

It contains real business logic: sort managers before staff, then alphabetically by last name within a role.

**Key point:** Functions are first-class values in JavaScript — they can be passed as arguments just like numbers or strings. Anonymous does not mean simple — a lambda can be as complex as any named function.

---

## 8 — Higher-Order Functions (map, filter, reduce)

> A higher-order function takes one or more functions as arguments, or returns a function.

📄 [`backend/src/controllers/manager/events.ts` lines 18–26](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/controllers/manager/events.ts#L18-L26)

```ts
const upcomingEvents = allEvents
  .filter(e => new Date(e.date) >= now)
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

const pastEvents = allEvents
  .filter(e => new Date(e.date) < now)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
```

- **`filter`** takes a predicate function and returns only elements where it returns `true`
- **`sort`** takes a comparator function and reorders elements by it
- Both are chained — the output of `filter` feeds into `sort`
- The original `allEvents` array is never modified

**`reduce`** — not used here directly, but the most general HOF: it folds a list into a single accumulated value. Both `map` and `filter` can be expressed as a `reduce`.

Example from the domain:
```ts
invitations.reduce((count, inv) => inv.response === 'yes' ? count + 1 : count, 0)
```

**Key point:** Higher-order functions abstract over behaviour, not just data. They let you build pipelines that transform data without loops or mutation.

---

## 9 — Where PL Concepts Made a Critical Architectural Difference

> Level 2: identifying points where the choice of concept had a measurable consequence on the architecture or technology.

---

### Point 1 — Polymorphism → zero-touch extensibility

📄 [`backend/src/utils/geofile-parsers.ts` lines 136–143](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/utils/geofile-parsers.ts#L136-L143)

**Without polymorphism:** every file upload handler would contain its own `if/else` chain for each format — duplicated across the codebase.

**With polymorphism:** every caller does one thing: `parser.parse(buf)`. Adding a new format means one new class and one new line in the factory. No existing code changes.

The architectural consequence: the system is **open for extension, closed for modification** — directly enabled by the abstract class + subtype polymorphism choice.

---

### Point 2 — Type inference → validation and types can never drift

📄 [`backend/src/schemas/index.ts` lines 3–6](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/schemas/index.ts#L3-L6)

**Without type inference:** you maintain two separate things — a runtime validation function and a compile-time type declaration. As the codebase evolves they inevitably drift apart.

**With type inference:** `loginSchema` is simultaneously the runtime validator and the compile-time type. There is one object to change. Drift is structurally impossible.

The architectural consequence: an entire class of bugs — where validated data doesn't match the declared type — is eliminated by the language feature itself.

---

### Point 3 — Pure functions → safe worker thread isolation

📄 [`backend/src/utils/geofile-parsers.ts` lines 15–37](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/utils/geofile-parsers.ts#L15-L37) and [`backend/src/workers/geofile.worker.ts`](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/workers/geofile.worker.ts)

```ts
// geofile.worker.ts — runs in a separate thread with its own V8 isolate
const parser = createParser(filename);
const geometryCollection = await parser.parse(buf);
parentPort!.postMessage({ ok: true, geometryCollection });
```

Geo-file parsing is CPU-heavy. It runs in a **worker thread** — Node's `worker_threads` gives each worker its own V8 isolate so heap memory is not shared by default.

**What purity adds on top of that:** the parser logic has no module-level shared state — no caches, no connection pools, no mutable singletons. You can move the code into a worker without auditing the entire module for hidden shared state. Purity makes the logic safe to isolate, not just the runtime.

The architectural consequence: the performance decision (worker thread) was only viable without risk because of the functional concept (pure functions). The two choices depend on each other.

---

### Point 4 — tRPC + type inference → self-synchronising API contract

📄 [`backend/src/trpc/trpc.ts`](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/trpc/trpc.ts)

tRPC uses TypeScript's structural typing and inference to share the full API contract between server and client at compile time — input types, output types, and error shapes are all inferred automatically from the procedure definitions.

**Without this:** you need a separate documentation step, a code generation pipeline (like protobuf/gRPC), or a manually maintained client SDK. These can all drift from the real API.

**With this:** if a procedure's input or output type changes on the server, the client gets a compile-time error immediately. No generation step, no schema drift.

The architectural consequence: an entire layer of tooling (API documentation, SDK generation, contract testing) becomes unnecessary because the language feature enforces the contract structurally. This is only possible because of TypeScript's structural typing and inference — in a nominally typed language like Java you would need a separate code generation step to achieve the same guarantee.

---

### Point 5 — Module augmentation → type safety across library boundaries

📄 [`backend/src/types/express.d.ts` lines 15–24](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/types/express.d.ts#L15-L24)

```ts
declare module 'express-session' {
  interface SessionData {
    user?:                SessionUser;
    csrfToken?:           string;
    pendingAdminId?:      number;
    pendingTotpSecret?:   string;
  }
}
```

`SessionData` is defined inside a third-party library. Without augmentation, `req.session.user` would be typed as `any` — every access unchecked, every typo a silent runtime bug.

**Declaration merging** is not classical OOP inheritance — it is TypeScript's additive type extension mechanism. The merged interface has the union of all declared members from all declarations. The library is never forked or wrapped.

The architectural consequence: type safety extends across library boundaries without modifying or wrapping the library. Custom session fields are fully typed everywhere in the codebase.

---

### Point 6 — Drizzle generics → type-safe queries without code generation

📄 [`backend/src/db/schema/users.ts`](https://github.com/carl-castell/hunt-hub_backend/blob/main/backend/src/db/schema/users.ts)

```ts
const users = await db
  .select({ id: usersTable.id, role: usersTable.role })
  .from(usersTable);
// inferred type: { id: number; role: 'admin' | 'manager' | 'staff' | 'guest' }[]
```

The result type is never declared — it is computed by the type system from the selection object. Change the selected columns and the result type changes automatically.

This works through two TypeScript features working together: **parametric polymorphism** (`select<T>` is generic over the selection shape) and **type-level computation** (Drizzle uses conditional and mapped types to extract each column's inner type and rebuild the result row at compile time).

**Without these features:** a type-safe database layer requires one of three options — stringly-typed queries with manual casting (unsafe), an ORM with fixed row classes (rigid, no partial selections), or a code generation step like Prisma that produces typed query functions from a schema file (extra build step, can drift from the real schema).

**With these features:** the type system itself does the work the code generator would otherwise do. Partial selections are first-class — you get exactly the columns you asked for, typed exactly as they appear in the database, with zero generated code to maintain.

The architectural consequence: an entire tooling category — schema-to-code generation — is eliminated because the language's type system is expressive enough to perform the same derivation at compile time.

**This point, Point 2 (Zod), and Point 4 (tRPC) are all the same family of language features** — type inference + structural typing + generics. One cluster of TypeScript features eliminated three separate architectural problems that other languages solve with separate tooling, build steps, or code generation pipelines.

---

*Presentation prepared for oral assessment — Concepts of Programming Languages*
