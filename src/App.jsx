import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Code2,
  Coffee,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Map,
  Mic2,
  Palette,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { createRoadmap, goals, validateRoadmap } from "./roadmaps.js";
import { createRoadmapPlan, roadmapCategories, validateRoadmapPlan } from "./roadmap-plan.js";

const STORAGE_KEY = "firststep-progress-v1";
const FIRST_STEP_ACHIEVEMENT = "first-step";
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "roadmaps", label: "My Roadmaps", icon: Map },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "guide", label: "AI Guide", icon: Sparkles },
];

function freshProgress() {
  return {
    sessionId: window.crypto.randomUUID(),
    skill: null,
    level: "beginner",
    roadmap: null,
    roadmapPlan: null,
    completedIds: [],
    completedTaskIds: [],
    rewardedTaskIds: [],
    xp: 0,
    achievementIds: [],
    activityDates: [],
    currentQuestId: null,
    activeTaskId: null,
  };
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function readProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { progress: freshProgress(), failed: false };
    const parsed = JSON.parse(stored);
    const valid = parsed && typeof parsed === "object";
    const data = valid ? parsed : {};
    const defaults = freshProgress();
    const roadmap = valid && validateRoadmap(data.roadmap) ? data.roadmap : null;
    const roadmapPlan = valid && validateRoadmapPlan(data.roadmapPlan)
      ? data.roadmapPlan
      : roadmap
        ? createRoadmapPlan({
          category: "career",
          goal: roadmap.personalGoal || `Build ${goals.find((goal) => goal.id === roadmap.skill)?.skill ?? "skill"} foundations`,
          level: data.level === "intermediate" ? "intermediate" : "beginner",
          dailyMinutes: 30,
          quizzes: roadmap.quests,
        })
        : null;
    const savedTaskIds = new Set(roadmapPlan?.phases.flatMap((phase) =>
      phase.modules.flatMap((module) => module.tasks.map((task) => task.id)),
    ) ?? []);
    const savedCompletedQuestIds = new Set(
      Array.isArray(data.completedIds) ? data.completedIds.filter((id) => typeof id === "string") : [],
    );
    const storedCompletedTaskIds = Array.isArray(data.completedTaskIds)
      ? data.completedTaskIds.filter((id) => savedTaskIds.has(id))
      : [];
    const completedTaskIds = new Set(storedCompletedTaskIds);
    for (const task of roadmapPlan?.phases.flatMap((phase) =>
      phase.modules.flatMap((module) => module.tasks),
    ) ?? []) {
      if (task.quizId && savedCompletedQuestIds.has(task.quizId)) completedTaskIds.add(task.id);
    }
    return {
      failed: false,
      progress: {
        ...defaults,
        ...data,
        sessionId: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.sessionId ?? "")
          ? data.sessionId
          : defaults.sessionId,
        roadmap,
        roadmapPlan,
        skill: roadmap ? data.skill : null,
        completedTaskIds: [...completedTaskIds],
        rewardedTaskIds: [...new Set([
          ...(Array.isArray(data.rewardedTaskIds)
            ? data.rewardedTaskIds.filter((id) => savedTaskIds.has(id))
            : []),
          ...completedTaskIds,
        ])],
        activeTaskId: savedTaskIds.has(data.activeTaskId) ? data.activeTaskId : null,
        completedIds: Array.isArray(data.completedIds) ? data.completedIds.filter((id) => typeof id === "string") : [],
        achievementIds: Array.isArray(data.achievementIds)
          ? data.achievementIds.filter((id) => typeof id === "string")
          : [],
        activityDates: Array.isArray(data.activityDates)
          ? data.activityDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
          : [],
        xp: Number.isFinite(data.xp) && data.xp >= 0 ? data.xp : 0,
        level: data.level === "intermediate" ? "intermediate" : "beginner",
      },
    };
  } catch {
    return { progress: freshProgress(), failed: true };
  }
}

function getStreak(dates) {
  if (!dates.length) return 0;
  const day = (date) => Date.parse(`${date}T00:00:00Z`);
  const today = day(localDateKey());
  const lastActive = Math.max(...dates.map(day));
  if (lastActive !== today && lastActive !== today - 86400000) return 0;
  const active = new Set(dates);
  let streak = 0;
  let cursor = lastActive;
  while (active.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= 86400000;
  }
  return streak;
}

