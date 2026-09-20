with open('frontend/src/components/dashboard/AdaptiveCameraUX.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const [showPrompt, setShowPrompt] = useState(true);', 'const [showPrompt, setShowPrompt] = useState(true);\n  const [isModelLoaded, setIsModelLoaded] = useState(false);')
content = content.replace('faceLandmarkerRef.current = faceLandmarker;', 'faceLandmarkerRef.current = faceLandmarker;\n        setIsModelLoaded(true);')

content = content.replace('disabled={!faceLandmarkerRef.current}', 'disabled={!isModelLoaded}')
content = content.replace('background: faceLandmarkerRef.current ?', 'background: isModelLoaded ?')
content = content.replace('cursor: faceLandmarkerRef.current ?', 'cursor: isModelLoaded ?')
content = content.replace('{faceLandmarkerRef.current ? "Enable Local Inference" : "Loading Model..."}', '{isModelLoaded ? "Enable Local Inference" : "Loading Model..."}')

with open('frontend/src/components/dashboard/AdaptiveCameraUX.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed ref access in render')
