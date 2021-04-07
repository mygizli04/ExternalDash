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
echo "[3] Update"
read script

if [ $script -eq 1 ]
then
    javascript="./log.js"
elif [ $script -eq 2 ]
then
    javascript="./manage.js"
elif [ $script -eq 3 ]
then
    which git &> /dev/null
    if [ $? -gt 0 ]
    then
        echo "You don't have git." #I spent like whole day making an insane mess of nested if statements for every single possibility ever. I said f- it and you only get this echo now.
    else
        git pull
    fi
    exit
else
    echo "I don't undertand :("
    exit 1
fi

echo "Launching $javascript Please wait.."
node $javascript
if [ $? -eq 127 ]
then
    echo "You don't seem have node.js installed. Would you like the script to attempt to install it? (Y/N) "
    read install
    if [ $install -eq "Y" ] || [ $install -eq "y" ] #
    then
        #Now, going to try to detect if they have a package manager (apt or brew)
        which brew > /dev/null
        if [ $? -eq 0 ]
        then
            brew install node
            exit
        else
            which apt > /dev/null
            if [ $? -eq 0 ] 
            then
                apt install node
            elif
                echo "We can't detect a supported package manager." #apt + brew cover most of the usecases, feel free to add more package managersmanagers
                echo "You can get node.js from https://nodejs.org/en/download/"
                open "https://nodejs.org/en/download/"
            fi
        fi
elif [ $? -gt 1 ]
then
    echo "Uh oh.. Looks like the script failed. You should read what the error message says in order to solve the issue."
    echo "If you can't understand the error, think the error is on my part, or can't resolve the error,"
    echo "don't hesitate to reach out to me, or even better make a pull request or issue over at github."
    echo "You can DM me over at discord (sbeve#4701), or make an issue at https://github.com/mygizli04/ExternalDash/issues"
    echo "Would you like the script to attempt to install/update modules?"
    read install
    if [ $install -eq "Y"]
    then
        npm i
    else
        exit 1
fi