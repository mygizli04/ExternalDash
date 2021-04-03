# ExternalDash
<h4>Created by Sbeve#4701</h4>
<h4>Thanks Breeze0505#0744 for helping out!</h4>

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
 
# Disclaimers and limitations
<h4>Due to minehut's limitations on what we can do, and us wanting to play it safe there are some limitations to ExternalDash.</h4>
<li> ExternalDash doesn't exit automatically when the server goes down.</li>
<li> You have to specify a polling time in the index.js file. We recommend every 5 seconds, which is the default. </li>
<li> Keep in mind by using ExternalDash, you are responsible if you get blocked from minehut. </li>
<li> We have never seen someone get blocked by using ExternalDash, but do keep in mind it's possible especially if you lower the polling time. </li>

 # Installation
 <h4>Make sure you are logged in to your minehut account and are using Google Chrome browser before following the steps listed below</h4>
 <br>
  <h4>Open a new tab in google, right click on the page and click "inspect"</h4>
  <h4>At the top of the UI tap "Network"</h4>
  <h4>Go to the address https://minehut.com/dashboard/home while in the developer tools menu (inspect/f12)</h4>
  <h4>Make sure you are logged in before going to this page, if so right click on any file that shows under the network tab and tab</h4>
  <h4>Proceed to click on "Save all as HAR with content</h4>
  <h4>And make sure to name the file "minehut.har"</h4>
  <h4>Drag this file into your folder</h4>
  <h4>Now go to the website https://nodejs.org/en/download/ and download node js</h4>
  <h4>Once installed, open cmd promt and change directory into your folder</h4>
  <h4>Start the script with "node index.js", you can start this with a batch file also</h4>
  <h3>The har files will outdate themselves eventually and you will have to redo these steps</h3>
