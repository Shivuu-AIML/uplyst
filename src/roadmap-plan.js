const categoryDefinitions = [
  { id: "college", name: "College subject", description: "Prepare for a class, syllabus, or exam." },
  { id: "career", name: "Career skill", description: "Build skills for a role or next career step." },
  { id: "company", name: "Company preparation", description: "Practice for a target company's role." },
  { id: "certification", name: "Certification", description: "Prepare for a professional certification exam." },
];

const levelNames = {
  beginner: "New to this",
  intermediate: "I know the basics",
  advanced: "Building on experience",
};

const defaultTemplates = {
  college: [
    [
      ["Map the syllabus", "Turn the supplied outline into a short list of concepts.", "Write one question you want each topic to answer.", "Review the syllabus or course outline you were given."],
      ["Find your starting point", "Notice which topics already feel familiar and which need attention.", "Mark each topic green, yellow, or red without judging your score.", "Use your lecture notes and course materials."],
    ],
    [
      ["Learn one concept at a time", "Use a short focused study block to understand one syllabus topic.", "Explain the idea in your own words, then check your notes for gaps.", "Revisit the assigned reading or lecture notes for that topic."],
      ["Practice with a worked example", "Move from recognizing a concept to applying it.", "Attempt one course problem before looking at its solution.", "Use instructor-provided examples and practice problems."],
    ],
    [
      ["Recall without your notes", "Strengthen memory by retrieving ideas instead of rereading.", "Write a short answer or solve one question from memory.", "Make a small set of prompts from your own syllabus."],
      ["Rehearse the exam format", "Practice organizing your time and checking your understanding.", "Try a short timed set, then review mistakes and unclear topics.", "Use a past paper only if your instructor or institution provides one."],
    ],
  ],
  career: [
    [
      ["Translate the role into skills", "Break the target role into practical areas to learn.", "Compare this roadmap with a current job description you choose.", "Use public job descriptions as a starting point; expectations vary by role and employer."],
      ["Strengthen the foundations", "Build a working understanding of one core concept at a time.", "Explain one concept simply, then identify a question to investigate.", "Use documentation or a trusted introductory course for your chosen subject."],
    ],
    [
      ["Practice a small building block", "Apply one concept in a focused exercise before starting a larger project.", "Complete a small example and note what you would change next.", "Use the official documentation for the tool or topic you selected."],
      ["Make a small, useful artifact", "Turn your learning into something another person can review.", "Create a small demo, design, analysis, or presentation relevant to your goal.", "Keep the scope small enough to finish and explain."],
    ],
    [
      ["Explain your decisions", "Practice describing your approach, trade-offs, and learning.", "Give a two-minute walkthrough of one piece of work.", "Use a peer, mentor, or your own written reflection for feedback."],
      ["Choose the next gap", "Use practice results to decide what deserves another study block.", "Write one strength, one open question, and one next action.", "Recheck your chosen role description; do not treat this roadmap as a hiring guarantee."],
    ],
  ],
  company: [
    [
      ["Start with the role description", "Use current information for the role you are targeting.", "Save the posting date and list the responsibilities in your own words.", "Check the employer's current public job description; roles and criteria change."],
      ["Build a preparation map", "Organize topics you want to review from information you have verified.", "Separate confirmed posting details from your own preparation ideas.", "Treat this roadmap as suggestions, not a statement of company requirements."],
    ],
    [
      ["Practice role-relevant examples", "Prepare concise examples that show how you approach your work.", "Use situation, action, and result to outline one real example.", "Draw from your coursework, projects, or experience."],
      ["Rehearse a practical prompt", "Practice reasoning aloud without assuming a specific interview format.", "Work through one representative problem and explain your choices.", "Use role-related practice material you can verify independently."],
    ],
    [
      ["Review the employer's public materials", "Learn enough about the organization to ask thoughtful questions.", "Write two questions grounded in sources you read.", "Use current employer-published material; this is research guidance, not insider information."],
      ["Run a calm mock interview", "Combine your examples and practice into one low-stakes rehearsal.", "Answer a few general questions, then note one improvement.", "Ask a peer to listen or record yourself for a private review."],
    ],
  ],
  certification: [
    [
      ["Find the official exam guide", "Start with the certifying organization's current exam information.", "Record the guide title, version, and date you checked it.", "Use the official certifying-body website as the source of truth."],
      ["Map the published exam domains", "Turn the official outline you found into a review checklist.", "Copy domain names accurately and mark unfamiliar areas.", "Follow the exam guide version that applies to your planned exam date."],
    ],
    [
      ["Study one published domain", "Choose a single domain from the verified outline for a focused session.", "Summarize one concept and add a question to revisit.", "Use materials recommended or linked by the certifying organization."],
      ["Apply and check your understanding", "Practice with material relevant to the selected exam domain.", "Attempt a practice question and explain why your answer fits.", "Use authorized practice material; avoid relying on an unofficial syllabus."],
    ],
    [
      ["Review the complete outline", "Return to every domain and note remaining gaps.", "Mark each outline item ready, revisit, or not yet studied.", "Compare your checklist against the current official guide."],
      ["Plan an exam-ready review", "Reserve focused time for the areas you still need to revisit.", "Take an authorized practice test if one is available to you.", "Confirm registration, exam format, and policies with the certifying body."],
    ],
  ],
};

