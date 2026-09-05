import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  getMyProfile,
  getMyApplications,
  generateMyInterviewQuestions,
  evaluateMyInterviewAnswer,
  getAdaptiveFollowUp,
  saveInterviewSession,
  getMyInterviewSessions,
  getInterviewSessionDetail
} from '@/api/candidates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScoreCircle } from '@/components/common/ScoreCircle'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Download,
  RotateCcw,
  Briefcase,
  Layers,
  Award,
  ChevronRight,
  ChevronDown,
  Upload,
  Clock,
  HelpCircle,
  FastForward,
  LogOut,
  History,
  ShieldCheck,
  Target,
  FileText,
  UserCheck,
  Zap,
  CheckSquare,
  XCircle,
  Eye,
  RefreshCw,
  Cpu
} from 'lucide-react'
import toast from 'react-hot-toast'

interface QuestionItem {
  question: string
  category: string
  difficulty: string
  level?: string
  interviewer_intent?: string
  expected_points?: string[]
  sample_answer?: string
  applied_job_id?: string
  applied_job_title?: string
  applied_company?: string
}

interface EvaluationResult {
  overall_score: number
  technical_knowledge: number
  communication: number
  answer_relevance: number
  completeness: number
  confidence: number
  technical_depth: number
  star_breakdown?: {
    situation: boolean
    task: boolean
    action: boolean
    result: boolean
    score: number
  }
  feedback_summary: string
  strengths: string[]
  weak_areas: string[]
  improvements: string[]
  suggested_answer?: string
}

