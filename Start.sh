#!/bin/bash
echo "==============================================================================================="
echo "Thank you for using ExternalDash!"
echo "Most recent version is available at https://github.com/mygizli04/ExternalDash"
echo "Created by mygizli04 on github (sbeve#4701 on Discord)"
echo "Special thanks to JaceBillingsley on github (Breeze0505#0744 on Discord) for helping me out"
echo "==============================================================================================="
echo -e "\nWhich script would you like to run?"
echo -e "\n[1] log.js (Almost real time logs on minehut)"
echo "[2] manage.js (Manage your minehut server right from the comfort of your terminal)"
read script

if [ $script -eq 1 ]
then
    javascript="./log.js"
elif [ $script -eq 2 ]
then
    javascript="./manage.js"
else
    echo "I don't undertand :("
    exit 1
fi

echo "Launching $javascript Please wait.."
node $javascript
if [ $? -gt 0 ]
then
    echo "Uh oh.. Looks like the script failed. You should read what the error message says in order to solve the issue."
    echo "If you can't understand the error, think the error is on my part, or can't resolve the error,"
    echo "don't hesitate to reach out to me, or even better make a pull request or issue over at github."
    echo "You can DM me over at discord (sbeve#4701), or make an issue at https://github.com/mygizli04/ExternalDash/issues"
    exit 1
fi