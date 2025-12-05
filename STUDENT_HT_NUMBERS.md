# Student Hall Ticket Numbers

## Active HT Number Ranges

### CSM Branch (60 students)

**Range: 22271A6600 to 22271A6660**

- **Year 1:** 22271A6600 to 22271A6614 (15 students)
- **Year 2:** 22271A6615 to 22271A6629 (15 students)
- **Year 3:** 22271A6630 to 22271A6644 (15 students)
- **Year 4:** 22271A6645 to 22271A6660 (15 students)

### CSE Branch (127 students)

**Range 1: 22271A0500 to 22271A0599** (100 students)
- Standard numeric sequence

**Range 2: 22271A05A1 to 22271A05A9** (9 students)
- Pattern: 22271A05A1, 22271A05A2, ..., 22271A05A9

**Range 3: 22271A05B1 to 22271A05B9** (9 students)
- Pattern: 22271A05B1, 22271A05B2, ..., 22271A05B9

**Range 4: 22271A05C1 to 22271A05C9** (9 students)
- Pattern: 22271A05C1, 22271A05C2, ..., 22271A05C9

## Total Students: 187

### Distribution

**By Branch:**
- **CSM** (Computer Science and Mathematics): 60 students
- **CSE** (Computer Science Engineering): 127 students

**By Section:**
- **Section A**
- **Section B**
- **Section C**

## How Students Register

1. Go to registration page: http://localhost:3001/student/register
2. Enter HT Number (e.g., `22271A6600`)
3. Enter matching details:
   - Name (as stored in master_students)
   - Branch (CSE, ECE, IT, EEE, or MECH)
   - Section (A, B, or C)
   - Year (1, 2, 3, or 4)
4. Provide email and password
5. Verify email
6. Login with HT Number and password

## Example Registration

**HT Number:** 22271A6600
- Name: (Check database for exact name)
- Branch: CSE
- Section: A
- Year: 1

## Adding More Ranges

When you provide additional HT number ranges, they will be added to the seed file and database. The system supports multiple ranges simultaneously.

## Notes

- Each HT Number can only be used once for registration
- Students must provide exact matching details (name, branch, section, year)
- Email verification is required before login
- All HT numbers are case-sensitive

