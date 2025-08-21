## Introduction
This is a simple, responsive web development quiz built using HTML, CSS, and JavaScript. It presents multiple-choice questions, gives immediate feedback after each selection, and shows the final score at the end. The project demonstrates dynamic DOM manipulation, event handling, and responsive design principles.

## Reflection
Building this quiz taught me how to combine HTML, CSS, and JavaScript to make an interactive project. I learned how to store questions in arrays of objects, create DOM elements from that data, and use event listeners for user interactions. Adding immediate feedback helped me understand conditional logic and how to change styles with class names.

## Live Demo
You can try the quiz online here: [**Click to Open Quiz**](https://quiz-application-omega-dun.vercel.app/)

## Problems Faced
### Challenge 1: Making the Progress Bar Work Correctly
**Problem:** I needed the progress bar to accurately show how far the user was in the quiz, but it kept hitting 100% early.
**Solution:** The logic that worked best was to update the bar's width each time a new question appeared. I calculated the percentage based on how many questions had been completed so far. Then, to give a "finish" effect, I used a setTimeout() function to let the progress bar reach 100% before the result screen appeared.

### Challenge 2: Checking for the Correct Answer
**Problem:** When a user clicked a button, I needed a simple and reliable way for the JavaScript to know if that specific button was the correct choice.  
**Solution:** I used HTML `data-` attributes. When the buttons were created in JavaScript, I added a special attribute, `data-correct="true"`, only to the button with the right answer. This made it easy to check: when a button was clicked, the code just had to look for that attribute to confirm if it was the correct one.

### Challenge 3: Displaying the Correct Answer After a Wrong Choice
**Problem:** I wanted the quiz to show the correct answer whenever the user picked the wrong one.  
**Solution:** I used class changes to mark the selected wrong button in red, then found the correct button and displayed its text in the feedback message. This way, the user could immediately see both their mistake and the correct answer.

### Challenge 4: Learning to Use the "Hide" Class for Screen Switching
**Problem:** I needed a simple way to switch between the start screen, quiz screen, and score screen without removing elements from the DOM.  
**Solution:** I created a reusable `.hide` CSS class that sets `display: none;`. By adding or removing this class in JavaScript, I could show or hide any section instantly. This made it easy to control which part of the quiz was visible and kept the HTML structure compact.
