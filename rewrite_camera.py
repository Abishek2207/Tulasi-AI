import re

with open('frontend/src/components/dashboard/AdaptiveCameraUX.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_effect = """  useEffect(() => {
    let animationFrameId: number;
    let isActive = true;

    const predictWebcam = async () => {
      if (!videoRef.current || !faceLandmarkerRef.current || !stream || !isActive) return;
      
      const video = videoRef.current;
      
      if (video.readyState >= 2) {
        const startTimeMs = performance.now();
        try {
          const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const nose = landmarks[1];
            const leftCheek = landmarks[234];
            const rightCheek = landmarks[454];
            
            const leftDist = nose.x - leftCheek.x;
            const rightDist = rightCheek.x - nose.x;
            const ratio = leftDist / rightDist;
            
            if (ratio > 2.5 || ratio < 0.4) {
              updateState("low engagement");
            } else {
              updateState("focused");
            }
          } else {
            updateState("no_face_detected");
          }
        } catch (e) {
          console.error("Inference error:", e);
        }
      }
      
      if (isActive) {
        animationFrameId = window.requestAnimationFrame(predictWebcam);
      }
    };

    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = () => {
        if (isActive) predictWebcam();
      };
    }
    
    return () => {
      isActive = false;
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [stream, updateState]);"""

pattern = re.compile(r'  const predictWebcam = useCallback.*?}, \[stream, predictWebcam\]\);', re.DOTALL)
new_content = pattern.sub(new_effect, content)

with open('frontend/src/components/dashboard/AdaptiveCameraUX.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
