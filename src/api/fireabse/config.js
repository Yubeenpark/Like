
const Router = require("koa-router");
const Koa = require('koa');
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZw-VXcu0yP3m9r11fe3JiJ-_ksEQDX-E",
  authDomain: "like-c93bb.firebaseapp.com",
  projectId: "like-c93bb",
  storageBucket: "like-c93bb.appspot.com",
  messagingSenderId: "514516382912",
  appId: "1:514516382912:web:17460502317f4c51166925"
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig)
let database = firebase.database();

module.exports = database;