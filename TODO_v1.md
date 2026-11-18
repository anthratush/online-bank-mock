# TODO.md

## Project Overview

### Tech Requirements

#### SPA

- [x] Implement Svelte SPA using "Single-page apps" documentation.

#### Storage

- [x] Set up Web API localStorage for transactions, balance, and currencies.
- [x] Mock card number, CVV, and end date.

#### PWA Functionality

- [x] Implement caching for JS and HTML files.

#### Authentication

- [x] Create sign-up page at `/admin/create-user` with pin-code field and save button.
- [x] Implement pin-code storage in localStorage.
- [x] Create sign-in page with pin-code validation.
- [x] Add "sign-up" link-button for new users.

#### New User

- [x] Initialize localStorage with mocks from `src/lib/mocks/new_user_setup.json`.

#### Admin Panel

- [x] Make admin panel accessible with 5-second touch-hold on user account icon.
- [x] Implement Edit Account page at `/admin/edit-account`.
- [x] Implement Add Transaction page at `/admin/add-transaction`.
- [x] Implement Add Currency page at `/admin/add-currency`.
- [x] Implement Edit Currency page at `/admin/edit-currency`.
- [x] Implement Edit Transaction page at `/admin/edit-transaction`.

#### Functionality and Rules

- [ ] Populate localStorage with mock transactions when a new currency is added.
- [x] Add field `type: "debit" | "credit"` to Transaction type.
- [x] Update logic: debit = income, credit = expense

### UI Requirements

#### Top Bar Navigation

- [x] Implement user icon that opens `/account` page with account info from localStorage.

#### Currencies Display (1/3 of the UI)

- [x] Display currencies from localStorage.
- [x] Style currencies as "physical cards".
- [x] Implement card flip functionality.
- [x] Show card number, CVV, and end date on flipped card.
- [x] Implement horizontal scrolling for multiple currencies.

#### Transactions Display (2/3 of the UI)

- [x] Display transactions from localStorage.
- [x] Show transaction name, date, and amount.
- [x] On click "All" open a view with a list of all transactions.
  - [x] Top left there is a Close button with cross icon.
  - [x] Transactions grouped by days.
