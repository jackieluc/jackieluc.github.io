# SENG 513 - Online Chat Web Application

This source code is the extension of a very simple chat example
used for the [Getting Started](http://socket.io/get-started/chat/)
guide of the Socket.IO website.
   
#### Notes:  
* Node version v6.10.0 (Windows) was used to develop this application
* Works best in Google Chrome browser... Mozilla Firefox has small Flex problem (that I was unable to fix)

## How to run the server:
$ git clone https://github.com/jackieluc/jackieluc.github.io.git  
$ cd jackieluc.github.io/a3/  
$ npm install  
$ npm install moment --save  
$ npm install socket.io --save  
$ node index.js  
listening on port 3000  

___

## How to access a client:

##### Local Client:
Open the browser and enter the URL: http://localhost:3000

##### Client on another machine:
Open the browser and enter the URL: 0.0.0.0:3000
* where 0.0.0.0 is the IP address of the machine that is running the Node server
