import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Verify() {
  const router = useRouter();
  const { token, guild } = router.query;
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [mathProblem, setMathProblem] = useState({ question: '', answer: 0 });
  const [clickPattern, setClickPattern] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [guildInfo, setGuildInfo] = useState(null);

  useEffect(() => {
    if (!token || !guild) {
      setError('Invalid verification link');
      return;
    }
    
    // Generate math captcha
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setMathProblem({
      question: `${num1} + ${num2}`,
      answer: num1 + num2
    });

    // Track time spent
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Fetch guild info
    fetchGuildInfo();

    return () => clearInterval(interval);
  }, [token, guild]);

  const fetchGuildInfo = async () => {
    try {
      const response = await fetch(`/api/verify/guild-info?guild=${guild}`);
      if (response.ok) {
        const data = await response.json();
        setGuildInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch guild info:', error);
    }
  };

  const trackClick = (x, y) => {
    setClickPattern(prev => [...prev, { x, y, time: Date.now() }]);
  };

  const handleStep1 = () => {
    if (timeSpent < 3) {
      setError('Please take your time to read the instructions');
      return;
    }
    setStep(2);
    setError('');
  };

  const handleStep2 = () => {
    if (parseInt(captchaAnswer) !== mathProblem.answer) {
      setError('Incorrect answer. Please try again.');
      return;
    }
    setStep(3);
    setError('');
  };

  const handleStep3 = async () => {
    setLoading(true);
    setError('');

    try {
      // Analyze behavior patterns
      const behaviorScore = analyzeBehavior();
      
      if (behaviorScore < 50) {
        setError('Suspicious activity detected. Please try again.');
        setLoading(false);
        return;
      }

      // Submit verification
      const response = await fetch('/api/verify/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          guild,
          captchaAnswer,
          timeSpent,
          clickPattern: clickPattern.length,
          behaviorScore
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.close();
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeBehavior = () => {
    let score = 100;

    // Too fast = bot
    if (timeSpent < 5) score -= 30;
    
    // Too slow = suspicious
    if (timeSpent > 300) score -= 10;

    // No mouse movement = bot
    if (clickPattern.length < 3) score -= 20;

    // Perfect pattern = bot
    const isRobotic = clickPattern.every((click, i) => {
      if (i === 0) return false;
      const prev = clickPattern[i - 1];
      return Math.abs(click.time - prev.time) < 100;
    });
    if (isRobotic) score -= 40;

    return Math.max(0, score);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-green-500/30 text-center max-w-md">
          <div className="text-8xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-white mb-4">Verified!</h1>
          <p className="text-green-300 text-lg mb-6">
            You have been successfully verified in {guildInfo?.name || 'the server'}
          </p>
          <p className="text-gray-400 text-sm">
            This window will close automatically...
          </p>
        </div>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-red-500/30 text-center max-w-md">
          <div className="text-8xl mb-6">❌</div>
          <h1 className="text-4xl font-bold text-white mb-4">Invalid Link</h1>
          <p className="text-red-300 text-lg">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Verification - Skyfall Security</title>
        <meta name="description" content="Complete verification to access the server" />
      </Head>

      <div 
        className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6"
        onMouseMove={(e) => trackClick(e.clientX, e.clientY)}
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🛡️</div>
            <h1 className="text-4xl font-bold text-white mb-2">Security Verification</h1>
            {guildInfo && (
              <p className="text-gray-300">
                Verifying for: <span className="text-purple-300 font-bold">{guildInfo.name}</span>
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                    step >= s
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Instructions */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-500/20 rounded-2xl p-6 border border-blue-500/30">
                <h2 className="text-2xl font-bold text-white mb-4">📋 Instructions</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-3">•</span>
                    <span>Complete all verification steps to prove you're human</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-3">•</span>
                    <span>This process helps protect the server from bots and spam</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-3">•</span>
                    <span>Your verification will expire in 10 minutes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-3">•</span>
                    <span>Do not refresh or close this page during verification</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-500/20 rounded-2xl p-6 border border-yellow-500/30">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">⚠️ Security Notice</h3>
                <p className="text-gray-300">
                  We use advanced bot detection to keep the server safe. Suspicious behavior may result in verification failure.
                </p>
              </div>

              <p className="text-center text-gray-400 text-sm">
                Time spent: {timeSpent}s (minimum 3s required)
              </p>

              <button
                onClick={handleStep1}
                disabled={timeSpent < 3}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  timeSpent >= 3
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {timeSpent >= 3 ? 'Continue →' : `Wait ${3 - timeSpent}s...`}
              </button>
            </div>
          )}

          {/* Step 2: Math Captcha */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-purple-500/20 rounded-2xl p-8 border border-purple-500/30 text-center">
                <h2 className="text-2xl font-bold text-white mb-6">🧮 Solve This Problem</h2>
                <div className="text-6xl font-bold text-purple-300 mb-6">
                  {mathProblem.question} = ?
                </div>
                <input
                  type="number"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30 text-red-300 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleStep2}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Submit Answer →
              </button>
            </div>
          )}

          {/* Step 3: Final Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-green-500/20 rounded-2xl p-8 border border-green-500/30 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">✨ Almost Done!</h2>
                <p className="text-gray-300 mb-6">
                  Click the button below to complete your verification
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Time Spent</p>
                    <p className="text-white font-bold text-xl">{timeSpent}s</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Interactions</p>
                    <p className="text-white font-bold text-xl">{clickPattern.length}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30 text-red-300 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleStep3}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  '✅ Complete Verification'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