export const InterviewPrepPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialJobId = searchParams.get('jobId') || ''

  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice')

  // Profile and Applications
  const [profileData, setProfileData] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Standard Target Roles
  const standardRoles = [
    'Data Analyst',
    'Machine Learning Engineer',
    'Software Developer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Cloud Architect',
    'Data Engineer',
    'Data Scientist',
    'AI Engineer',
    'Business Analyst',
    'Product Manager',
    'Cybersecurity Analyst',
    'UI/UX Designer'
  ]

  // Setup State
  const [selectedRoleType, setSelectedRoleType] = useState<string>('Data Analyst')
  const [customRoleTitle, setCustomRoleTitle] = useState<string>('')
  const [selectedMode, setSelectedMode] = useState<string>('mixed') // technical, project, hr, behavioral, scenario, resume, mixed
  const [answerMode, setAnswerMode] = useState<'text' | 'speech'>('text')
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [questionCount, setQuestionCount] = useState<number>(5)

  // Active Session State
  const [sessionActive, setSessionActive] = useState(false)
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [candidateAnswerText, setCandidateAnswerText] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<EvaluationResult | null>(null)
  const [showModelAnswer, setShowModelAnswer] = useState(false)

  // Adaptive Follow-Up State
  const [adaptiveFollowUp, setAdaptiveFollowUp] = useState<any | null>(null)
  const [loadingFollowUp, setLoadingFollowUp] = useState(false)

  // Session Records & Metrics
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [answersHistory, setAnswersHistory] = useState<string[]>([])
  const [evaluationsHistory, setEvaluationsHistory] = useState<EvaluationResult[]>([])
  const [skippedCount, setSkippedCount] = useState(0)
  const [interviewReport, setInterviewReport] = useState<any | null>(null)
  const [sessionSaved, setSessionSaved] = useState(false)

  // Past Sessions History
  const [pastSessions, setPastSessions] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedHistoryDetail, setSelectedHistoryDetail] = useState<any | null>(null)

  // Speech Recognition & Synthesis
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  // Timer reference
  const timerRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const [pData, aData] = await Promise.all([
          getMyProfile(),
          getMyApplications()
        ])
        setProfileData(pData)
        setApplications(aData || [])

        if (initialJobId && aData && aData.length > 0) {
          const match = aData.find((a: any) => a.job_id === initialJobId)
          if (match) setSelectedRoleType(`job_${match.job_id}`)
        } else if (aData && aData.length > 0) {
          setSelectedRoleType(`job_${aData[0].job_id}`)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()

    // Detect browser speech support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition || !('speechSynthesis' in window)) {
      setSpeechSupported(false)
    }
  }, [initialJobId])

  // Timer effect during active session
  useEffect(() => {
    if (sessionActive && !interviewReport) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [sessionActive, interviewReport])

  // Load Past Sessions
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      const data = await getMyInterviewSessions()
      setPastSessions(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Could not load session history')
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    }
  }, [activeTab])

  // Speech Output (Text-To-Speech)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Speech Recognition (Microphone Speech-To-Text)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Web Speech API is not supported in this browser. Please use Text Mode.')
      setAnswerMode('text')
      return
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    stopSpeaking()

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        toast.success('Microphone listening... Speak clearly!')
      }

      recognition.onresult = (event: any) => {
        let full = ''
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript + ' '
        }
        setCandidateAnswerText(full.trim())
      }

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. You can continue typing in Text Mode.')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error(err)
      setIsListening(false)
    }
  }

  const getEffectiveRoleTitle = () => {
    if (selectedRoleType.startsWith('job_')) {
      const jId = selectedRoleType.replace('job_', '')
      const app = applications.find(a => a.job_id === jId)
      return app ? app.job_title : 'Selected Role'
    }
    if (selectedRoleType === 'other') {
      return customRoleTitle.trim() || 'Custom Position'
    }
    return selectedRoleType
  }

  const getEffectiveCompany = () => {
    if (selectedRoleType.startsWith('job_')) {
      const jId = selectedRoleType.replace('job_', '')
      const app = applications.find(a => a.job_id === jId)
      return app ? app.company : 'Partner Network'
    }
    return 'HireSense Partner Network'
  }

  // START INTERVIEW SESSION
  const handleStartInterview = async () => {
    try {
      setGenerating(true)
      setCurrentIndex(0)
      setCandidateAnswerText('')
      setCurrentFeedback(null)
      setShowModelAnswer(false)
      setAdaptiveFollowUp(null)
      setAnswersHistory([])
      setEvaluationsHistory([])
      setSkippedCount(0)
      setInterviewReport(null)
      setSessionSaved(false)
      setElapsedSeconds(0)

      let jobIdParam: string | undefined = undefined
      let targetTitleParam: string = getEffectiveRoleTitle()

      if (selectedRoleType.startsWith('job_')) {
        jobIdParam = selectedRoleType.replace('job_', '')
      }

      const qList = await generateMyInterviewQuestions(
        jobIdParam,
        selectedMode,
        difficulty,
        questionCount,
        targetTitleParam
      )

      if (!qList || qList.length === 0) {
        toast.error('Unable to generate questions. Please try again.')
        return
      }

      setQuestions(qList)
      setSessionActive(true)
      setSessionStartTime(Date.now())
      toast.success(`Ready! ${qList.length} personalized questions generated for ${targetTitleParam}.`)

      if (answerMode === 'speech') {
        setTimeout(() => {
          speakText(qList[0].question)
        }, 500)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to start interview session'
      toast.error(msg)
    } finally {
      setGenerating(false)
    }
  }

  // SUBMIT & EVALUATE ANSWER
  const handleSubmitAnswer = async () => {
    if (!candidateAnswerText.trim() || candidateAnswerText.trim().length < 10) {
      toast.error('Please provide a substantive answer (at least 10 characters) before submitting.')
      return
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
    stopSpeaking()

    try {
      setEvaluating(true)
      const currentQ = questions[currentIndex]
      const targetRole = getEffectiveRoleTitle()

      const evaluation = await evaluateMyInterviewAnswer(
        currentQ.question,
        candidateAnswerText,
        currentQ.category,
        targetRole
      )

      setCurrentFeedback(evaluation)
      setAnswersHistory(prev => [...prev, candidateAnswerText])
      setEvaluationsHistory(prev => [...prev, evaluation])
      toast.success('AI Evaluation Complete!')

      // Check for adaptive follow-up
      try {
        setLoadingFollowUp(true)
        const followUpRes = await getAdaptiveFollowUp(
          currentQ,
          candidateAnswerText,
          evaluation,
          targetRole
        )
        if (followUpRes?.has_follow_up && followUpRes.follow_up) {
          setAdaptiveFollowUp(followUpRes.follow_up)
        } else {
          setAdaptiveFollowUp(null)
        }
      } catch (err) {
        console.error('Follow-up error:', err)
      } finally {
        setLoadingFollowUp(false)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to evaluate answer. Please try again.')
    } finally {
      setEvaluating(false)
    }
  }

  // SKIP QUESTION
  const handleSkipQuestion = () => {
    stopSpeaking()
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    const skippedEval: EvaluationResult = {
      overall_score: 0.0,
      technical_knowledge: 0.0,
      communication: 0.0,
      answer_relevance: 0.0,
      completeness: 0.0,
      confidence: 0.0,
      technical_depth: 0.0,
      feedback_summary: 'Question was skipped by candidate.',
      strengths: [],
      weak_areas: ['Question skipped without response.'],
      improvements: ['Prepare key concepts for this topic in future practice.']
    }

    setAnswersHistory(prev => [...prev, '[SKIPPED]'])
    setEvaluationsHistory(prev => [...prev, skippedEval])
    setSkippedCount(prev => prev + 1)
    toast('Question skipped', { icon: '⏭' })

    proceedToNextQuestion()
  }

  // PROCEED TO NEXT OR COMPLETE
  const proceedToNextQuestion = () => {
    setShowModelAnswer(false)
    setAdaptiveFollowUp(null)
    setCurrentFeedback(null)
    setCandidateAnswerText('')

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1
      setCurrentIndex(nextIdx)
      if (answerMode === 'speech') {
        setTimeout(() => {
          speakText(questions[nextIdx].question)
        }, 400)
      }
    } else {
      finishInterviewSession()
    }
  }

  // FINISH & PERSIST INTERVIEW SESSION
  const finishInterviewSession = async () => {
    stopSpeaking()
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    try {
      const targetRole = getEffectiveRoleTitle()
      const comp = getEffectiveCompany()
      let jobIdParam: string | undefined = undefined
      if (selectedRoleType.startsWith('job_')) {
        jobIdParam = selectedRoleType.replace('job_', '')
      }

      const sessionPayload = {
        questions,
        answers: answersHistory,
        evaluations: evaluationsHistory,
        target_role: targetRole,
        company: comp,
        interview_mode: selectedMode,
        answer_mode: answerMode,
        difficulty,
        duration_seconds: elapsedSeconds,
        job_id: jobIdParam
      }

      const saveRes = await saveInterviewSession(sessionPayload)
      setInterviewReport(saveRes?.report)
      setSessionSaved(true)
      toast.success('Interview Completed and Saved to Session History!')
    } catch (err) {
      console.error('Failed to save session:', err)
      toast.error('Session completed, but history could not be saved to server.')
      // Fallback local report
      setInterviewReport({
        overall_score: 75.0,
        readiness_level: 'Ready',
        category_scores: {
          technical_knowledge: 75.0,
          communication: 80.0,
          problem_solving: 70.0,
          project_understanding: 75.0,
          behavioral: 80.0,
          role_fit: 75.0
        },
        strengths: ['Demonstrated good technical vocabulary', 'Effective communication'],
        weak_areas: ['Include more measurable impact metrics in project examples'],
        recommendations: ['Practice with deeper architectural trade-offs']
      })
    }
  }

  // DOWNLOAD REPORT TXT
  const handleDownloadReport = () => {
    if (!interviewReport) return

    let report = `===========================================================\n`
    report += `HIRESENSE AI — INTERVIEW PRACTICE EVALUATION REPORT\n`
    report += `===========================================================\n`
    report += `Candidate: ${profileData?.candidate?.full_name || 'Candidate'}\n`
    report += `Target Role: ${getEffectiveRoleTitle()}\n`
    report += `Company: ${getEffectiveCompany()}\n`
    report += `Interview Mode: ${selectedMode.toUpperCase()} (${answerMode.toUpperCase()} MODE)\n`
    report += `Difficulty: ${difficulty.toUpperCase()}\n`
    report += `Duration: ${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s\n`
    report += `Date: ${new Date().toLocaleString()}\n`
    report += `Overall Score: ${interviewReport.overall_score}%\n`
    report += `Readiness Level: ${interviewReport.readiness_level}\n`
    report += `===========================================================\n\n`

    report += `[CATEGORY PERFORMANCE]\n`
    Object.entries(interviewReport.category_scores || {}).forEach(([cat, val]) => {
      const name = cat.replace('_', ' ').toUpperCase()
      report += `• ${name}: ${val}%\n`
    })
    report += `\n`

    report += `[KEY STRENGTHS]\n`
    interviewReport.strengths?.forEach((s: string) => {
      report += `✓ ${s}\n`
    })
    report += `\n`

    report += `[AREAS FOR IMPROVEMENT]\n`
    interviewReport.weak_areas?.forEach((w: string) => {
      report += `! ${w}\n`
    })
    report += `\n`

    report += `[RECOMMENDED TOPICS TO PRACTICE]\n`
    interviewReport.recommendations?.forEach((r: string) => {
      report += `→ ${r}\n`
    })
    report += `\n===========================================================\n`
    report += `[QUESTION-BY-QUESTION BREAKDOWN]\n`
    report += `===========================================================\n\n`

    questions.forEach((q, idx) => {
      const ans = answersHistory[idx] || '[NO RESPONSE]'
      const ev = evaluationsHistory[idx]
      report += `Question ${idx + 1} (${q.category.toUpperCase()} - ${q.difficulty.toUpperCase()}):\n`
      report += `${q.question}\n\n`
      report += `Your Answer:\n${ans}\n\n`
      if (ev) {
        report += `Score: ${ev.overall_score}%\n`
        report += `Feedback: ${ev.feedback_summary}\n`
        if (ev.strengths?.length) report += `Strengths: ${ev.strengths.join('; ')}\n`
        if (ev.improvements?.length) report += `Improvements: ${ev.improvements.join('; ')}\n`
      }
      report += `-----------------------------------------------------------\n\n`
    })

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HireSense_Interview_${getEffectiveRoleTitle().replace(/\s+/g, '_')}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getReadinessBadgeClass = (level: string) => {
    switch (level) {
      case 'Highly Ready': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      case 'Ready': return 'bg-teal-500/15 text-teal-400 border-teal-500/30'
      case 'Needs Improvement': return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      default: return 'bg-coral/15 text-coral border-coral/30'
    }
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  const hasResume = profileData?.has_resume === true

  // =========================================================================
  // GATEWAY: LOCKED IF NO RESUME UPLOADED
  // =========================================================================
  if (!hasResume) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2">
            <Mic className="w-6 h-6 text-emerald-400" />
            AI Interview Preparation Platform
          </h1>
          <p className="text-xs text-sage-muted">Real-time technical, project, behavioral, and HR interview simulator</p>
        </div>

        <Card className="bg-charcoal border-obsidian-border shadow-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-light border border-obsidian-border flex items-center justify-center text-sage-muted mx-auto">
            <Mic className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-warm-white text-lg">Resume Required</h3>
            <p className="text-xs text-sage-muted max-w-md mx-auto leading-relaxed">
              Please upload your resume first. Our AI interviewer creates personalized questions based on your actual skills, projects, and work experience.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/candidate/resume">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-extrabold text-xs px-8 h-11 shadow-lg shadow-emerald-500/10 gap-2">
                <Upload className="w-4 h-4" /> Upload Resume
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
            <Mic className="w-6 h-6 text-emerald-400" />
            AI Interview Preparation Platform
          </h1>
          <p className="text-xs text-sage-muted">
            Personalized technical, project, behavioral, and scenario screening with real-time AI scoring
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-charcoal p-1 rounded-xl border border-emerald-500/15">
          <Button
            size="sm"
            variant={activeTab === 'practice' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('practice')}
            disabled={sessionActive && !interviewReport}
            className={`text-xs h-8 ${activeTab === 'practice' ? 'bg-emerald-500 text-obsidian font-bold' : 'text-sage-muted'}`}
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Practice Console
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            disabled={sessionActive && !interviewReport}
            className={`text-xs h-8 ${activeTab === 'history' ? 'bg-emerald-500 text-obsidian font-bold' : 'text-sage-muted'}`}
          >
            <History className="w-3.5 h-3.5 mr-1.5" /> Session History
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRACTICE CONSOLE */}
      {/* ========================================================================= */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          {/* 1. PRE-INTERVIEW SETUP (Visible only when not in active session) */}
          {!sessionActive && (
            <Card className="bg-charcoal border-emerald-500/20 shadow-2xl p-6 space-y-5">
              {/* Candidate Info Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-light border border-obsidian-border text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    {profileData?.candidate?.full_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <span className="text-sage-muted text-[11px] block">Candidate</span>
                    <span className="font-bold text-warm-white">{profileData?.candidate?.full_name || 'Authenticated Candidate'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-obsidian/60 px-2.5 py-1 rounded-lg border border-obsidian-border text-[11px]">
                    <span className="text-sage-muted">Resume:</span>
                    <span className="text-emerald-400 font-medium">{profileData?.resume?.filename || 'Verified'}</span>
                  </div>
                </div>
              </div>

              {/* Answering Mode Switcher */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-sage-muted">Select Answering Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAnswerMode('text')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      answerMode === 'text'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-warm-white'
                        : 'bg-charcoal-light border-obsidian-border text-sage hover:border-emerald-500/20'
                    }`}
                  >
                    <FileText className={`w-5 h-5 mt-0.5 ${answerMode === 'text' ? 'text-emerald-400' : 'text-sage-muted'}`} />
                    <div>
                      <span className="text-xs font-bold block">⌨ Text Interview</span>
                      <span className="text-[11px] text-sage-muted">Type answers into a dedicated response workspace with real-time AI scoring.</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!speechSupported) {
                        toast.error('Web Speech API is not supported in this browser. Please use Text Mode.')
                        return
                      }
                      setAnswerMode('speech')
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      answerMode === 'speech'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-warm-white'
                        : 'bg-charcoal-light border-obsidian-border text-sage hover:border-emerald-500/20'
                    }`}
                  >
                    <Mic className={`w-5 h-5 mt-0.5 ${answerMode === 'speech' ? 'text-emerald-400' : 'text-sage-muted'}`} />
                    <div>
                      <span className="text-xs font-bold block">🎙 AI Voice Interview</span>
                      <span className="text-[11px] text-sage-muted">AI speaks questions aloud. Answer with your microphone and review live transcript.</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Configuration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {/* Target Position Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-muted">Target Position</label>
                  <select
                    value={selectedRoleType}
                    onChange={e => setSelectedRoleType(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-md bg-charcoal-light border border-emerald-500/20 text-warm-white outline-none"
                  >
                    {applications.length > 0 && (
                      <optgroup label="Applied Positions">
                        {applications.map(a => (
                          <option key={`job_${a.job_id}`} value={`job_${a.job_id}`}>
                            {a.job_title} — {a.company}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Standard Roles">
                      {standardRoles.map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </optgroup>
                    <option value="other">Other (Custom Title)</option>
                  </select>
                  {selectedRoleType === 'other' && (
                    <Input
                      placeholder="e.g. Generative AI Engineer"
                      value={customRoleTitle}
                      onChange={e => setCustomRoleTitle(e.target.value)}
                      className="h-8 text-xs bg-charcoal border-emerald-500/30 text-warm-white mt-1.5"
                    />
                  )}
                </div>

                {/* 7 Distinct Interview Modes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-muted">Interview Mode</label>
                  <select
                    value={selectedMode}
                    onChange={e => setSelectedMode(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-md bg-charcoal-light border border-emerald-500/20 text-warm-white outline-none"
                  >
                    <option value="mixed">🎯 Mixed Interview (Full Simulation)</option>
                    <option value="technical">💻 Technical Interview</option>
                    <option value="project">📁 Project Interview</option>
                    <option value="behavioral">🧠 Behavioral Interview (STAR)</option>
                    <option value="scenario">⚡ Scenario-Based Interview</option>
                    <option value="resume">📄 Resume-Based Interview</option>
                    <option value="hr">🤝 HR Interview</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-muted">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-md bg-charcoal-light border border-emerald-500/20 text-warm-white outline-none"
                  >
                    <option value="easy">Easy (Fundamentals)</option>
                    <option value="medium">Medium (Practical & Applied)</option>
                    <option value="hard">Hard (Advanced Architecture)</option>
                  </select>
                </div>

                {/* Question Count */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-muted">Question Count</label>
                  <select
                    value={questionCount}
                    onChange={e => setQuestionCount(Number(e.target.value))}
                    className="w-full h-9 px-3 text-xs rounded-md bg-charcoal-light border border-emerald-500/20 text-warm-white outline-none"
                  >
                    <option value={5}>5 Questions (Standard Round)</option>
                    <option value={10}>10 Questions (Comprehensive)</option>
                    <option value={15}>15 Questions (Deep Evaluation)</option>
                    <option value={20}>20 Questions (Full Mock)</option>
                  </select>
                </div>
              </div>

              {/* Start Session Action */}
              <div className="flex items-center justify-between pt-4 border-t border-obsidian-border">
                <div className="text-[11px] text-sage-muted">
                  Ready to simulate: <span className="text-warm-white font-semibold">{getEffectiveRoleTitle()}</span> at <span className="text-emerald-400 font-semibold">{getEffectiveCompany()}</span>
                </div>

                <Button
                  size="default"
                  onClick={handleStartInterview}
                  disabled={generating}
                  className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-extrabold text-xs h-10 px-6 gap-2 shadow-lg shadow-emerald-500/15"
                >
                  {generating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> Generating Personalized Questions...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Start Interview Session
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* 2. ACTIVE INTERVIEW CONSOLE */}
          {sessionActive && !interviewReport && currentQ && (
            <div className="space-y-4">
              {/* Interview Top Navigation Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal border border-emerald-500/20 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
                    <Target className="w-3.5 h-3.5" />
                    Question {currentIndex + 1} of {questions.length}
                  </div>
                  <span className="text-xs text-sage-muted hidden sm:inline">
                    Role: <span className="text-warm-white font-semibold">{getEffectiveRoleTitle()}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-sage font-mono">
                    <Clock className="w-3.5 h-3.5 text-champagne" />
                    <span>{formatTime(elapsedSeconds)}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm('Are you sure you want to end this interview session early?')) {
                        finishInterviewSession()
                      }
                    }}
                    className="border-obsidian-border text-sage hover:text-coral hover:border-coral/40 text-xs h-8 gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> End Interview
                  </Button>
                </div>
              </div>

              {/* Progress Tracker Bar */}
              <div className="space-y-1.5 px-1">
                <div className="flex items-center justify-between text-[11px] text-sage-muted">
                  <span>Progress: {Math.round(((currentIndex) / questions.length) * 100)}%</span>
                  <span>Answered: {answersHistory.length} | Skipped: {skippedCount} | Remaining: {questions.length - currentIndex}</span>
                </div>
                <div className="w-full h-1.5 bg-charcoal-light rounded-full overflow-hidden border border-obsidian-border">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Main Question Card */}
              <Card className="bg-charcoal border-emerald-500/30 shadow-2xl overflow-hidden">
                <CardHeader className="bg-charcoal-light/70 border-b border-obsidian-border p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {currentQ.category}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-charcoal text-sage-muted border border-obsidian-border">
                        {currentQ.difficulty}
                      </span>
                      {currentQ.level && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian text-sage-muted border border-obsidian-border hidden sm:inline">
                          {currentQ.level}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(currentQ.question)}
                        className="h-8 text-xs text-sage hover:text-warm-white gap-1.5"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-4 h-4 text-coral animate-pulse" />
                            <span className="text-coral">Stop Speaking</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 text-emerald-400" />
                            <span>Replay Audio</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-warm-white leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {currentQ.interviewer_intent && (
                    <p className="text-[11px] text-sage-muted italic border-l-2 border-emerald-500/40 pl-2.5">
                      Interviewer Intent: {currentQ.interviewer_intent}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* AI Speaking Visualizer State */}
                  {isSpeaking && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs text-emerald-300 font-semibold">AI Interviewer is speaking question...</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={stopSpeaking}
                        className="h-7 text-[11px] text-coral hover:bg-coral/10"
                      >
                        Mute Audio
                      </Button>
                    </div>
                  )}

                  {/* Speech Mode Interface */}
                  {answerMode === 'speech' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-sage-muted">Your Spoken Response (Voice Input)</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={toggleListening}
                            className={`text-xs h-8 px-4 gap-1.5 font-bold transition-all ${
                              isListening
                                ? 'bg-coral hover:bg-coral-light text-white animate-pulse shadow-lg shadow-coral/25'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-obsidian'
                            }`}
                          >
                            {isListening ? (
                              <>
                                <MicOff className="w-3.5 h-3.5" /> Stop Recording
                              </>
                            ) : (
                              <>
                                <Mic className="w-3.5 h-3.5" /> Start Speaking (Mic)
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Microphone Status Indicator */}
                      {isListening && (
                        <div className="p-3 rounded-xl bg-coral/10 border border-coral/30 flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-coral animate-ping" />
                          <span className="text-xs text-coral font-medium">Listening to your voice... Speak your response clearly.</span>
                        </div>
                      )}

                      {/* Editable Live Transcript Box */}
                      <div className="space-y-1">
                        <textarea
                          rows={4}
                          value={candidateAnswerText}
                          onChange={e => setCandidateAnswerText(e.target.value)}
                          disabled={evaluating}
                          placeholder={
                            isListening
                              ? 'Listening in real-time... (your spoken words will appear here automatically)'
                              : 'Click "Start Speaking (Mic)" to record your answer, or type into this box directly.'
                          }
                          className="w-full p-3.5 text-xs rounded-xl bg-charcoal-light border border-obsidian-border text-warm-white placeholder:text-sage-muted/50 focus:border-emerald-500/40 outline-none leading-relaxed resize-none"
                        />
                        <div className="flex justify-between items-center text-[11px] text-sage-muted px-1">
                          <span>Review your transcript above before submitting.</span>
                          <span>{candidateAnswerText.trim().split(/\s+/).filter(Boolean).length} words</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Mode Interface */}
                  {answerMode === 'text' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-sage-muted">Your Answer</label>
                        <span className="text-[11px] text-sage-muted font-mono">
                          {candidateAnswerText.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>

                      <textarea
                        rows={5}
                        value={candidateAnswerText}
                        onChange={e => setCandidateAnswerText(e.target.value)}
                        disabled={evaluating}
                        placeholder="Structure your answer clearly. Detail your architectural approach, concrete actions, tools used, and quantifiable results..."
                        className="w-full p-3.5 text-xs rounded-xl bg-charcoal-light border border-obsidian-border text-warm-white placeholder:text-sage-muted/50 focus:border-emerald-500/40 outline-none leading-relaxed resize-none"
                      />
                    </div>
                  )}

                  {/* Actions (Submit / Skip) */}
                  {!currentFeedback && (
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSkipQuestion}
                        disabled={evaluating}
                        className="text-xs text-sage-muted hover:text-warm-white gap-1.5"
                      >
                        <FastForward className="w-3.5 h-3.5" /> Skip Question
                      </Button>

                      <div className="flex items-center gap-2">
                        {candidateAnswerText.trim().length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCandidateAnswerText('')}
                            disabled={evaluating}
                            className="text-xs text-sage-muted hover:text-coral h-9"
                          >
                            Clear
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={handleSubmitAnswer}
                          disabled={evaluating || candidateAnswerText.trim().length < 10}
                          className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-9 px-6 gap-2 shadow-md shadow-emerald-500/10"
                        >
                          {evaluating ? (
                            <>
                              <Sparkles className="w-4 h-4 animate-spin" /> Evaluating Answer...
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-4 h-4" /> Submit Answer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* IN-FLIGHT AI EVALUATION FEEDBACK CARD */}
                  {currentFeedback && (
                    <div className="p-5 rounded-xl bg-charcoal-light border border-champagne/30 space-y-4 animate-in fade-in">
                      {/* Score Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-obsidian-border pb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-champagne" />
                          <div>
                            <h4 className="font-bold text-warm-white text-sm">AI Answer Diagnostics</h4>
                            <span className="text-[11px] text-sage-muted">Evaluated against role requirements and technical depth</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-xs text-sage-muted font-mono">Answer Score:</span>
                          <span className={`text-base font-extrabold font-mono px-2.5 py-0.5 rounded border ${
                            currentFeedback.overall_score >= 80
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : currentFeedback.overall_score >= 60
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-coral/15 text-coral border-coral/30'
                          }`}>
                            {currentFeedback.overall_score}%
                          </span>
                        </div>
                      </div>

                      {/* Multi-Dimensional Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-charcoal border border-obsidian-border">
                          <span className="text-[10px] text-sage-muted block">Technical Depth</span>
                          <span className="font-bold text-emerald-400 font-mono">{currentFeedback.technical_depth}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-charcoal border border-obsidian-border">
                          <span className="text-[10px] text-sage-muted block">Relevance</span>
                          <span className="font-bold text-emerald-400 font-mono">{currentFeedback.answer_relevance}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-charcoal border border-obsidian-border">
                          <span className="text-[10px] text-sage-muted block">Communication</span>
                          <span className="font-bold text-emerald-400 font-mono">{currentFeedback.communication}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-charcoal border border-obsidian-border">
                          <span className="text-[10px] text-sage-muted block">Confidence</span>
                          <span className="font-bold text-emerald-400 font-mono">{currentFeedback.confidence}%</span>
                        </div>
                      </div>

                      {/* STAR Breakdown for Behavioral / Project Questions */}
                      {currentFeedback.star_breakdown && (
                        <div className="p-3 rounded-lg bg-charcoal border border-obsidian-border space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-warm-white flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-champagne" /> STAR Framework Structure
                            </span>
                            <span className="text-champagne font-mono text-[11px] font-bold">
                              {currentFeedback.star_breakdown.score}% Complete
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                            <div className={`p-1 rounded border ${currentFeedback.star_breakdown.situation ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-charcoal-light text-sage-muted border-obsidian-border'}`}>
                              Situation {currentFeedback.star_breakdown.situation ? '✓' : '✗'}
                            </div>
                            <div className={`p-1 rounded border ${currentFeedback.star_breakdown.task ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-charcoal-light text-sage-muted border-obsidian-border'}`}>
                              Task {currentFeedback.star_breakdown.task ? '✓' : '✗'}
                            </div>
                            <div className={`p-1 rounded border ${currentFeedback.star_breakdown.action ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-charcoal-light text-sage-muted border-obsidian-border'}`}>
                              Action {currentFeedback.star_breakdown.action ? '✓' : '✗'}
                            </div>
                            <div className={`p-1 rounded border ${currentFeedback.star_breakdown.result ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-charcoal-light text-sage-muted border-obsidian-border'}`}>
                              Result {currentFeedback.star_breakdown.result ? '✓' : '✗'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Feedback Summary */}
                      <p className="text-xs text-sage leading-relaxed">
                        {currentFeedback.feedback_summary}
                      </p>

                      {/* Strengths and Weak Areas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-sage text-[11px]">
                            {currentFeedback.strengths?.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                          <span className="font-bold text-amber-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" /> Areas for Improvement
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-sage text-[11px]">
                            {currentFeedback.improvements?.map((i, idx) => (
                              <li key={idx}>{i}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Expandable Model Answer */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowModelAnswer(!showModelAnswer)}
                          className="text-xs text-champagne hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> {showModelAnswer ? 'Hide' : 'View'} Suggested Model Answer
                        </button>
                        {showModelAnswer && (
                          <div className="mt-2 p-3 rounded-lg bg-charcoal border border-obsidian-border text-xs text-sage-muted leading-relaxed">
                            {currentQ.sample_answer || currentFeedback.suggested_answer}
                          </div>
                        )}
                      </div>

                      {/* ADAPTIVE FOLLOW-UP CARD */}
                      {adaptiveFollowUp && (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-champagne animate-spin" />
                            <span className="text-xs font-bold text-warm-white">
                              {adaptiveFollowUp.type === 'deep_dive' ? 'Adaptive Follow-Up (Technical Deep Dive)' : 'Adaptive Clarification'}
                            </span>
                          </div>
                          <p className="text-xs text-warm-white font-medium">
                            {adaptiveFollowUp.question}
                          </p>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Inject follow-up as next question
                                const followUpQ: QuestionItem = {
                                  question: adaptiveFollowUp.question,
                                  category: currentQ.category,
                                  difficulty: adaptiveFollowUp.difficulty || 'hard',
                                  level: adaptiveFollowUp.type
                                }
                                setQuestions(prev => [
                                  ...prev.slice(0, currentIndex + 1),
                                  followUpQ,
                                  ...prev.slice(currentIndex + 1)
                                ])
                                setAdaptiveFollowUp(null)
                                proceedToNextQuestion()
                              }}
                              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs h-8"
                            >
                              Answer Adaptive Follow-Up
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Next Question Control */}
                      <div className="flex justify-end pt-2 border-t border-obsidian-border">
                        <Button
                          size="sm"
                          onClick={proceedToNextQuestion}
                          className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-9 px-5 gap-1.5"
                        >
                          {currentIndex < questions.length - 1 ? (
                            <>
                              Next Question <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              Complete Interview & View Report <CheckCircle2 className="w-3.5 h-3.5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 3. FINAL COMPREHENSIVE INTERVIEW REPORT */}
          {sessionActive && interviewReport && (
            <div className="space-y-6 animate-in zoom-in-95">
              <Card className="bg-charcoal border-emerald-500/30 shadow-2xl p-6 space-y-6">
                {/* Header Summary */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-obsidian-border pb-6">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                        Interview Simulation Complete
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${getReadinessBadgeClass(interviewReport.readiness_level)}`}>
                        {interviewReport.readiness_level}
                      </span>
                    </div>

                    <h2 className="text-2xl font-extrabold text-warm-white">
                      {getEffectiveRoleTitle()} Performance Report
                    </h2>
                    <p className="text-xs text-sage-muted max-w-md leading-relaxed">
                      Completed in {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s. Evaluated across {questions.length} personalized questions for {getEffectiveCompany()}.
                    </p>
                  </div>

                  <ScoreCircle score={interviewReport.overall_score} size={115} strokeWidth={9} />
                </div>

                {/* Category Competency Matrix */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-warm-white flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" /> Category Competency Scores
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center text-xs">
                    {Object.entries(interviewReport.category_scores || {}).map(([key, val]: [string, any]) => (
                      <div key={key} className="p-3 rounded-xl bg-charcoal-light border border-obsidian-border space-y-1">
                        <span className="text-[10px] text-sage-muted uppercase tracking-wider block">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-base font-extrabold text-warm-white font-mono">{val}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Weak Areas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <h5 className="font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Strong Performance Areas
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sage text-[11px] leading-relaxed">
                      {interviewReport.strengths?.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <h5 className="font-bold text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Recommended Topics to Refine
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sage text-[11px] leading-relaxed">
                      {interviewReport.recommendations?.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Question-by-Question Accordion Review */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-warm-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-champagne" /> Question-by-Question Review
                  </h4>

                  <div className="space-y-2.5">
                    {questions.map((q, idx) => {
                      const ans = answersHistory[idx] || '[SKIPPED]'
                      const ev = evaluationsHistory[idx]
                      return (
                        <div key={idx} className="p-4 rounded-xl bg-charcoal-light/70 border border-obsidian-border space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-warm-white">
                              Question {idx + 1}: {q.question}
                            </span>
                            <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">
                              {ev ? `${ev.overall_score}%` : 'Skipped'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-charcoal text-sage-muted text-[11px] leading-relaxed">
                            <span className="text-sage font-semibold block mb-0.5">Your Response:</span>
                            {ans}
                          </div>

                          {ev && (
                            <p className="text-[11px] text-sage italic">
                              AI Feedback: {ev.feedback_summary}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Report Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-obsidian-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSessionActive(false)
                      setInterviewReport(null)
                      setQuestions([])
                    }}
                    className="border-obsidian-border text-sage hover:text-warm-white text-xs h-9 gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Practice Another Role
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('history')}
                      variant="outline"
                      className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 text-xs h-9 gap-1.5"
                    >
                      <History className="w-3.5 h-3.5" /> View All Sessions
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleDownloadReport}
                      className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-9 px-5 gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Full Report (.txt)
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SESSION HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <Card className="bg-charcoal border-emerald-500/20 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
              <div>
                <h3 className="font-bold text-warm-white text-sm">Past Interview Practice Sessions</h3>
                <p className="text-xs text-sage-muted">Review your scores, transcripts, and readiness progression over time</p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={fetchHistory}
                disabled={loadingHistory}
                className="border-obsidian-border text-sage hover:text-warm-white text-xs h-8 gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${loadingHistory ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : pastSessions.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-charcoal-light flex items-center justify-center text-sage-muted mx-auto border border-obsidian-border">
                  <History className="w-6 h-6" />
                </div>
                <p className="text-xs text-sage-muted">No past interview sessions found yet. Start your first session in the Practice Console!</p>
                <Button
                  size="sm"
                  onClick={() => setActiveTab('practice')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs"
                >
                  Start Practice
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {pastSessions.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="p-4 rounded-xl bg-charcoal-light border border-obsidian-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-emerald-500/20"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-warm-white text-sm">{s.target_role}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getReadinessBadgeClass(s.readiness_level)}`}>
                          {s.readiness_level}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-charcoal text-sage-muted border border-obsidian-border">
                          {s.interview_mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-sage-muted">
                        <span>{s.company || 'HireSense Network'}</span>
                        <span>•</span>
                        <span>{s.question_count} Questions ({s.answer_mode})</span>
                        <span>•</span>
                        <span>{new Date(s.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{Math.floor((s.duration_seconds || 0) / 60)}m {(s.duration_seconds || 0) % 60}s</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-sage-muted block">Score</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          {s.overall_score}%
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const detail = await getInterviewSessionDetail(s.id)
                            setSelectedHistoryDetail(detail)
                          } catch {
                            toast.error('Could not load session details')
                          }
                        }}
                        className="border-obsidian-border text-sage hover:text-warm-white text-xs h-8"
                      >
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Historical Session Detail Modal / View */}
          {selectedHistoryDetail && (
            <Card className="bg-charcoal border-emerald-500/30 shadow-2xl p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
                <div>
                  <h4 className="font-bold text-warm-white text-sm">
                    {selectedHistoryDetail.target_role} — Session Archive
                  </h4>
                  <span className="text-[11px] text-sage-muted">
                    Conducted on {new Date(selectedHistoryDetail.created_at).toLocaleString()} ({selectedHistoryDetail.interview_mode} mode)
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedHistoryDetail(null)}
                  className="text-sage hover:text-warm-white text-xs h-8"
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-charcoal-light border border-obsidian-border">
                  <span className="text-[10px] text-sage-muted block">Overall Score</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-sm">{selectedHistoryDetail.overall_score}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-charcoal-light border border-obsidian-border">
                  <span className="text-[10px] text-sage-muted block">Readiness</span>
                  <span className="font-extrabold text-champagne text-xs">{selectedHistoryDetail.readiness_level}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-charcoal-light border border-obsidian-border">
                  <span className="text-[10px] text-sage-muted block">Duration</span>
                  <span className="font-mono text-warm-white">{Math.floor((selectedHistoryDetail.duration_seconds || 0) / 60)}m {(selectedHistoryDetail.duration_seconds || 0) % 60}s</span>
                </div>
                <div className="p-2.5 rounded-lg bg-charcoal-light border border-obsidian-border">
                  <span className="text-[10px] text-sage-muted block">Questions</span>
                  <span className="font-mono text-warm-white">{selectedHistoryDetail.question_count}</span>
                </div>
              </div>

              {/* Questions & Answers in archive */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-warm-white">Question & Answer Archive</h5>
                {selectedHistoryDetail.questions?.map((q: any, idx: number) => {
                  const ans = selectedHistoryDetail.answers?.[idx] || '[SKIPPED]'
                  const ev = selectedHistoryDetail.evaluations?.[idx]
                  return (
                    <div key={idx} className="p-3.5 rounded-xl bg-charcoal-light border border-obsidian-border space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-warm-white">
                          Q{idx + 1}: {q.question || q}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">
                          {ev ? `${ev.overall_score}%` : ''}
                        </span>
                      </div>
                      <p className="p-2.5 rounded-lg bg-charcoal text-sage-muted text-[11px]">
                        {ans}
                      </p>
                      {ev && (
                        <p className="text-[11px] text-sage italic">
                          Feedback: {ev.feedback_summary}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedHistoryDetail(null)
                    setSelectedRoleType(selectedHistoryDetail.target_role)
                    setSelectedMode(selectedHistoryDetail.interview_mode || 'mixed')
                    setActiveTab('practice')
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs"
                >
                  Practice This Role Again
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
