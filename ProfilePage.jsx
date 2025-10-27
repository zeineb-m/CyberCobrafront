import { useAuth } from "./src/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <p className="text-center text-slate-400 mt-10">Not logged in</p>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">👤 Profile</h2>
        <p><span className="font-semibold">Username:</span> {user.username}</p>
        <p><span className="font-semibold">Email:</span> {user.email || "—"}</p>
        <p><span className="font-semibold">Role:</span> {user.roles?.join(", ") || "User"}</p>
        <p><span className="font-semibold">Superuser:</span> {user.is_superuser ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}
