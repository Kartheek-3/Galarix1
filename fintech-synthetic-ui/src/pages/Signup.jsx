import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();


  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

// 🔥 small delay ensures auth state updates
setTimeout(() => {
  navigate("/");
}, 100);
    } catch {
      alert("Google signup failed");
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

      <div className="w-[460px] backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-white">

        <h2 className="text-3xl font-bold text-center mb-6">
          Create Account 🚀
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-xl bg-white/20"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-xl bg-white/20"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full py-3 mb-4 rounded-xl bg-blue-600"
        >
          Sign Up
        </button>

        <button
  onClick={handleGoogleSignup}
  className="w-full py-3 rounded-xl bg-white text-black flex items-center justify-center gap-3 hover:bg-gray-100 transition"
>
  <img
    src="https://www.svgrepo.com/show/475656/google-color.svg"
    alt="google"
    className="w-5 h-5"
  />
  Continue with Google
</button>

        <p className="text-center mt-4">
  Already have an account?{" "}
 <button
  onClick={() => navigate("/login")}
  className="text-blue-400 hover:underline font-semibold transition"
>
    Login
  </button>
</p>
      </div>
    </div>
  );
}

export default Signup;