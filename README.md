# ExternalDash <img src='https://media.discordapp.net/attachments/822820765737025577/827931529681961000/Flame3.png' width='50' height='60'></img>
<h4>Created by Sbeve#4701</h4>
<h4>Thanks Breeze0505#0744 for helping out!</h4>
<sup>Special thanks to summiner#7340 for finding and fixing a bug!</sup>


 
# Disclaimers and limitations
<h4>Due to minehut's limitations on what we can do, and us wanting to play it safe there are some limitations to ExternalDash.</h4>
<li> ExternalDash doesn't exit automatically when the server goes down.</li>
<li> You have to specify a polling time in the index.js file. We recommend every 5 seconds, which is the default. </li>
<li> Keep in mind by using ExternalDash, you are responsible if you get blocked from minehut. </li>
<li> We have never seen someone get blocked by using ExternalDash, but do keep in mind it's possible especially if you lower the polling time. </li>

# Functions
 <h4>Currently Active</h4>
 <br>
 <li>&nbsp; Start Servers</li>
 <br>
 <li>&nbsp; View Current Logs</li>
 <br>
 <li>&nbsp; Run Console Commands</li>
 <br>
 <li>&nbsp; Skript management (upload, download, sync)</li>
 <br>
 <li>&nbsp; Plugin managemnt (download configs, install, remove, reset)</li>
 <br>
 <li>&nbsp; Saves logs (While client online) to the logs folder</li>

 # Installation
 <h4>Make sure you are logged in to your minehut account and are using Google Chrome (or Google Chrome based) browser before following the steps listed below</h4>
 <br>
  <h4>Open a new tab in google, right click on the page and click "inspect"</h4>
  <img src=https://user-images.githubusercontent.com/42012824/113481844-f45db600-94ac-11eb-8c92-96e6915c65b1.png></img>
  <h4>At the top of the UI tap "Network"</h4>
  <img src=https://user-images.githubusercontent.com/42012824/113481874-13f4de80-94ad-11eb-8632-c0e9b9a5f687.png></img>
  <h4>Go to the address https://minehut.com/dashboard/home while in the developer tools menu</h4>
  <li> If you are not already logged in, log in to your account, and then **refresh the page**.  </li>
  <h4>Right click on any file on the scren, it doesnt matter which one.</h4>
  <h4>Proceed to click on "Save all as HAR with content</h4>
  <img src=https://user-images.githubusercontent.com/42012824/113482035-d17fd180-94ad-11eb-968d-969c1d8bbae5.png></img>
  <h4>And make sure to name the file "minehut.har"</h4>
  <h4>Download the project from above and unzip it on your desktop.</h4>
  <img src=https://user-images.githubusercontent.com/42012824/113482087-0be96e80-94ae-11eb-92df-0f43ac68f1ac.png></img>
  <h4>Drag minehut.har into the project folder</h4>
  <h4>Now navigate to https://nodejs.org/en/download/ and download node.js</h4>
  <h4>Once installed, open terminal (or a command prompt) and cd into the project folder. (Tip: Type "cd", leave a space, and drag and drop the folder into the window)</h4>
  <h4>Once in the folder, run "npm i" in order to install the required modules.</h4>
  <h4>You can now optionally just double click Start.bat or Start.sh depending on your system and follow the on-screen instructions</h4>
  <h4>There are 2 scripts you can run. "log.js" or "manage.js". "log.js" is for (almost) real time logs from minehut, with the ability to run commands and start servers.</h4>
 <h4> "manage.js" is still in beta, but it currently allows skript files to be synced over to and from minehut. </h4>
 <h4> You can start them by typing "node " and then your desired script</h4>
  <h3>The har files will expire eventually due to minehut's limitations. If this happens, delete both "minehut.json" and "minehut.har" files from the project file, and re-do the steps involving your browser.</h3>
