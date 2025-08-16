import { useEffect, useState } from "react";
import API from "../api/axios";

export default function InchargeDashboard() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    API.get("/incharge/files").then((res) => setFiles(res.data));
  }, []);

  const markComplete = async (id) => {
    await API.put(`/incharge/files/${id}/complete`);
    setFiles(files.map((f) => (f._id === id ? { ...f, status: "completed" } : f)));
  };

  return (
    <div>
      <h2>Incharge Dashboard</h2>
      <h3>You have {files.length} files</h3>
      <ul>
        {files.map((f) => (
          <li key={f._id}>
            {f.title} - {f.status}
            {f.status === "in-progress" && (
              <button onClick={() => markComplete(f._id)}>Mark Completed</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
