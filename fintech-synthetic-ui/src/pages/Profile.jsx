import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="p-8 rounded-2xl shadow-xl bg-white dark:bg-slate-900 text-center">

        {/* Avatar */}
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl mx-auto mb-4">
            {(user?.displayName || user?.email)?.charAt(0).toUpperCase()}
          </div>
        )}

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          {user?.displayName || "User"}
        </h2>

        <p className="text-sm text-slate-500">
          {user?.email}
        </p>

      </div>
    </div>
  );
}

export default Profile;