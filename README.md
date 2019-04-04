# CryptoBank iOS
CryptoBank is a fictional banking app intended to showcase [Cisco Webex Teams](https://www.webex.com/team-collaboration.html) cloud collaboration features with integrated client chat, voice and video. This is an iPhone (iOS) frontend application that will connect to the [CryptoBank backend service](https://github.com/ismailakkila/cryptobank-backend).

The app is designed to integrate with Project Onboard. Project Onboard is an experimental web application that allows you to create, view, modify and delete user information via an administration portal. You can check it out [here](https://github.com/ismailakkila/projectonboard).

[Demo](https://cryptobank-web.herokuapp.com)

## Screenshots
Launch Screen<br>
![Alt text](/screenshots/screenshot-launch.png?raw=true "Launch Screen")

Login<br>
![Alt text](/screenshots/screenshot-login.png?raw=true "Login")

Dashboard<br>
![Alt text](/screenshots/screenshot-dashboard.png?raw=true "Dashboard")

Webex Teams Support<br>
![Alt text](/screenshots/screenshot-webexteams.png?raw=true "Webex Teams Support")

Voice Chat<br>
![Alt text](/screenshots/screenshot-voicechat.png?raw=true "Voice Chat")

Video Chat - Fullscreen<br>
![Alt text](/screenshots/screenshot-videochat-fullscreen.png?raw=true "Video Chat - Fullscreen")

Video Chat - Window<br>
![Alt text](/screenshots/screenshot-videochat-pip.png?raw=true "Video Chat - Window")

## Prerequisites
You will need to setup the following:
* [Project Onboard](https://github.com/ismailakkila/projectonboard)
* [CryptoBank Backend](https://github.com/ismailakkila/cryptobank-backend)
* [Cisco Webex Teams Developer Account](https://developer.webex.com)

Modify src/backendUrl.js to specify your CryptoBank Backend URL.

## Installation Procedure

This App is created with Expo and React Native using the WebRTC Framework. You will need to "eject" from Expo and Build with xCode (latest version) to run with iOS Simulator.

Install the application
```
npm install
```

Eject from Expo and follow instruction to install with ExpoKit. You can check [here](https://docs.expo.io/versions/latest/expokit/eject/) to read more about Ejecting with Expo
```
expo eject
```

Link with React native
```
react-native link react-native-webrtc
react-native link react-native-incall-manager
react-native link react-native-proximity
```

Manage Dependencies with CocoaPods
```
cd ios
pod install
```

Start the Expo Development Server
```
npm start
```

Build with xCode

Add Header Search Paths under RNProximity Library
![Alt text](/screenshots/screenshot-rnProximity.png?raw=true "RNProximity")

Change Build Settings under cryptobank Target
![Alt text](/screenshots/screenshot-buildsettings-enablemodules.png?raw=true "Build Settings")

![Alt text](/screenshots/screenshot-buildsettings-bitcode.png?raw=true "Bitcode")

Hit the Play Button to allow the xCode to compile and build. If successful, the iOS Simulator would automatically launch


## Built With
* [Socket.IO](https://socket.io)
* [Cisco Webex](https://developer.webex.com)
* [Expo](https://expo.io)
* [React Native](https://facebook.github.io/react-native/)
* [Redux](https://redux.js.org)
