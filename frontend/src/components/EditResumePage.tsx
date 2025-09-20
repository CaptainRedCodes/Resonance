// components/ResumeEditor.tsx
import React, { useState, useEffect } from "react";
import { useResume } from "../context/ResumeContext";

export const ResumeEditor: React.FC = () => {
  const { parsedResume, setParsedResume } = useResume();
  const [localResume, setLocalResume] = useState<any>(null);

  // Copy context resume into local editable state
  useEffect(() => {
    if (parsedResume) {
      setLocalResume(JSON.parse(JSON.stringify(parsedResume))); // deep copy
    }
  }, [parsedResume]);

  if (!localResume) {
    return <p className="text-gray-600 text-center py-4">No parsed resume available</p>;
  }

  // Handle input changes
  const handleChange = (section: string, field: string, value: string, index?: number) => {
    setLocalResume((prev: any) => {
      const updated = { ...prev };
      if (Array.isArray(updated[section]) && index !== undefined) {
        updated[section][index][field] = value;
      } else {
        updated[section][field] = value;
      }
      return updated;
    });
  };

  // Save edits back to context
  const handleSave = () => {
    setParsedResume(localResume);
    alert("Changes saved ✅");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">✏️ Edit Your Resume</h2>

      {/* Personal Info */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-2">Personal Info</h3>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          placeholder="Name"
          value={localResume.personal_info?.name || ""}
          onChange={(e) => handleChange("personal_info", "name", e.target.value)}
        />
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          placeholder="Email"
          value={localResume.personal_info?.email || ""}
          onChange={(e) => handleChange("personal_info", "email", e.target.value)}
        />
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          placeholder="Phone"
          value={localResume.personal_info?.phone || ""}
          onChange={(e) => handleChange("personal_info", "phone", e.target.value)}
        />
      </section>

      {/* Education */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-2">Education</h3>
        {localResume.education?.map((edu: any, idx: number) => (
          <div key={idx} className="border p-3 mb-2 rounded">
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Institution"
              value={edu.institution || ""}
              onChange={(e) => handleChange("education", "institution", e.target.value, idx)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Degree"
              value={edu.degree || ""}
              onChange={(e) => handleChange("education", "degree", e.target.value, idx)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Year"
              value={edu.year || ""}
              onChange={(e) => handleChange("education", "year", e.target.value, idx)}
            />
          </div>
        ))}
      </section>

      {/* Experience */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-2">Experience</h3>
        {localResume.experience?.map((exp: any, idx: number) => (
          <div key={idx} className="border p-3 mb-2 rounded">
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Company"
              value={exp.company || ""}
              onChange={(e) => handleChange("experience", "company", e.target.value, idx)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Role"
              value={exp.role || ""}
              onChange={(e) => handleChange("experience", "role", e.target.value, idx)}
            />
            <textarea
              className="w-full p-2 border rounded mb-2"
              placeholder="Description"
              value={exp.description || ""}
              onChange={(e) => handleChange("experience", "description", e.target.value, idx)}
            />
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-2">Skills</h3>
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Skills (comma separated)"
          value={localResume.skills?.join(", ") || ""}
          onChange={(e) =>
            setLocalResume((prev: any) => ({
              ...prev,
              skills: e.target.value.split(",").map((s) => s.trim())
            }))
          }
        />
      </section>

      {/* Projects */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-2">Projects</h3>
        {localResume.projects?.map((proj: any, idx: number) => (
          <div key={idx} className="border p-3 mb-2 rounded">
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Project Name"
              value={proj.name || ""}
              onChange={(e) => handleChange("projects", "name", e.target.value, idx)}
            />
            <textarea
              className="w-full p-2 border rounded mb-2"
              placeholder="Description"
              value={proj.description || ""}
              onChange={(e) => handleChange("projects", "description", e.target.value, idx)}
            />
          </div>
        ))}
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
