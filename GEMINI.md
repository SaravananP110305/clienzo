# GEMINI.md

# Clienzo - Global Agent Rules

Version: 1.0

These rules are mandatory for every task, feature, component, screen, API, and database object.

If any future prompt conflicts with these rules, follow this document unless the prompt explicitly instructs otherwise.

---

# Project Overview

Project Name

Clienzo

Project Type

Lead Management & Appointment Management System for IT Companies.

Purpose

Help Business Development teams manage leads from collection to meeting scheduling.

This project is intended for business users.

The application must remain simple, clean, and easy to use.

---

# Technology Stack

Frontend

- React
- Vite
- JSX
- React Router DOM
- Tailwind CSS
- React Hook Form
- React Icons
- Axios

Backend

- Node.js
- Express.js

Database

- PostgreSQL

ORM

- Prisma

Authentication

- JWT

Do not use TypeScript.

Do not introduce new frameworks unless explicitly requested.

---

# Development Phases

Phase 1

Frontend only.

No backend.

No database.

No API implementation.

Only UI.

Phase 2

Backend only.

No frontend redesign.

Phase 3

Database only.

---

# Existing Project

The project already contains

- Admin Template
- Layout
- Sidebar
- Header
- Footer
- Common Components
- Theme
- Tailwind Configuration

Never recreate these.

Always extend the existing project.

---

# Analyze Before Coding

Before writing any code

1. Analyze the existing project.
2. Understand the folder structure.
3. Identify reusable components.
4. Reuse existing code whenever possible.
5. Extend existing files instead of replacing them.

Never assume a component does not exist.

Search first.

Reuse first.

Create only if necessary.

---

# Component Rules

Always reuse existing

- Button
- Input
- Select
- Modal
- Card
- Table
- Pagination
- Search
- Filter
- Badge
- Loader
- Empty State
- Breadcrumb
- Sidebar
- Header

Never duplicate components.

If a reusable component already exists,

use it.

---

# Layout Rules

Always use the existing

Sidebar

Header

Content Area

Footer

Breadcrumb

Do not redesign layouts.

---

# UI Design Rules

Font

Poppins

Use sentence case only.

Never use uppercase headings.

Never use tracking classes.

Never use decorative typography.

No hero sections.

No marketing UI.

No welcome banners.

No promotional cards.

Enterprise dashboard only.

---

# Theme

Use existing CSS variables.

Do not introduce a new color system.

Primary

--primary-color

Secondary

--secondary-color

Always follow the existing theme.

---

# Page Rules

Every page should contain

Page Title

Primary Action Button (if required)

Search

Filter

Table or Content

Pagination

Nothing else.

Do not generate

Descriptions

Marketing text

Helper paragraphs

Dashboard quotes

---

# Cards

Cards should display only

Label

Value

Optional Icon

No supporting text.

No descriptions.

---

# Tables

All tables must support

Search

Filter

Sorting

Pagination

Rows Per Page

Sticky Header

Hover State

Action Column

No table descriptions.

---

# Forms

Desktop

2 Columns

Mobile

1 Column

Labels above fields.

Required fields

Validation below field.

Buttons

Cancel

Save

Reuse existing form controls.

---

# Modals

Use modals only for

Delete

Confirmation

Small Forms

Large forms must use pages.

---

# Search

Search should always appear above the table.

Placeholder

Search...

---

# Filters

Keep filters simple.

Dropdowns only.

Avoid advanced filters.

---

# Icons

React Icons only.

Only use icons where useful.

No decorative icons.

---

# Spacing

Use compact enterprise spacing.

Avoid

Large margins

Large paddings

Empty white space

Oversized containers

---

# Responsiveness

Desktop

Tablet

Mobile

Must support all.

Desktop first.

---

# Accessibility

Use proper labels.

Keyboard navigation.

Focus states.

Semantic HTML.

---

# Folder Structure

Follow the existing project structure.

Never reorganize folders.

Never rename existing files.

Never move files.

Only add new files when required.

---

# Naming Convention

Components

PascalCase

Pages

PascalCase

Hooks

camelCase

Functions

camelCase

Variables

camelCase

Constants

UPPER_CASE

---

# Code Style

Use Functional Components.

Use Hooks.

Avoid class components.

Keep components small.

Avoid duplicated code.

Extract reusable logic.

Meaningful names.

Clean imports.

Consistent formatting.

---

# State Management

Use the project's existing state management.

Do not introduce Redux, Zustand, MobX, or Context unless already used or explicitly requested.

---

# API Rules

Frontend Phase

No API implementation.

Only create service placeholders if requested.

Do not fake APIs.

Do not create mock servers.

---

# Database Rules

Only in Phase 3.

Do not generate schemas during frontend tasks.

---

# Feature Scope

Build only the requested feature.

Do not generate future modules.

Do not anticipate upcoming requirements.

No speculative development.

---

# Performance

Avoid unnecessary renders.

Reuse components.

Lazy load pages when appropriate.

Avoid large component files.

---

# Security

Never hardcode

Passwords

Secrets

API Keys

Tokens

---

# Comments

Avoid unnecessary comments.

Only explain complex business logic.

---

# Quality Checklist

Before completing a task verify

✓ Existing components reused

✓ Existing layout preserved

✓ Existing theme preserved

✓ Responsive

✓ Accessible

✓ Clean JSX

✓ No duplicated code

✓ No unnecessary files

✓ No future features

✓ Matches project coding style

---

# Agent Behavior

Always

Analyze first.

Reuse first.

Extend first.

Never redesign the project.

Never replace existing architecture.

Never generate code outside the requested scope.

When uncertain,

prefer modifying existing code over creating new code.

The final output must look like it was built by the original developers of the project.