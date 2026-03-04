"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Plus, Trash2 } from "lucide-react";

interface ResumeData {
    fullName: string;
    email: string;
    phone: string;
    summary: string;
    skills: string;
    experiences: { title: string; company: string; duration: string; description: string }[];
    education: { degree: string; institution: string; year: string }[];
    certifications: string;
}

const DEFAULT_RESUME: ResumeData = {
    fullName: "",
    email: "",
    phone: "",
    summary: "",
    skills: "",
    experiences: [{ title: "", company: "", duration: "", description: "" }],
    education: [{ degree: "", institution: "", year: "" }],
    certifications: "",
};

export default function ResumePage() {
    const [resume, setResume] = useState<ResumeData>({ ...DEFAULT_RESUME });
    const [atsScore, setAtsScore] = useState<number | null>(null);

    const updateField = (field: keyof ResumeData, value: string) => {
        setResume((prev) => ({ ...prev, [field]: value }));
    };

    const addExperience = () => {
        setResume((prev) => ({
            ...prev,
            experiences: [...prev.experiences, { title: "", company: "", duration: "", description: "" }],
        }));
    };

    const removeExperience = (index: number) => {
        setResume((prev) => ({
            ...prev,
            experiences: prev.experiences.filter((_, i) => i !== index),
        }));
    };

    const updateExperience = (index: number, field: string, value: string) => {
        setResume((prev) => ({
            ...prev,
            experiences: prev.experiences.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            ),
        }));
    };

    const addEducation = () => {
        setResume((prev) => ({
            ...prev,
            education: [...prev.education, { degree: "", institution: "", year: "" }],
        }));
    };

    const removeEducation = (index: number) => {
        setResume((prev) => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index),
        }));
    };

    const updateEducation = (index: number, field: string, value: string) => {
        setResume((prev) => ({
            ...prev,
            education: prev.education.map((edu, i) =>
                i === index ? { ...edu, [field]: value } : edu
            ),
        }));
    };

    const calculateATS = () => {
        const keywords = [
            "javascript", "python", "react", "node", "sql", "api", "git",
            "docker", "cloud", "agile", "typescript", "aws", "leadership",
        ];
        const allText = `${resume.summary} ${resume.skills} ${resume.experiences
            .map((e) => e.description)
            .join(" ")}`.toLowerCase();
        const matchCount = keywords.filter((kw) => allText.includes(kw)).length;
        const score = Math.round((matchCount / keywords.length) * 100);
        setAtsScore(score);
    };

    const handleExportPDF = () => {
        // Generate a printable version and trigger print dialog
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;
        printWindow.document.write(`
      <html>
        <head>
          <title>${resume.fullName || "Resume"} - Tulasi AI</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 800px; margin: 40px auto; color: #111; line-height: 1.6; }
            h1 { font-size: 28px; margin-bottom: 4px; }
            h2 { font-size: 16px; border-bottom: 2px solid #333; padding-bottom: 4px; margin-top: 20px; }
            .contact { color: #555; font-size: 13px; }
            .section { margin-top: 12px; }
            .exp-title { font-weight: bold; }
            .exp-company { color: #555; }
            ul { padding-left: 20px; }
          </style>
        </head>
        <body>
          <h1>${resume.fullName || "Your Name"}</h1>
          <p class="contact">${resume.email} · ${resume.phone}</p>
          ${resume.summary ? `<div class="section"><h2>Professional Summary</h2><p>${resume.summary}</p></div>` : ""}
          ${resume.skills ? `<div class="section"><h2>Skills</h2><p>${resume.skills}</p></div>` : ""}
          <div class="section"><h2>Experience</h2>
            ${resume.experiences.map((e) => `
              <p><span class="exp-title">${e.title}</span> · <span class="exp-company">${e.company}</span> (${e.duration})</p>
              <p>${e.description}</p>
            `).join("")}
          </div>
          <div class="section"><h2>Education</h2>
            ${resume.education.map((e) => `<p><strong>${e.degree}</strong> — ${e.institution} (${e.year})</p>`).join("")}
          </div>
          ${resume.certifications ? `<div class="section"><h2>Certifications</h2><p>${resume.certifications}</p></div>` : ""}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
                    <p className="text-muted-foreground">
                        Build an ATS-friendly resume and export it as PDF.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={calculateATS}>
                        Check ATS Score
                    </Button>
                    <Button onClick={handleExportPDF}>
                        <Download className="h-4 w-4 mr-2" /> Export PDF
                    </Button>
                </div>
            </div>

            {atsScore !== null && (
                <Card className={atsScore >= 60 ? "border-green-500" : "border-yellow-500"}>
                    <CardContent className="py-4 flex items-center justify-between">
                        <span className="font-medium">ATS Keyword Match Score</span>
                        <span className={`text-2xl font-bold ${atsScore >= 60 ? "text-green-500" : "text-yellow-500"}`}>
                            {atsScore}%
                        </span>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Personal Info */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <Input placeholder="Full Name" value={resume.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
                        <Input placeholder="Email" type="email" value={resume.email} onChange={(e) => updateField("email", e.target.value)} />
                        <Input placeholder="Phone" value={resume.phone} onChange={(e) => updateField("phone", e.target.value)} />
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Professional Summary</CardTitle></CardHeader>
                    <CardContent>
                        <textarea
                            placeholder="Brief professional summary..."
                            value={resume.summary}
                            onChange={(e) => updateField("summary", e.target.value)}
                            className="w-full min-h-[100px] p-3 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Skills</CardTitle></CardHeader>
                    <CardContent>
                        <textarea
                            placeholder="JavaScript, Python, React, Docker, AWS..."
                            value={resume.skills}
                            onChange={(e) => updateField("skills", e.target.value)}
                            className="w-full min-h-[80px] p-3 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Certifications</CardTitle></CardHeader>
                    <CardContent>
                        <textarea
                            placeholder="AWS Solutions Architect, Google Cloud Professional..."
                            value={resume.certifications}
                            onChange={(e) => updateField("certifications", e.target.value)}
                            className="w-full min-h-[80px] p-3 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Experience */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Work Experience</CardTitle>
                    <Button variant="outline" size="sm" onClick={addExperience}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {resume.experiences.map((exp, i) => (
                        <div key={i} className="grid gap-2 p-4 border rounded-lg relative">
                            {resume.experiences.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => removeExperience(i)}
                                >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Job Title" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} />
                                <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} />
                            </div>
                            <Input placeholder="Duration (e.g., Jan 2023 - Present)" value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} />
                            <textarea
                                placeholder="Describe your responsibilities..."
                                value={exp.description}
                                onChange={(e) => updateExperience(i, "description", e.target.value)}
                                className="w-full min-h-[60px] p-3 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Education */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Education</CardTitle>
                    <Button variant="outline" size="sm" onClick={addEducation}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {resume.education.map((edu, i) => (
                        <div key={i} className="grid gap-2 p-4 border rounded-lg relative">
                            {resume.education.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => removeEducation(i)}
                                >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                            )}
                            <div className="grid grid-cols-3 gap-2">
                                <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} />
                                <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} />
                                <Input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
