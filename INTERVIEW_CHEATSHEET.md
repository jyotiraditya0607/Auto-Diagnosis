## LWC + Apex Interview Cheat Sheet

### LWC Data Access
- **@wire + cacheable**: Use `@AuraEnabled(cacheable=true)` Apex for read-only wires; platform caches per params.
- **Refresh wired data**: Change reactive params or call `refreshApex(wiredResult)`.
- **LDS vs Apex**: LDS (`getRecord`, `updateRecord`) for simple record CRUD with CRUD/FLS/sharing. Apex for complex queries/DTOs/multi-entity logic.

### Imperative vs @wire
- **@wire**: Declarative, lifecycle-aware, cached, auto-refresh on param change; read-only.
- **Imperative**: Call-on-demand, supports mutations and sequencing with try/catch; ideal for buttons/modals.

### LDS Field Access
- Use `getFieldValue(record, FIELD)` and guard `data` before access; avoid null dereferences.

### Navigation
- `standard__recordPage`: view/edit record.
- `standard__objectPage`: create new record.
- `standard__webPage`: navigate to URL.
- Record Type on New: state `{ recordTypeId, nooverride: '1' }`.

### UX Patterns
- **Toasts**: Dispatch `ShowToastEvent({ title, message, variant })` via a helper.
- **Loading/Error**: Track `isLoading` and `error`; use `lightning-spinner`; disable actions while loading.
- **Formatting**: Use `Intl.DateTimeFormat` and `Intl.NumberFormat` for dates/currency.

### Derived UI
- Map picklist/status to classes; getters return arrays of steps with `isCompleted/isCurrent`.

### Apex Service Design
- **with sharing**: Enforces sharing; default for user-facing data.
- **@AuraEnabled(cacheable=true)**: Read-only; deterministic; no DML/side-effects.
- **SOQL**: Select only needed fields; use relationship fields (e.g., `Contact.Name`); observe FLS.
- **Errors**: Throw `AuraHandledException` with user-safe messages.

### DTOs
- Return wrapper classes shaped for UI (e.g., `current`, `all`) to cut round trips; balance size vs calls.

### Security
- Enforce CRUD/FLS using `Schema.sObjectType` checks and `Security.stripInaccessible` before returning data.
- Guest users: restrict fields, validate inputs, enforce sharing/CRUD/FLS; favor cacheable read methods.

### Experience Cloud Auth
- `Site.login(username, password, startUrl)` returns `PageReference`; redirect to respect `startUrl`.
- `Auth.AuthConfiguration` drives UI toggles (username/password, self-reg, URLs) per community.

### Triggers
- One trigger per object; bulkify; no SOQL/DML in loops; use handler; recursion guards; solid tests.

### Knowledge
- Query articles with `PublishStatus='Online'` and locale; order by `LastPublishedDate`; respect visibility.

### Performance
- Cacheable wires, DTOs, pagination, indexed filters, limited fields; debounce inputs; avoid large text fields where not needed.

### Testing
- `seeAllData=false`; create data; assert DTO shape/order; cover happy/error paths; validate sharing/CRUD/FLS handling; verify trigger effects.

### Manual Refresh (Imperative)
- Toggle `isLoading`, call Apex again, update state, show toast; use `refreshApex` only for wired data.


