import React, { useEffect, useRef, useState, useCallback } from "react";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";
import { Save, FileText, Hash, AlertCircle, CheckCircle } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxWords?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  onSave?: (content: string) => void;
  showWordCount?: boolean;
  showCharCount?: boolean;
  readOnly?: boolean;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write a detailed product description here...",
  minHeight = 250,
  maxWords,
  autoSave = false,
  autoSaveInterval = 30000,
  onSave,
  showWordCount = true,
  showCharCount = true,
  readOnly = false,
  className = "",
}) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const quillRef = useRef<ReactQuill>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate word and character count
  const calculateCounts = useCallback((content: string) => {
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    const words = textContent.split(/\s+/).filter((word) => word.length > 0);
    const chars = textContent.length;

    setWordCount(words.length);
    setCharCount(chars);
  }, []);

  // Auto-save functionality
  const handleAutoSave = useCallback(async () => {
    if (!autoSave || !onSave) return;

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      await onSave(editorValue);
      setLastSaved(new Date());
      setSaveStatus("saved");

      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [autoSave, onSave, editorValue]);

  // Setup auto-save interval
  useEffect(() => {
    if (autoSave && onSave) {
      autoSaveTimeoutRef.current = setInterval(
        handleAutoSave,
        autoSaveInterval
      );

      return () => {
        if (autoSaveTimeoutRef.current) {
          clearInterval(autoSaveTimeoutRef.current);
        }
      };
    }

    return () => {}; // Empty cleanup function for when condition is false
  }, [autoSave, onSave, autoSaveInterval, handleAutoSave]);

  // Calculate counts when value changes
  useEffect(() => {
    calculateCounts(editorValue);
  }, [editorValue, calculateCounts]);

  // Sync with external value changes
  useEffect(() => {
    setEditorValue(value || "");
  }, [value]);

  // Remove duplicate toolbars
  useEffect(() => {
    const removeDuplicateToolbars = () => {
      document.querySelectorAll(".ql-toolbar").forEach((toolbar, index) => {
        if (index > 0) {
          toolbar.remove();
        }
      });
    };

    const timeoutId = setTimeout(removeDuplicateToolbars, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  const handleManualSave = async () => {
    if (!onSave) return;
    await handleAutoSave();
  };

  const isWordLimitExceeded = maxWords && wordCount > maxWords;
  const isWordLimitWarning = maxWords && wordCount > maxWords * 0.9;

  return (
    <div className={`rich-text-editor-container ${className}`}>
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center gap-6 text-sm text-gray-700">
          {showWordCount && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm border border-gray-200">
              <FileText size={16} className="text-blue-600" />
              <span className="font-medium">{wordCount}</span>
              <span className="text-gray-500">words</span>
              {maxWords && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">{maxWords}</span>
                </>
              )}
            </div>
          )}
          {showCharCount && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm border border-gray-200">
              <Hash size={16} className="text-green-600" />
              <span className="font-medium">{charCount}</span>
              <span className="text-gray-500">characters</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {autoSave && onSave && (
            <div className="flex items-center gap-2">
              {saveStatus === "saving" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium">Saving...</span>
                </div>
              )}
              {saveStatus === "saved" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Saved</span>
                </div>
              )}
              {saveStatus === "error" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">Save failed</span>
                </div>
              )}
              {lastSaved && saveStatus === "idle" && (
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}

          {onSave && (
            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Save size={16} />
              Save
            </button>
          )}
        </div>
      </div>

      {isWordLimitWarning && !isWordLimitExceeded && (
        <div className="px-4 py-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">
              Approaching word limit (
              {Math.round((wordCount / maxWords!) * 100)}%)
            </span>
          </div>
        </div>
      )}

      {/* Word Limit Exceeded */}
      {isWordLimitExceeded && (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400 text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">
              Word limit exceeded ({wordCount}/{maxWords} words)
            </span>
          </div>
        </div>
      )}

      {/* Enhanced Editor */}
      <div className="relative">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          readOnly={readOnly}
          modules={{
            toolbar: [
              [{ font: [] }, { size: ["small", false, "large", "huge"] }],
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ script: "sub" }, { script: "super" }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ align: [] }],
              ["blockquote", "code-block"],
              ["link", "image", "video"],
              ["clean"],
            ],
            clipboard: {
              matchVisual: false,
            },
          }}
          placeholder={placeholder}
          style={{
            minHeight: `${minHeight}px`,
            height: `${minHeight}px`,
          }}
        />
      </div>

      <style jsx>{`
        .rich-text-editor-container .ql-toolbar {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-color: #e2e8f0;
          border-radius: 0;
          padding: 16px;
          border-bottom: 2px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }

        .rich-text-editor-container .ql-container {
          background: white !important;
          border-color: #e2e8f0;
          border-radius: 0 0 0.75rem 0.75rem;
          color: #1e293b;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          font-size: 15px;
          line-height: 1.7;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .rich-text-editor-container .ql-editor {
          padding: 20px;
          color: #1e293b;
        }

        .rich-text-editor-container .ql-editor.ql-blank::before {
          color: #94a3b8 !important;
          font-style: italic;
          font-size: 15px;
        }

        .rich-text-editor-container .ql-picker,
        .rich-text-editor-container .ql-stroke,
        .rich-text-editor-container .ql-fill {
          color: #475569 !important;
          stroke: #475569 !important;
          fill: #475569 !important;
        }

        .rich-text-editor-container .ql-picker-options {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          padding: 8px 0 !important;
        }

        .rich-text-editor-container .ql-picker-item {
          color: #475569 !important;
          padding: 10px 16px !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
        }

        .rich-text-editor-container .ql-picker-item:hover {
          background: #f1f5f9 !important;
          color: #1e293b !important;
        }

        .rich-text-editor-container .ql-tooltip {
          background: white;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          padding: 12px 16px;
          font-size: 14px;
        }

        .rich-text-editor-container .ql-tooltip input {
          background: #f8fafc;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          padding: 8px 12px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .rich-text-editor-container .ql-tooltip input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
        }

        .rich-text-editor-container .ql-snow .ql-toolbar button {
          width: 36px !important;
          height: 36px !important;
          border-radius: 0.375rem !important;
          margin: 0 2px !important;
          transition: all 0.2s ease !important;
        }

        .rich-text-editor-container .ql-snow .ql-toolbar button:hover,
        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          .ql-picker-label:hover {
          color: #3b82f6 !important;
          background: #eff6ff !important;
        }

        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          button:hover
          .ql-stroke,
        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          .ql-picker-label:hover
          .ql-stroke {
          stroke: #3b82f6 !important;
        }

        .rich-text-editor-container .ql-snow .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          .ql-picker-label:hover
          .ql-fill {
          fill: #3b82f6 !important;
        }

        .rich-text-editor-container .ql-snow .ql-toolbar button.ql-active,
        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          .ql-picker-label.ql-active {
          color: #3b82f6 !important;
          background: #dbeafe !important;
        }

        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          button.ql-active
          .ql-stroke,
        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          .ql-picker-label.ql-active
          .ql-stroke {
          stroke: #3b82f6 !important;
        }

        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          button.ql-active
          .ql-fill,
        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          .ql-picker-label.ql-active
          .ql-fill {
          fill: #3b82f6 !important;
        }

        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-label {
          border-radius: 0.375rem !important;
          padding: 6px 12px !important;
          transition: all 0.2s ease !important;
        }

        .rich-text-editor-container
          .ql-snow
          .ql-toolbar
          .ql-picker-label:hover {
          background: #eff6ff !important;
        }

        /* Enhanced typography for editor content */
        .rich-text-editor-container .ql-editor h1 {
          font-size: 2rem !important;
          font-weight: 700 !important;
          margin: 1.5rem 0 1rem 0 !important;
          color: #1e293b !important;
        }

        .rich-text-editor-container .ql-editor h2 {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          margin: 1.25rem 0 0.75rem 0 !important;
          color: #1e293b !important;
        }

        .rich-text-editor-container .ql-editor h3 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          margin: 1rem 0 0.5rem 0 !important;
          color: #1e293b !important;
        }

        .rich-text-editor-container .ql-editor p {
          margin: 0.75rem 0 !important;
          line-height: 1.7 !important;
        }

        .rich-text-editor-container .ql-editor blockquote {
          border-left: 4px solid #3b82f6 !important;
          padding-left: 1rem !important;
          margin: 1rem 0 !important;
          font-style: italic !important;
          color: #64748b !important;
          background: #f8fafc !important;
          padding: 1rem !important;
          border-radius: 0.375rem !important;
        }

        .rich-text-editor-container .ql-editor code {
          background: #f1f5f9 !important;
          color: #dc2626 !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
          font-size: 0.875rem !important;
          font-family: "Fira Code", "Monaco", "Consolas", monospace !important;
        }

        .rich-text-editor-container .ql-editor pre {
          background: #1e293b !important;
          color: #f1f5f9 !important;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          overflow-x: auto !important;
          margin: 1rem 0 !important;
        }

        .rich-text-editor-container .ql-editor ul,
        .rich-text-editor-container .ql-editor ol {
          padding-left: 1.5rem !important;
          margin: 0.75rem 0 !important;
        }

        .rich-text-editor-container .ql-editor li {
          margin: 0.25rem 0 !important;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .rich-text-editor-container .ql-toolbar {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-color: #475569;
          }

          .rich-text-editor-container .ql-container {
            background: #1e293b !important;
            border-color: #475569;
            color: #f1f5f9;
          }

          .rich-text-editor-container .ql-editor {
            color: #f1f5f9;
          }

          .rich-text-editor-container .ql-editor.ql-blank::before {
            color: #64748b !important;
          }

          .rich-text-editor-container .ql-picker,
          .rich-text-editor-container .ql-stroke,
          .rich-text-editor-container .ql-fill {
            color: #cbd5e1 !important;
            stroke: #cbd5e1 !important;
            fill: #cbd5e1 !important;
          }

          .rich-text-editor-container .ql-picker-options {
            background: #1e293b !important;
            border-color: #475569 !important;
          }

          .rich-text-editor-container .ql-picker-item {
            color: #cbd5e1 !important;
          }

          .rich-text-editor-container .ql-picker-item:hover {
            background: #334155 !important;
            color: #f1f5f9 !important;
          }

          .rich-text-editor-container .ql-tooltip {
            background: #1e293b;
            color: #f1f5f9;
            border-color: #475569;
          }

          .rich-text-editor-container .ql-tooltip input {
            background: #334155;
            color: #f1f5f9;
            border-color: #64748b;
          }
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
