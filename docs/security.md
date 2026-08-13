# Security & Compliance - IntelliAvatar

This document logs security implementations and safeguards configured on the IntelliAvatar conversational digital-human platform.

---

## 1. Authentication & Session Secrets

* **Bcrypt Password Hashing**:
  * Direct salt generation and comparison using python `bcrypt` module. Bypasses buggy passlib context setups.
* **JWT Access Keys**:
  * High-entropy signatures hashed via HS256 using `python-jose`. Expire after 60 minutes.
* **Header Authorization**:
  * Decoded bearer authorization tokens are validated at the API router layer using FastAPI dependencies.

---

## 2. SQL Injection & Schema Safety

* **SQLAlchemy ORM**:
  * Translates python class structures to secure database queries.
  * Auto-sanitizes string parameters and variables, completely preventing SQL injection exploits.
* **SQLite/Postgres Migrations**:
  * Dialect-neutral schemas utilize UUID primary keys, foreign key cascading delete constraints, and unique indices.

---

## 3. Data Scopes & Organization Isolation

* **Tenant Segregation**:
  * Every database record is referenced by an `organization_id`.
  * Middleware layers enforce that active users can only list, update, query, or delete records scoped to their registered workspace.
* **Private Conversations Audit**:
  * Admins cannot view private message dialogues unless explicitly granted permissions by organizational policies.

---

## 4. File Upload Safeguards

* **Magic-Number Headers Verification**:
  * Rejects files based on MIME-type metadata headers, ensuring only valid image (PNG/JPEG) and document (PDF, TXT, DOCX, PPTX) types are processed.
* **Storage Isolation**:
  * Files are stored under random UUID names inside dedicated directories (`uploads/avatars/`, `uploads/documents/`) situated outside executable file trees. Prevents execution attacks or traversal attempts.
