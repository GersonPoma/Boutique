// Extendemos la interfaz Window para incluir las APIs de Speech Recognition
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
