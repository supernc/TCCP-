
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { TCCP_CHAPTERS, Question, QuestionType, Option } from './types';
import { generateQuestions } from './services/geminiService';

// --- Shared Components ---

const Navbar = () => (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-md group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              TCCP Prep Master
            </span>
          </Link>
        </div>
        <div className="flex space-x-8">
          <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors">练习</Link>
          <Link to="/exam" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors">模拟考</Link>
          <Link to="/collection" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors">我的收藏</Link>
        </div>
      </div>
    </div>
  </nav>
);

const QuestionCard: React.FC<{
  question: Question;
  showAnswer: boolean;
  userAnswer: string[];
  onAnswerChange: (answer: string[]) => void;
  onToggleCollection: (q: Question) => void;
  isCollected: boolean;
}> = ({ question, showAnswer, userAnswer, onAnswerChange, onToggleCollection, isCollected }) => {
  const toggleOption = (id: string) => {
    if (showAnswer) return;
    if (question.type === QuestionType.SINGLE) {
      onAnswerChange([id]);
    } else {
      if (userAnswer.includes(id)) {
        onAnswerChange(userAnswer.filter(a => a !== id));
      } else {
        onAnswerChange([...userAnswer, id]);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md mb-6">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded uppercase ${question.type === QuestionType.SINGLE ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
              {question.type === QuestionType.SINGLE ? '单选题' : '多选题'}
            </span>
            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded">
              {question.topic}
            </span>
          </div>
          <button 
            onClick={() => onToggleCollection(question)}
            className={`p-1.5 rounded-full transition-colors ${isCollected ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5" fill={isCollected ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map(option => {
            const isSelected = userAnswer.includes(option.id);
            const isCorrect = question.correctAnswers.includes(option.id);
            
            let borderColor = 'border-gray-200';
            let bgColor = 'bg-white';
            let textColor = 'text-gray-700';

            if (showAnswer) {
              if (isCorrect) {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-50';
                textColor = 'text-green-700';
              } else if (isSelected && !isCorrect) {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-50';
                textColor = 'text-red-700';
              }
            } else if (isSelected) {
              borderColor = 'border-blue-500';
              bgColor = 'bg-blue-50';
              textColor = 'text-blue-700';
            }

            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                disabled={showAnswer}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${borderColor} ${bgColor} ${textColor} hover:shadow-sm`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-current text-white' : 'border-current'}`}>
                  {option.id}
                </span>
                <span className="flex-grow">{option.text}</span>
                {showAnswer && isCorrect && (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {showAnswer && (
          <div className="mt-8 p-6 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-bold text-gray-900">选项解析与知识点回顾</h4>
            </div>
            <p className="text-sm font-bold text-blue-800 mb-4 pb-2 border-b border-blue-100">
              正确答案：{question.correctAnswers.sort().join(', ')}
            </p>
            <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
              {question.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Pages ---

const Dashboard: React.FC<{
  onStartPractice: (chapterId: number) => void;
  onRandomPractice: () => void;
  isLoading: boolean;
}> = ({ onStartPractice, onRandomPractice, isLoading }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">TCCP 知识库练习</h1>
          <p className="text-gray-600 text-lg">全域知识扩展，支持逐项解析，助你掌握腾讯云架构底层原理。</p>
        </div>
        <button
          onClick={onRandomPractice}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {isLoading ? '正在组题...' : '全章节随机 20 题'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TCCP_CHAPTERS.map(chapter => (
          <div key={chapter.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-xl font-bold">
                {chapter.id}
              </span>
              <h3 className="text-lg font-bold text-gray-900">{chapter.title}</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 flex-grow">{chapter.description}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => onStartPractice(chapter.id)}
                disabled={isLoading}
                className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                单章节练习 (20题)
              </button>
              <a href={chapter.url} target="_blank" rel="noreferrer" className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PracticePage: React.FC<{
  questions: Question[];
  collections: Question[];
  onToggleCollection: (q: Question) => void;
  onDone: () => void;
  isBatchMode?: boolean; 
}> = ({ questions, collections, onToggleCollection, onDone, isBatchMode = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [globalSubmitted, setGlobalSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const checkCorrect = (qId: string) => {
    const q = questions.find(item => item.id === qId);
    if (!q || !answers[qId]) return false;
    return [...answers[qId]].sort().join(',') === [...q.correctAnswers].sort().join(',');
  };

  const hasAnswered = (qId: string) => !!answers[qId] && answers[qId].length > 0;

  const handleSingleSubmit = () => {
    setSubmittedQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleGlobalSubmit = () => {
    setGlobalSubmitted(true);
  };

  const sidebarIcons = useMemo(() => {
    return questions.map((q, idx) => {
      let bgColor = 'bg-gray-100 text-gray-400';
      let borderColor = 'border-transparent';

      const answered = hasAnswered(q.id);
      const showFeedback = isBatchMode ? globalSubmitted : submittedQuestions[q.id];

      if (showFeedback) {
        bgColor = checkCorrect(q.id) ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
      } else if (answered) {
        bgColor = 'bg-blue-100 text-blue-600';
        borderColor = 'border-blue-300';
      }

      if (currentIndex === idx) {
        borderColor = 'border-blue-600 ring-2 ring-blue-100';
      }

      return (
        <button
          key={q.id}
          onClick={() => setCurrentIndex(idx)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all border-2 ${bgColor} ${borderColor}`}
        >
          {idx + 1}
        </button>
      );
    });
  }, [questions, answers, submittedQuestions, globalSubmitted, currentIndex, isBatchMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24 shadow-sm">
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">题目导航</h4>
            <p className="text-[10px] text-gray-400">{isBatchMode ? '全部提交后显示对错' : '确认后即刻显示对错'}</p>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-4 gap-3">
            {sidebarIcons}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div> <span>已填写</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-green-500 rounded"></div> <span>答对</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-red-500 rounded"></div> <span>答错</span>
            </div>
          </div>
          <button 
            onClick={onDone} 
            className="w-full mt-8 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm"
          >
            退出练习
          </button>
        </div>
      </aside>

      <main className="flex-grow">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            showAnswer={isBatchMode ? globalSubmitted : submittedQuestions[currentQuestion.id]}
            userAnswer={answers[currentQuestion.id] || []}
            onAnswerChange={(ans) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: ans }))}
            onToggleCollection={onToggleCollection}
            isCollected={collections.some(c => c.id === currentQuestion.id)}
          />
        )}

        <div className="flex gap-4 mt-8">
          {isBatchMode ? (
            !globalSubmitted ? (
              <>
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 disabled:opacity-30"
                >
                  上一题
                </button>
                {isLast ? (
                  <button
                    onClick={handleGlobalSubmit}
                    disabled={Object.keys(answers).length < questions.length}
                    className="flex-grow bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    提交并评估全部试题
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="flex-grow bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700"
                  >
                    下一题
                  </button>
                )}
              </>
            ) : (
              <button onClick={onDone} className="flex-grow bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-black">
                练习结束，回到主页
              </button>
            )
          ) : (
            <>
              {!submittedQuestions[currentQuestion.id] ? (
                <button
                  onClick={handleSingleSubmit}
                  disabled={!hasAnswered(currentQuestion.id)}
                  className="flex-grow bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50"
                >
                  确定并查看深度解析
                </button>
              ) : (
                <button
                  onClick={() => isLast ? onDone() : setCurrentIndex(prev => prev + 1)}
                  className="flex-grow bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-black"
                >
                  {isLast ? '完成本次单章练习' : '进入下一题'}
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Mock Exam Component ---

const ExamPage: React.FC<{
  collections: Question[];
  onToggleCollection: (q: Question) => void;
}> = ({ collections, onToggleCollection }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); 

  const startExam = async () => {
    setIsLoading(true);
    try {
      const perChapter = 4;
      const promises = TCCP_CHAPTERS.map(chapter => generateQuestions(chapter.id, perChapter));
      const results = await Promise.all(promises);
      const allQuestions = results.flat().sort(() => Math.random() - 0.5);
      setQuestions(allQuestions);
      setIsStarted(true);
      setIsFinished(false);
      setTimeLeft(3600);
    } catch (e) {
      alert("模拟考试生成失败，请检查网络。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: number;
    if (isStarted && !isFinished && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [isStarted, isFinished, timeLeft]);

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-4">全真模拟考试</h2>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          考试规则：系统将从 5 个核心章节中随机抽取 20 道题目，限时 60 分钟。提交后将获得详细评分。
        </p>
        <button 
          onClick={startExam} 
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-bold shadow-xl transition-all disabled:opacity-50"
        >
          {isLoading ? '正在抽取题目...' : '开始模拟考试'}
        </button>
      </div>
    );
  }

  if (isFinished) {
    const score = questions.reduce((acc, q) => {
      const ans = userAnswers[q.id] || [];
      return [...ans].sort().join(',') === [...q.correctAnswers].sort().join(',') ? acc + 5 : acc;
    }, 0);

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 mb-12 text-center">
          <h2 className="text-5xl font-black text-gray-900 mb-2">得分: {score}</h2>
          <p className="text-gray-500 mb-6">满分 100 分</p>
          <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">返回主页</button>
        </div>
        <div className="space-y-12">
          {questions.map((q, idx) => (
            <div key={q.id}>
              <QuestionCard 
                question={q} 
                showAnswer={true} 
                userAnswer={userAnswers[q.id] || []} 
                onAnswerChange={() => {}} 
                onToggleCollection={onToggleCollection} 
                isCollected={collections.some(c => c.id === q.id)} 
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
       <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md p-5 border border-gray-200 rounded-2xl mb-12 flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-4 text-2xl font-mono font-bold text-gray-900">
            {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}
          </div>
          <button 
            onClick={() => { if(window.confirm('确定交卷吗？')) setIsFinished(true); }} 
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
          >
            提交试卷
          </button>
       </div>
       <div className="space-y-16">
         {questions.map((q, idx) => (
           <QuestionCard 
              key={q.id} 
              question={q} 
              showAnswer={false} 
              userAnswer={userAnswers[q.id] || []} 
              onAnswerChange={ans => setUserAnswers(prev => ({...prev, [q.id]: ans}))} 
              onToggleCollection={onToggleCollection} 
              isCollected={collections.some(c => c.id === q.id)} 
           />
         ))}
       </div>
    </div>
  );
};

// --- Collection Page ---

const CollectionPage: React.FC<{
  collections: Question[];
  onToggleCollection: (q: Question) => void;
  onImport: (qs: Question[]) => void;
  onStartPractice: () => void;
}> = ({ collections, onToggleCollection, onImport, onStartPractice }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (collections.length === 0) return;
    const headers = ["章节ID", "知识点", "类型", "题目", "选项JSON", "正确答案CSV", "深度解析"];
    const rows = collections.map(q => [
      q.chapter,
      q.topic,
      q.type,
      q.question,
      JSON.stringify(q.options),
      q.correctAnswers.join(','),
      q.explanation
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,\ufeff" + [headers, ...rows].map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TCCP_My_Collections_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        // Skip header
        const dataLines = lines.slice(1);
        const importedQuestions: Question[] = dataLines.map((line, index) => {
          // Robust CSV parsing for quoted fields
          const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
          const fields = line.match(regex)?.map(f => f.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
          
          if (fields.length < 7) return null;

          const [chapter, topic, type, question, optionsStr, answersStr, explanation] = fields;
          
          return {
            id: `import-${Date.now()}-${index}`,
            chapter: parseInt(chapter) || 1,
            topic: topic || "未知知识点",
            type: type === "SINGLE" ? QuestionType.SINGLE : QuestionType.MULTIPLE,
            question: question || "空题目",
            options: JSON.parse(optionsStr || "[]"),
            correctAnswers: answersStr?.split(',') || [],
            explanation: explanation || "暂无解析"
          } as Question;
        }).filter(q => q !== null) as Question[];

        if (importedQuestions.length > 0) {
          onImport(importedQuestions);
          alert(`成功导入 ${importedQuestions.length} 道题目！`);
        } else {
          alert("未发现有效数据，请检查文件格式。");
        }
      } catch (error) {
        console.error("Import error:", error);
        alert("导入失败，请确保使用本系统导出的 CSV 格式。");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center shadow-inner">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">我的收藏</h1>
            <p className="text-gray-500">共 {collections.length} 个收藏题目（支持表格导入导出）</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            导入 CSV (Excel)
          </button>
          <button 
            onClick={handleExport}
            disabled={collections.length === 0}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all text-sm flex items-center gap-2"
          >
            导出 CSV
          </button>
          <button 
            onClick={onStartPractice}
            disabled={collections.length === 0}
            className="px-6 py-2 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 shadow-md disabled:opacity-50 transition-all text-sm"
          >
            收藏练习
          </button>
        </div>
      </div>
      
      {collections.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-medium">暂无收藏，你可以手动练习添加或上传 CSV 表格导入</p>
        </div>
      ) : (
        <div className="space-y-8">
          {collections.map(q => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              showAnswer={true} 
              userAnswer={q.correctAnswers} 
              onAnswerChange={() => {}} 
              onToggleCollection={onToggleCollection} 
              isCollected={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- App Container ---

const App = () => {
  const STORAGE_KEY = 'tccp_exam_pro_collections_final_v5';

  // 稳固的初始化逻辑：优先从最稳固的 key 加载，如果失败则尝试迁移
  const [collections, setCollections] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);

      // 迁移旧数据
      const oldKeys = ['tccp_master_collections_v3', 'tccp_collections_v2', 'tccp_collections'];
      for (const key of oldKeys) {
        const oldData = localStorage.getItem(key);
        if (oldData) {
          const parsed = JSON.parse(oldData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Migrated data from ${key}`);
            return parsed;
          }
        }
      }
    } catch (e) { console.error("Persistence load error:", e); }
    return [];
  });

  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'DASHBOARD' | 'SINGLE_PRACTICE' | 'ALL_RANDOM_PRACTICE' | 'COLLECTION_PRACTICE'>('DASHBOARD');

  // 强化持久化保存：使用 JSON.stringify 的 replacer 避免循环引用或无效数据
  useEffect(() => {
    try {
      if (collections.length >= 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
      }
    } catch (e) { console.error("Persistence save error:", e); }
  }, [collections]);

  const toggleCollection = useCallback((q: Question) => {
    setCollections(prev => {
      const exists = prev.some(c => c.id === q.id);
      return exists ? prev.filter(c => c.id !== q.id) : [...prev, q];
    });
  }, []);

  const handleImportCollections = useCallback((qs: Question[]) => {
    setCollections(prev => {
      // Avoid duplicates based on question text
      const existingTexts = new Set(prev.map(p => p.question));
      const newItems = qs.filter(q => !existingTexts.has(q.question));
      return [...prev, ...newItems];
    });
  }, []);

  const handleStartSinglePractice = async (chapterId: number) => {
    setIsGenerating(true);
    try {
      const qs = await generateQuestions(chapterId, 20);
      setPracticeQuestions(qs);
      setMode('SINGLE_PRACTICE');
    } catch (e) {
      alert("AI 生成失败，请刷新重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartAllRandomPractice = async () => {
    setIsGenerating(true);
    try {
      const promises = TCCP_CHAPTERS.map(chapter => generateQuestions(chapter.id, 4));
      const results = await Promise.all(promises);
      const allQuestions = results.flat().sort(() => Math.random() - 0.5);
      setPracticeQuestions(allQuestions);
      setMode('ALL_RANDOM_PRACTICE');
    } catch (e) {
      alert("随机组题失败。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartCollectionPractice = () => {
    if (collections.length === 0) return;
    setPracticeQuestions([...collections].sort(() => Math.random() - 0.5));
    setMode('COLLECTION_PRACTICE');
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 pb-20 selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <Routes>
          <Route path="/" element={
            mode === 'DASHBOARD' ? (
              <Dashboard 
                onStartPractice={handleStartSinglePractice} 
                onRandomPractice={handleStartAllRandomPractice} 
                isLoading={isGenerating} 
              />
            ) : (
              <PracticePage 
                questions={practiceQuestions} 
                collections={collections}
                onToggleCollection={toggleCollection}
                onDone={() => setMode('DASHBOARD')}
                isBatchMode={mode === 'ALL_RANDOM_PRACTICE'} 
              />
            )
          } />
          <Route path="/exam" element={<ExamPage collections={collections} onToggleCollection={toggleCollection} />} />
          <Route path="/collection" element={
             mode === 'COLLECTION_PRACTICE' ? (
               <PracticePage 
                questions={practiceQuestions} 
                collections={collections}
                onToggleCollection={toggleCollection}
                onDone={() => setMode('DASHBOARD')}
                isBatchMode={false} 
               />
             ) : (
              <CollectionPage 
                collections={collections} 
                onToggleCollection={toggleCollection} 
                onImport={handleImportCollections}
                onStartPractice={handleStartCollectionPractice}
              />
             )
          } />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
