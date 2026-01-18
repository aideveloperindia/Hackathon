# Test Questions for JITS Coding Platform

This document contains sample coding questions with correct answers for testing the platform.

---

## Test Question 1: Python - Sum of Two Numbers

### Question Details:
**Title:** Sum of Two Numbers
**Language:** Python
**Description:** 
Write a Python program that takes two integers as input and prints their sum.

**Sample Input:**
```
5
10
```

**Sample Output:**
```
15
```

### Correct Answer (Output):
```
15
```

### Test Cases:
1. **Input:** `5\n10` → **Expected Output:** `15` (Score: 10)
2. **Input:** `-5\n10` → **Expected Output:** `5` (Score: 10)
3. **Input:** `0\n0` → **Expected Output:** `0` (Score: 10)
4. **Input:** `100\n200` → **Expected Output:** `300` (Score: 10)

### Sample Solution Code:
```python
a = int(input())
b = int(input())
print(a + b)
```

---

## Test Question 2: Python - Find Maximum Number

### Question Details:
**Title:** Find Maximum Number
**Language:** Python
**Description:**
Write a Python program that takes three integers as input and prints the maximum among them.

**Sample Input:**
```
5
10
3
```

**Sample Output:**
```
10
```

### Correct Answer (Output):
```
10
```

### Test Cases:
1. **Input:** `5\n10\n3` → **Expected Output:** `10` (Score: 10)
2. **Input:** `1\n2\n3` → **Expected Output:** `3` (Score: 10)
3. **Input:** `-5\n-2\n-10` → **Expected Output:** `-2` (Score: 10)
4. **Input:** `100\n100\n100` → **Expected Output:** `100` (Score: 10)

### Sample Solution Code:
```python
a = int(input())
b = int(input())
c = int(input())
print(max(a, b, c))
```

---

## Test Question 3: Python - Check Even or Odd

### Question Details:
**Title:** Check Even or Odd
**Language:** Python
**Description:**
Write a Python program that takes an integer as input and prints "Even" if the number is even, otherwise prints "Odd".

**Sample Input:**
```
5
```

**Sample Output:**
```
Odd
```

### Correct Answer (Output):
```
Odd
```

### Test Cases:
1. **Input:** `5` → **Expected Output:** `Odd` (Score: 10)
2. **Input:** `4` → **Expected Output:** `Even` (Score: 10)
3. **Input:** `0` → **Expected Output:** `Even` (Score: 10)
4. **Input:** `-3` → **Expected Output:** `Odd` (Score: 10)

### Sample Solution Code:
```python
n = int(input())
if n % 2 == 0:
    print("Even")
else:
    print("Odd")
```

---

## Test Question 4: Python - Factorial

### Question Details:
**Title:** Calculate Factorial
**Language:** Python
**Description:**
Write a Python program that takes a positive integer n as input and prints the factorial of n.

**Sample Input:**
```
5
```

**Sample Output:**
```
120
```

### Correct Answer (Output):
```
120
```

### Test Cases:
1. **Input:** `5` → **Expected Output:** `120` (Score: 10)
2. **Input:** `3` → **Expected Output:** `6` (Score: 10)
3. **Input:** `1` → **Expected Output:** `1` (Score: 10)
4. **Input:** `7` → **Expected Output:** `5040` (Score: 10)

### Sample Solution Code:
```python
n = int(input())
fact = 1
for i in range(1, n + 1):
    fact *= i
print(fact)
```

---

## Test Question 5: Python - Reverse a String

### Question Details:
**Title:** Reverse a String
**Language:** Python
**Description:**
Write a Python program that takes a string as input and prints the reversed string.

**Sample Input:**
```
hello
```

**Sample Output:**
```
olleh
```

### Correct Answer (Output):
```
olleh
```

### Test Cases:
1. **Input:** `hello` → **Expected Output:** `olleh` (Score: 10)
2. **Input:** `world` → **Expected Output:** `dlrow` (Score: 10)
3. **Input:** `a` → **Expected Output:** `a` (Score: 10)
4. **Input:** `12345` → **Expected Output:** `54321` (Score: 10)

### Sample Solution Code:
```python
s = input()
print(s[::-1])
```

---

## Test Question 6: C - Sum of Array Elements

### Question Details:
**Title:** Sum of Array Elements
**Language:** C
**Description:**
Write a C program that reads n integers, stores them in an array, and prints the sum of all elements.

**Sample Input:**
```
5
1 2 3 4 5
```

**Sample Output:**
```
15
```

### Correct Answer (Output):
```
15
```

### Test Cases:
1. **Input:** `5\n1 2 3 4 5` → **Expected Output:** `15` (Score: 10)
2. **Input:** `3\n10 20 30` → **Expected Output:** `60` (Score: 10)
3. **Input:** `1\n100` → **Expected Output:** `100` (Score: 10)
4. **Input:** `4\n-1 2 -3 4` → **Expected Output:** `2` (Score: 10)

