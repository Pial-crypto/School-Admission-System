# Assumptions

## 1. Class Naming
- Class names must follow `Class {Number} – {Shift} Shift`.
- Supported shifts: Morning, Day, Evening.
- Class numbers must be positive integers.
- Class names are case-insensitive.
- Duplicate class names are not allowed, regardless of capitalization.

## 2. Student Admission Rules
- A student can have only one active `HELD` reservation across all classes.
- A student can have only one `CONFIRMED` admission across the entire system.
- A student cannot reserve another class while an active hold exists.
- After a hold expires or is cancelled, the student can reserve another class.
- After confirmation, the student cannot reserve another class.

## 3. Hold Duration
- Default hold duration is 300 seconds (5 minutes).
- Hold duration is configurable.
- Expired and cancelled holds release their seats.
- Only active holds can be confirmed.

## 4. Confirmation
- Students confirm their own reservations.
- Successful confirmation changes the status to `CONFIRMED`.
- Repeated confirmation of the same hold must not consume additional seats.
- No separate admin approval or payment gateway is assumed.

## 5. Concurrency and Multiple Backend Processes (Bonus)
- Multiple backend instances may run on different ports while sharing one PostgreSQL database.
- PostgreSQL transactions and row-level locking protect seat allocation.
- Seat availability checking and hold creation happen within the protected transaction.
- In-memory locks are not used because they cannot coordinate separate backend processes.
- The combined number of `HELD` and `CONFIRMED` reservations must never exceed `totalSeats`.