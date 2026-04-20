import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle, Shield, KeyRound, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';
import UserService from '../../../services/user.service';
import { useTranslation } from 'react-i18next';

export const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Translation keys object
  const forgotPasswordKeys = {
    // Left section
    title: 'forgotPassword.title',
    description: 'forgotPassword.description',
    secureEncrypted: 'forgotPassword.secureEncrypted',
    secureEncryptedDesc: 'forgotPassword.secureEncryptedDesc',
    twoStepVerification: 'forgotPassword.twoStepVerification',
    twoStepVerificationDesc: 'forgotPassword.twoStepVerificationDesc',
    quickRecovery: 'forgotPassword.quickRecovery',
    quickRecoveryDesc: 'forgotPassword.quickRecoveryDesc',
    rememberPassword: 'forgotPassword.rememberPassword',
    backToLogin: 'forgotPassword.backToLogin',
    
    // Stepper
    stepEmail: 'forgotPassword.stepEmail',
    stepVerify: 'forgotPassword.stepVerify',
    stepReset: 'forgotPassword.stepReset',
    stepEmailDesc: 'forgotPassword.stepEmailDesc',
    stepVerifyDesc: 'forgotPassword.stepVerifyDesc',
    stepResetDesc: 'forgotPassword.stepResetDesc',
    
    // Step 1 - Email Form
    emailAddress: 'forgotPassword.emailAddress',
    emailPlaceholder: 'forgotPassword.emailPlaceholder',
    emailHint: 'forgotPassword.emailHint',
    sendCode: 'forgotPassword.sendCode',
    sending: 'forgotPassword.sending',
    
    // Step 2 - OTP Verification
    verificationCode: 'forgotPassword.verificationCode',
    otpHint: 'forgotPassword.otpHint',
    otpCharsHint: 'forgotPassword.otpCharsHint',
    otpCodeSent: 'forgotPassword.otpCodeSent',
    otpAllowedChars: 'forgotPassword.otpAllowedChars',
    back: 'forgotPassword.back',
    verifyCode: 'forgotPassword.verifyCode',
    resendCode: 'forgotPassword.resendCode',
    
    // Step 3 - Reset Password
    newPassword: 'forgotPassword.newPassword',
    newPasswordPlaceholder: 'forgotPassword.newPasswordPlaceholder',
    confirmNewPassword: 'forgotPassword.confirmPassword',
    confirmPasswordPlaceholder: 'forgotPassword.confirmPasswordPlaceholder',
    passwordHint: 'forgotPassword.passwordHint',
    passwordSecurity: 'forgotPassword.passwordSecurity',
    resetPassword: 'forgotPassword.resetPassword',
    resettingPassword: 'forgotPassword.resettingPassword',
    
    // Messages
    otpSentSuccess: 'forgotPassword.otpSentSuccess',
    otpVerifiedSuccess: 'forgotPassword.otpVerifiedSuccess',
    passwordResetSuccess: 'forgotPassword.passwordResetSuccess',
    otpResendSuccess: 'forgotPassword.otpResendSuccess',
    
    // Errors
    otpIncomplete: 'forgotPassword.otpIncomplete',
    passwordsMismatch: 'forgotPassword.passwordsMismatch',
    passwordMinLength: 'forgotPassword.passwordMinLength',
    failedInitiate: 'forgotPassword.failedInitiate',
    failedSendOtp: 'forgotPassword.failedSendOtp',
    invalidOtp: 'forgotPassword.invalidOtp',
    failedReset: 'forgotPassword.failedReset',
    networkError: 'forgotPassword.networkError',
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const forgotResponse = await UserService.forgotPassword(email);
      const forgotData = forgotResponse.data;

      if (forgotData.statusCode !== 200) {
        setError(forgotData.message || t(forgotPasswordKeys.failedInitiate));
        return;
      }

      const otpResponse = await UserService.sendOtp(email);
      const otpData = otpResponse.data;

      if (otpData.statusCode === 200) {
        setCurrentStep(2);
        setSuccessMessage(t(forgotPasswordKeys.otpSentSuccess));
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(otpData.message || t(forgotPasswordKeys.failedSendOtp));
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        t(forgotPasswordKeys.networkError)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP using validateOtpCode
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError(t(forgotPasswordKeys.otpIncomplete));
      setIsLoading(false);
      return;
    }

    try {
      const validateResponse = await UserService.validateOtpCode(otpCode);
      const validateData = validateResponse.data;

      if (validateData.statusCode === 200) {
        const token = validateData.data;
        setResetToken(token);
        setSuccessMessage(t(forgotPasswordKeys.otpVerifiedSuccess));
        setTimeout(() => setSuccessMessage(""), 2000);
        setCurrentStep(3);
      } else {
        setError(validateData.message || t(forgotPasswordKeys.invalidOtp));
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message || t(forgotPasswordKeys.networkError)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password with token in header
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError(t(forgotPasswordKeys.passwordsMismatch));
      return;
    }

    if (newPassword.length < 8) {
      setError(t(forgotPasswordKeys.passwordMinLength));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await UserService.resetPassword(resetToken, {
        newPassword,
        confirmNewPassword,
      });

      const data = response.data;

      if (data.statusCode === 200) {
        setSuccessMessage(t(forgotPasswordKeys.passwordResetSuccess));
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(data.message || t(forgotPasswordKeys.failedReset));
      }
    } catch (error: any) {
      const backendError =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        error?.message ||
        t(forgotPasswordKeys.networkError);

      setError(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await UserService.sendOtp(email);
      const data = response.data;

      if (data.statusCode === 200) {
        setSuccessMessage(t(forgotPasswordKeys.otpResendSuccess));
        setTimeout(() => setSuccessMessage(""), 3000);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(data.message || t(forgotPasswordKeys.failedSendOtp));
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message || t(forgotPasswordKeys.networkError)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (sanitizedValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = sanitizedValue;
      setOtp(newOtp);
      
      if (sanitizedValue && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
      
      if (sanitizedValue && index === 5 && newOtp.every(char => char !== '')) {
        const otpCode = [...newOtp].join('');
        if (otpCode.length === 6) {
          setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { bubbles: true }));
            }
          }, 100);
        }
      }
    }
  };

  // Handle paste for OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedChars = pastedData.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
    
    if (pastedChars.length > 0) {
      const otpArray = pastedChars.split('');
      const newOtp = [...otp];
      for (let i = 0; i < Math.min(otpArray.length, 6); i++) {
        newOtp[i] = otpArray[i];
      }
      setOtp(newOtp);
      
      if (pastedChars.length === 6) {
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true }));
          }
        }, 100);
      }
    }
  };

  // Handle key down for backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step indicators
  const steps = [
    { number: 1, title: t(forgotPasswordKeys.stepEmail), description: t(forgotPasswordKeys.stepEmailDesc) },
    { number: 2, title: t(forgotPasswordKeys.stepVerify), description: t(forgotPasswordKeys.stepVerifyDesc) },
    { number: 3, title: t(forgotPasswordKeys.stepReset), description: t(forgotPasswordKeys.stepResetDesc) }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SECTION - Classic Branding/Info */}
        <div className="md:w-1/2 bg-white border-r border-gray-100 p-8 md:p-12 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-indigo-50 p-2 rounded-xl">
                <KeyRound className="w-8 h-8 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{t(forgotPasswordKeys.title)}</span>
            </div>
            
            {/* Main Content */}
            <div className="mb-8 leading-relaxed hidden sm:block">
              <p className="text-gray-600 text-lg leading-relaxed hidden sm:block">
                {t(forgotPasswordKeys.description)}
              </p>
            </div>
            
            {/* Feature List */}
            <div className="space-y-5 leading-relaxed hidden sm:block">
              <div className="flex items-start gap-3">
                <div className="bg-green-50 rounded-full p-1 mt-0.5">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t(forgotPasswordKeys.secureEncrypted)}</h3>
                  <p className="text-gray-500 text-sm">{t(forgotPasswordKeys.secureEncryptedDesc)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 rounded-full p-1 mt-0.5">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t(forgotPasswordKeys.twoStepVerification)}</h3>
                  <p className="text-gray-500 text-sm">{t(forgotPasswordKeys.twoStepVerificationDesc)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-50 rounded-full p-1 mt-0.5">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t(forgotPasswordKeys.quickRecovery)}</h3>
                  <p className="text-gray-500 text-sm">{t(forgotPasswordKeys.quickRecoveryDesc)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Link */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              {t(forgotPasswordKeys.rememberPassword)}{' '}
              <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                {t(forgotPasswordKeys.backToLogin)}
              </a>
            </p>
          </div>
        </div>

        {/* RIGHT SECTION - Stepper & Forms */}
        <div className="md:w-1/2 bg-gray-50 p-8 md:p-12">
          {/* Stepper */}
          <div className="mb-10">
            <div className="flex justify-between items-center relative">
              {steps.map((step, idx) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        currentStep >= step.number
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white border-2 border-gray-300 text-gray-500'
                      }`}
                    >
                      {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                    </div>
                    <span className={`text-xs mt-2 font-medium hidden sm:block ${
                      currentStep >= step.number ? 'text-indigo-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                        currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-in fade-in duration-300">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Step 1: Email Form */}
          {currentStep === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t(forgotPasswordKeys.emailAddress)}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t(forgotPasswordKeys.emailPlaceholder)}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t(forgotPasswordKeys.emailHint)}
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t(forgotPasswordKeys.sending)}
                  </>
                ) : (
                  <>
                    {t(forgotPasswordKeys.sendCode)} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t(forgotPasswordKeys.verificationCode)}
                </label>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((char, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={char}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading}
                      className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold font-mono bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all uppercase"
                      style={{ textTransform: 'uppercase' }}
                      placeholder="•"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  {t(forgotPasswordKeys.otpCodeSent)} <span className="font-medium text-gray-700">{email}</span>
                </p>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {t(forgotPasswordKeys.otpAllowedChars)}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  disabled={isLoading}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition disabled:opacity-50 bg-white"
                >
                  {t(forgotPasswordKeys.back)}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t(forgotPasswordKeys.verifyCode)}
                </button>
              </div>
              
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="w-full text-indigo-600 text-sm hover:text-indigo-700 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t(forgotPasswordKeys.resendCode)}
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {currentStep === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t(forgotPasswordKeys.newPassword)}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t(forgotPasswordKeys.newPasswordPlaceholder)}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t(forgotPasswordKeys.passwordHint)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t(forgotPasswordKeys.confirmNewPassword)}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder={t(forgotPasswordKeys.confirmPasswordPlaceholder)}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {t(forgotPasswordKeys.passwordSecurity)}
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t(forgotPasswordKeys.resettingPassword)}
                  </>
                ) : (
                  t(forgotPasswordKeys.resetPassword)
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;