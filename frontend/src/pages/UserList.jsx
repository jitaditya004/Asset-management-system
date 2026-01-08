import { useEffect, useState } from "react";
import API from "../api/api";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [meRes, usersRes] = await Promise.all([
        API.get("/user/me"),
        API.get("/user"),
      ]);
      setMe(meRes.data.user);
      setUsers(usersRes.data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function promoteUser(publicId) {
    if (!window.confirm("Promote this user to ASSET_MANAGER?")) return;
    try {
      await API.patch(`/user/${publicId}/promote`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || "Promotion failed");
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await API.delete(`/user/${userId}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  }

  if (loading) return <p className="p-6 text-white/60">Loading users…</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-semibold tracking-wide">
        User Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((u) => (
          <UserCard
            key={u.public_id}
            user={u}
            me={me}
            onPromote={promoteUser}
            onDelete={deleteUser}
          />
        ))}
      </div>
    </div>
  );
}


function UserCard({ user, me, onPromote, onDelete }) {
  const isMe = me?.public_id === user.public_id;

  return (
    <div
      className="
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-5
        shadow-lg
        hover:shadow-xl hover:-translate-y-1
        transition
      "
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="font-semibold text-lg truncate">
          {user.full_name}
        </h2>
        <p className="text-xs text-white/50 truncate">
          {user.public_id}
        </p>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm mb-5">
        <Info label="Email" value={user.email} />
        <Info label="Department" value={user.department_name || "—"} />
        <Info label="Designation" value={user.designation_name || "—"} />
        <Info label="Role" value={user.role_name} highlight />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end items-center">
        {user.role_name === "USER" && !isMe && (
          <button
            onClick={() => onPromote(user.public_id)}
            className="
              px-3 py-1 text-xs
              rounded-lg
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700
              text-white
              transition
            "
          >
            Promote
          </button>
        )}

        {!isMe && (
          <button
            onClick={() => onDelete(user.user_id)}
            className="
              px-3 py-1 text-xs
              rounded-lg
              bg-red-500/20 text-red-300
              hover:bg-red-500/30
              transition
            "
          >
            Delete
          </button>
        )}

        {isMe && (
          <span className="text-xs text-green-400 italic">
            You
          </span>
        )}
      </div>
    </div>
  );
}


function Info({ label, value, highlight }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-white/50">{label}</span>
      <span
        className={`font-medium ${
          highlight ? "text-indigo-300" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
