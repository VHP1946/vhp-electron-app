Library to create an electron app to run react and .html files


[Setup](#setup)
[App](#app)
[AppUser](#appuser)
[AppControls](#appcontrols)
[App Manager](#app-manager)
[App Mart](#app-mart)



# App
Creates an app and orchestrates the feature of the app.

# App Manager
Responsible for setup and housing of basic configuration for the app:
- paths
- cuser
- approot
- appsettpath
- appset
- AppUser

## Local
Setup for the application's local storage held on the users computer. Many things can be stored here including settings, database items, and offline changes. The data is stored within a local IMDB folder, and organized by the applications name  (found in settings.json)

## Login

## Mart



# AppUser
- [Local User](##local-user)
- [Authentication](#authentication)


`{
    userfile='',
    authlist={}
}`

## Local User
On each computer using a vhp electron there is an IMDB folder in the C: drive. In the root is a userset.json file storing that users information. Regardless of the computer, the user on that file reflects the user who logged in. These credentials will be used across any electron application. On start, the credentials will be retrieved and tested against the provide authlist. If there is a match the "main" page is served. If not, the user is sent to the login page.In the case this userset.json folder does not exist, it created with default user information. The user would then be sent to  the login page.

## Authentication



# AppControls
Serves the required pages for the app
