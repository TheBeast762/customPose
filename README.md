# customPose
This project combines the projects "face-api" https://github.com/justadudewhohacks/face-api.js

and "posenet" https://github.com/tensorflow/tfjs-models/tree/master/posenet

Into a user-friendly UI on a localhost in order to approximate facial expressions and body movements to give feedback on the user's presentation.

Make sure to create facenet.npz and caffemodel in the customFace repository.

Installation:

--Posenet--

You can use this as standalone es5 bundle like this:

  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet"></script>
Or you can install it via npm for use in a TypeScript / ES6 project.

npm install @tensorflow-models/posenet

--Face-API--

Simply include the latest script from dist/face-api.js.

Or install it via npm:

npm i face-api.js