function App() {
  const initial = useMemo(readProgress, []);
  const [progress, setProgress] = useState(initial.progress);
  const [persistenceError, setPersistenceError] = useState(initial.failed);
  const [selectedLevel, setSelectedLevel] = useState(initial.progress.level);
  const [personalGoal, setPersonalGoal] = useState(initial.progress.roadmap?.personalGoal ?? "");
  const [category, setCategory] = useState(initial.progress.roadmapPlan?.category ?? "career");
  const [targetDate, setTargetDate] = useState(initial.progress.roadmapPlan?.targetDate ?? "");
  const [dailyMinutes, setDailyMinutes] = useState(initial.progress.roadmapPlan?.dailyMinutes ?? 30);
  const [semester, setSemester] = useState(initial.progress.roadmapPlan?.details?.semester ?? "");
  const [subject, setSubject] = useState(initial.progress.roadmapPlan?.details?.subject ?? "");
  const [syllabusTopics, setSyllabusTopics] = useState(initial.progress.roadmapPlan?.details?.topics?.join(", ") ?? "");
  const [role, setRole] = useState(initial.progress.roadmapPlan?.details?.role ?? "");
  const [experience, setExperience] = useState(initial.progress.roadmapPlan?.details?.experience ?? "");
  const [company, setCompany] = useState(initial.progress.roadmapPlan?.details?.company ?? "");
  const [certification, setCertification] = useState(initial.progress.roadmapPlan?.details?.certification ?? "");
  const [quizTrack, setQuizTrack] = useState("");
  const [formError, setFormError] = useState("");
  const [activeQuestId, setActiveQuestId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(initial.progress.activeTaskId ?? null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [reward, setReward] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState("");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [apiNotice, setApiNotice] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setPersistenceError(false);
    } catch {
      setPersistenceError(true);
    }
  }, [progress]);

  const roadmap = progress.roadmap;
  const roadmapPlan = progress.roadmapPlan;
  const completed = new Set(progress.completedIds);
  const completedCount = roadmap ? roadmap.quests.filter((quest) => completed.has(quest.id)).length : 0;
  const nextQuest = roadmap?.quests.find((quest) => !completed.has(quest.id)) ?? null;
  const activeQuest = roadmap?.quests.find((quest) => quest.id === activeQuestId) ?? null;
  const levelNumber = Math.floor(progress.xp / 100) + 1;
  const levelProgress = progress.xp % 100;
  const streak = getStreak(progress.activityDates);
  const currentGoal = goals.find((goal) => goal.id === roadmap?.skill);
  const tasks = roadmapPlan?.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks)) ?? [];
  const completedTasks = new Set(progress.completedTaskIds);
  const completedTaskCount = tasks.filter((task) => completedTasks.has(task.id)).length;
  const nextTask = tasks.find((task) => !completedTasks.has(task.id)) ?? null;
  const selectedTask = tasks.find((task) => task.id === activeTaskId) ?? null;

  function validateRoadmapForm() {
    if (personalGoal.trim().length < 4) return "Add a short goal so your roadmap can stay focused.";
    if (!Number.isInteger(Number(dailyMinutes)) || dailyMinutes < 5 || dailyMinutes > 300) {
      return "Choose a daily study target between 5 and 300 minutes.";
    }
    const isFutureDate = (date) => {
      if (!date) return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      const parsed = new Date(`${date}T12:00:00.000Z`);
      return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date && date >= localDateKey();
    };
    if (!isFutureDate(targetDate)) return "Choose a target date in the future.";
    if (category === "college") {
      if (!semester.trim() || !subject.trim()) return "Add your semester and subject to build a college roadmap.";
      if (!isFutureDate(targetDate)) return "Your exam date must be today or later.";
    }
    if (category === "career" && (!role.trim() || !experience)) return "Add the role you want and your current experience.";
    if (category === "company" && (!company.trim() || !role.trim())) return "Add the company and target role you’re preparing for.";
    if (category === "certification" && (!certification.trim() || !targetDate)) {
      return "Add the certification name and exam date.";
    }
    return "";
  }

  async function buildPath(event) {
    event.preventDefault();
    const validationError = validateRoadmapForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError("");
    setGenerationLoading(true);
    setApiNotice(null);
    let nextRoadmap;
    let source = "curated";
    let message = null;
    const generationSkill = quizTrack || ({ college: "java", career: "react", company: "react", certification: "java" })[category];
    const details = {
      semester: semester.trim(),
      subject: subject.trim(),
      topics: syllabusTopics.split(/[\n,;]+/).map((topic) => topic.trim()).filter(Boolean),
      role: role.trim(),
      experience,
      company: company.trim(),
      certification: certification.trim(),
      targetDate,
      dailyMinutes: Number(dailyMinutes),
    };
    try {
      const response = await fetch("/api/roadmaps/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          skill: generationSkill,
          level: selectedLevel,
          goal: personalGoal.trim(),
          category,
          context: details,
          sessionId: progress.sessionId,
        }),
      });
      if (!response.ok) throw new Error("Roadmap API request failed");
      const result = await response.json();
      if (!validateRoadmap(result.roadmap) || !["gemini", "curated"].includes(result.source)) {
        throw new Error("Roadmap API response was invalid");
      }
      nextRoadmap = result.roadmap;
      source = result.source;
      message = typeof result.message === "string" ? result.message : null;
    } catch {
      nextRoadmap = createRoadmap(generationSkill, selectedLevel, personalGoal.trim());
      message = "The API couldn't be reached, so this curated roadmap is shown.";
    } finally {
      setGenerationLoading(false);
    }

    const quizRoadmap = quizTrack
      ? nextRoadmap.quests?.length
        ? nextRoadmap
        : createRoadmap(quizTrack, selectedLevel)
      : { quests: [] };
    const roadmapPlan = createRoadmapPlan({
      category,
      goal: personalGoal.trim(),
      level: selectedLevel,
      dailyMinutes: Number(dailyMinutes),
      targetDate,
      details,
      quizzes: quizRoadmap.quests,
      generatedQuests: source === "gemini" ? nextRoadmap.quests : [],
    });
    setProgress({
      ...freshProgress(),
      sessionId: progress.sessionId,
      skill: generationSkill,
      level: selectedLevel,
      roadmap: { ...nextRoadmap, personalGoal: personalGoal.trim() },
      roadmapPlan,
      roadmapSource: source,
      roadmapMessage: message,
      currentQuestId: nextRoadmap.quests[0].id,
      completedTaskIds: [],
      activeTaskId: roadmapPlan.phases[0].modules[0].tasks[0].id,
    });
    setActiveQuestId(null);
    setFeedback(null);
    setSelectedAnswer(null);
    setTaskFeedback("");
    setActiveTaskId(roadmapPlan.phases[0].modules[0].tasks[0].id);
    setActiveSection("roadmaps");
  }

  function startTask(task) {
    if (!task || completedTasks.has(task.id)) {
      if (task) {
        setActiveTaskId(task.id);
        setProgress((current) => ({ ...current, activeTaskId: task.id }));
        setTaskFeedback("");
      }
      return;
    }
    const firstIncomplete = tasks.find((item) => !completedTasks.has(item.id));
    if (task.id !== firstIncomplete?.id && task.id !== activeTaskId) return;
    setActiveTaskId(task.id);
    setProgress((current) => ({ ...current, activeTaskId: task.id }));
    setActiveQuestId(null);
    setTaskFeedback("");
    setActiveSection("roadmaps");
  }

  function setTaskCompletion(task, isComplete) {
    const today = localDateKey();
    const shouldToast = isComplete && !progress.rewardedTaskIds.includes(task.id);
    setProgress((current) => {
      const earnedReward = isComplete && !current.rewardedTaskIds.includes(task.id);
      return {
        ...current,
        completedTaskIds: isComplete
          ? [...new Set([...current.completedTaskIds, task.id])]
          : current.completedTaskIds.filter((id) => id !== task.id),
        rewardedTaskIds: earnedReward
          ? [...new Set([...current.rewardedTaskIds, task.id])]
          : current.rewardedTaskIds,
        xp: earnedReward ? current.xp + 20 : current.xp,
        achievementIds: isComplete && !current.achievementIds.includes(FIRST_STEP_ACHIEVEMENT)
          ? [...current.achievementIds, FIRST_STEP_ACHIEVEMENT]
          : current.achievementIds,
        activityDates: earnedReward && !current.activityDates.includes(today)
          ? [...current.activityDates, today]
          : current.activityDates,
        activeTaskId: task.id,
      };
    });
    setActiveTaskId(task.id);
    setTaskFeedback(isComplete ? (shouldToast ? "Task complete. 20 XP earned." : "Task marked complete.") : "");
    if (shouldToast) {
      setReward(true);
      window.setTimeout(() => setReward(false), 1600);
    }
  }

  function startQuest(quest) {
    if (!quest || completed.has(quest.id)) return;
    setProgress((current) => ({ ...current, currentQuestId: quest.id }));
    setActiveQuestId(quest.id);
    setSelectedAnswer(null);
    setFeedback(null);
    setTaskFeedback("");
  }

  async function answerQuest(event) {
    event.preventDefault();
    if (!activeQuest || selectedAnswer === null || answerSubmitting) return;
    if (selectedAnswer !== activeQuest.answer) {
      setFeedback({ correct: false, text: "Not quite. Take another look, then give it another try." });
      return;
    }
    if (completed.has(activeQuest.id)) return;

    setAnswerSubmitting(true);
    setApiNotice(null);
    let awardedXp = 20;
    try {
      const response = await fetch(`/api/quests/${encodeURIComponent(activeQuest.id)}/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(4000),
        body: JSON.stringify({ sessionId: progress.sessionId, answer: selectedAnswer }),
      });
      if (!response.ok) throw new Error("Quest completion API request failed");
      const result = await response.json();
      if (!result.completed || ![0, 20].includes(result.awardedXp)) {
        throw new Error("Quest completion API response was invalid");
      }
      awardedXp = result.awardedXp;
    } catch {
      setApiNotice("The API couldn't confirm this reward; your progress is saved on this device.");
    }

    const today = localDateKey();
    const nextCompleted = [...progress.completedIds, activeQuest.id];
    const nextAchievements = progress.achievementIds.includes(FIRST_STEP_ACHIEVEMENT)
      ? progress.achievementIds
      : [...progress.achievementIds, FIRST_STEP_ACHIEVEMENT];
    const nextQuestId = roadmap.quests.find((quest) => !nextCompleted.includes(quest.id))?.id ?? null;
    const taskForQuest = tasks.find((task) => task.quizId === activeQuest.id);
    if (taskForQuest && progress.rewardedTaskIds.includes(taskForQuest.id)) awardedXp = 0;
    const newlyCompletedTasks = taskForQuest
      ? [...new Set([...progress.completedTaskIds, taskForQuest.id])]
      : progress.completedTaskIds;
    const newlyRewardedTasks = taskForQuest
      ? [...new Set([...progress.rewardedTaskIds, taskForQuest.id])]
      : progress.rewardedTaskIds;
    const nextTaskAfterQuiz = tasks.find((task) => !newlyCompletedTasks.includes(task.id)) ?? null;
    setProgress((current) => ({
      ...current,
      completedIds: nextCompleted,
      completedTaskIds: newlyCompletedTasks,
      rewardedTaskIds: newlyRewardedTasks,
      activeTaskId: taskForQuest ? nextTaskAfterQuiz?.id ?? null : current.activeTaskId,
      xp: current.xp + awardedXp,
      achievementIds: nextAchievements,
      activityDates: current.activityDates.includes(today)
        ? current.activityDates
        : [...current.activityDates, today],
      currentQuestId: nextQuestId,
    }));
    if (taskForQuest) {
      setActiveTaskId(nextTaskAfterQuiz?.id ?? null);
    }
    setFeedback({ correct: true, text: activeQuest.explanation });
    if (awardedXp > 0) {
      setReward(true);
      window.setTimeout(() => setReward(false), 1600);
    }
    setAnswerSubmitting(false);
  }

  function continueJourney() {
    setFeedback(null);
    if (nextQuest) startQuest(nextQuest);
    else setActiveQuestId(null);
  }

  function resetDemo() {
    setProgress(freshProgress());
    setSelectedLevel("beginner");
    setPersonalGoal("");
    setFormError("");
    setCategory("career");
    setTargetDate("");
    setDailyMinutes(30);
    setSemester("");
    setSubject("");
    setSyllabusTopics("");
    setRole("");
    setExperience("");
    setCompany("");
    setCertification("");
    setQuizTrack("");
    setActiveSection("dashboard");
    setActiveQuestId(null);
    setFeedback(null);
    setSelectedAnswer(null);
    setApiNotice(null);
    setResetConfirm(false);
    setTaskFeedback("");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => { setActiveSection("dashboard"); setActiveQuestId(null); }} aria-label="Uplyst home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>uplyst<span className="brand-dot">.</span></span>
        </button>
        <nav className="primary-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              className={`nav-link ${activeSection === id ? "active" : ""}`}
              type="button"
              key={id}
              aria-current={activeSection === id ? "page" : undefined}
              onClick={() => { setActiveSection(id); setActiveQuestId(null); setFeedback(null); setTaskFeedback(""); }}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          {roadmap && (
                <div className="header-progress" aria-label={`${completedTaskCount} of ${tasks.length} roadmap tasks complete`}>
                  <span>{completedTaskCount}/{tasks.length} steps</span>
                  <span className="header-progress-track"><span style={{ width: `${tasks.length ? (completedTaskCount / tasks.length) * 100 : 0}%` }} /></span>
            </div>
          )}
          {roadmap && (
            <button className="reset-button" type="button" onClick={() => setResetConfirm(true)} aria-label="Reset demo" title="Reset demo">
              <RotateCcw size={14} /> <span>Reset demo</span>
            </button>
          )}
        </div>
      </header>

      {(persistenceError || apiNotice) && (
        <div className="storage-notice" role="status">
          {persistenceError
            ? "Progress could not be saved in this browser. You can keep going, but it may not survive a refresh."
            : apiNotice}
        </div>
      )}

      <main className={`main-content ${!roadmap && activeSection === "dashboard" ? "welcome-main" : ""}`}>
        {activeQuest ? (
          <QuestView
            quest={activeQuest}
            goal={currentGoal}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            feedback={feedback}
            answerSubmitting={answerSubmitting}
            onSubmit={answerQuest}
            onBack={() => { setActiveQuestId(null); setFeedback(null); }}
            onContinue={continueJourney}
            nextQuest={nextQuest}
            progress={progress}
            completedCount={completedCount}
          />
        ) : activeSection === "dashboard" && !roadmap ? (
          <section className="welcome-layout">
            <div className="welcome-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> A CLEARER WAY TO LEARN</div>
              <h1>Your next step<br />starts <span>here.</span></h1>
              <p className="welcome-subtitle">Turn the thing you want to learn into a path you can actually follow. One focused step at a time.</p>
              <div className="welcome-proof"><CheckCircle2 size={16} /><span>Made for curious minds, career changers, and your next big goal.</span></div>
            </div>

            <form className="goal-card" onSubmit={buildPath}>
              <div className="card-topline">
                <span className="step-counter">LET’S BEGIN</span>
                <span className="curated-label"><span /> PERSONALIZED LEARNING</span>
              </div>
              <h2>What would you like to work toward?</h2>
              <p className="card-caption">Choose a topic and we’ll shape a first roadmap around you.</p>
              <div className="category-grid" role="group" aria-label="Choose a roadmap type">
                {roadmapCategories.map((item) => (
                  <button
                    className={`category-option ${category === item.id ? "selected" : ""}`}
                    type="button"
                    aria-pressed={category === item.id}
                    key={item.id}
                    onClick={() => { setCategory(item.id); setFormError(""); }}
                  >
                    <span className="category-option-icon"><CategoryIcon category={item.id} /></span>
                    <span className="category-option-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
                    <span className="goal-check"><Check size={12} /></span>
                  </button>
                ))}
              </div>
              <div className="form-divider" />
              <label className="field-label" htmlFor="personal-goal">YOUR GOAL</label>
              <input
                id="personal-goal"
                className="goal-input"
                required
                maxLength={140}
                placeholder="e.g. Prepare for my biology final"
                value={personalGoal}
                onChange={(event) => { setPersonalGoal(event.target.value); setFormError(""); }}
              />
              {category === "college" && (
                <div className="category-fields">
                  <div className="form-field-row">
                    <FormField id="semester" label="SEMESTER" value={semester} onChange={setSemester} placeholder="e.g. Semester 3" />
                    <FormField id="subject" label="SUBJECT" value={subject} onChange={setSubject} placeholder="e.g. Cell biology" />
                  </div>
                  <label className="field-label" htmlFor="syllabus-topics">SYLLABUS TOPICS <span>OPTIONAL</span></label>
                  <textarea id="syllabus-topics" className="goal-input goal-textarea" maxLength={500} placeholder="Separate topics with commas" value={syllabusTopics} onChange={(event) => setSyllabusTopics(event.target.value)} />
                  <DateField id="target-date" label="EXAM DATE" value={targetDate} onChange={setTargetDate} />
                </div>
              )}
              {category === "career" && (
                <div className="category-fields">
                  <FormField id="target-role" label="ROLE YOU’RE WORKING TOWARD" value={role} onChange={setRole} placeholder="e.g. Frontend developer" />
                  <label className="field-label" htmlFor="experience">CURRENT EXPERIENCE</label>
                  <select id="experience" className="form-select" value={experience} onChange={(event) => setExperience(event.target.value)}>
                    <option value="">Choose your starting point</option>
                    <option value="new">New to this field</option>
                    <option value="some-practice">Some learning or project experience</option>
                    <option value="1-3-years">1–3 years of experience</option>
                    <option value="3-plus-years">3+ years of experience</option>
                  </select>
                  <DateField id="target-date" label="TARGET DATE" value={targetDate} onChange={setTargetDate} optional />
                </div>
              )}
              {category === "company" && (
                <div className="category-fields">
                  <div className="form-field-row">
                    <FormField id="company" label="COMPANY" value={company} onChange={setCompany} placeholder="e.g. Acme" />
                    <FormField id="company-role" label="TARGET ROLE" value={role} onChange={setRole} placeholder="e.g. Product analyst" />
                  </div>
                  <p className="form-hint">Preparation suggestions only. Check the company’s current public role description for verified details.</p>
                  <DateField id="target-date" label="TARGET DATE" value={targetDate} onChange={setTargetDate} optional />
                </div>
              )}
              {category === "certification" && (
                <div className="category-fields">
                  <FormField id="certification" label="CERTIFICATION NAME" value={certification} onChange={setCertification} placeholder="e.g. AWS Certified Cloud Practitioner" />
                  <DateField id="target-date" label="EXAM DATE" value={targetDate} onChange={setTargetDate} />
                  <p className="form-hint">We’ll suggest a study structure. Verify the official exam outline and version with the certifying body.</p>
                </div>
              )}
              <div className="form-field-row preferences-row">
                <div>
                  <label className="field-label" htmlFor="level-choice">CURRENT SKILL LEVEL</label>
                  <select id="level-choice" className="form-select" value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="daily-minutes">STUDY TIME PER DAY</label>
                  <select id="daily-minutes" className="form-select" value={dailyMinutes} onChange={(event) => setDailyMinutes(Number(event.target.value))}>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
              </div>
              <div className="optional-quiz-field">
                <label className="field-label" htmlFor="quiz-track">OPTIONAL SHORT QUIZ PRACTICE</label>
                <select id="quiz-track" className="form-select" value={quizTrack} onChange={(event) => setQuizTrack(event.target.value)}>
                  <option value="">No extra skill quiz</option>
                  {goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.skill}</option>)}
                </select>
                <span>Uses the existing interactive quiz and XP rewards.</span>
              </div>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="primary-button build-button" type="submit" disabled={generationLoading}>
                {generationLoading ? "Building your path…" : "Build my learning path"} <ArrowRight size={17} />
              </button>
              <p className="privacy-note"><CheckCircle2 size={13} /> Your roadmap and progress stay on this device.</p>
            </form>
          </section>
        ) : activeSection === "dashboard" ? (
          <DashboardView
            roadmap={roadmap}
            roadmapPlan={roadmapPlan}
            goal={currentGoal}
            nextTask={nextTask}
            completedTaskCount={completedTaskCount}
            progress={progress}
            levelNumber={levelNumber}
            levelProgress={levelProgress}
            streak={streak}
            onStartTask={() => nextTask && startTask(nextTask)}
            onRoadmaps={() => setActiveSection("roadmaps")}
          />
        ) : activeSection === "roadmaps" ? roadmap ? (
          <JourneyView
            roadmap={roadmap}
            roadmapPlan={roadmapPlan}
            goal={currentGoal}
            progress={progress}
            completed={completed}
            completedCount={completedCount}
            completedTaskIds={completedTasks}
            completedTaskCount={completedTaskCount}
            levelNumber={levelNumber}
            levelProgress={levelProgress}
            streak={streak}
            nextQuest={nextQuest}
            reward={reward}
            taskFeedback={taskFeedback}
            roadmapSource={progress.roadmapSource}
            roadmapMessage={progress.roadmapMessage}
            onStart={startQuest}
            onStartTask={startTask}
            onToggleTask={setTaskCompletion}
            activeTask={selectedTask}
            onChangeGoal={() => {
              setProgress(freshProgress());
              setSelectedLevel("beginner");
              setPersonalGoal("");
              setCategory("career");
              setFormError("");
              setApiNotice(null);
              setActiveSection("dashboard");
            }}
          />
        ) : (
          <EmptySection
            eyebrow="YOUR LEARNING LIBRARY"
            title="Your next roadmap starts here."
            description="Create a learning path and it will be ready to pick up whenever you are."
            action="Create a roadmap"
            icon={Map}
            onAction={() => setActiveSection("dashboard")}
          />
        ) : activeSection === "achievements" ? (
          <AchievementsView
            progress={progress}
            levelNumber={levelNumber}
            levelProgress={levelProgress}
            streak={streak}
            onCreate={() => setActiveSection("dashboard")}
          />
        ) : (
          <GuideView onStart={() => setActiveSection(roadmap ? "roadmaps" : "dashboard")} hasRoadmap={Boolean(roadmap)} />
        )}
      </main>

      <footer className="site-footer">
        <span>© 2025 Uplyst</span>
        <span>Your next step starts here.</span>
        <span className="footer-status"><span /> YOUR JOURNEY, YOUR PACE</span>
      </footer>

      {resetConfirm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setResetConfirm(false); }}>
          <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <div className="modal-icon"><RotateCcw size={19} /></div>
            <h2 id="reset-title">Start fresh?</h2>
            <p>This clears your roadmap, XP, achievements, and activity dates on this device.</p>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setResetConfirm(false)}>Keep my progress</button>
              <button className="danger-button" type="button" onClick={resetDemo}>Reset demo</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ progress, levelNumber, levelProgress, streak, compact = false }) {
  return (
    <section className={`profile-card ${compact ? "profile-compact" : ""}`} aria-label="Your learning profile">
      <div className="profile-heading">
        <span className="profile-avatar"><Sparkles size={17} /></span>
        <div><strong>Your momentum</strong><span>One step at a time</span></div>
      </div>
      <div className="profile-level">
        <div className="level-text"><span>LEVEL {String(levelNumber).padStart(2, "0")}</span><span><strong key={progress.xp} className="xp-count">{levelProgress}</strong> <small>/ 100 XP</small></span></div>
        <div className="level-track"><span style={{ width: `${levelProgress}%` }} /></div>
      </div>
      <div className="profile-stats">
        <div><Zap size={14} /><strong>{progress.xp}</strong><span>total XP</span></div>
        <div><Award size={14} /><strong>{progress.achievementIds.length}</strong><span>badges</span></div>
        <div><Flame size={14} /><strong>{streak}</strong><span>day streak</span></div>
      </div>
    </section>
  );
}

function FormField({ id, label, value, onChange, placeholder }) {
  return (
    <div className="form-control">
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="goal-input"
        required
        maxLength={100}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function DateField({ id, label, value, onChange, optional = false }) {
  const minimumDate = localDateKey();
  return (
    <div className="form-control date-field">
      <label className="field-label" htmlFor={id}>{label}{optional && <span> · OPTIONAL</span>}</label>
      <input
        id={id}
        className="goal-input"
        type="date"
        min={minimumDate}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function CategoryIcon({ category }) {
  const icons = {
    college: GraduationCap,
    career: Target,
    company: BriefcaseBusiness,
    certification: Award,
  };
  const Icon = icons[category] ?? Map;
  return <Icon size={17} strokeWidth={1.8} aria-hidden="true" />;
}

function DashboardView({
  roadmap, roadmapPlan, nextTask, completedTaskCount, progress, levelNumber, levelProgress, streak,
  onStartTask, onRoadmaps,
}) {
  const allDone = !nextTask;
  return (
    <section className="dashboard-view">
      <div className="page-heading">
        <div className="eyebrow"><span className="eyebrow-line" /> YOUR LEARNING, AT A GLANCE</div>
        <h1>Your next step starts here.</h1>
        <p>Small, steady steps make real progress.</p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <section className="next-quest-card">
            <div className="next-quest-topline">
              <span className="section-kicker">{allDone ? "A MOMENT TO CELEBRATE" : "PICK UP WHERE YOU LEFT OFF"}</span>
              <span className="quiet-pill">{roadmapPlan.categoryLabel}</span>
            </div>
            <span className="next-quest-icon"><Target size={20} /></span>
            <h2>{allDone ? "You’ve completed this roadmap." : nextTask.title}</h2>
            <p>{allDone ? "You showed up and saw it through. Choose another small goal whenever you’re ready." : nextTask.objective}</p>
            <div className="next-quest-meta"><Clock3 size={14} /> {allDone ? "A great place to build from" : `${nextTask.estimatedMinutes} min · ${roadmapPlan.dailyMinutes} min/day`}</div>
            <button className="primary-button" type="button" onClick={allDone ? onRoadmaps : onStartTask}>
              {allDone ? "Review your roadmap" : "Continue learning"} <ArrowRight size={16} />
            </button>
          </section>
          <section className="dashboard-roadmap-card">
            <div>
              <span className="section-kicker">YOUR CURRENT ROADMAP</span>
              <h2>{roadmapPlan.title}</h2>
              <p>{completedTaskCount} of {roadmapPlan.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks)).length} tasks complete · About {roadmapPlan.estimatedDays} study days</p>
            </div>
            <button className="secondary-button" type="button" onClick={onRoadmaps}>View roadmap <ArrowRight size={15} /></button>
          </section>
        </div>
        <aside className="dashboard-sidebar">
          <ProfileCard progress={progress} levelNumber={levelNumber} levelProgress={levelProgress} streak={streak} />
          <section className="dashboard-tip">
            <Sparkles size={17} />
            <div><strong>Keep it small.</strong><p>A short learning session is still a meaningful step forward.</p></div>
            <button className="text-button" type="button" onClick={onRoadmaps}>Your roadmaps <ArrowRight size={14} /></button>
          </section>
        </aside>
      </div>
    </section>
  );
}

function EmptySection({ eyebrow, title, description, action, icon: Icon, onAction }) {
  return (
    <section className="empty-section">
      <span className="empty-icon"><Icon size={21} strokeWidth={1.7} /></span>
      <span className="section-kicker">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <button className="primary-button" type="button" onClick={onAction}>{action} <ArrowRight size={16} /></button>
    </section>
  );
}

function AchievementsView({ progress, levelNumber, levelProgress, streak, onCreate }) {
  const earned = progress.achievementIds.includes(FIRST_STEP_ACHIEVEMENT);
  return (
    <section className="achievements-view">
      <div className="page-heading">
        <div className="eyebrow"><span className="eyebrow-line" /> YOUR PROGRESS, RECOGNIZED</div>
        <h1>Achievements</h1>
        <p>Every finished step is worth celebrating.</p>
      </div>
      <div className="achievement-layout">
        <div className="achievement-list">
          <article className={`achievement-tile ${earned ? "earned" : "locked"}`}>
            <span className="achievement-tile-icon">{earned ? <CheckCircle2 size={22} /> : <Award size={22} />}</span>
            <div>
              <span className="section-kicker">{earned ? "UNLOCKED" : "YOUR FIRST MILESTONE"}</span>
              <h2>First Step</h2>
              <p>{earned ? "You completed your first learning task. Momentum starts with showing up." : "Complete your first learning task to earn this achievement."}</p>
            </div>
            <span className="achievement-status">{earned ? "Earned" : "In progress"}</span>
          </article>
          {!progress.roadmap && (
            <div className="achievement-empty">
              <p>Your achievements will appear here as you make progress.</p>
              <button className="text-button" type="button" onClick={onCreate}>Start your first roadmap <ArrowRight size={14} /></button>
            </div>
          )}
        </div>
        <aside className="achievement-sidebar">
          <ProfileCard progress={progress} levelNumber={levelNumber} levelProgress={levelProgress} streak={streak} />
          <div className="achievement-summary">
            <span className="section-kicker">A NOTE TO YOURSELF</span>
            <p>Progress isn’t about doing everything at once. It’s about coming back to one thing that matters.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function GuideView({ onStart, hasRoadmap }) {
  return (
    <section className="guide-view">
      <div className="page-heading">
        <div className="eyebrow"><span className="eyebrow-line" /> A LITTLE GUIDANCE, WHEN YOU NEED IT</div>
        <h1>Meet your AI Guide.</h1>
        <p>Turn a big, blurry goal into one clear next step.</p>
      </div>
      <div className="guide-card">
        <span className="guide-mark"><Sparkles size={20} /></span>
        <div className="guide-copy">
          <span className="section-kicker">HOW YOUR GUIDE HELPS</span>
          <h2>A path that starts with you.</h2>
          <p>Choose a skill, tell us what you’re working toward, and get a focused roadmap with short, interactive quests. When AI generation isn’t available, a curated roadmap keeps you moving.</p>
          <div className="guide-steps">
            <div><span>01</span><strong>Choose what matters</strong><small>Java, React, design, or public speaking.</small></div>
            <div><span>02</span><strong>Set your starting point</strong><small>Pick a level and add a personal goal.</small></div>
            <div><span>03</span><strong>Take one small step</strong><small>Learn, answer, and keep your momentum.</small></div>
          </div>
          <button className="primary-button" type="button" onClick={onStart}>
            {hasRoadmap ? "Open my roadmap" : "Build my first roadmap"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

function SkillIcon({ goal }) {
  const icons = { java: Coffee, react: Code2, design: Palette, speaking: Mic2 };
  const Icon = icons[goal?.id] ?? Sparkles;
  return <Icon size={19} strokeWidth={1.7} aria-hidden="true" />;
}

function getDailyPlan(tasks, completedTaskIds, dailyMinutes) {
  const remaining = tasks.filter((task) => !completedTaskIds.has(task.id));
  const planned = [];
  let minutes = 0;
  for (const task of remaining) {
    if (planned.length && minutes + task.estimatedMinutes > dailyMinutes) break;
    planned.push(task);
    minutes += task.estimatedMinutes;
    if (minutes >= dailyMinutes) break;
  }
  return planned;
}

function TaskDetail({ task, isComplete, feedback, onToggle, onOpenQuiz }) {
  if (!task) return null;
  return (
    <section className="task-detail" aria-labelledby="task-detail-title">
      <div className="task-detail-heading">
        <div>
          <span className="section-kicker">LEARNING OBJECTIVE · {task.estimatedMinutes} MIN</span>
          <h2 id="task-detail-title">{task.title}</h2>
        </div>
        <span className={`task-detail-status ${isComplete ? "complete" : "active"}`}>{isComplete ? "Completed" : "In progress"}</span>
      </div>
      <p className="task-objective">{task.objective}</p>
      {feedback && <p className="task-completion-feedback" role="status"><CheckCircle2 size={15} /> {feedback}</p>}
      <div className="task-support-grid">
        <div><span>LEARN</span><p>{task.explanation}</p></div>
        <div><span>TRY IT</span><p>{task.exercise}</p></div>
        <div><span>CHECKPOINT</span><p>{task.checkpoint}</p></div>
      </div>
      <div className="task-detail-actions">
        {task.quizId && (
          <button className="secondary-button" type="button" onClick={() => onOpenQuiz(task.quizId)}>
            Open skill quiz <ArrowRight size={14} />
          </button>
        )}
        <button className={isComplete ? "secondary-button" : "primary-button"} type="button" onClick={() => onToggle(task, !isComplete)}>
          {isComplete ? "Mark as not done" : "Mark task complete"} <Check size={15} />
        </button>
      </div>
    </section>
  );
}

function JourneyView({
  roadmap, roadmapPlan, goal, progress, completed, completedCount, completedTaskIds, completedTaskCount,
  levelNumber, levelProgress, streak, nextQuest, reward, roadmapSource, roadmapMessage,
  taskFeedback,
  activeTask, onStart, onStartTask, onToggleTask, onChangeGoal,
}) {
  const tasks = roadmapPlan.phases.flatMap((phase) => phase.modules.flatMap((module) => module.tasks));
  const nextTask = tasks.find((task) => !completedTaskIds.has(task.id)) ?? null;
  const dailyPlan = getDailyPlan(tasks, completedTaskIds, roadmapPlan.dailyMinutes);
  const complete = !nextTask;
  return (
    <div className="journey-layout">
      <section className="journey-main">
        <div className="journey-topline">
          <span className="eyebrow"><span className="eyebrow-line" /> YOUR LEARNING PATH</span>
          <button className="text-button" onClick={onChangeGoal} type="button"><ArrowLeft size={14} /> Change goal</button>
        </div>
        <div className="roadmap-heading">
          <span className={`large-skill-icon ${goal?.color ?? "orange"}`}><SkillIcon goal={goal} /></span>
          <div>
            <div className="skill-level-label">{goal?.skill} <span>·</span> {roadmap.level}</div>
            <h1>{roadmapPlan.title}</h1>
            <p>{roadmap.personalGoal ? `A path shaped around “${roadmap.personalGoal}”` : "A few small steps to get you moving."}</p>
            <span className={`roadmap-source ${roadmapSource === "gemini" ? "ai-source" : ""}`}>
              {roadmapSource === "gemini" ? "GEMINI-PERSONALIZED" : "CURATED ROADMAP"}
            </span>
          </div>
        </div>
        {roadmapMessage && <p className="roadmap-notice" role="status">{roadmapMessage}</p>}

        <div className="roadmap-overview">
          <div className="overview-item"><span>ESTIMATED</span><strong>About {roadmapPlan.estimatedDays} {roadmapPlan.estimatedDays === 1 ? "day" : "days"}</strong></div>
          <div className="overview-item"><span>DAILY TARGET</span><strong>{roadmapPlan.dailyMinutes} min / day</strong></div>
          <div className="overview-item"><span>PROGRESS</span><strong>{completedTaskCount} / {tasks.length} tasks</strong></div>
          {roadmapPlan.targetDateLabel && <div className="overview-item"><span>TARGET DATE</span><strong>{roadmapPlan.targetDateLabel}</strong></div>}
        </div>
        <div className="roadmap-progress" role="progressbar" aria-label="Roadmap task progress" aria-valuemin={0} aria-valuemax={tasks.length} aria-valuenow={completedTaskCount}>
          <span className="sr-only">{completedTaskCount} of {tasks.length} tasks completed</span>
          <div className="roadmap-progress-track"><span style={{ width: `${(completedTaskCount / tasks.length) * 100}%` }} /></div>
        </div>

        <div className="roadmap-phases">
          {roadmapPlan.phases.map((phase, phaseIndex) => (
            <section className="roadmap-phase" key={phase.id}>
              <div className="phase-heading">
                <span className="phase-number">{String(phaseIndex + 1).padStart(2, "0")}</span>
                <div><span className="section-kicker">PHASE {phaseIndex + 1}</span><h2>{phase.title}</h2></div>
              </div>
              {phase.modules.map((module) => (
                <section className="roadmap-module" key={module.id}>
                  <h3>{module.title}</h3>
                  {module.tasks.map((task) => {
            const status = completedTaskIds.has(task.id)
              ? "completed"
              : task.id === activeTask?.id
                ? "in-progress"
                : task === nextTask
                  ? "available"
                  : "locked";
            return (
              <article className={`roadmap-quest task-card ${status}`} key={task.id}>
                <button
                  className="task-node-button"
                  type="button"
                  disabled={status === "locked"}
                  aria-label={`${task.title}: ${status.replace("-", " ")}`}
                  aria-current={status === "in-progress" ? "step" : undefined}
                  onClick={() => onStartTask(task)}
                >
                  <span className="quest-node">{status === "completed" ? <Check size={15} /> : status === "locked" ? <LockKeyhole size={13} /> : status === "in-progress" ? <span className="active-node" /> : <span>{String(tasks.indexOf(task) + 1).padStart(2, "0")}</span>}</span>
                </button>
                <div className="quest-summary">
                  <div className="quest-title-line">
                    <h4>{task.title}</h4>
                    <span className={`status-pill ${status}`}>{status === "completed" ? "DONE" : status === "available" ? "AVAILABLE" : status === "in-progress" ? "IN PROGRESS" : "LOCKED"}</span>
                  </div>
                  <p>{task.objective}</p>
                  <div className="quest-meta"><Clock3 size={13} /> {task.estimatedMinutes} min<span className="meta-dot">·</span><span>Learning task</span></div>
                  {status !== "locked" && <button className="quest-inline-cta" type="button" onClick={() => onStartTask(task)}>{status === "completed" ? "Review task" : status === "in-progress" ? "Continue task" : "Start task"} <ArrowRight size={14} /></button>}
                </div>
              </article>
            );
          })}
                </section>
              ))}
            </section>
          ))}
        </div>
        <TaskDetail
          task={activeTask}
          isComplete={activeTask ? completedTaskIds.has(activeTask.id) : false}
          feedback={taskFeedback}
          onToggle={onToggleTask}
          onOpenQuiz={(quizId) => {
            const quest = roadmap.quests.find((item) => item.id === quizId);
            if (quest) onStart(quest);
          }}
        />
        <div className={`next-action-card ${complete ? "journey-complete" : ""}`}>
          <div className="next-action-icon">{complete ? <Award size={19} /> : <Target size={19} />}</div>
          <div className="next-action-copy">
            <span>{complete ? "PATH COMPLETE" : "YOUR NEXT SMALL WIN"}</span>
            <strong>{complete ? "Look how far you’ve come." : nextTask.title}</strong>
            <p>{complete ? "You finished every task in this learning path." : nextTask.objective}</p>
          </div>
          {!complete && <button className="primary-button next-action-button" type="button" onClick={() => onStartTask(nextTask)}>Start next task <ArrowRight size={16} /></button>}
          {complete && <span className="complete-stamp"><CheckCircle2 size={16} /> ALL DONE</span>}
        </div>
      </section>
      <aside className="journey-sidebar">
        <section className="daily-plan-card">
          <span className="section-kicker">TODAY’S LEARNING PLAN</span>
          <h2>{roadmapPlan.dailyMinutes} minutes, one step at a time.</h2>
          <p>{dailyPlan.length ? "A short sequence that fits your daily study target." : "Everything in this roadmap is complete. Take a moment to celebrate."}</p>
          {dailyPlan.map((task) => (
            <button className="daily-plan-task" key={task.id} type="button" onClick={() => onStartTask(task)}>
              <span>{task.title}</span><small>{task.estimatedMinutes} min</small>
            </button>
          ))}
        </section>
        <ProfileCard progress={progress} levelNumber={levelNumber} levelProgress={levelProgress} streak={streak} />
        <section className="achievement-card">
          <div className="side-card-heading"><span>YOUR ACHIEVEMENTS</span><span className="achievement-count">{progress.achievementIds.length}</span></div>
          {progress.achievementIds.includes(FIRST_STEP_ACHIEVEMENT) ? (
            <div className="achievement-earned">
              <span className="badge-art"><Sparkles size={19} /></span>
              <span><strong>First Step</strong><small>Your first learning step is complete</small></span>
              <CheckCircle2 className="achievement-check" size={16} />
            </div>
          ) : (
            <div className="achievement-locked">
              <span className="badge-art locked"><Award size={18} /></span>
              <span><strong>First Step</strong><small>Complete a learning task to unlock</small></span>
              <LockKeyhole size={14} />
            </div>
          )}
        </section>
        <div className="encouragement-card">
          <span className="quote-mark">“</span>
          <p>You don’t have to see the whole staircase. Just take the first step.</p>
          <span className="quote-credit">ONE QUEST AT A TIME</span>
        </div>
        {reward && <div className="xp-toast" role="status"><Zap size={16} /> +20 XP <span>Step complete!</span></div>}
      </aside>
    </div>
  );
}

function QuestView({
  quest, goal, selectedAnswer, setSelectedAnswer, feedback, answerSubmitting, onSubmit, onBack, onContinue,
  nextQuest, progress, completedCount,
}) {
  const isCompleted = feedback?.correct;
  const levelNumber = Math.floor(progress.xp / 100) + 1;
  const levelProgress = progress.xp % 100;
  const streak = getStreak(progress.activityDates);
  return (
    <div className="quest-view">
      <div className="quest-view-top">
        <button className="text-button" type="button" onClick={onBack}><ArrowLeft size={14} /> Back to your path</button>
        <span className="quest-number">{String(completedCount + (isCompleted ? 0 : 1)).padStart(2, "0")} <span>/ {isCompleted ? "QUEST COMPLETE" : "YOUR NEXT QUEST"}</span></span>
      </div>
      <div className="quest-content-grid">
        <section className="lesson-panel">
          <div className="lesson-eyebrow"><BookOpen size={14} /> {goal?.skill ?? "LEARNING QUEST"} <span>·</span> {quest.duration}</div>
          <h1>{quest.title}</h1>
          <p className="lesson-objective">{quest.objective}</p>
          <div className="lesson-example">
            <div className="example-topline"><span><i /><i /><i /></span><span>YOUR FIRST LOOK</span></div>
            <div className="example-body">
              <span className="code-line-number">01</span>
              <code>{quest.task}</code>
            </div>
          </div>
          <div className="lesson-note"><Sparkles size={15} /><p>Take a breath. This is just a small first step — you don’t need to know everything yet.</p></div>
          <ProfileCard progress={progress} levelNumber={levelNumber} levelProgress={levelProgress} streak={streak} compact />
        </section>
        <section className="quiz-panel">
          <div className="quiz-step"><span>YOUR TURN</span><span>+20 XP</span></div>
          <h2>{quest.question}</h2>
          <form onSubmit={onSubmit}>
            <div className="answer-list" role="radiogroup" aria-label="Choose your answer">
              {quest.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selectedAnswer === index}
                  disabled={isCompleted || answerSubmitting}
                  className={`answer-option ${selectedAnswer === index ? "selected" : ""} ${feedback && selectedAnswer === index ? (feedback.correct ? "answer-correct" : "answer-incorrect") : ""}`}
                  onClick={() => { setSelectedAnswer(index); if (feedback && !feedback.correct) setFeedback(null); }}
                >
                  <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                  {selectedAnswer === index && <span className="answer-radio" />}
                </button>
              ))}
            </div>
            {feedback && (
              <div className={`feedback-box ${feedback.correct ? "success" : "try-again"}`} role="status">
                {feedback.correct ? <CheckCircle2 size={17} /> : <CircleHelp size={17} />}
                <div><strong>{feedback.correct ? "That’s exactly right!" : "Almost there."}</strong><p>{feedback.correct ? feedback.text : `${feedback.text} ${quest.explanation}`}</p></div>
              </div>
            )}
            {isCompleted ? (
              <button className="primary-button quiz-submit" type="button" onClick={onContinue}>
                {nextQuest ? "Continue your path" : "See your progress"} <ArrowRight size={16} />
              </button>
            ) : (
              <button className="primary-button quiz-submit" type="submit" disabled={selectedAnswer === null || answerSubmitting}>
                {answerSubmitting ? "Saving your progress…" : "Check my answer"} <ArrowRight size={16} />
              </button>
            )}
            <p className="quiz-reassurance"><CheckCircle2 size={13} /> You can try again if you need to.</p>
          </form>
        </section>
      </div>
      <div className="quest-footer">
        <span><span className="quest-footer-dot" /> PROGRESS SAVES AUTOMATICALLY</span>
        <span>Small steps add up.</span>
      </div>
    </div>
  );
}

export default App;
