# AI Usage Disclosure

## 1. AI Tool Used
- ChatGPT (OpenAI)

## 2. Areas Where AI Assistance Was Used
- Backend architecture and ASP.NET Core Web API implementation.
- Entity Framework Core and PostgreSQL integration.
- API controllers, DTOs, and service-layer logic.
- Hold expiration, confirmation, and cancellation logic.
- Database migrations and concurrency handling.
- React frontend components and API integration.
- Automated test implementation and debugging.
- Documentation and troubleshooting.

## 3. AI-Generated Mistakes and Corrections

AI-generated code was manually reviewed and several issues were identified:

### 3.1 Incomplete API Response
- AI initially removed seat-count properties from `ClassResponse`.
- The class creation response also omitted required response fields.
- The DTO and API response were reviewed against the API requirements and corrected.

### 3.2 Case-Insensitive Class Name Validation
- AI initially failed to properly enforce case-insensitive duplicate class-name validation.
- The issue was identified during manual review.
- Case-insensitive uniqueness was addressed using normalized name comparison and a database-level unique index.

### 3.3 Class Name Format Validation
- AI initially did not fully implement the required class naming format.
- The validation was identified as missing during requirement-based review and subsequently addressed.

### 3.4 Unnecessary Response Fields
- AI included additional timestamps such as `createdAt` and `confirmedAt` in a hold response.
- These fields were reviewed against the required API response contract and were not necessary.

### 3.5 Database Configuration and Migration Issues
- AI-assisted database setup encountered connection and migration issues.
- One backend instance attempted to connect to a database that was not running.
- Another database instance did not contain the required `Classes` table.
- The database connection and migration setup were investigated and corrected during testing.

### 3.6 Hold Duration Inconsistency
- AI initially suggested a 600-second default hold duration.
- The project assumption was 300 seconds.
- The configuration and documentation were reviewed to maintain consistency.

## 4. Manual Review and Verification
- Reviewed generated code against the assignment requirements.
- Manually inspected API request and response structures.
- Ran automated backend and frontend tests.
- Verified concurrent hold requests using two independent backend processes sharing one PostgreSQL database.
- Verified that 10 concurrent requests resulted in 3 successful reservations and 7 conflict responses for a class with 3 seats.

## 5. Responsibility
AI was used as an assistance tool, not as a replacement for development and decision-making. Generated code was reviewed, tested, debugged, and adjusted during implementation.