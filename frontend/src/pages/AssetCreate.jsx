import { useState,useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import {getAllDept} from "../services/department.service";
import { getAllCat } from "../services/category.service";
import { getSubCatByCategory } from "../services/subcat.service";
import SelectField from "../components/form/SelectField";
import { getAllVendor } from "../services/vendor.service";
import LocationPicker from "../components/map/LocationPicker";
import { useAuth } from "../hook/useAuth";

export default function CreateAsset() {
  const {user,loadinguser,reloadUser}= useAuth();    
  const nav = useNavigate();
  const [form, setForm] = useState({
    asset_name: "",
    category: "",
    subcategory: "",
    serial_number: "",
    model_number: "",
    purchase_date: "",
    purchase_cost: "",
    vendor: "",
    status: "ACTIVE",
    location:"",
    region: "",
    latitude: "",
    longitude: "",
    warranty_expiry: "",
    description: "",
    assigned_to: "NOT ASSIGNED",
    department: "",
    category_id: "",
    subcategory_id: ""
  });

  // const [images, setImages] = useState([]);
  // const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departments,setDepartments] = useState([]);
  const [category,setCategory]=useState([]);
 // const [subcat,setSubcat]=useState([]);
  const [vendor,setVendor]=useState([]);


  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcat, setLoadingSubcat] = useState(false);


  useEffect(() => {
    async function loadMeta() {
      try {
        const [deptRes,CatRes,vendorRes]= await Promise.all([
          getAllDept(),getAllCat(),getAllVendor()
        ]);

        setDepartments(deptRes.data);
        setCategory(CatRes.data);
        //setSubcat(SubCatRes.data);
        setVendor(vendorRes.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load dropdown data");
      }
    }

    loadMeta();
  }, []);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log(form);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      // images.forEach((img) => fd.append("file", img));
      // documents.forEach((doc) => fd.append("file", doc));

      await API.post("/assets", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      nav("/assets");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  if (loadinguser) {
    return (
      <aside className="w-64 h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading…
      </aside>
    );
  }

  if (!user) {
    reloadUser();
    return null;
  }
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="
        bg-white/10 backdrop-blur-xl
        border border-white/20
        rounded-2xl shadow-xl
        p-6
      ">

      <h1 className="text-2xl font-semibold mb-6 text-white tracking-wide">
        Create Asset
      </h1>


      <form onSubmit={submit} className="grid grid-cols-2 gap-5">
        <Input label="Asset Name" name="asset_name" onChange={handleChange} />
        
        <SelectField
          label="Category"
          name="category"
          value={form.category_id}  //
          onChange={async(e)=>{
            const categoryId=e.target.value;

            const selected = category.find(
              (c)=>String(c.category_id) === categoryId
            );

            setForm((f) => ({
              ...f,
              category_id: categoryId,                 // ID saved
              category: selected?.category_name || "", // NAME saved
              subcategory_id: "",
              subcategory: ""
            }));

           try{
            setLoadingSubcat(true); 
            const res = await getSubCatByCategory(categoryId);
            setSubcategories(res.data);
            }catch(err){
              console.error(err);
            }finally{
              setLoadingSubcat(false);
            }
          }}
          options={category}
          placeholder="Select Category"
          getKey={(c) => c.category_id}
          getLabel={(c) => c.category_name}
          getValue={(c) => c.category_id}
        />
        {form.category && (<SelectField
          label="Sub-category"
          name="subcategory"
          value={form.subcategory}
          onChange={(e) => {
            const subcatId = e.target.value;

            const selected = subcategories.find(
              (s) => String(s.subcategory_id) === subcatId
            );

            setForm((f) => ({
              ...f,
              subcategory_id: subcatId,
              subcategory: selected?.subcategory_name || ""
            }));
          }}
          options={subcategories}
          placeholder={loadingSubcat ? "Loading...":"Select Sub-category"}
          disabled={loadingSubcat}
          getKey={(c) => c.subcategory_id}
          getLabel={(c) => c.subcategory_name}
          getValue={(c) => c.subcategory_id}
        />)}
        <SelectField
          label="Vendor"
          name="vendor"
          value={form.vendor}
          onChange={handleChange}
          options={vendor}
          placeholder="Select Vendor"
          getKey={(c) => c.vendor_id}
          getLabel={(c) => c.vendor_name}
          getValue={(c) => c.vendor_name}
        />
        <SelectField
          label="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
          options={departments}
          placeholder="Select Department"
          getKey={(d) => d.department_id}
          getLabel={(d) => d.department_name}
          getValue={(d) => d.department_name}
        />

        <Input label="Serial Number" name="serial_number" onChange={handleChange} />
        <Input label="Model Number" name="model_number" onChange={handleChange} />
        {/* <Input label="Location" name="location" onChange={handleChange} /> */}

        <Input type="date" label="Purchase Date" name="purchase_date" onChange={handleChange} />
        <Input type="number" label="Purchase Cost" name="purchase_cost" onChange={handleChange} />

        <Input type="date" label="Warranty Expiry" name="warranty_expiry" onChange={handleChange} />

      {user.role.toUpperCase()==="ADMIN" &&  <select
          name="status"
          className="
            col-span-2
            bg-white/10 text-white
            border border-white/20
            rounded-lg px-3 py-2
            backdrop-blur
            focus:outline-none
            focus:ring-2 focus:ring-indigo-500
            transition
          "
          onChange={handleChange}
        >
          <option className="bg-slate-900 text-white" value="ACTIVE">ACTIVE</option>
          <option className="bg-slate-900 text-white" value="IN_REPAIR">IN REPAIR</option>
          <option className="bg-slate-900 text-white" value="RETIRED">RETIRED</option>
          <option className="bg-slate-900 text-white" value="OPEN">OPEN</option>
          <option className="bg-slate-900 text-white" value="IN_MAINTENANCE">IN MAINTENANCE</option>
        </select>}


        <textarea
          name="description"
          placeholder="Description"
          className="
            col-span-2
            bg-white/10 text-white
            border border-white/20
            rounded-lg px-3 py-2
            min-h-[100px]
            placeholder:text-white/50
            backdrop-blur
            focus:outline-none
            focus:ring-2 focus:ring-indigo-500
            transition
          "
          onChange={handleChange}
        />


        {/* <FileInput label="Images" multiple accept="image/*" onChange={setImages} />
        <FileInput label="Documents (PDF)" multiple accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={setDocuments} /> */}

        {/* LOCATION DETAILS */}
        <div className="col-span-2 space-y-3
                          mt-6 p-4
                          rounded-xl
                          bg-black/20
                          border border-white/10">
          <h3 className="font-medium text-white tracking-wide">Asset Location</h3>

          <Input
            label="Location Name"
            name="location"
            value={form.location}
            onChange={handleChange}
          />

          <Input
            label="Region"
            name="region"
            value={form.region}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Latitude"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
            />
            <Input
              label="Longitude"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
            />
          </div>

          <LocationPicker
            value={
              form.latitude && form.longitude
                ? [Number(form.latitude), Number(form.longitude)]
                : null
            }
            onChange={({ lat, lng }) =>
              setForm((f) => ({
                ...f,
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6)
              }))
            }
          />
        </div>


        <button
          disabled={loading}
          className="col-span-2
                    bg-gradient-to-r from-indigo-600 to-purple-600
                    text-white py-2 rounded-lg
                    hover:from-indigo-700 hover:to-purple-700
                    transition-all
                    disabled:opacity-50
                    shadow-lg"
        >
          {loading ? "Creating..." : "Create Asset"}
        </button>
      </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-white/80 mb-1">
        {label}
      </label>
      <input
        {...props}
        placeholder={label}
        className="w-full
          bg-white/10 text-white
          border border-white/20
          rounded-lg px-3 py-2
          placeholder:text-white/50
          focus:outline-none
          focus:ring-2 focus:ring-indigo-500
          transition
        "
        required
      />

    </div>
  );
}

function FileInput({ label, onChange, ...props }) {
  return (
    <div className="col-span-2 space-y-1">
      <label className="block text-sm text-white/80">{label}</label>
      <input
        {...props}
        type="file"
        onChange={(e) => onChange([...e.target.files])}
        className="block w-full text-sm text-white
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg
          file:border-0
          file:bg-indigo-600
          file:text-white
          hover:file:bg-indigo-700
          cursor-pointer
        "
      />
    

    {/* Show selected file names
      {files.length > 0 && (
        <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
          {files.map((file, idx) => (
            <li key={idx}>
              {file.name}
              <span className="text-gray-400">
                {" "}({Math.round(file.size / 1024)} KB)
              </span>
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
}
