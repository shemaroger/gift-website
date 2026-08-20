import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Hand } from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginUser, verifyOTP, fetchUserById } from "../../api";

export default function LoginUI() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    const response = await loginUser({ email, password });

    if (response.success) {
      toast.success("Login successful");
      setOtpRequired(true);
    } else {
      setFormError(response.message);
      toast.error(response.message);
    }

    setIsLoading(false);
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    const responseOTP = await verifyOTP(email, otp);

    if (!responseOTP.success) {
      setFormError(responseOTP.message);
      toast.error(responseOTP.message);
      setIsLoading(false);
      return;
    }

    const userData = responseOTP.data?.user;
    const accessToken = responseOTP.data?.access;
    const refreshToken = responseOTP.data?.refresh;

    if (accessToken && refreshToken && userData) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      const response = await fetchUserById(userData.id);
      if (response.success && response.data && response.data.is_active === false) {
        toast.error('Your account is not active. Please contact the admin.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        setIsLoading(false);
        navigate('/autho/login');
        return;
      }
    }

    toast.success("OTP verified successfully");
    navigate('/dashboard/adminDashboard');
  };


  return (
    <div className="flex h-screen bg-green-800">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col w-1/2 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px w-full bg-white"
              style={{
                top: `${i * 10}%`,
                transform: `rotate(${i * 3}deg)`
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="flex items-center mb-16 relative z-10">
          <div className="h-14 w-14 flex items-center justify-center bg-white rounded-3xl mr-2">
            <img
              src="/images/gift.jpg"
              alt="Ganza-Inema Fair Trade Logo"
              className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-2xl"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-green-200">Ganza-Inema</span> <span className="text-orange-300">Fair Trade</span>
          </h1>
        </div>

        {/* Main hero section */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <h2 className="font-display text-4xl font-semibold mb-4">The admin side of the work</h2>
          <p className="text-green-100 mb-8">
            Manage savings groups, events, and content for GIfT — the Community Benefit Company
            registered by the Rwanda Development Board, based in Kicukiro District's Kanombe Sector.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-white rounded-l-3xl flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to Home Button */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-green-800 transition-colors duration-200 group"
            >
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>

          <div className="flex md:hidden items-center justify-center mb-8">
            <div className="h-10 w-10 flex items-center justify-center bg-green-800 rounded-full mr-2">
              <img
                src="/images/gift.jpg"
                alt="Ganza-Inema Fair Trade Logo"
                className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-2xl"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-green-600">Ganza-Inema</span> <span className="text-orange-600">Fair Trade</span>
            </h1>
          </div>

          <h2 className="font-display text-3xl font-semibold text-gray-800 mb-2">Welcome back <Hand className="inline w-6 h-6 text-orange-600" /></h2>

          {otpRequired ? (
            <>
              <p className="text-gray-500 mb-8">Enter the verification code sent to your email</p>

              <form onSubmit={handleOtpVerification} className="space-y-6" noValidate>
                {formError && (
                  <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                    {formError}
                  </p>
                )}
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setFormError(""); }}
                    placeholder="Enter 6-digit code"
                    aria-invalid={!!formError}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !otp}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-md transition duration-300 flex justify-center items-center"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm">
                    OTP sent to <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Check your email inbox and spam folder
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-8">Sign in to continue to your account</p>

              <form onSubmit={handleLogin} className="space-y-6" noValidate>
                {formError && (
                  <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                    {formError}
                  </p>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                    placeholder="Enter your email"
                    aria-invalid={!!formError}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFormError(""); }}
                    placeholder="Enter your password"
                    aria-invalid={!!formError}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-md transition duration-300 flex justify-center items-center"
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        toastStyle={{
          backgroundColor: '#ffffff',
          color: '#333333',
          borderRadius: '8px',
          border: '1px solid #ddd',
          padding: '16px',
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
          maxWidth: '700px',
          minWidth: '200px',
          fontSize: '16px',
        }}
      />
    </div>
  );
}