import base64
from flask import Flask
from flask import abort, jsonify, request
from io import BytesIO
import numpy as np
from flask_cors import CORS
from PIL import Image
from tensorflow.keras.models import model_from_json
from skimage.transform import resize
import tensorflow


graph = None


class Model(object):
    def __init__(self):
        print('loading model')
        self.model = model_from_json(open('model_architecture.json').read())
        global graph
        graph = tensorflow.get_default_graph()
        print('model loaded')

    def __call__(self, img):
        global graph
        with graph.as_default():
            self.model.load_weights('model_weights.h5')
            pred = self.model.predict(img)
            likelihood = repr(np.amax(pred))
            result = np.argmax(pred)
            return labels[result], likelihood


app = Flask(__name__)
CORS(app)
labels = ['airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck']
model = Model()


@app.route('/image', methods=['POST'])
def image():
    if not request.json or not 'image' in request.json:
        abort(400)
    img_bytes = BytesIO(base64.b64decode(request.json['image']))
    img = np.array(Image.open(img_bytes))
    resized = resize(img, (32, 32), anti_aliasing='reflect', mode='reflect')
    resized_reshaped = resized.reshape(1, 32, 32, 3)
    label, likelihood = model.__call__(resized_reshaped)
    return jsonify({'msg': label, 'likelihood': likelihood})
