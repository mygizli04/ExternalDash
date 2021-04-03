# ExternalDash
<h4>Created by Sbeve#4701</h4>
<h4>Thanks Breeze0505#0744 for helping out!</h4>

 
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
 <h4>Adding In the Future</h4>
 <br>
 <li> &nbsp; Download Logs</li>
 <br>
 <li> &nbsp; Upload Scripts</li>
 <br>
 <li> &nbsp; Add/Remove Plugins</li>

 # Installation
 <h4>Make sure you are logged in to your minehut account and are using Google Chrome (or Google Chrome based) browser before following the steps listed below</h4>
 <br>
  <h4>Open a new tab in google, right click on the page and click "inspect"</h4>
  <img src=https://user-images.githubusercontent.com/42012824/113481844-f45db600-94ac-11eb-8c92-96e6915c65b1.png></img>
  <h4>At the top of the UI tap "Network"</h4>
  <img src=https://user-images.githubusercontent.com/42012824/113481874-13f4de80-94ad-11eb-8632-c0e9b9a5f687.png></img>
  <h4>Go to the address https://minehut.com/dashboard/home while in the developer tools menu</h4>
  <li> If you are not already logged in, log in to your account, and then **refresh the page**.  </li>
  <h4>Right click on any file you can see.</h4>
  <h4>Proceed to click on "Save all as HAR with content</h4>
  <img src=https://user-images.githubusercontent.com/42012824/113482035-d17fd180-94ad-11eb-968d-969c1d8bbae5.png></img>
  <h4>And make sure to name the file "minehut.har"</h4>
  <h4>Download the project from above and unzip it on your desktop.</h4>
  <img src=https://user-images.githubusercontent.com/42012824/113482087-0be96e80-94ae-11eb-92df-0f43ac68f1ac.png></img>
  <h4>Drag minehut.har into the project folder</h4>
  <h4>Now navigate to https://nodejs.org/en/download/ and download node.js</h4>
  <h4>Once installed, open terminal (or a command prompt) and cd into the project folder. (Tip: Type "cd", leave a space, and drag and drop the folder into the window)</h4>
  <h4>Start the script by typing "node index.js" into the console and pressing enter, you can also create a batch file to do this.</h4>
  <h3>The har files will expire eventually due to minehut's limitations. If this happens, delete both "minehut.json" and "minehut.har" files from the project file, and re-do the steps involving your browser.</h3>