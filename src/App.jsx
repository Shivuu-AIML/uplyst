import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Flame,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { createRoadmap, goals, validateRoadmap } from "./roadmaps.js";

const STORAGE_KEY = "firststep-progress-v1";
const FIRST_STEP_ACHIEVEMENT = "first-step";

function freshProgress() {
  return {
    skill: null,
    level: "beginner",
    roadmap: null,
    completedIds: [],
    xp: 0,
    achievementIds: [],
    activityDates: [],
    currentQuestId: null,
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
    const roadmap = valid && validateRoadmap(parsed.roadmap) ? parsed.roadmap : null;
    return {
      failed: false,
      progress: {
        ...freshProgress(),
        ...parsed,
        roadmap,
        skill: roadmap ? parsed.skill : null,
        completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds.filter((id) => typeof id === "string") : [],
        achievementIds: Array.isArray(parsed.achievementIds)
          ? parsed.achievementIds.filter((id) => typeof id === "string")
          : [],
        activityDates: Array.isArray(parsed.activityDates)
          ? parsed.activityDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
          : [],
        xp: Number.isFinite(parsed.xp) && parsed.xp >= 0 ? parsed.xp : 0,
        level: parsed.level === "intermediate" ? "intermediate" : "beginner",
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
  const [selectedSkill, setSelectedSkill] = useState(initial.progress.skill ?? "java");
  const [selectedLevel, setSelectedLevel] = useState(initial.progress.level);
  const [personalGoal, setPersonalGoal] = useState(initial.progress.roadmap?.personalGoal ?? "");
  const [activeQuestId, setActiveQuestId] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [reward, setReward] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setPersistenceError(false);
    } catch {
      setPersistenceError(true);
    }
  }, [progress]);

  const roadmap = progress.roadmap;
  const completed = new Set(progress.completedIds);
  const completedCount = roadmap ? roadmap.quests.filter((quest) => completed.has(quest.id)).length : 0;
  const nextQuest = roadmap?.quests.find((quest) => !completed.has(quest.id)) ?? null;
  const activeQuest = roadmap?.quests.find((quest) => quest.id === activeQuestId) ?? null;
  const levelNumber = Math.floor(progress.xp / 100) + 1;
  const levelProgress = progress.xp % 100;
  const streak = getStreak(progress.activityDates);
  const currentGoal = goals.find((goal) => goal.id === roadmap?.skill);

  function buildPath(event) {
    event.preventDefault();
    const nextRoadmap = createRoadmap(selectedSkill, selectedLevel, personalGoal);
    if (!validateRoadmap(nextRoadmap)) {
      setPersistenceError(true);
      return;
    }
    setProgress({
      ...freshProgress(),
      skill: selectedSkill,
      level: selectedLevel,
      roadmap: nextRoadmap,
      currentQuestId: nextRoadmap.quests[0].id,
    });
    setActiveQuestId(null);
    setFeedback(null);
  }

  function startQuest(quest) {
    if (!quest || completed.has(quest.id)) return;
    setProgress((current) => ({ ...current, currentQuestId: quest.id }));
    setActiveQuestId(quest.id);
    setSelectedAnswer(null);
    setFeedback(null);
  }

  function answerQuest(event) {
    event.preventDefault();
    if (!activeQuest || selectedAnswer === null) return;
    if (selectedAnswer !== activeQuest.answer) {
      setFeedback({ correct: false, text: "Not quite. Take another look, then give it another try." });
      return;
    }
    if (completed.has(activeQuest.id)) return;

    const today = localDateKey();
    const nextCompleted = [...progress.completedIds, activeQuest.id];
    const nextAchievements = progress.achievementIds.includes(FIRST_STEP_ACHIEVEMENT)
      ? progress.achievementIds
      : [...progress.achievementIds, FIRST_STEP_ACHIEVEMENT];
    const nextQuestId = roadmap.quests.find((quest) => !nextCompleted.includes(quest.id))?.id ?? null;
    setProgress((current) => ({
      ...current,
      completedIds: nextCompleted,
      xp: current.xp + 20,
      achievementIds: nextAchievements,
      activityDates: current.activityDates.includes(today)
        ? current.activityDates
        : [...current.activityDates, today],
      currentQuestId: nextQuestId,
    }));
    setFeedback({ correct: true, text: activeQuest.explanation });
    setReward(true);
    window.setTimeout(() => setReward(false), 1600);
  }

  function continueJourney() {
    setFeedback(null);
    if (nextQuest) startQuest(nextQuest);
    else setActiveQuestId(null);
  }

  function resetDemo() {
    setProgress(freshProgress());
    setSelectedSkill("java");
    setSelectedLevel("beginner");
    setPersonalGoal("");
    setActiveQuestId(null);
    setFeedback(null);
    setSelectedAnswer(null);
    setResetConfirm(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()} aria-label="FirstStep home">
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.5} /></span>
          <span>firststep<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-right">
          {roadmap && (
            <div className="header-progress" aria-label={`${completedCount} of ${roadmap.quests.length} quests complete`}>
              <span>{completedCount}/{roadmap.quests.length} quests</span>
              <span className="header-progress-track"><span style={{ width: `${(completedCount / roadmap.quests.length) * 100}%` }} /></span>
            </div>
          )}
          {roadmap && (
            <button className="reset-button" type="button" onClick={() => setResetConfirm(true)}>
              <RotateCcw size={14} /> <span>Reset demo</span>
            </button>
          )}
        </div>
      </header>

      {persistenceError && (
        <div className="storage-notice" role="status">
          Progress could not be saved in this browser. You can keep going, but it may not survive a refresh.
        </div>
      )}

      <main className={`main-content ${!roadmap ? "welcome-main" : ""}`}>
        {!roadmap ? (
          <section className="welcome-layout">
            <div className="welcome-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT CHAPTER STARTS HERE</div>
              <h1>Every skill<br />starts <span>somewhere.</span></h1>
              <p className="welcome-subtitle">Tell us what you want to learn. We’ll help you take the first step.</p>
              <div className="welcome-proof">
                <div className="avatar-stack" aria-hidden="true"><span>J</span><span>M</span><span>A</span></div>
                <span>A little progress goes a long way.</span>
              </div>
              <div className="welcome-spark" aria-hidden="true"><div /><div /><div /></div>
            </div>

            <form className="goal-card" onSubmit={buildPath}>
              <div className="card-topline">
                <span className="step-counter">01 <span>/ 02</span></span>
                <span className="curated-label"><span /> PERSONALIZED FOR YOU</span>
              </div>
              <h2>What would you like to learn?</h2>
              <p className="card-caption">Pick a skill. We’ll make the first step feel easy.</p>
              <div className="goal-grid" role="radiogroup" aria-label="Choose a learning goal">
                {goals.map((goal) => (
                  <button
                    className={`goal-option ${selectedSkill === goal.id ? "selected" : ""}`}
                    type="button"
                    role="radio"
                    aria-checked={selectedSkill === goal.id}
                    key={goal.id}
                    onClick={() => setSelectedSkill(goal.id)}
                  >
                    <span className={`goal-icon ${goal.color}`}>{goal.icon}</span>
                    <span>{goal.skill === "UI/UX design" ? "UI/UX design" : goal.skill === "Public speaking" ? "Public speaking" : `Learn ${goal.skill}`}</span>
                    <span className="goal-check"><Check size={12} /></span>
                  </button>
                ))}
              </div>
              <div className="form-divider" />
              <div className="selector-row">
                <div>
                  <label className="field-label" htmlFor="level-choice">YOUR EXPERIENCE</label>
                  <select id="level-choice" value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                  </select>
                </div>
                <div className="level-hint"><CircleHelp size={14} /><span>We’ll meet you where you are.</span></div>
              </div>
              <label className="field-label goal-label" htmlFor="personal-goal">A LITTLE MORE ABOUT YOUR GOAL <span>OPTIONAL</span></label>
              <input
                id="personal-goal"
                className="goal-input"
                maxLength={90}
                placeholder="e.g. Build a portfolio project"
                value={personalGoal}
                onChange={(event) => setPersonalGoal(event.target.value)}
              />
              <button className="primary-button build-button" type="submit">
                Build my learning path <ArrowRight size={17} />
              </button>
              <p className="privacy-note"><CheckCircle2 size={13} /> No account needed. Your progress stays on this device.</p>
            </form>
          </section>
        ) : activeQuest ? (
          <QuestView
            quest={activeQuest}
            goal={currentGoal}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            feedback={feedback}
            onSubmit={answerQuest}
            onBack={() => { setActiveQuestId(null); setFeedback(null); }}
            onContinue={continueJourney}
            nextQuest={nextQuest}
            progress={progress}
            completedCount={completedCount}
          />
        ) : (
          <JourneyView
            roadmap={roadmap}
            goal={currentGoal}
            progress={progress}
            completed={completed}
            completedCount={completedCount}
            levelNumber={levelNumber}
            levelProgress={levelProgress}
            streak={streak}
            nextQuest={nextQuest}
            reward={reward}
            onStart={startQuest}
            onChangeGoal={() => { setProgress(freshProgress()); setSelectedSkill("java"); setSelectedLevel("beginner"); }}
          />
        )}
      </main>

      <footer className="site-footer">
        <span>© 2025 FirstStep</span>
        <span>Small steps. Real momentum.</span>
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

function JourneyView({
  roadmap, goal, progress, completed, completedCount, levelNumber, levelProgress, streak, nextQuest, reward, onStart, onChangeGoal,
}) {
  const complete = !nextQuest;
  return (
    <div className="journey-layout">
      <section className="journey-main">
        <div className="journey-topline">
          <span className="eyebrow"><span className="eyebrow-line" /> YOUR LEARNING PATH</span>
          <button className="text-button" onClick={onChangeGoal} type="button"><ArrowLeft size={14} /> Change goal</button>
        </div>
        <div className="roadmap-heading">
          <span className={`large-skill-icon ${goal?.color ?? "orange"}`}>{goal?.icon}</span>
          <div>
            <div className="skill-level-label">{goal?.skill} <span>·</span> {roadmap.level}</div>
            <h1>{roadmap.title}</h1>
            <p>{roadmap.personalGoal ? `A path shaped around “${roadmap.personalGoal}”` : "A few small steps to get you moving."}</p>
          </div>
        </div>

        <div className="roadmap-progress">
          <div><span>YOUR PROGRESS</span><strong>{completedCount} <span>/ {roadmap.quests.length} quests</span></strong></div>
          <div className="roadmap-progress-track"><span style={{ width: `${(completedCount / roadmap.quests.length) * 100}%` }} /></div>
        </div>

        <div className="quest-list">
          {roadmap.quests.map((quest, index) => {
            const status = completed.has(quest.id) ? "completed" : quest === nextQuest ? "available" : "locked";
            return (
              <article className={`roadmap-quest ${status}`} key={quest.id}>
                <div className="quest-rail">
                  <span className="quest-node">{status === "completed" ? <Check size={15} /> : status === "locked" ? <LockKeyhole size={13} /> : <span>{String(index + 1).padStart(2, "0")}</span>}</span>
                  {index < roadmap.quests.length - 1 && <span className="quest-connector" />}
                </div>
                <div className="quest-summary">
                  <div className="quest-title-line">
                    <h3>{quest.title}</h3>
                    <span className={`status-pill ${status}`}>{status === "completed" ? "DONE" : status === "available" ? "UP NEXT" : "LOCKED"}</span>
                  </div>
                  <p>{quest.objective}</p>
                  <div className="quest-meta"><Clock3 size={13} /> {quest.duration}<span className="meta-dot">·</span><span>+20 XP</span></div>
                  {status === "available" && (
                    <button className="quest-inline-cta" type="button" onClick={() => onStart(quest)}>
                      Start this quest <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <div className={`next-action-card ${complete ? "journey-complete" : ""}`}>
          <div className="next-action-icon">{complete ? <Award size={19} /> : <Target size={19} />}</div>
          <div className="next-action-copy">
            <span>{complete ? "PATH COMPLETE" : "YOUR NEXT SMALL WIN"}</span>
            <strong>{complete ? "Look how far you’ve come." : nextQuest.title}</strong>
            <p>{complete ? "You finished every quest in this learning path." : nextQuest.objective}</p>
          </div>
          {!complete && <button className="primary-button next-action-button" type="button" onClick={() => onStart(nextQuest)}>Start next quest <ArrowRight size={16} /></button>}
          {complete && <span className="complete-stamp"><CheckCircle2 size={16} /> ALL DONE</span>}
        </div>
      </section>
      <aside className="journey-sidebar">
        <ProfileCard progress={progress} levelNumber={levelNumber} levelProgress={levelProgress} streak={streak} />
        <section className="achievement-card">
          <div className="side-card-heading"><span>YOUR ACHIEVEMENTS</span><span className="achievement-count">{progress.achievementIds.length}</span></div>
          {progress.achievementIds.includes(FIRST_STEP_ACHIEVEMENT) ? (
            <div className="achievement-earned">
              <span className="badge-art"><Sparkles size={19} /></span>
              <span><strong>First Step</strong><small>Your first quest is complete</small></span>
              <CheckCircle2 className="achievement-check" size={16} />
            </div>
          ) : (
            <div className="achievement-locked">
              <span className="badge-art locked"><Award size={18} /></span>
              <span><strong>First Step</strong><small>Complete a quest to unlock</small></span>
              <LockKeyhole size={14} />
            </div>
          )}
        </section>
        <div className="encouragement-card">
          <span className="quote-mark">“</span>
          <p>You don’t have to see the whole staircase. Just take the first step.</p>
          <span className="quote-credit">ONE QUEST AT A TIME</span>
        </div>
        {reward && <div className="xp-toast" role="status"><Zap size={16} /> +20 XP <span>Quest complete!</span></div>}
      </aside>
    </div>
  );
}

function QuestView({
  quest, goal, selectedAnswer, setSelectedAnswer, feedback, onSubmit, onBack, onContinue, nextQuest, progress, completedCount,
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
                  disabled={isCompleted}
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
              <button className="primary-button quiz-submit" type="submit" disabled={selectedAnswer === null}>
                Check my answer <ArrowRight size={16} />
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
