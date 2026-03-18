import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const ResumeUpload = ({ onFileSelect, isLoading }: ResumeUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback((file: File) => {
    const allowed = ["application/pdf", "text/plain", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".txt")) {
      alert("Please upload a PDF, DOC, DOCX, or TXT file.");
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = () => {
    if (selectedFile) onFileSelect(selectedFile);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 cursor-pointer",
          dragOver ? "border-accent bg-accent/5 scale-[1.02]" : "border-border hover:border-accent/50 hover:bg-muted/50",
          selectedFile && "border-accent/40 bg-accent/5"
        )}
        onClick={() => document.getElementById("resume-input")?.click()}
      >
        <input
          id="resume-input"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-accent" />
            <div className="text-left">
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              className="ml-2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Drop your resume here</p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, DOC, DOCX, or TXT — up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Resume & Finding Jobs...
          </>
        ) : (
          "Find Matching Jobs"
        )}
      </Button>
    </div>
  );
};

export default ResumeUpload;
