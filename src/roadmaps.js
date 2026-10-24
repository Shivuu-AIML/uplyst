const catalogs = {
  java: {
    skill: "Java",
    icon: "☕",
    color: "orange",
    title: "Your Java foundations",
    quests: [
      {
        id: "java-first-output",
        title: "Make your first output",
        objective: "See how Java speaks to the screen.",
        duration: "3 min",
        task: 'System.out.println("Hello World");',
        question: "What does this statement do?",
        options: [
          "Prints “Hello World” to the screen",
          "Creates a new Java file",
          "Asks the user to type their name",
        ],
        answer: 0,
        explanation:
          "println writes the text inside the parentheses to the console, then moves to a new line. You just read your first Java statement.",
      },
      {
        id: "java-variables",
        title: "Give information a name",
        objective: "Use a variable to hold a piece of information.",
        duration: "5 min",
        task: 'String name = "Maya";',
        question: "What is the variable name in this line?",
        options: ["String", "name", '"Maya"'],
        answer: 1,
        explanation:
          "name is the variable identifier. String tells Java its type, and “Maya” is the value it holds.",
      },
      {
        id: "java-decisions",
        title: "Let your code decide",
        objective: "Recognize how a condition guides a program.",
        duration: "6 min",
        task: "if (score > 10) { ... }",
        question: "When does the code inside this if block run?",
        options: ["Every time, no matter the score", "When score is greater than 10", "Only when score is zero"],
        answer: 1,
        explanation: "An if block runs when its condition is true. Here, that means score must be greater than 10.",
      },
      {
        id: "java-methods",
        title: "Bundle a reusable action",
        objective: "Understand the role of a method.",
        duration: "7 min",
        task: "sayHello();",
        question: "What is sayHello() most likely doing?",
        options: ["Calling a method named sayHello", "Declaring a number", "Ending the program"],
        answer: 0,
        explanation: "Parentheses after a method name are a call: they ask Java to run that reusable block of code.",
      },
      {
        id: "java-first-loop",
        title: "Repeat a small action",
        objective: "See how a loop saves you from repeating the same line.",
        duration: "6 min",
        task: "for (int i = 1; i <= 3; i++) { ... }",
        question: "How many times does this loop run?",
        options: ["Once", "Three times", "It never stops"],
        answer: 1,
        explanation: "The counter starts at 1 and continues through 3, so the loop body runs three times.",
      },
    ],
  },
  react: {
    skill: "React",
    icon: "⚛",
    color: "blue",
    title: "Your React foundations",
    quests: [
      {
        id: "react-components",
        title: "Meet your first component",
        objective: "See how a component becomes part of a page.",
        duration: "3 min",
        task: "function Welcome() { return <h1>Hello!</h1>; }",
        question: "What does the Welcome function return?",
        options: ["A heading that says Hello!", "A database connection", "A CSS file"],
        answer: 0,
        explanation: "A React component returns UI. This one returns a heading, which React can render on the page.",
      },
      {
        id: "react-jsx",
        title: "Read the shape of JSX",
        objective: "Connect familiar HTML-like tags to React UI.",
        duration: "5 min",
        task: "<button>Start</button>",
        question: "What does this JSX describe?",
        options: ["A button labeled Start", "A JavaScript loop", "A request to a server"],
        answer: 0,
        explanation: "JSX lets you describe UI with HTML-like tags. This snippet describes a button with the label Start.",
      },
      {
        id: "react-props",
        title: "Pass a component a prop",
        objective: "Understand how components receive information.",
        duration: "6 min",
        task: "<Greeting name='Sam' />",
        question: "What is name here?",
        options: ["A prop passed into Greeting", "A component file", "An event listener"],
        answer: 0,
        explanation: "name is a prop: information passed into a component so it can render something personal.",
      },
      {
        id: "react-state",
        title: "Keep track of changing UI",
        objective: "Recognize why a component uses state.",
        duration: "7 min",
        task: "const [count, setCount] = useState(0);",
        question: "What is count?",
        options: ["A value React can keep track of", "The component's CSS class", "A URL"],
        answer: 0,
        explanation: "State is a value React remembers between renders. Updating it can refresh the UI that depends on it.",
      },
      {
        id: "react-expressions",
        title: "Show a value in your UI",
        objective: "Connect JavaScript values to the UI you render.",
        duration: "6 min",
        task: "<p>{message}</p>",
        question: "What do the curly braces do in this JSX?",
        options: ["Insert the JavaScript value of message", "Create a new HTML tag", "Hide the paragraph"],
        answer: 0,
        explanation: "Curly braces let JSX read a JavaScript expression. Here, the paragraph displays the value of message.",
      },
    ],
  },
  design: {
    skill: "UI/UX design",
    icon: "✳",
    color: "pink",
    title: "Your design foundations",
    quests: [
      {
        id: "design-observe",
        title: "Notice the moment that matters",
        objective: "Start with a real person and a real need.",
        duration: "3 min",
        task: "A new user opens your app for the first time.",
        question: "What is the most useful first design question?",
        options: ["What are they trying to accomplish?", "Which gradient looks coolest?", "How many screens can we add?"],
        answer: 0,
        explanation: "Good design begins with the person. Understanding what they came to do helps every later decision.",
      },
      {
        id: "design-hierarchy",
        title: "Guide the eye",
        objective: "Use visual hierarchy to make a next step clear.",
        duration: "5 min",
        task: "One page. One primary action. A clear visual cue.",
        question: "What does visual hierarchy help someone do?",
        options: ["Notice what matters first", "Read every element at once", "Memorize the color palette"],
        answer: 0,
        explanation: "Hierarchy uses size, contrast, and placement to make the most important content easiest to find.",
      },
      {
        id: "design-wireframe",
        title: "Sketch before you polish",
        objective: "Explore an idea without getting stuck on details.",
        duration: "6 min",
        task: "Draw three boxes: heading, content, action.",
        question: "Why start with a simple wireframe?",
        options: ["To explore layout before visual polish", "To choose production-ready colors", "To skip talking to users"],
        answer: 0,
        explanation: "A wireframe makes structure easy to change before color and detail make a design feel finished.",
      },
      {
        id: "design-feedback",
        title: "Make feedback useful",
        objective: "Turn an observation into a next design step.",
        duration: "7 min",
        task: "“I wasn't sure what to tap next.”",
        question: "What is a useful response to this feedback?",
        options: ["Clarify the next action's label and prominence", "Explain why the design is correct", "Add more decoration"],
        answer: 0,
        explanation: "The feedback points to a moment of uncertainty. Make the next action clearer, then see if that helps.",
      },
      {
        id: "design-accessibility",
        title: "Make a control easier to use",
        objective: "Notice a simple way to make an interface more inclusive.",
        duration: "6 min",
        task: "A form field has a visible label and clear focus state.",
        question: "Why make keyboard focus visible?",
        options: ["So keyboard users can see where they are", "So the page uses more color", "So buttons can be smaller"],
        answer: 0,
        explanation: "A visible focus indicator helps people who navigate with a keyboard understand which control is active.",
      },
    ],
  },
  speaking: {
    skill: "Public speaking",
    icon: "◉",
    color: "green",
    title: "Your speaking foundations",
    quests: [
      {
        id: "speaking-opening",
        title: "Open with one clear idea",
        objective: "Give listeners a simple reason to lean in.",
        duration: "3 min",
        task: "“Today, I'll show you one small way to make mornings easier.”",
        question: "What makes this a strong opening?",
        options: ["It gives the audience a clear promise", "It starts with an unrelated fact", "It lists every slide"],
        answer: 0,
        explanation: "A clear promise sets expectations and helps listeners understand why the talk matters to them.",
      },
      {
        id: "speaking-pause",
        title: "Let a pause do its work",
        objective: "Use silence to make an idea easier to follow.",
        duration: "5 min",
        task: "Say one sentence. Pause. Then share the next idea.",
        question: "What can a deliberate pause do?",
        options: ["Give listeners a moment to absorb an idea", "Make every point sound uncertain", "Replace the need for a clear message"],
        answer: 0,
        explanation: "A short pause gives people time to process and gives your next point room to land.",
      },
      {
        id: "speaking-structure",
        title: "Shape a short story",
        objective: "Make your point easy to remember.",
        duration: "6 min",
        task: "Situation → choice → result",
        question: "Which order gives a short story a clear arc?",
        options: ["Situation, choice, result", "Result, result, result", "Details with no connection"],
        answer: 0,
        explanation: "A situation gives context, a choice creates movement, and the result shows why it mattered.",
      },
      {
        id: "speaking-practice",
        title: "Practice one friendly rep",
        objective: "Build confidence with a small, repeatable rehearsal.",
        duration: "7 min",
        task: "Explain one idea aloud in 20 seconds.",
        question: "What is the goal of a short first rehearsal?",
        options: ["Practice one clear idea without needing perfection", "Memorize a full speech immediately", "Avoid noticing what could improve"],
        answer: 0,
        explanation: "Small practice reps make it easier to improve one thing at a time without waiting to feel perfect.",
      },
      {
        id: "speaking-reflect",
        title: "Choose one thing to improve",
        objective: "Turn a practice run into a useful next step.",
        duration: "6 min",
        task: "After your short talk, write down one thing that felt clear.",
        question: "What makes reflection after practice useful?",
        options: ["It helps you choose one focused next improvement", "It proves you should never feel nervous", "It means you need to rewrite everything"],
        answer: 0,
        explanation: "Noticing one clear strength and one next step makes practice specific, encouraging, and repeatable.",
      },
    ],
  },
};

