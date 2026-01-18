# Quick Guide: Creating Test Events from TEST_QUESTIONS.md

## Languages Available:
- **Python**: 8 questions (Questions 1-5, 8-10)
- **C**: 1 question (Question 6)
- **Java**: 1 question (Question 7)

---

## Event 1: Python Test Event

### Event Details:
- **Title:** Python Coding Challenge
- **Language:** Python
- **Description:** Test your Python programming skills
- **Max Participants:** 120

### Questions to Add:

#### Question 1: Sum of Two Numbers
- **Title:** Sum of Two Numbers
- **Description:** Write a Python program that takes two integers as input and prints their sum.
- **Sample Input:** `5\n10`
- **Sample Output:** `15`
- **Correct Answer:** `15`
- **Test Cases:**
  1. Input: `5\n10` → Output: `15` (Score: 10)
  2. Input: `-5\n10` → Output: `5` (Score: 10)
  3. Input: `0\n0` → Output: `0` (Score: 10)
  4. Input: `100\n200` → Output: `300` (Score: 10)

#### Question 2: Find Maximum Number
- **Title:** Find Maximum Number
- **Description:** Write a Python program that takes three integers as input and prints the maximum among them.
- **Sample Input:** `5\n10\n3`
- **Sample Output:** `10`
- **Correct Answer:** `10`
- **Test Cases:**
  1. Input: `5\n10\n3` → Output: `10` (Score: 10)
  2. Input: `1\n2\n3` → Output: `3` (Score: 10)
  3. Input: `-5\n-2\n-10` → Output: `-2` (Score: 10)
  4. Input: `100\n100\n100` → Output: `100` (Score: 10)

#### Question 3: Check Even or Odd
- **Title:** Check Even or Odd
- **Description:** Write a Python program that takes an integer as input and prints "Even" if the number is even, otherwise prints "Odd".
- **Sample Input:** `5`
- **Sample Output:** `Odd`
- **Correct Answer:** `Odd`
- **Test Cases:**
  1. Input: `5` → Output: `Odd` (Score: 10)
  2. Input: `4` → Output: `Even` (Score: 10)
  3. Input: `0` → Output: `Even` (Score: 10)
  4. Input: `-3` → Output: `Odd` (Score: 10)

#### Question 4: Calculate Factorial
- **Title:** Calculate Factorial
- **Description:** Write a Python program that takes a positive integer n as input and prints the factorial of n.
- **Sample Input:** `5`
- **Sample Output:** `120`
- **Correct Answer:** `120`
- **Test Cases:**
  1. Input: `5` → Output: `120` (Score: 10)
  2. Input: `3` → Output: `6` (Score: 10)
  3. Input: `1` → Output: `1` (Score: 10)
  4. Input: `7` → Output: `5040` (Score: 10)

#### Question 5: Reverse a String
- **Title:** Reverse a String
- **Description:** Write a Python program that takes a string as input and prints the reversed string.
- **Sample Input:** `hello`
- **Sample Output:** `olleh`
- **Correct Answer:** `olleh`
- **Test Cases:**
  1. Input: `hello` → Output: `olleh` (Score: 10)
  2. Input: `world` → Output: `dlrow` (Score: 10)
  3. Input: `a` → Output: `a` (Score: 10)
  4. Input: `12345` → Output: `54321` (Score: 10)

---

## Event 2: C Programming Challenge

### Event Details:
- **Title:** C Programming Challenge
- **Language:** C
- **Description:** Test your C programming skills
- **Max Participants:** 120

### Questions to Add:

#### Question 1: Sum of Array Elements
- **Title:** Sum of Array Elements
- **Description:** Write a C program that reads n integers, stores them in an array, and prints the sum of all elements.
- **Sample Input:** `5\n1 2 3 4 5`
- **Sample Output:** `15`
- **Correct Answer:** `15`
- **Test Cases:**
  1. Input: `5\n1 2 3 4 5` → Output: `15` (Score: 10)
  2. Input: `3\n10 20 30` → Output: `60` (Score: 10)
  3. Input: `1\n100` → Output: `100` (Score: 10)
  4. Input: `4\n-1 2 -3 4` → Output: `2` (Score: 10)

