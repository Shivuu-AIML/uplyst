import assert from "node:assert/strict";
import test from "node:test";
import { createRoadmapPlan, validateRoadmapPlan } from "./roadmap-plan.js";

const categoryDetails = {
  college: { semester: "Semester 2", subject: "Biology", topics: ["Cell structure", "Genetics"] },
  career: { role: "Frontend developer", experience: "some-practice" },
  company: { company: "Example Co", role: "Product designer" },
  certification: { certification: "Cloud fundamentals", targetDate: "2027-04-18" },
};

test("each roadmap category produces six validated, actionable tasks", () => {
  for (const [category, details] of Object.entries(categoryDetails)) {
    const plan = createRoadmapPlan({
      category,
      goal: "Prepare with a clear study plan",
      level: "beginner",
      dailyMinutes: 30,
      targetDate: details.targetDate ?? "",
      details,
    });

    const tasks = plan.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks));
    assert.equal(tasks.length, 6);
    assert.equal(plan.category, category);
    assert.equal(validateRoadmapPlan(plan), true);
    assert.ok(tasks.every((task) => task.title && task.objective && task.explanation && task.exercise && task.checkpoint));
    assert.ok(tasks.every((task) => task.estimatedMinutes <= plan.dailyMinutes));
  }
});

test("college topics personalize tasks and plans reject malformed saved task data", () => {
  const plan = createRoadmapPlan({
    category: "college",
    goal: "Prepare for my biology exam",
    level: "intermediate",
    dailyMinutes: 15,
    details: categoryDetails.college,
  });
  const firstTask = plan.phases[0].modules[0].tasks[0];
  const taskTitles = plan.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks.map((task) => task.title)));

  assert.match(firstTask.title, /Cell structure/);
  assert.equal(new Set(taskTitles).size, taskTitles.length);
  assert.equal(plan.estimatedDays, 6);
  assert.equal(validateRoadmapPlan({ ...plan, phases: [] }), false);
});

test("a target date must be a real calendar date to receive a display label", () => {
  const plan = createRoadmapPlan({
    category: "certification",
    goal: "Prepare for an exam",
    level: "beginner",
    dailyMinutes: 30,
    targetDate: "2025-02-30",
    details: categoryDetails.certification,
  });

  assert.equal(plan.targetDateLabel, "");
});

test("validated Gemini quests become a four-to-six task roadmap", () => {
  const quests = Array.from({ length: 4 }, (_, index) => ({
    id: `step-${index + 1}`,
    title: `Personalized step ${index + 1}`,
    objective: `Work toward the goal with step ${index + 1}.`,
    duration: "8 min",
    task: `Try the activity for step ${index + 1}.`,
    question: `What did step ${index + 1} help you practice?`,
  }));
  const plan = createRoadmapPlan({
    category: "career",
    goal: "Prepare for a frontend role",
    level: "beginner",
    dailyMinutes: 15,
    generatedQuests: quests,
    quizzes: quests,
  });
  const tasks = plan.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks));

  assert.equal(tasks.length, 4);
  assert.equal(validateRoadmapPlan(plan), true);
  assert.equal(tasks[0].title, "Personalized step 1");
  assert.equal(tasks[0].objective, quests[0].objective);
  assert.match(tasks[0].exercise, /Try the activity/);
  assert.equal(tasks[0].checkpoint, quests[0].question);
  assert.equal(tasks[0].quizId, quests[0].id);
});
