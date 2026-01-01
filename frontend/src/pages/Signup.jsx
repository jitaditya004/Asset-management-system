
import { useState,useEffect } from "react";
import API from "../api/api";
import {Link} from "react-router-dom";
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
  const [departments,setDepartments]=useState([]);
  const [designations,setDesignations]=useState([]);

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


      await API.post(
        "/auth/register",form,{withCredentials: true},
      );

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


  useEffect(()=>{
    async function loadMeta() {
      try{
        const [deptRes,desigRes]=await Promise.all([getAllDept(),getAllDesig()]);

        setDepartments(deptRes.data);
        setDesignations(desigRes.data);
      }catch(err){
        setError("Server Down");
        console.error(err);
      }
    }

    loadMeta();
  },[]);

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-700">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow space-y-4"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Create Account
        </h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}

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

        {/* <Input
          label="Designation"
          name="designation"
          value={form.designation}
          onChange={handleChange}
        /> */}

        <SelectField
          label="Department *"
          name="department"
          value={form.department}
          onChange={handleChange}
          options={departments}
          placeholder="Select Department"
          getKey={(d) => d.department_id}
          getLabel={(d) => d.department_name}
          getValue={(d)=>d.department_name}
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
          getValue={(d)=>d.designation_name}
        />

        {/* <Input
          label="Department *"
          name="department"
          value={form.department}
          onChange={handleChange}
        /> */}

        <button
          disabled={loading}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
        <div className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
         Login
          </Link>
         </div>

      </form>
      
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
