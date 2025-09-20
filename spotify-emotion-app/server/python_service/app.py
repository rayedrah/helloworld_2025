from flask import Flask, request, jsonify
import tempfile
import os
from deepface import DeepFace
import cv2

app = Flask(__name__)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'no image file provided'}), 400

    img_file = request.files['image']
    if img_file.filename == '':
        return jsonify({'error': 'empty filename'}), 400

    tmp_fd, tmp_path = tempfile.mkstemp(suffix=os.path.splitext(img_file.filename)[1] or '.jpg')
    os.close(tmp_fd)
    try:
        img_file.save(tmp_path)

        # Use DeepFace to analyze emotion
        try:
            result = DeepFace.analyze(img_path=tmp_path, actions=['emotion'], enforce_detection=False)
            # DeepFace returns a dict with 'dominant_emotion'
            emotion = result.get('dominant_emotion') if isinstance(result, dict) else None
            return jsonify({'emotion': emotion})
        except Exception as e:
            return jsonify({'error': 'analysis_failed', 'detail': str(e)}), 500

    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


if __name__ == '__main__':
    # Run on port 6000 by default
    app.run(host='127.0.0.1', port=int(os.environ.get('PY_DETECT_PORT', 6000)))
