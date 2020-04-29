# DS-Browser

The DS-Browser is a node-project that offers a website to present the content of Domain Specifications in a pretty way.

## Install

Pull the project from GitHub:

`git clone https://github.com/semantifyit/ds-browser.git`

To install the node dependencies (in the project folder):

`npm install`

## Run Project

use the start script in the package.json or start directly:

`node app.js`

The DS-Browser will be available as website on http://localhost:8080/

## Structure

This project consists of:
 
* a backend to host the website (express-app) in /app.js
* a web-page with dynamic content generation based on the actual URL (single-page-application) at /public/index.html
* a script that serves Domain Specifications as raw JSON-LD files (with a little post-processing of the structure) at /shaclService/shacl.js


