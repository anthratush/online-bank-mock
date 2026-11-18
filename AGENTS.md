## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Styling**: TailwindCSS
- **Add-ons**: prettier, eslint, tailwindcss, sveltekit-adapter, ai-tools

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Project Logic

## Data Flow

### `localStorage` Structure

- **User Account**: `user.account` (e.g., `firstName`, `lastName`, `pinCode`).
- **Currencies**: `user.currencies` (e.g., `id`, `name`, `symbol`, `cardNumber`, `cardCVV`, `cardExpDate`).
- **Transactions**: `user.transactions` (e.g., `uid`, `name`, `date`, `amount`, `currency`).

Storage JSON structure
Key: user
Value:

```
{
  "account": Ref "Account",
  "currencies": Array<Ref "Currency">
  "isAuth": boolean, Whether the user is logged in.
  "transactions": Array<Ref "Transactions">
}
```

Currency

```
{
  "id": string, eg. "usd"
  "name": string, eg. "US Dollar"
  "symbol": string, eg. "$"
  "cardBalance": number, eg. 100
  "cardNumber": string, eg. "4441122411791091"
  "cardCVV": string, eg. "549"
  "cardExpDate": string, eg. "09/35"
}
```

Account

```
{
  "firstName": string, eg. "First Name",
  "lastName": string, eg. "Last Name",
  "pinCode": string, eg. "1111",
  "email": string,
  "country": Ref "Country"
}
```

Country

```
{
  "id": "US",
  "name": "United States"
}
```

Transaction

```
{
  "uid": string, eg. "txn_001"
  "name": string, eg. "Grab",
  "date": string, eg. "2023-11-01",
  "amount": float, eg. 15.75,
  "currency": string, eg. "usd" !Must be one of the user's currencies.
}
```

### Mocks

- **New User Setup**: `src/lib/mocks/new_user_setup.json` initializes `localStorage` with default currencies and transactions.
- **Static Data**:
  - Countries: `src/lib/mocks/countries.json`.
  - Currencies: `src/lib/mocks/currencies.json`.

## UI/UX Rules

## Styles

- Use TailwindCSS for all the styling. Fallback to CSS only when the task can't be achieved with TailwindCSS classes.

### Authentication

- **Sign-Up**: `/admin/create-user` (saves `pinCode` to `localStorage`).
- **Sign-In**: Validates `pinCode` against `localStorage:user.account.pinCode`. Redirects to sign-up if missing.

### Admin Panel

- **Access**: 5-second touch-hold on the user account icon.
- **Routes**:
  - `/admin/edit-account`: Edit user details (first name, last name, country, phone, email).
  - `/admin/add-transaction`: Add transactions (amount, currency, date).
  - `/admin/add-currency`: Add currencies from `src/lib/mocks/currencies.json`.
  - `/admin/add-currency`: Add currencies from `src/lib/mocks/currencies.json`.
  - `/admin/edit-currency`: Edit existing currencies. "cardBalance" is the only editable field.
  - `/admin/edit-transaction`: Edit existing transactions.

### Display Rules

- **Currencies**: Horizontally scrollable

## Code Style

- Always use TypeScript

## TODO Management

- After a task from `TODO.md` is completed and confirmed, mark it as done by changing `- [ ]` to `- [x]` in `TODO.md`.

## Session Specs

- Read `.agents/specs/SPEC_*.md` at the start of a session for key learnings from previous sessions (data model decisions, Svelte 5 patterns, page conventions, validation workflow).
- After a session with notable learnings, write them to `.agents/specs/SPEC_[YYYY-MM-DD].md`.
