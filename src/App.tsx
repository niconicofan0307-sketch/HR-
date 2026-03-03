import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Briefcase, 
  Users, 
  Video, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Search, 
  BarChart3, 
  Clock,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Play,
  Square,
  Loader2,
  ArrowLeft,
  Star
} from 'lucide-react';
import { generateInterviewQuestions, evaluateInterview } from './services/geminiService';

// --- Types ---
interface Job {
  id: number;
  title: string;
  jd: string;
  traits: string;
  questions: string[];
  created_at: string;
}

interface Interview {
  id: number;
  job_id: number;
  candidate_name: string;
  responses: { question: string; answer: string }[];
  evaluation: string;
  score: number;
  created_at: string;
}

// --- Components ---

const Header = () => (
  <header className="h-16 border-b border-black/5 bg-white/50 backdrop-blur-xl flex items-center px-8 sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <Video className="text-white w-5 h-5" />
      </div>
      <span className="font-bold text-lg tracking-tight">AI Interviewer Pro</span>
    </div>
  </header>
);

const HRDashboard = ({ onSelectJob, onCreateJob }: { onSelectJob: (job: Job) => void, onCreateJob: () => void }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif italic mb-2">Job Openings</h1>
          <p className="text-black/50">Manage your active roles and candidate screenings.</p>
        </div>
        <button 
          onClick={onCreateJob}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Create New Job
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <motion.div 
              key={job.id}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm cursor-pointer group"
              onClick={() => onSelectJob(job)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Briefcase size={24} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/30">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{job.title}</h3>
              <p className="text-sm text-black/50 line-clamp-2 mb-6">{job.jd}</p>
              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                <div className="flex items-center gap-2 text-xs font-medium text-black/40">
                  <Users size={14} />
                  <span>View Candidates</span>
                </div>
                <ChevronRight size={16} className="text-black/20 group-hover:text-indigo-600 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateJobModal = ({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) => {
  const [title, setTitle] = useState('');
  const [jd, setJd] = useState('');
  const [traits, setTraits] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const questions = await generateInterviewQuestions({ title, jd, traits });
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, jd, traits, questions })
      });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-8 border-b border-black/5 flex justify-between items-center">
          <h2 className="text-2xl font-serif italic">Create New Job Opening</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-black/40 mb-2">Job Title</label>
            <input 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-black/5 rounded-xl border-none focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              placeholder="e.g. Senior Product Designer"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-black/40 mb-2">Job Description</label>
            <textarea 
              required
              value={jd}
              onChange={e => setJd(e.target.value)}
              className="w-full px-4 py-3 bg-black/5 rounded-xl border-none focus:ring-2 focus:ring-indigo-600 outline-none transition-all h-32 resize-none"
              placeholder="Paste the JD here..."
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-black/40 mb-2">Core Traits Needed</label>
            <input 
              required
              value={traits}
              onChange={e => setTraits(e.target.value)}
              className="w-full px-4 py-3 bg-black/5 rounded-xl border-none focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              placeholder="e.g. Empathy, Attention to detail, Leadership"
            />
          </div>
          <button 
            disabled={isGenerating}
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                AI Generating Interview Questions...
              </>
            ) : (
              'Create & Generate AI Questions'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const JobDetails = ({ job, onBack }: { job: Job, onBack: () => void }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  useEffect(() => {
    fetch(`/api/interviews/${job.id}`)
      .then(res => res.json())
      .then(data => {
        setInterviews(data);
        setLoading(false);
      });
  }, [job.id]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-black/40 hover:text-black mb-8 transition-colors">
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl font-serif italic mb-4">{job.title}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {job.traits.split(',').map(trait => (
                <span key={trait} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                  {trait.trim()}
                </span>
              ))}
            </div>
            <div className="prose prose-sm text-black/60 max-w-none">
              <h4 className="text-black font-bold mb-2">Job Description</h4>
              <p className="whitespace-pre-wrap">{job.jd}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-600" />
              AI Generated Questions
            </h3>
            <div className="space-y-4">
              {JSON.parse(job.questions as any).map((q: string, i: number) => (
                <div key={i} className="flex gap-4 p-4 bg-black/5 rounded-2xl">
                  <span className="font-mono text-indigo-600 font-bold">0{i+1}</span>
                  <p className="text-sm font-medium">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-96">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users size={20} className="text-indigo-600" />
            Candidates ({interviews.length})
          </h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map(interview => (
                <motion.div 
                  key={interview.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedInterview(interview)}
                  className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm cursor-pointer hover:border-indigo-600/20 transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{interview.candidate_name}</span>
                    <div className="flex items-center gap-1 text-indigo-600">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-bold">{interview.score}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-black/40 font-mono uppercase tracking-widest">
                    <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                    <span>View Assessment</span>
                  </div>
                </motion.div>
              ))}
              {interviews.length === 0 && (
                <div className="text-center py-10 bg-black/5 rounded-3xl border border-dashed border-black/10">
                  <p className="text-sm text-black/40">No candidates yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedInterview && (
          <InterviewDetailsModal 
            interview={selectedInterview} 
            onClose={() => setSelectedInterview(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const InterviewDetailsModal = ({ interview, onClose }: { interview: Interview, onClose: () => void }) => {
  const evaluation = JSON.parse(interview.evaluation as any);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
      >
        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-serif italic">{interview.candidate_name}</h2>
            <p className="text-xs font-mono uppercase tracking-widest text-black/40">Interview Assessment</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">{interview.score}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-black/40">Overall Score</div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Strengths
                </h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.strengths.map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <X size={16} className="text-rose-500" />
                  Areas for Improvement
                </h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.weaknesses.map((w: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-medium rounded-lg">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
              <h4 className="text-sm font-bold mb-3">Final Recommendation</h4>
              <p className="text-sm text-indigo-900 italic leading-relaxed">
                "{evaluation.recommendation}"
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-4">Detailed Assessment</h4>
            <p className="text-sm text-black/60 leading-relaxed whitespace-pre-wrap">
              {evaluation.assessment}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-4">Interview Transcript</h4>
            <div className="space-y-6">
              {interview.responses.map((r, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs font-bold text-indigo-600">Q: {r.question}</p>
                  <p className="text-sm text-black/70 bg-black/5 p-4 rounded-xl italic">
                    "{r.answer}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CandidatePortal = ({ onStartInterview }: { onStartInterview: (job: Job) => void }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif italic mb-4">Candidate Portal</h1>
        <p className="text-black/50 text-lg">Select a position to begin your AI-powered video interview.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <motion.div 
              key={job.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm flex items-center justify-between group"
            >
              <div>
                <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                <div className="flex gap-2">
                  {job.traits.split(',').slice(0, 3).map(trait => (
                    <span key={trait} className="text-[10px] font-mono uppercase tracking-widest text-black/30">
                      #{trait.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => onStartInterview(job)}
                className="bg-black text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all"
              >
                Start Interview
                <Play size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const InterviewSession = ({ job, onComplete }: { job: Job, onComplete: () => void }) => {
  const [step, setStep] = useState<'intro' | 'interview' | 'evaluating' | 'finished'>('intro');
  const [name, setName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ question: string; answer: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState('');

  const questions = JSON.parse(job.questions as any);

  useEffect(() => {
    if (step === 'interview') {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        });

      // Setup Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };
      }
    }

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [step]);

  const startRecording = () => {
    setIsRecording(true);
    setTranscript('');
    recognitionRef.current?.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    
    const newResponses = [...responses, { 
      question: questions[currentQuestionIndex], 
      answer: transcript || "No response provided." 
    }];
    setResponses(newResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscript('');
    } else {
      handleFinish(newResponses);
    }
  };

  const handleFinish = async (finalResponses: any[]) => {
    setStep('evaluating');
    try {
      const evaluation = await evaluateInterview(
        { title: job.title, jd: job.jd, traits: job.traits },
        finalResponses
      );
      
      await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          candidate_name: name,
          responses: finalResponses,
          evaluation: JSON.stringify(evaluation),
          score: evaluation.score
        })
      });
      
      setStep('finished');
    } catch (error) {
      console.error(error);
    }
  };

  if (step === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-20 bg-white rounded-3xl border border-black/5 shadow-xl">
        <h2 className="text-3xl font-serif italic mb-6">Welcome to your interview</h2>
        <p className="text-black/50 mb-8">Please enter your full name and ensure your camera and microphone are working correctly.</p>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-black/40 mb-2">Full Name</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-black/5 rounded-xl border-none focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              placeholder="Your Name"
            />
          </div>
          <button 
            disabled={!name}
            onClick={() => setStep('interview')}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            Enter Interview Room
          </button>
        </div>
      </div>
    );
  }

  if (step === 'evaluating') {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="animate-spin text-indigo-600 mb-6" size={60} />
        <h2 className="text-3xl font-serif italic">Analyzing your responses...</h2>
        <p className="text-black/40 mt-2">Our AI is evaluating your performance based on industry standards.</p>
      </div>
    );
  }

  if (step === 'finished') {
    return (
      <div className="max-w-2xl mx-auto p-12 mt-20 bg-white rounded-3xl border border-black/5 shadow-xl text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-4xl font-serif italic mb-4">Interview Complete!</h2>
        <p className="text-black/50 mb-10">Thank you for your time, {name}. Your responses have been submitted to the HR team for review. We will be in touch soon.</p>
        <button 
          onClick={onComplete}
          className="bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-indigo-600 transition-all"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 flex flex-col md:flex-row gap-8 h-[calc(100vh-100px)]">
      <div className="flex-1 flex flex-col gap-6">
        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute top-6 left-6 flex gap-2">
            <div className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-widest rounded-full flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
              {isRecording ? 'Recording' : 'Live Preview'}
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-center">
            {!isRecording ? (
              <button 
                onClick={startRecording}
                className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
              >
                <Mic size={20} />
                Start Answering
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-rose-700 transition-all shadow-xl"
              >
                <Square size={20} />
                Stop & Next
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-black/5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-bold">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_: any, i: number) => (
                <div key={i} className={`w-8 h-1 rounded-full ${i <= currentQuestionIndex ? 'bg-indigo-600' : 'bg-black/10'}`} />
              ))}
            </div>
          </div>
          <h3 className="text-2xl font-bold leading-tight">{questions[currentQuestionIndex]}</h3>
          
          {isRecording && (
            <div className="mt-8 p-6 bg-indigo-50/50 rounded-2xl border border-dashed border-indigo-200">
              <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">Live Transcription</p>
              <p className="text-sm text-indigo-900 italic">
                {transcript || "Listening..."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-3xl border border-black/5">
          <h4 className="text-sm font-bold mb-4">Interview Progress</h4>
          <div className="space-y-3">
            {questions.map((q: string, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < currentQuestionIndex ? 'bg-emerald-100 text-emerald-600' : i === currentQuestionIndex ? 'bg-indigo-600 text-white' : 'bg-black/5 text-black/30'}`}>
                  {i < currentQuestionIndex ? <CheckCircle2 size={12} /> : i + 1}
                </div>
                <span className={`text-xs truncate ${i === currentQuestionIndex ? 'font-bold text-black' : 'text-black/40'}`}>{q}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl text-white">
          <Clock size={24} className="mb-4 opacity-50" />
          <h4 className="text-sm font-bold mb-1">Take your time</h4>
          <p className="text-xs opacity-70 leading-relaxed">Think about your answer before you start recording. We're looking for honest, detailed responses.</p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'role-selection' | 'hr-dashboard' | 'hr-job-details' | 'candidate-portal' | 'interview-session'>('role-selection');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'role-selection' && (
            <motion.div 
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[80vh] p-8"
            >
              <h1 className="text-6xl font-serif italic mb-4 text-center">Welcome to AI Interviewer</h1>
              <p className="text-black/40 text-xl mb-16 text-center max-w-2xl">The future of recruitment. Choose your path to continue.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setView('hr-dashboard')}
                  className="bg-white p-10 rounded-[40px] border border-black/5 shadow-xl cursor-pointer group hover:border-indigo-600/20 transition-all"
                >
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Users size={32} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">I am an HR Manager</h2>
                  <p className="text-black/50 leading-relaxed">Create job openings, generate AI interview questions, and review candidate assessments.</p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setView('candidate-portal')}
                  className="bg-white p-10 rounded-[40px] border border-black/5 shadow-xl cursor-pointer group hover:border-indigo-600/20 transition-all"
                >
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Video size={32} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">I am a Candidate</h2>
                  <p className="text-black/50 leading-relaxed">Browse open positions and complete your AI-powered video interview in minutes.</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {view === 'hr-dashboard' && (
            <motion.div key="hr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HRDashboard 
                onCreateJob={() => setShowCreateModal(true)}
                onSelectJob={(job) => {
                  setSelectedJob(job);
                  setView('hr-job-details');
                }} 
              />
            </motion.div>
          )}

          {view === 'hr-job-details' && selectedJob && (
            <motion.div key="hr-details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <JobDetails job={selectedJob} onBack={() => setView('hr-dashboard')} />
            </motion.div>
          )}

          {view === 'candidate-portal' && (
            <motion.div key="candidate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CandidatePortal onStartInterview={(job) => {
                setSelectedJob(job);
                setView('interview-session');
              }} />
            </motion.div>
          )}

          {view === 'interview-session' && selectedJob && (
            <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewSession job={selectedJob} onComplete={() => setView('candidate-portal')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCreateModal && (
          <CreateJobModal 
            onClose={() => setShowCreateModal(false)} 
            onCreated={() => {
              // Refresh is handled by the dashboard's useEffect
            }} 
          />
        )}
      </AnimatePresence>

      <footer className="p-8 text-center text-[10px] font-mono uppercase tracking-widest text-black/20">
        &copy; 2024 AI Interviewer Pro &bull; Built with Gemini AI
      </footer>
    </div>
  );
}