const moduleTitles = {
  college: [["Syllabus map", "Starting point"], ["Concept study", "Worked examples"], ["Active recall", "Exam rehearsal"]],
  career: [["Role map", "Core concepts"], ["Guided practice", "Small project"], ["Communication", "Next steps"]],
  company: [["Role research", "Preparation map"], ["Experience stories", "Role practice"], ["Company research", "Mock interview"]],
  certification: [["Official guide", "Exam domains"], ["Domain study", "Practice questions"], ["Full review", "Exam readiness"]],
};

const topicActions = [
  [
    ["Study", "Build a clear explanation of {topic} from your course materials."],
    ["Explain", "Put {topic} into your own words and identify what is still unclear."],
  ],
  [
    ["Apply", "Use {topic} to work through an example from your class or syllabus."],
    ["Connect", "Find a connection between {topic} and another idea in your course."],
  ],
  [
    ["Recall", "Retrieve the main ideas about {topic} without looking at your notes."],
    ["Review", "Check your understanding of {topic} and identify one gap to revisit."],
  ],
];

function cleanText(value, maxLength = 180) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function splitTopics(value) {
  if (Array.isArray(value)) return value.map((topic) => cleanText(topic, 100)).filter(Boolean).slice(0, 12);
  return cleanText(value, 500).split(/[\n,;]+/).map((topic) => cleanText(topic, 100)).filter(Boolean).slice(0, 12);
}

function formatDate(value) {
  if (!value) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function detailLabel(category, details) {
  if (category === "college") return [details.subject, details.semester].filter(Boolean).join(" · ");
  if (category === "career") return details.role;
  if (category === "company") return [details.company, details.role].filter(Boolean).join(" · ");
  return details.certification;
}

function taskTemplate(category, index, details) {
  const phaseIndex = Math.min(Math.floor(index / 2), 2);
  const source = defaultTemplates[category][phaseIndex];
  const task = source[index % 2];
  const topic = details.topics?.length ? details.topics[index % details.topics.length] : undefined;
  const [title, objective, exercise, explanation] = task;
  const template = {
    title,
    objective,
    exercise,
    explanation: explanation ?? exercise,
    checkpoint: explanation ?? exercise,
  };
  if (category === "college" && topic) {
    const [action, objective] = topicActions[phaseIndex][index % 2];
    return {
      ...template,
      title: `${action} ${topic}`,
      objective: objective.replace("{topic}", topic),
      exercise: `Spend this block on ${topic}: ${task[2]}`,
      checkpoint: `Check your work on ${topic} against course materials and note any remaining questions.`,
    };
  }
  return template;
}

export const roadmapCategories = categoryDefinitions;

export function categoryLabel(category) {
  return categoryDefinitions.find((item) => item.id === category)?.name ?? "Career skill";
}

export function createRoadmapPlan({
  category,
  goal,
  level,
  dailyMinutes,
  targetDate = "",
  details = {},
  quizzes = [],
  generatedQuests = [],
}) {
  const normalizedDetails = {
    subject: cleanText(details.subject, 100),
    semester: cleanText(details.semester, 80),
    topics: splitTopics(details.topics),
    role: cleanText(details.role, 100),
    experience: cleanText(details.experience, 100),
    company: cleanText(details.company, 100),
    certification: cleanText(details.certification, 100),
  };
  const planGoal = cleanText(goal, 140);
  const quizList = Array.isArray(quizzes) ? quizzes : [];
  const generatedList = Array.isArray(generatedQuests) && generatedQuests.length >= 4 && generatedQuests.length <= 6
    ? generatedQuests
    : [];
  let quizIndex = 0;
  const buildTask = (taskIndex, generatedQuest = null) => {
    const template = generatedQuest
      ? {
        title: cleanText(generatedQuest.title, 90),
        objective: cleanText(generatedQuest.objective, 180),
        explanation: cleanText(generatedQuest.task, 240),
        exercise: `Complete this activity, then explain what you learned: ${cleanText(generatedQuest.task, 240)}`,
        checkpoint: cleanText(generatedQuest.question, 180),
      }
      : taskTemplate(category, taskIndex, normalizedDetails);
    const attachedQuiz = quizList[quizIndex] ?? null;
    quizIndex += 1;
    const requestedMinutes = Number.parseInt(generatedQuest?.duration?.match(/\d{1,3}/)?.[0] ?? "", 10);
    const suggestedMinutes = [15, 20, 25, 30, 35, 40][taskIndex] ?? 25;
    return {
      id: `${category}-task-${taskIndex + 1}`,
      title: template.title,
      objective: template.objective,
      estimatedMinutes: Math.min(Number.isInteger(requestedMinutes) ? Math.max(requestedMinutes, 5) : suggestedMinutes, dailyMinutes),
      explanation: template.explanation,
      exercise: template.exercise,
      checkpoint: template.checkpoint,
      quizId: attachedQuiz?.id ?? null,
      quizTitle: attachedQuiz?.title ?? null,
    };
  };
  const phaseNames = ["Get oriented", "Build understanding", "Practice and review"];
  const phases = generatedList.length
    ? phaseNames.map((title, phaseIndex) => {
      const start = Math.floor((generatedList.length * phaseIndex) / phaseNames.length);
      const end = Math.floor((generatedList.length * (phaseIndex + 1)) / phaseNames.length);
      return {
        id: `${category}-phase-${phaseIndex + 1}`,
        title,
        modules: [{
          id: `${category}-module-${phaseIndex + 1}-1`,
          title: ["Foundations", "Focused practice", "Review and next steps"][phaseIndex],
          tasks: generatedList.slice(start, end).map((quest, index) => buildTask(start + index, quest)),
        }],
      };
    })
    : defaultTemplates[category].map((moduleTemplates, phaseIndex) => ({
      id: `${category}-phase-${phaseIndex + 1}`,
      title: phaseNames[phaseIndex],
      modules: moduleTemplates.map((_, moduleIndex) => {
        const taskIndex = phaseIndex * 2 + moduleIndex;
        return {
          id: `${category}-module-${phaseIndex + 1}-${moduleIndex + 1}`,
          title: moduleTitles[category][phaseIndex][moduleIndex],
          tasks: [buildTask(taskIndex)],
        };
      }),
    }));
  const tasks = phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks));
  const totalMinutes = tasks.reduce((total, task) => total + task.estimatedMinutes, 0);
  const studyDays = Math.ceil(totalMinutes / dailyMinutes);
  const date = formatDate(targetDate);
  const focus = detailLabel(category, normalizedDetails);
  return {
    category,
    categoryLabel: categoryLabel(category),
    title: focus ? `${planGoal}: ${focus}` : planGoal,
    goal: planGoal,
    targetDate,
    dailyMinutes,
    estimatedDays: studyDays,
    estimatedMinutes: totalMinutes,
    targetDateLabel: date,
    details: normalizedDetails,
    phases,
  };
}

