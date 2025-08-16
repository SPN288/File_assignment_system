import File from "../models/File.js";

export const getMyFiles = async (req, res) => {
  const files = await File.find({ assignedTo: req.user.id });
  res.json(files);
};

export const markCompleted = async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });

  file.status = "completed";
  file.logs.push({ action: "completed", by: req.user.id });
  await file.save();
  res.json(file);
};
