from deepface import DeepFace
import cv2

cap = cv2.VideoCapture(0)

def get_detected_emotion_and_save_image(filename="emotion_capture.jpg"):
    detected_emotion = None
    ret, frame = cap.read()
    if not ret:
        return None, None

    try:
        analysis = DeepFace.analyze(img_path=frame, actions=['emotion'], enforce_detection=False)
        if analysis and isinstance(analysis, dict):
            detected_emotion = analysis.get('dominant_emotion', None)
    except Exception as e:
        print("Error:", e)

    # Save the frame to file
    saved_ok = cv2.imwrite(filename, frame)
    if saved_ok:
        return detected_emotion, filename  # Return path to saved image file
    else:
        return detected_emotion, None


    
# Release resources
cap.release()
cv2.destroyAllWindows()

