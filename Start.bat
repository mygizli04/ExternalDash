@echo off
cls

REM I don't test the windows version as much as i test the sh file!!
REM If there's an error let me know!

echo ================================================================================
echo Thank you for using ExternalDash!
echo Most recent version is available at https://github.com/mygizli04/ExternalDash
echo Created by mygizli04 on github (sbeve#4701 on Discord)
echo Special thanks to JaceBillingsley on github (Breeze0505#0744 on Discord) for helping me out
echo ================================================================================
echo.  
echo [1] log.js (Almost real time logs on minehut)
echo [2] manage.js (Manage your minehut server right from the comfort of your command prompt)
echo [3] Update

set /P input=Which script would you like to run? 

if %input% == 1 set javascript=log.js
if %input% == 2 set javascript=manage.js
if %input% == 3 goto UPDATE
if "%javascript%"=="" (
    echo That is not a valid answer.
    PAUSE
    exit
)

node -v 2>NUL || goto DOESNTEXIST

node %javascript%

if %errorlevel%==1 (
    echo Uh oh.. Looks like the script failed. You should read what the error message says in order to solve the issue.
    echo If you can't understand the error, think the error is on my part, or can't resolve the error,
    echo don't hesitate to reach out to me, or even better make a pull request or issue over at github.
    echo You can DM me over at discord (sbeve#4701), or make an issue at https://github.com/mygizli04/ExternalDash/issues
    set /P install=Would you like the script to attempt to install/update modules? (Y/N)
    if %install% == Y (
        npm i
        PAUSE
        exit
    )
)

PAUSE
exit

:UPDATE
echo Updating...
git pull > nul 2>&1 || goto CANTUPDATE
PAUSE
exit
:CANTUPDATE
echo You don't have git installed.
PAUSE
exit

:DOESNTEXIST
echo You don't have node installed. Please install it from https://nodejs.org/en/download/
start https://nodejs.org/en/download/

PAUSE