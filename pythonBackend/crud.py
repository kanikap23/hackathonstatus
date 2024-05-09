from flask import Flask, request, jsonify
import base64
import os
from flask_cors import CORS
import pymongo
import cv2
import face_recognition
import requests
import numpy as np

app = Flask(__name__)
CORS(app)

connection_string="mongodb+srv://shreeshnautiyal3:mongop@cluster0.y9godyn.mongodb.net/test?retryWrites=true&w=majority"

client=pymongo.MongoClient(connection_string)
print(client)

# dbs=client['tracker']
# info=dbs.buses

dbs=client['test']
info=dbs.buses
print(info)
print(dbs)

@app.route('/save-image', methods=['POST'])
def save_image():
    data = request.get_json()
    a=data["contactNo"]
    image_data = data['image']
    print("info ",info)
    print(a)
    b="sw"
    for record in info.find({'driver.contactInfo':a}):
        b=record

    cloudImag=b["photo"]["secure_url"]


    response = requests.get(cloudImag)


    img_array = np.array(bytearray(response.content), dtype=np.uint8)

    img = cv2.imdecode(img_array, -1)

    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    url_encoding = face_recognition.face_encodings(rgb_img)[0]

    image_data = image_data.split(",")[1]  # Remove the base64 prefix

    # # Convert base64 to binary
    image_binary = base64.b64decode(image_data)

    # # Define the path for saving the image
    save_path = f"login/{a}_userImage.jpg"
    if not os.path.exists('login'):
        os.makedirs('login')

    # # Save the image
    with open(save_path, 'wb') as f:
        f.write(image_binary)
    folder_path = "login/"  # Folder where multiple saved images are present
    # # Get the list of files in the folder
    file_names = os.listdir(folder_path)


    # # Filter only image files
    image_files = [file_name for file_name in file_names if file_name.endswith(('.jpg', '.jpeg', '.png', '.bmp'))]


    # # Compare the URL image with each saved image until a match is found
    for image_file in image_files:
        img2 = cv2.imread(os.path.join(folder_path, image_file))
        rgb_img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)
        face_encodings = face_recognition.face_encodings(rgb_img2)
        if face_encodings:
            saved_encoding = face_encodings[0]
            result = face_recognition.compare_faces([url_encoding],saved_encoding)
            if result[0]:
                print("balle balle ")
                os.remove(save_path)  
                return jsonify({"result": "True","bus":str(b["_id"])})
    os.remove(save_path)
    return jsonify({"result": "False"})



if __name__ == '__main__':
    app.run(debug=True, port=11000)