### Sample Solution Code:
```c
#include <stdio.h>
int main() {
    int n, sum = 0;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
        sum += arr[i];
    }
    printf("%d\n", sum);
    return 0;
}
```

---

## Test Question 7: Java - Check Prime Number

### Question Details:
**Title:** Check Prime Number
**Language:** Java
**Description:**
Write a Java program that takes an integer as input and prints "Prime" if it's a prime number, otherwise prints "Not Prime".

**Sample Input:**
```
7
```

**Sample Output:**
```
Prime
```

### Correct Answer (Output):
```
Prime
```

### Test Cases:
1. **Input:** `7` → **Expected Output:** `Prime` (Score: 10)
2. **Input:** `4` → **Expected Output:** `Not Prime` (Score: 10)
3. **Input:** `2` → **Expected Output:** `Prime` (Score: 10)
4. **Input:** `1` → **Expected Output:** `Not Prime` (Score: 10)

### Sample Solution Code:
```java
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean isPrime = true;
        if (n <= 1) {
            isPrime = false;
        } else {
            for (int i = 2; i * i <= n; i++) {
                if (n % i == 0) {
                    isPrime = false;
                    break;
                }
            }
        }
        System.out.println(isPrime ? "Prime" : "Not Prime");
    }
}
```

---

## Testing Instructions

### Step 1: Create Event
1. Login as Admin
2. Go to "Conduct Event"
3. Fill in:
   - **Title:** Python Test Event
   - **Language:** Python
   - **Description:** Testing Python questions
   - **Max Participants:** 120
4. Click "Create Event"

### Step 2: Add Questions
1. After creating event, you'll see the questions form
2. For each question above:
   - Enter **Title**
   - Enter **Description**
   - Enter **Sample Input** (optional)
   - Enter **Sample Output** (optional)
   - Enter **Correct Answer/Output** (IMPORTANT - this is what locks the answer)
   - Add **Test Cases**:
     - Input: `5\n10`
     - Expected Output: `15`
     - Score: `10`
     - Click "Add Test Case"
   - Click "Add Question to Event"

### Step 3: Start Event
1. After adding all questions, click "Start Event"
2. Event status changes to ACTIVE

### Step 4: Test as Student
1. Login/Register as Student
2. Join the event
3. Select a question
4. Write code in the editor
5. Click "Run Code" to test (optional)
6. Click "Submit Code"
7. If your output matches the **Correct Answer**, you'll see:
   - "🎉 Perfect! Your answer matches the correct solution and is now LOCKED!"
   - Timer stops
   - Answer is locked

### Step 5: Check Leaderboard
1. Go to Leaderboard
2. Participants with locked answers (matching correct answer) are ranked by fastest time
3. Fastest correct submission gets first rank

---

## Quick Test Scenario

### Simple Test (Recommended for First Test):

**Question:** Sum of Two Numbers
- **Language:** Python
- **Correct Answer:** `15`
- **Test Case:** Input: `5\n10`, Output: `15`, Score: `10`

**Student Code to Test:**
```python
a = int(input())
b = int(input())
print(a + b)
```

**Expected Behavior:**
1. Student submits code
2. Code executes with input `5\n10`
3. Output is `15`
4. Matches correct answer → Answer LOCKED
5. Timer stops
6. Student sees "LOCKED" message
7. Leaderboard shows student ranked by time

---

## Important Notes

1. **Correct Answer Format:**
   - Enter ONLY the output (no extra spaces, newlines)
   - Example: For output `15`, enter exactly `15`
   - The system normalizes output (trims whitespace)

2. **Test Cases:**
   - Test cases are secondary validation
   - Primary check is against "Correct Answer"
   - If correct answer matches, answer is locked regardless of test cases

3. **Answer Locking:**
   - Only happens when output EXACTLY matches admin's correct answer
   - Timer stops when answer is locked
   - Locked answers are used for leaderboard ranking

4. **Leaderboard Ranking:**
   - Participants with locked answers ranked by fastest time
   - Fastest correct submission = First rank
   - Others ranked by score, then time

---

## Troubleshooting

**Issue:** Answer not locking
- **Solution:** Check that output exactly matches correct answer (no extra spaces/newlines)

**Issue:** Timer not stopping
- **Solution:** Ensure verdict is ACCEPTED and matchesCorrectAnswer is true

**Issue:** Leaderboard not ranking correctly
- **Solution:** Check that submissions have `matchesCorrectAnswer: true` in executionResult

---

## Additional Test Questions

### Question 8: Python - Fibonacci Series (First N Terms)
**Input:** `5`
**Output:** `0 1 1 2 3`
**Correct Answer:** `0 1 1 2 3`

### Question 9: Python - Count Vowels
**Input:** `hello`
**Output:** `2`
**Correct Answer:** `2`

### Question 10: Python - Palindrome Check
**Input:** `madam`
**Output:** `Yes`
**Correct Answer:** `Yes`

---

**Good luck with testing! 🚀**
