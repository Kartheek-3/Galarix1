import { useState ,useEffect} from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loadingDone, setLoadingDone] = useState(false);
    const { user } = useAuth();
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch {
      alert("Invalid credentials");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

// 🔥 small delay ensures auth state updates
setTimeout(() => {
  navigate("/");
}, 100);
    } catch {
      alert("Google login failed");
    }
  };
  useEffect(() => {
  if (user) {
    navigate("/");
  }
}, [user]);
  useEffect(() => {
  const move = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;

    document.documentElement.style.setProperty("--moveX", `${x}px`);
    document.documentElement.style.setProperty("--moveY", `${y}px`);
  };

  window.addEventListener("mousemove", move);
  return () => window.removeEventListener("mousemove", move);
}, []);

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-animated galarix-bg">

      {/* CARD */}
     
<div className="
  relative z-10
  w-[460px]
  backdrop-blur-xl
  bg-white/10
  border border-white/20
  shadow-2xl
  rounded-3xl
  p-8
  text-white
  transition duration-300
  hover:-translate-y-2 hover:shadow-blue-500/30
">
        {/* GALARIX BRANDING */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Galarix
          </h1>
          <p className="text-xs text-slate-400 tracking-widest">
            FINTECH DATA ENGINE
          </p>
        </div>

        {/* HEADER */}
        <h2 className="text-3xl font-bold text-center mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-sm text-slate-300 text-center mb-6">
          Login to continue
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email address"
          className="w-full p-3 mb-4 rounded-xl bg-white/20 border border-white/30 placeholder-slate-300 focus:outline-none input-glow"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-2 rounded-xl bg-white/20 border border-white/30 placeholder-slate-300 focus:outline-none input-glow"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* FORGOT */}
        <div className="text-right mb-4">
          <span className="text-sm text-blue-400 cursor-pointer hover:underline">
            Forgot password?
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full py-3 mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-[1.02] transition font-semibold ripple"
        >
          Login
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="text-xs text-slate-300">OR</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded-xl bg-white text-black flex items-center justify-center gap-3 hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5"
          />
          Continue with Google
        </button>

        {/* FOOTER */}
        <p className="text-sm text-center mt-5 text-slate-300">
          Don't have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;