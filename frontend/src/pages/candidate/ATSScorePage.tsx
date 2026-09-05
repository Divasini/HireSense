import React, { useEffect, useState } from 'react';
import { getMyProfile } from '@/api/candidates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScoreCircle } from '@/components/common/ScoreCircle';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Upload,
  FileSearch,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export const ATSScorePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sage">Loading ATS score...</div>
      </div>
    );
  }

  if (!profileData?.has_resume) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-6">
        <div className="rounded-full bg-obsidian-border p-6 shadow-md border border-obsidian-border/50">
          <Upload className="h-12 w-12 text-sage-muted" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-warm-white">No Resume Uploaded</h2>
          <p className="text-sage max-w-md mx-auto">
            Upload your resume to get an AI-powered ATS scan. Discover how parsers read your document and get actionable feedback.
          </p>
        </div>
        <Link to="/candidate/profile">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Go to Profile to Upload
          </Button>
        </Link>
      </div>
    );
  }

  const atsAnalysis = profileData?.ats_analysis || {};
  const overallScore = atsAnalysis?.overall_score || profileData?.ats_score || 0;
  const breakdown = atsAnalysis?.breakdown || {};
  const checklist = atsAnalysis?.checklist || [];
  const whatHelped = atsAnalysis?.what_helped || [];
  const whatReduced = atsAnalysis?.what_reduced || [];
  const suggestions = atsAnalysis?.suggestions || [];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-warm-white flex items-center gap-2">
            <FileSearch className="h-8 w-8 text-emerald-400" />
            ATS Parser Results
          </h1>
          <p className="text-sage mt-2">
            See exactly how your resume is read by Applicant Tracking Systems.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overall Score & Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-charcoal border-obsidian-border">
            <CardContent className="pt-6 flex flex-col items-center">
              <ScoreCircle score={overallScore} size={180} />
              <h3 className="text-xl font-bold text-warm-white mt-6 text-center">
                ATS Readability Score
              </h3>
              <p className="text-sage-muted text-sm text-center mt-2">
                A score of 80+ ensures your resume can be safely parsed by standard ATS platforms.
              </p>
            </CardContent>
          </Card>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <MetricCard title="Standard Headers" value={breakdown.standard_headers} />
            <MetricCard title="Parser Readability" value={breakdown.parser_readability} />
            <MetricCard title="Formatting Hygiene" value={breakdown.formatting_hygiene} />
            <MetricCard title="Contact Visibility" value={breakdown.contact_visibility} />
          </div>
        </div>

        {/* Right Column: Detailed Analysis */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Checklist */}
          <Card className="bg-charcoal border-obsidian-border">
            <CardHeader>
              <CardTitle className="text-warm-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Essential Parse Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklist.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-md bg-charcoal-light/30 border border-obsidian-border/50">
                    {item.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-warm-white font-medium">{item.item}</h4>
                      <p className="text-sm text-sage">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What Helped */}
            <Card className="bg-charcoal border-obsidian-border border-t-2 border-t-emerald-500/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-warm-white flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  What Strengthened
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {whatHelped.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-emerald-300 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {whatHelped.length === 0 && (
                    <li className="text-sage text-sm italic">No data available</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* What Reduced */}
            <Card className="bg-charcoal border-obsidian-border border-t-2 border-t-amber-500/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-warm-white flex items-center gap-2 text-lg">
                  <TrendingDown className="h-5 w-5 text-amber-400" />
                  What Reduced
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {whatReduced.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-amber-300/90 text-sm">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {whatReduced.length === 0 && (
                    <li className="text-sage text-sm italic">No deductions found</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <Card className="bg-charcoal border-obsidian-border">
              <CardHeader>
                <CardTitle className="text-warm-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-champagne" />
                  ATS Improvements Needed
                </CardTitle>
                <CardDescription className="text-sage">
                  Actionable steps to fix parsing issues.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.map((sug: any, idx: number) => (
                  <div key={idx} className="bg-charcoal-light/60 border border-obsidian-border rounded-lg p-4 flex flex-col gap-3">
                    <div className="flex items-center">
                      <span className="text-xs font-semibold bg-obsidian-border text-champagne px-2 py-1 rounded">
                        {sug.section}
                      </span>
                    </div>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex gap-2">
                        <span className="font-bold text-red-400 min-w-[45px]">WHAT</span>
                        <span className="text-warm-white">{sug.what}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-amber-400 min-w-[45px]">WHY</span>
                        <span className="text-sage">{sug.why}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-emerald-400 min-w-[45px]">HOW</span>
                        <span className="text-warm-white">{sug.how}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value }: { title: string; value?: number }) => {
  const displayValue = value ?? 0;
  return (
    <Card className="bg-charcoal-light/60 border-obsidian-border">
      <CardContent className="p-4">
        <h4 className="text-xs font-medium text-sage-muted mb-2 uppercase tracking-wider">{title}</h4>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-2xl font-bold text-warm-white">{displayValue}%</span>
        </div>
        <div className="h-1.5 w-full bg-obsidian-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${displayValue}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
