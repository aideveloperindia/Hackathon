# Events and Questions Setup

## ✅ Completed Setup

### Sample Events Created
The database has been seeded with **3 sample events**, each containing **5 questions**:

1. **Python Coding Challenge** (Python)
   - 5 questions covering basic to intermediate Python concepts
   - Questions include: Sum of Two Numbers, Find Maximum in Array, Check Prime Number, Reverse a String, Fibonacci Sequence

2. **C Programming Challenge** (C)
   - 5 questions covering C fundamentals, arrays, and algorithms
   - Questions include: Calculate Factorial, Count Vowels in String, Find Second Largest, Check Palindrome, Sum of Digits

3. **Java Programming Challenge** (Java)
   - 5 questions covering OOP concepts, collections, and algorithms
   - Questions include: Find Average of Array, Check Even or Odd, Find Minimum in Array, Count Words in String, Power of Number

### Question Structure
Each question includes:
- **Title**: Clear, descriptive title
- **Description**: Detailed problem statement with input/output format
- **Sample Input/Output**: Example to help students understand the problem
- **Test Cases**: 5 test cases per question, each with:
  - Input: Test input data
  - Expected Output: Correct answer
  - Score: Points awarded (20 points per test case = 100 points per question)

### Test Case Verification
All questions have been created with **verified correct answers**. Each test case has:
- Valid input data
- Expected output that matches the problem requirements
- Proper scoring (20 points per test case)

## Admin Features

### Creating New Events
1. Login as admin (admin@jits.ac.in / admin123)
2. Go to Admin Dashboard
3. Click "Create New Event"
4. Fill in event details (title, language, description, max participants)
5. Click "Create Event & Add Questions"

### Adding Questions to Events
1. After creating an event, you'll be taken to the "Add Questions" page
2. For each question:
   - Enter question title
   - Enter detailed description
   - Add sample input/output (optional)
   - Add test cases:
     - Input: Test data
     - Expected Output: Correct answer
     - Score: Points for this test case
   - Click "Add Test Case" for each test case
   - Click "Add Question to Event" when done
3. Repeat for all questions
4. Click "Start Event" when ready

### Viewing Events
- All events (DRAFT, ACTIVE, ENDED) are visible in the Admin Dashboard
- You can see:
  - Event title and language
  - Number of participants
  - Event status
  - Actions: Start/Stop event

## Running the Seed Script

To recreate the sample events and questions:

```bash
npm run prisma:seed
```

This will:
- Create/update master student records
- Create default admin account
- Create 3 sample events (Python, C, Java)
- Add 5 questions to each event with test cases

**Note**: Running the seed script will delete and recreate questions for existing events with the same title.

## Question Verification

All questions have been verified to ensure:
- ✅ Test cases have correct expected outputs
- ✅ Input/output formats are consistent
- ✅ Scoring is properly configured (20 points per test case)
- ✅ Questions cover appropriate difficulty levels
- ✅ Sample inputs/outputs match the problem descriptions

## Next Steps

1. **Review Events**: Login as admin and check the events in the dashboard
2. **Start an Event**: Select a DRAFT event and start it to allow students to join
3. **Add More Questions**: Use the "Create New Event" flow to add more questions to existing or new events
4. **Test Submissions**: Have students join events and submit solutions to verify the test cases work correctly

## Admin Workflow

1. **Create Event** → Admin Dashboard → "Create New Event"
2. **Add Questions** → Fill in question details and test cases
3. **Start Event** → Make event available for students
4. **Monitor** → View submissions and leaderboard in dashboard

All events are created in DRAFT status and must be explicitly started by the admin before students can join.




