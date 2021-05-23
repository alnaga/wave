# Installation Instructions
The first step to running Wave is to make sure that all the project dependencies are installed on your machine.
These are the following
- Node.js (Version 12.13.1 was used for development but any version after that should also work)
- MongoDB (Version 4.4.3 was used for development)
- Client NPM Modules
- API NPM Modules

To install the client NPM modules, simply run the following command in the root project directory:
```shell
npm install
```

This should start downloading the dependencies and placing them in the 'node_modules' directory so that the application can access them.

Secondly, navigate to the '/api' directory and run the following command to install API dependencies:
```shell
npm install
```
This will download the API's dependencies and place them into the '/api/node_modules' directory.

Now that the project dependencies have been installed, ensure that the 'rootCA.pem' certificate file has been trusted
on your machine. On MacOS, this can be done by simply double clicking the file and adding it to your Keychain.
To install it on an iOS device, transfer the file to the device and open Settings -> General -> Profiles.
Install the profile and then navigate to Settings -> General -> About -> Certificate Trust Settings and make sure that
the newly installed certificate has been granted full trust by tapping the toggle button.

Finally it is time to start the application.
To run the client, enter the following command in the root project directory:
```shell
npm run start:localhost
```
This will build and run the client and make it available on your local machine's 'localhost' address on port 8080.

In a separate terminal window, navigate to the '/api' directory and run:
```shell
npm run start:localhost
```
This will build and run the API and make it accessible on port 8081 of your machine's 'localhost' address.

Finally, in a third terminal window, navigate again to the '/api' directory and run:
```shell
npm run start:db
```
This will start a MongoDB server running on port 8082 of your machine's 'localhost' address.

The application should now be running and opening your browser to 'https://localhost:8080' should display
the user interface.