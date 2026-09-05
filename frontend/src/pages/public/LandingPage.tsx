import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Bot,
  BrainCircuit,
  FileCheck2,
  Users2,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  FileSearch,
  Award,
  Lock,
  LineChart,
  Layers,
  CheckCircle2
} from 'lucide-react'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-obsidian text-warm-white flex flex-col selection:bg-emerald selection:text-obsidian">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-obsidian/85 backdrop-blur-md border-b border-obsidian-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={32} showText={true} subtitle={false} />
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-xs text-sage-muted hover:text-warm-white hover:bg-charcoal">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-emerald hover:bg-emerald-600 text-obsidian font-bold text-xs shadow-sm shadow-emerald-950/30">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-obsidian via-charcoal/40 to-obsidian border-b border-obsidian-border">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald border border-emerald-500/25 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald" />
            HireSense AI — Smarter Screening. Better Hiring.
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-warm-white tracking-tight leading-[1.12]">
            Autonomous Resume Screening with{' '}
            <span className="text-emerald">
              Explainable AI Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-lg text-sage-muted max-w-3xl mx-auto font-normal leading-relaxed">
            Transform resume screening into intelligent, explainable, and data-driven hiring. Our dual-layer semantic NLP engine deeply understands candidate achievements, skill taxonomies, and role relevance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto bg-emerald hover:bg-emerald-600 text-obsidian font-extrabold px-8 h-12 shadow-lg shadow-emerald-950/50 gap-2 text-sm">
                Open Recruiter Command Center
                <ArrowRight className="w-4 h-4 text-obsidian" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 font-semibold text-sm border-obsidian-border bg-charcoal text-warm-white hover:bg-charcoal-light">
                Candidate Profile Analyzer
              </Button>
            </Link>
          </div>

          {/* Elegant Visual Pipeline Flow */}
          <div className="pt-14 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-sage-muted mb-6">Autonomous Talent Matching Lifecycle</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
              <div className="p-3.5 rounded-xl bg-charcoal border border-obsidian-border text-center space-y-1">
                <span className="text-xs font-bold text-sage">1. Resume Ingestion</span>
                <p className="text-[11px] text-sage-muted">PDF / DOCX / TXT</p>
              </div>
              <div className="p-3.5 rounded-xl bg-charcoal border border-emerald-500/30 text-center space-y-1">
                <span className="text-xs font-bold text-emerald">2. AI Understanding</span>
                <p className="text-[11px] text-sage-muted">500+ Skills NER</p>
              </div>
              <div className="p-3.5 rounded-xl bg-charcoal border border-obsidian-border text-center space-y-1">
                <span className="text-xs font-bold text-sage">3. Smart Matching</span>
                <p className="text-[11px] text-sage-muted">Dense Embeddings</p>
              </div>
              <div className="p-3.5 rounded-xl bg-charcoal border border-champagne/40 text-center space-y-1">
                <span className="text-xs font-bold text-champagne">4. Candidate Ranking</span>
                <p className="text-[11px] text-sage-muted">Multi-Factor Scores</p>
              </div>
              <div className="p-3.5 rounded-xl bg-charcoal border border-emerald-500/40 text-center space-y-1 col-span-2 md:col-span-1">
                <span className="text-xs font-bold text-emerald">5. Better Hiring</span>
                <p className="text-[11px] text-sage-muted">Explainable Decisions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features & AI Capabilities */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald">Why HireSense AI</h2>
          <p className="text-3xl font-extrabold text-warm-white">The Exclusive AI Recruitment Command Center</p>
          <p className="text-sage-muted text-sm">Designed for high-precision recruiting teams that demand speed, accuracy, and zero guesswork.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-charcoal border border-obsidian-border shadow-obsidian-card space-y-3">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald border border-emerald-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-warm-white">Semantic Context Matching</h3>
            <p className="text-xs text-sage-muted leading-relaxed">
              Understands conceptual synonyms. Automatically connects practical experience in transformer fine-tuning with machine learning requirements.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal border border-obsidian-border shadow-obsidian-card space-y-3">
            <div className="p-3 w-fit rounded-xl bg-champagne/10 text-champagne border border-champagne/20">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-warm-white">What-If Score Simulator</h3>
            <p className="text-xs text-sage-muted leading-relaxed">
              Dynamically modify required or preferred skills to observe live rank recalculations and mathematical delta explanations in real-time.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal border border-obsidian-border shadow-obsidian-card space-y-3">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald border border-emerald-500/20">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-warm-white">✦ HireSense Intelligence</h3>
            <p className="text-xs text-sage-muted leading-relaxed">
              Generates transparent natural-language justifications for every candidate score with personalized interview questions for technical interviews.
            </p>
          </div>
        </div>
      </section>

      {/* Recruiter & Candidate Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-charcoal/50 border-t border-b border-obsidian-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-obsidian border border-obsidian-border space-y-4">
            <div className="flex items-center gap-2 text-emerald">
              <Users2 className="w-5 h-5" />
              <h3 className="font-bold text-base text-warm-white">For Recruiters & Hiring Managers</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-sage-muted">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald" /> Batch resume screening of 1,000+ applicants in seconds</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald" /> Customizable mathematical component scoring weights</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald" /> Instant candidate skill gap & competency matrix</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald" /> CSV, Excel, and PDF comprehensive report exports</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-obsidian border border-obsidian-border space-y-4">
            <div className="flex items-center gap-2 text-champagne">
              <Award className="w-5 h-5" />
              <h3 className="font-bold text-base text-warm-white">For Candidates & Job Seekers</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-sage-muted">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-champagne" /> Instant Resume Quality (0-100) & structural feedback</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-champagne" /> ATS Compatibility checker with formatting checklist</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-champagne" /> AI job recommendations with match percentages</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-champagne" /> One-click application tracking and status updates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-obsidian-border bg-obsidian py-8 px-4 text-center text-xs text-sage-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={24} showText={true} subtitle={false} />
          <p>© 2026 HireSense AI. All rights reserved. "Smarter Screening. Better Hiring."</p>
        </div>
      </footer>
    </div>
  )
}
