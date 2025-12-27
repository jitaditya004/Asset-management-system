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
  console.log(me," ----  ",users);
  if (loading) return <p className="p-6">Loading users…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">User Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  console.log(isMe);

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="font-semibold text-lg">{user.full_name}</h2>
        <p className="text-xs text-gray-500">{user.public_id}</p>
      </div>

      <div className="space-y-1 text-sm mb-4">
        <Info label="Email" value={user.email} />
        <Info label="Department" value={user.department_name || "—"} />
        <Info label="Designation" value={user.designation_name || "—"} />
        <Info label="Role" value={user.role_name} />
      </div>

      <div className="flex gap-2 justify-end">
        {user.role_name === "USER" && !isMe && (
          <button
            onClick={() => onPromote(user.public_id)}
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded"
          >
            Promote
          </button>
        )}

        {!isMe && (
          <button
            onClick={() => onDelete(user.user_id)}
            className="text-xs px-3 py-1 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        )}

        {isMe && (
          <span className="text-xs text-gray-400 italic">You</span>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
