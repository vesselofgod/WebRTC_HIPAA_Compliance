# 📋 메디로그
![메디로그 소개](https://user-images.githubusercontent.com/18081105/137470716-273ad6a5-bb46-4c86-84a0-f6114e129834.png)

---
## ▶ 프로젝트 소개
![메디로그 소개2](https://user-images.githubusercontent.com/18081105/137470874-4235e53d-1d2a-470d-8112-53f0a1c83f0a.png)

## 🔀 개발 방향
![기능](https://user-images.githubusercontent.com/18081105/137470972-a7d8fff1-c6dc-4b7c-a462-6ced70f5e963.png)


## 💡 핵심 기능
화상상담 기능|
:---: |
![화상상담](https://user-images.githubusercontent.com/18081105/140267090-0663470a-4e8f-4cb9-a9ef-9e4efd21bbdc.png)

메디로그의 가장 핵심기능인 **화상상담/채팅 기능** 이다. 기본적으로 원격의료상담에 있어 실시간으로 상담을 받을 수 있는 화상회의 기능을 WebRTC를 이용해서 설계하였다. 각 User는 로그인을 한 후 상담이 필요한 분야의 상담방에 들어가서 화상상담과 채팅을 이용하여 상담을 받을 수 있다. 그리고 상담 후에는 상담내역을 마이페이지에서 확인할 수 있도록 설계하였다.

 - **[모든 기능 보기](https://github.com/vesselofgod/WebRTC_HIPAA_Compliance/wiki/Project-Design)**

 
## ✅ 컴퓨터 구성 / 필수 조건 안내 (Prerequisites)
 - node.js install
 -  ``` 
    "dependencies": {
    "aws-sdk": "^2.1019.0",
    "body-parser": "^1.19.0",
    "cookie-parser": "^1.4.5",
    "ejs": "^3.1.6",
    "express": "^4.17.1",
    "express-mysql-session": "^2.1.7",
    "express-session": "^1.17.2",
    "express-socket.io-session": "^1.3.5",
    "multer": "^1.4.3",
    "multer-s3": "^2.10.0",
    "mysql": "^2.18.1",
    "socket.io": "^1.7.4"}
## ⚡️ 설치/실행 안내 (Installation/Run Process)
- ```npm install aws-sdk body-parser cookie-parser ejs express express-mysql-session express-session express-socket.io-session multer multer-s3 mysql socket.io --save```
- ```node index.js```
- open web browser and connect ```localhost:8000```


## 🙏 팀 정보 (Team Information)
![성환이형 소개](https://user-images.githubusercontent.com/18081105/137470010-135af834-d417-43b6-b6e5-32faf57c8ece.png)
![내 소개](https://user-images.githubusercontent.com/18081105/137469654-203e971a-d4e4-430a-bbee-a0cd67a54246.png)


## ⚙ 기술 스택 (Technique Used)

- ### Front-end
JavaScript | CSS | HTML
:---: | :---: | :---: 
![js icon](https://user-images.githubusercontent.com/18081105/97551731-b0a2e400-1a16-11eb-9b4b-667c67881868.png) | ![CSS3_logo_and_wordmark svg](https://user-images.githubusercontent.com/18081105/135971466-a34a5648-114a-4aa0-8a94-b89e1a71a9c4.png) | ![html](https://user-images.githubusercontent.com/18081105/135970958-5ede8575-7861-4fc2-9db9-8dcc3c0b3872.png)



- ### Back-end
Node.js | WebRTC |socket.io
:---: | :---: | :---: 
![nodejs](https://user-images.githubusercontent.com/18081105/135970378-9d7cf78a-4fa6-41a3-87a9-1c675bb092c1.jpg) | ![webrtc](https://user-images.githubusercontent.com/18081105/135970746-c419bfd5-5fce-4d97-9194-c5ed8440fbf5.png) | ![socket io_icon-removebg-preview](https://user-images.githubusercontent.com/18081105/140266703-6500647c-e218-4177-af8d-4cd336c1eb29.png)
 
## 🔧 프로젝트 관리 (Project Management)
 - [개발 일정(Develop Schedule)](https://trello.com/b/JlaOjArx/live-telemidicine-service)
 - [Class Diagram](https://github.com/vesselofgod/WebRTC_HIPAA_Compliance/wiki/Class-Diagram)
 - [Mockup Screens](https://github.com/vesselofgod/WebRTC_HIPAA_Compliance/wiki/Mockup-Screens)
 - [개발일기](https://oflofty.tistory.com/category/%5BNode.js%5DMedilogue%20%EA%B0%9C%EB%B0%9C%EC%9D%BC%EA%B8%B0)
