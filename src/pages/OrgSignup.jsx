import React, { useState } from "react";
import axios from "axios";
// removed framer-motion; using CSS transitions instead

const OrganizerSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    logo: null,
    description: "",
  });
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const res = await axios.post("/api/organizer/signup", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message || "Signup successful!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong!");
    }
  };

  // floating background circles
  const FloatingCircles = () => {
    const circles = Array.from({ length: 10 });
    return (
      <div className="absolute inset-0 overflow-hidden">
        {circles.map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-purple-300/70 blur-3xl animate-pulse"
            style={{
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-purple-300 to-indigo-300 overflow-hidden">
      {/* Floating circles background */}
      <FloatingCircles />

      {/* Form card */}
      <div
        className="relative z-10 w-full max-w-lg p-8 rounded-2xl bg-white/30 backdrop-blur-xl shadow-2xl transition-all duration-700 ease-out translate-y-0 opacity-100"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-900">
          Organizer Signup
        </h2>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-white/60 text-purple-800 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Organizer Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full bg-white/70 backdrop-blur-md border border-purple-300 focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full bg-white/70 backdrop-blur-md border border-purple-300 focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full bg-white/70 backdrop-blur-md border border-purple-300 focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />

          {/* Logo uploader */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-purple-400 rounded-xl p-6 bg-white/40 cursor-pointer hover:bg-white/60 transition">
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="logoUpload"
            />
            <label htmlFor="logoUpload" className="cursor-pointer text-purple-700">
              {preview ? (
                <img
                  src={preview}
                  alt="Logo Preview"
                  className="w-24 h-24 rounded-full object-cover shadow-md"
                />
              ) : (
                "Upload Organizer Logo"
              )}
            </label>
          </div>

          <textarea
            name="description"
            placeholder="Organizer Description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-md border border-purple-300 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:scale-105 hover:shadow-purple-400/50 transition-transform"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrganizerSignup;
