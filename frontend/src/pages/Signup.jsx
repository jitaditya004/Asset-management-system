import { useState, useEffect } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import { getAllDept } from "../services/department.service";
import { getAllDesig } from "../services/designation.services";
import SelectField from "../components/form/SelectField";

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    designation: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    console.log(form);
    if (!form.full_name || !form.email || !form.password || !form.department) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/register", form, { withCredentials: true });

      setSuccess("Account created successfully. You can now log in.");
      setForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        designation: "",
        department: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [deptRes, desigRes] = await Promise.all([
          getAllDept(),
          getAllDesig(),
        ]);

        setDepartments(deptRes.data);
        setDesignations(desigRes.data);
      } catch (err) {
        setError("Server Down");
        console.error(err);
      }
    }

    loadMeta();
  }, []);

  return (
    <div
      className="
        min-h-screen flex items-center justify-center
        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
      "
    >
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-md
          bg-white/10 backdrop-blur-xl
          border border-white/20
          rounded-2xl
          shadow-2xl
          p-8
          space-y-4
          text-white
          animate-fadeIn
        "
      >
        {/* Title */}
        <div className="text-center mb-2">
          <h2 className="text-3xl font-semibold tracking-wide">
            Create Account ✨
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Join the Asset Management Portal
          </p>
        </div>

        {/* Messages */}
        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        {/* Inputs */}
        <Input
          label="Full Name *"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
        />

        <Input
          label="Email *"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />

        <Input
          label="Password *"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />

        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />

        {/* Selects */}
        <SelectField
          label="Department *"
          name="department"
          value={form.department}
          onChange={handleChange}
          options={departments}
          placeholder="Select Department"
          getKey={(d) => d.department_id}
          getLabel={(d) => d.department_name}
          getValue={(d) => d.department_name}
        />

        <SelectField
          label="Designation"
          name="designation"
          value={form.designation}
          onChange={handleChange}
          options={designations}
          placeholder="Select Designation"
          getKey={(d) => d.designation_id}
          getLabel={(d) => d.designation_name}
          getValue={(d) => d.designation_name}
        />

        {/* Submit */}
        <button
          disabled={loading}
          className="
            w-full mt-4
            bg-gradient-to-r from-slate-700 to-slate-600
            hover:from-slate-600 hover:to-slate-500
            text-white py-2.5 rounded-lg
            font-medium
            shadow-lg hover:shadow-xl
            transition
            disabled:opacity-50
          "
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-slate-300 hover:text-slate-200 font-medium transition"
          >
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1 text-white/80">
        {label}
      </label>
      <input
        {...props}
        className="
          w-full
          bg-white/10 backdrop-blur
          border border-white/20
          px-4 py-2.5
          rounded-lg
          text-white
          placeholder:text-white/40
          focus:outline-none
          focus:ring-2 focus:ring-slate-400
          transition
        "
      />
    </div>
  );
}
