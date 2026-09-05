import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getInterviewQuestions, generateInterviewQuestions } from '@/api/screening'
import { InterviewQuestion } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Printer, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export const InterviewQuestionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getInterviewQuestions(id)
      .then(data => setQuestions(data || []))
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-charcoal p-6 rounded-2xl border border-emerald-500/10">
        <div className="space-y-1">
          <Link to="/recruiter/ranking" className="text-xs text-sage hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Candidates
          </Link>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Personalized Interview Questionnaire
          </h1>
          <p className="text-xs text-sage-muted">AI-generated interview questions based on candidate projects and skill gaps</p>
        </div>

        <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
          <Printer className="w-3.5 h-3.5" /> Print Questionnaire
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={idx} className="bg-charcoal border-emerald-500/10 shadow-xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                {q.category}
              </span>
              <span className="text-xs text-sage-muted capitalize">Difficulty: {q.difficulty}</span>
            </CardHeader>
            <CardContent className="text-sm font-semibold text-warm-white leading-relaxed pt-2">
              {q.question}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
