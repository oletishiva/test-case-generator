"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Minimize2, Maximize2 } from "lucide-react";

interface FaceProctoProps {
  onViolation: (type: string, detail: string) => void;
}

export default function FaceProctor({ onViolation }: FaceProctoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modelsLoadedRef = useRef(false);

  const [status, setStatus] = useState<"loading" | "active" | "denied" | "error">("loading");
  const [collapsed, setCollapsed] = useState(false);
  const [lastViolation, setLastViolation] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Dynamically import face-api to avoid SSR issues
        const faceapi = await import("@vladmandic/face-api");

        // Load models from /public/models/
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        modelsLoadedRef.current = true;

        if (cancelled) return;

        // Request webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false,
        });

        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus("active");

        // Detection loop every 5 seconds
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || !canvasRef.current || !modelsLoadedRef.current) return;

          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }))
            .withFaceLandmarks();

          if (detections.length === 0) {
            setLastViolation("No face detected");
            onViolation("face_violation", "no_face");
          } else if (detections.length > 1) {
            setLastViolation("Multiple faces detected");
            onViolation("face_violation", "multiple_faces");
          } else {
            // Check head pose via nose tip vs face center
            const landmarks = detections[0].landmarks;
            const nose = landmarks.getNose()[3]; // nose tip
            const faceBox = detections[0].detection.box;
            const faceCenterX = faceBox.x + faceBox.width / 2;
            const yaw = Math.abs(nose.x - faceCenterX) / faceBox.width;
            if (yaw > 0.25) {
              // Silent flag only — no banner (reduce false positives)
              onViolation("face_violation", "looking_away");
            } else {
              setLastViolation(""); // clear last violation message
            }
          }
        }, 5000);
      } catch (err: unknown) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setStatus("denied");
        } else {
          console.warn("FaceProctor init error:", err);
          setStatus("error");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [onViolation]);

  if (status === "denied") {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-slate-400">
        <CameraOff className="w-3.5 h-3.5" />
        Proctoring unavailable
      </div>
    );
  }

  if (status === "error") return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${collapsed ? "w-auto" : "w-44"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${status === "active" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
          <span className="text-xs text-slate-400 font-medium">Proctoring</span>
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          {collapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Video feed */}
          <div className="relative bg-slate-950">
            {status === "loading" && (
              <div className="w-44 h-32 flex items-center justify-center">
                <Camera className="w-6 h-6 text-slate-600 animate-pulse" />
              </div>
            )}
            <video
              ref={videoRef}
              className={`w-44 h-32 object-cover ${status !== "active" ? "hidden" : ""}`}
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Violation badge */}
          {lastViolation && (
            <div className="px-2 py-1 bg-red-500/20 border-t border-red-500/30">
              <p className="text-xs text-red-400 truncate">{lastViolation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