export const goals = Object.entries(catalogs).map(([id, item]) => ({
  id,
  skill: item.skill,
  icon: item.icon,
  color: item.color,
}));

export function createRoadmap(skill, level, personalGoal = "") {
  const catalog = catalogs[skill] ?? catalogs.java;
  const goalNote = personalGoal.trim();
  return {
    skill,
    level,
    title: catalog.title,
    personalGoal: goalNote,
    quests: catalog.quests.map((quest) => ({
      ...quest,
      objective: level === "intermediate" ? `Build on what you know: ${quest.objective}` : quest.objective,
    })),
  };
}

export function validateRoadmap(value) {
  return Boolean(
    value &&
      typeof value.skill === "string" &&
      typeof value.level === "string" &&
      typeof value.title === "string" &&
      Array.isArray(value.quests) &&
      value.quests.length >= 4 &&
      value.quests.length <= 6 &&
      value.quests.every(
        (quest) =>
          typeof quest.id === "string" &&
          typeof quest.title === "string" &&
          typeof quest.objective === "string" &&
          typeof quest.duration === "string" &&
          typeof quest.task === "string" &&
          typeof quest.question === "string" &&
          Array.isArray(quest.options) &&
          quest.options.length >= 2 &&
          Number.isInteger(quest.answer) &&
          quest.answer >= 0 &&
          quest.answer < quest.options.length &&
          typeof quest.explanation === "string",
      ),
  );
}