export function validateRoadmapPlan(plan) {
  const tasks = plan?.phases?.flatMap((phase) => phase.modules?.flatMap((module) => module.tasks ?? []) ?? []) ?? [];
  const totalMinutes = tasks.reduce((total, task) => total + (Number.isInteger(task.estimatedMinutes) ? task.estimatedMinutes : 0), 0);
  const taskIds = tasks.map((task) => task.id);
  return Boolean(
    plan &&
    categoryDefinitions.some(({ id }) => id === plan.category) &&
    typeof plan.goal === "string" && plan.goal.length > 0 &&
    typeof plan.title === "string" && plan.title.length > 0 &&
    Number.isInteger(plan.dailyMinutes) &&
    plan.dailyMinutes >= 5 &&
    plan.dailyMinutes <= 300 &&
    Array.isArray(plan.phases) &&
    plan.phases.length === 3 &&
    plan.phases.every((phase) =>
      typeof phase.id === "string" &&
      typeof phase.title === "string" &&
      Array.isArray(phase.modules) &&
      phase.modules.every((module) =>
        typeof module.id === "string" &&
        typeof module.title === "string" &&
        Array.isArray(module.tasks),
      ),
    ) &&
    tasks.length >= 4 &&
    tasks.length <= 6 &&
    new Set(taskIds).size === taskIds.length &&
    Number.isInteger(plan.estimatedMinutes) &&
    plan.estimatedMinutes === totalMinutes &&
    Number.isInteger(plan.estimatedDays) &&
    plan.estimatedDays === Math.ceil(totalMinutes / plan.dailyMinutes) &&
    tasks.every((task) =>
      typeof task.id === "string" &&
      typeof task.title === "string" && task.title.length > 0 &&
      typeof task.objective === "string" && task.objective.length > 0 &&
      Number.isInteger(task.estimatedMinutes) &&
      task.estimatedMinutes > 0 &&
      typeof task.explanation === "string" && task.explanation.length > 0 &&
      typeof task.exercise === "string" && task.exercise.length > 0 &&
      typeof task.checkpoint === "string" && task.checkpoint.length > 0 &&
      (task.quizId === null || typeof task.quizId === "string"),
    ),
  );
}
