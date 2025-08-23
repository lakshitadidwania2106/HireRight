import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// removed framer-motion; using CSS animations instead
import Header from "../components/ui/header";
import Footer from "../components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthToken } from "../utils/handleToken";
import { toast } from "react-toastify";

// Animated background
const AnimatedBackground = () => {
  const circles = Array.from({ length: 12 });
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {circles.map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-purple-400/30 animate-[float_8s_ease-in-out_infinite]"
          style={{
            width: Math.random() * 150 + 80,
            height: Math.random() * 150 + 80,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${6 + Math.random() * 6}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function OrgDashboard() {
  const [orgData, setOrgData] = useState(null);
  const [formData, setFormData] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerType, setViewerType] = useState("guest");

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();

    const fetchData = async () => {
      try {
        // org details
        const { data } = await axios.get(`http://localhost:8000/api/organization/org/${id}/`);
        setOrgData(data);
        setFormData(data);
      } catch {
        toast.error("Could not load organization details.");
      }

      if (token) {
        try {
          const { data } = await axios.get(`http://localhost:8000/api/organization/check-org/${id}/`, {
            headers: { Authorization: `Token ${token}` },
          });
          if (data.is_organization) {
            setViewerType("owner");

            const { data: ivs } = await axios.get("http://localhost:8000/api/interview/get-interviews/", {
              headers: { Authorization: `Token ${token}` },
            });

            // attach application info
            const updated = await Promise.all(
              ivs.map(async (interview) => {
                try {
                  const res = await axios.get(`http://localhost:8000/api/interview/get-applications/${interview.id}/`, {
                    headers: { Authorization: `Token ${token}` },
                  });
                  return { ...interview, hasApplications: res.data.length > 0 };
                } catch {
                  return { ...interview, hasApplications: false };
                }
              })
            );
            setInterviews(updated);
          }
        } catch {
          setViewerType("guest");
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (field) => {
    const token = getAuthToken();
    if (viewerType !== "owner") return;
    try {
      await axios.put("http://localhost:8000/api/organization/update/", {
        [field]: formData[field],
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      setOrgData((prev) => ({ ...prev, [field]: formData[field] }));
      setEditingField(null);
      toast.success("Updated successfully");
    } catch {
      toast.error("Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-200 via-indigo-100 to-white">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!orgData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-red-400">
        Organization not found.
      </div>
    );
  }

  const { orgname, email, address, photo, Description } = orgData;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-white">
      <AnimatedBackground />
      <Header viewerType={viewerType} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Org Info */}
        <Card className="backdrop-blur-lg bg-white/60 shadow-xl rounded-2xl mb-10 border border-white/40">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col items-center gap-4">
              {viewerType === "owner" && editingField === "photo" ? (
                <div className="space-y-2">
                  <Input name="photo" value={formData.photo} onChange={handleChange} />
                  <Button onClick={() => handleSave("photo")} className="bg-violet-500 text-white rounded-full px-6">Save</Button>
                </div>
              ) : (
                <img src={photo} alt="Org Logo" className="w-28 h-28 rounded-full border-2 border-violet-400 cursor-pointer" onClick={() => viewerType === "owner" && setEditingField("photo")} />
              )}

              <h1 className="text-3xl font-bold">
                {viewerType === "owner" && editingField === "orgname" ? (
                  <div className="space-y-2">
                    <Input name="orgname" value={formData.orgname} onChange={handleChange} />
                    <Button onClick={() => handleSave("orgname")} className="bg-violet-500 text-white rounded-full px-6">Save</Button>
                  </div>
                ) : (
                  <span onClick={() => viewerType === "owner" && setEditingField("orgname")} className="cursor-pointer">{orgname}</span>
                )}
              </h1>

              <p className="text-gray-600">Email: {email}</p>

              <p className="text-gray-600">
                Address: {viewerType === "owner" && editingField === "address" ? (
                  <>
                    <Input name="address" value={formData.address} onChange={handleChange} />
                    <Button onClick={() => handleSave("address")} className="mt-2 bg-violet-500 text-white rounded-full px-6">Save</Button>
                  </>
                ) : (
                  <span onClick={() => viewerType === "owner" && setEditingField("address")} className="cursor-pointer">{address}</span>
                )}
              </p>

              <p className="text-gray-600 w-full">
                Description: {viewerType === "owner" && editingField === "Description" ? (
                  <>
                    <Textarea name="Description" value={formData.Description} onChange={handleChange} />
                    <Button onClick={() => handleSave("Description")} className="mt-2 bg-violet-500 text-white rounded-full px-6">Save</Button>
                  </>
                ) : (
                  <span onClick={() => viewerType === "owner" && setEditingField("Description")} className="cursor-pointer">{Description || "No description provided"}</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interviews */}
        {viewerType === "owner" && interviews.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Interviews</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {interviews.map((interview, index) => (
                <div key={interview.id} className="transition-all duration-300 ease-out">
                  <Card className="backdrop-blur-lg bg-white/70 shadow-lg rounded-2xl border border-white/40">
                    <CardContent className="p-6 space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800">{interview.post}</h3>
                      <p className="text-gray-600">{interview.desc}</p>
                      <p className="text-sm text-gray-500">Experience: {interview.experience} yrs</p>
                      <p className="text-sm text-gray-500">Deadline: {interview.submissionDeadline}</p>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <Button onClick={() => navigate(`/interview/${interview.id}?orgId=${id}`)} className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full px-5">Edit</Button>
                        {interview.hasApplications && (
                          <Button onClick={() => navigate(`/applications/${interview.id}`)} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-5">View Applications</Button>
                        )}
                        <Button onClick={() => navigate(`/leaderboard/${interview.id}`)} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-5">View Leaderboard</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
