/*Q2. Predict the output

Output: safe

Simple Explanation:
Let's break down the condition with num = 12:

    num%3 === 0 becomes 12 % 3 === 0 which is true.

    (num+1 == 15) becomes 13 == 15 which is false.

    (num-1 == 11) becomes 11 == 11 which is true.
*/
let num = 12;
if (num % 3 === 0 && (num + 1 == 15 || num - 1 == 11)) {
  console.log("safe");
} else {
  console.log("Unsafe");
}