---

## Event 3: Java Programming Challenge

### Event Details:
- **Title:** Java Programming Challenge
- **Language:** Java
- **Description:** Test your Java programming skills
- **Max Participants:** 120

### Questions to Add:

#### Question 1: Check Prime Number
- **Title:** Check Prime Number
- **Description:** Write a Java program that takes an integer as input and prints "Prime" if it's a prime number, otherwise prints "Not Prime".
- **Sample Input:** `7`
- **Sample Output:** `Prime`
- **Correct Answer:** `Prime`
- **Test Cases:**
  1. Input: `7` → Output: `Prime` (Score: 10)
  2. Input: `4` → Output: `Not Prime` (Score: 10)
  3. Input: `2` → Output: `Prime` (Score: 10)
  4. Input: `1` → Output: `Not Prime` (Score: 10)

---

## Step-by-Step Instructions:

### For Python Event:

1. **Login as Admin**
2. **Click "Conduct Event"**
3. **Create Event:**
   - Title: `Python Coding Challenge`
   - Language: `Python`
   - Description: `Test your Python programming skills`
   - Max Participants: `120`
   - Click "Create Event"

4. **Add Question 1:**
   - Title: `Sum of Two Numbers`
   - Description: `Write a Python program that takes two integers as input and prints their sum.`
   - Sample Input: `5\n10`
   - Sample Output: `15`
   - **Correct Answer:** `15` ⚠️ IMPORTANT
   - Test Cases:
     - Click "Add Test Case"
     - Input: `5\n10`
     - Expected Output: `15`
     - Score: `10`
     - Click "Add Test Case" again for each test case
   - Click "Add Question to Event"

5. **Repeat for Questions 2-5** (use details above)

6. **Click "Start Event"**

### For C Event:

1. Create event with Language: `C`
2. Add Question 1 (Sum of Array Elements) using details above
3. Start event

### For Java Event:

1. Create event with Language: `Java`
2. Add Question 1 (Check Prime Number) using details above
3. Start event

---

## Quick Copy-Paste Format for Admin Panel:

### Python Question 1 (Sum of Two Numbers):
```
Title: Sum of Two Numbers
Description: Write a Python program that takes two integers as input and prints their sum.
Sample Input: 5
10
Sample Output: 15
Correct Answer: 15
```

### Python Question 2 (Find Maximum):
```
Title: Find Maximum Number
Description: Write a Python program that takes three integers as input and prints the maximum among them.
Sample Input: 5
10
3
Sample Output: 10
Correct Answer: 10
```

### Python Question 3 (Even/Odd):
```
Title: Check Even or Odd
Description: Write a Python program that takes an integer as input and prints "Even" if the number is even, otherwise prints "Odd".
Sample Input: 5
Sample Output: Odd
Correct Answer: Odd
```

### Python Question 4 (Factorial):
```
Title: Calculate Factorial
Description: Write a Python program that takes a positive integer n as input and prints the factorial of n.
Sample Input: 5
Sample Output: 120
Correct Answer: 120
```

### Python Question 5 (Reverse String):
```
Title: Reverse a String
Description: Write a Python program that takes a string as input and prints the reversed string.
Sample Input: hello
Sample Output: olleh
Correct Answer: olleh
```

---

## Testing as Student:

After creating events, test with these solutions:

### Python - Sum of Two Numbers:
```python
a = int(input())
b = int(input())
print(a + b)
```

### Python - Find Maximum:
```python
a = int(input())
b = int(input())
c = int(input())
print(max(a, b, c))
```

### Python - Even/Odd:
```python
n = int(input())
if n % 2 == 0:
    print("Even")
else:
    print("Odd")
```

### Python - Factorial:
```python
n = int(input())
fact = 1
for i in range(1, n + 1):
    fact *= i
print(fact)
```

### Python - Reverse String:
```python
s = input()
print(s[::-1])
```

### C - Sum of Array:
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

### Java - Prime Check:
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

**Note:** Make sure to enter the **Correct Answer** exactly as shown (no extra spaces or newlines) for answer locking to work!
