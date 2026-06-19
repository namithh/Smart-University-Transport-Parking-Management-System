# 🚍 Smart University Transport & Parking Management System

A full-stack **MERN** web application developed to modernize and streamline university transportation and parking operations. The platform provides intelligent transport booking, parking reservation, incident reporting, real-time notifications, and an integrated **Machine Learning Dashboard** for traffic accident analysis and prediction using the India Traffic Accident Dataset.

---

## 📖 Overview

Universities often struggle with transportation and parking management due to manual processes, overcrowded buses, inefficient parking allocation, and poor communication between students and administrators.

The **Smart University Transport & Parking Management System** addresses these challenges by providing a centralized platform where users can manage transport and parking services efficiently.

In addition to core transport and parking features, the system integrates a **Machine Learning Dashboard** powered by **TensorFlow**. The dashboard analyzes the **India Traffic Accident Dataset** to identify accident trends, visualize accident statistics, and generate predictive insights.

---

## ✨ Key Features

### 🚌 Transport Management

* Bus seat reservation system
* Route and schedule management
* Driver schedule viewing
* Booking history tracking
* Transport availability management

### 🅿 Parking Management

* Parking slot reservation
* Real-time parking availability
* Reservation tracking
* Parking management dashboard

### 👤 User Management

* User registration and authentication
* Secure login system
* Role-based access control
* User profile management

### 🚨 Incident Management

* Report transport or parking incidents
* Track reported issues
* Incident review and management by administrators

### 🔔 Notifications

* Real-time notifications
* Booking confirmations
* Transport updates
* Important system announcements

---

# 🤖 Machine Learning Dashboard

The system includes an advanced **Machine Learning Dashboard** developed using **TensorFlow** and trained on a sample of the **India Traffic Accident Dataset**.

This dashboard enables users to explore accident data through interactive visualizations while leveraging machine learning models to identify accident patterns and generate predictive insights.

### Dashboard Features

* 📈 Accident trend analysis
* 📍 State-wise accident statistics
* 📊 Interactive charts and visualizations
* ⚠ Accident severity analysis
* 🔮 Accident prediction using machine learning
* 🚦 Risk pattern identification
* 📉 Historical data exploration
* 📌 Accident hotspot analysis

### Machine Learning Technologies

* TensorFlow
* Python

### Dataset

The dashboard uses the **India Traffic Accident Dataset**, allowing the system to:

* Analyze historical accident records
* Identify accident trends and patterns
* Predict accident-related outcomes
* Visualize traffic accident statistics
* Support data-driven transportation planning

---

## 🛠 Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Machine Learning & Data Analytics

* TensorFlow
* Python

### Version Control

* Git
* GitHub

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Smart-University-Transport-Parking-Management-System.git

cd Smart-University-Transport-Parking-Management-System
```

---

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

### Install Backend Dependencies

```bash
cd backend
npm install
```

---

## ⚙ Environment Variables

Create a `.env` file inside the backend folder.

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GOOGLE_API_KEY=your_google_api_key
```

⚠ **Important:** Never upload your `.env` file to GitHub.

Make sure `.env` is included in your `.gitignore`.

```gitignore
.env
```

---

## ▶ Running the Project

### Start Backend

```bash
cd backend

npm run dev
```

---

### Start Frontend

```bash
cd frontend

npm start
```

The application will run on:

```text
Frontend : http://localhost:3000

Backend : http://localhost:5000
```

---

## 👥 User Roles

### Student

* Reserve bus seats
* Book parking spaces
* Report incidents
* View notifications
* Manage profile

### Driver

* View assigned schedules
* View routes
* Receive transport updates

### Administrator

* Manage users
* Manage transport schedules
* Manage parking slots
* Review incidents
* Send notifications
* Monitor system activities

---

## 🎯 Project Objectives

* Improve university transportation efficiency
* Reduce bus overcrowding
* Simplify parking management
* Automate manual administrative processes
* Improve communication among stakeholders
* Provide accident analytics through machine learning
* Enable data-driven decision making

---

## 🔮 Future Enhancements

* Mobile application development
* Real-time GPS bus tracking
* AI-based demand prediction
* IoT-enabled smart parking
* Online payment integration
* Advanced traffic prediction models
* Real-time accident alerts

---

## 🧪 Testing

The project was tested using:

* Unit Testing
* Integration Testing
* User Acceptance Testing (UAT)

The testing process ensured:

* System reliability
* Module integration
* Performance optimization
* User experience improvements

---

## 👨‍💻 Team Members

* **Namith Kahatapitiya** – IT23565258
* **U.P. Nagodavithana** – IT23667082
* **W.A.P.G. Wickramarathne** – IT23547124
* **R.A.T.R. Rathnasekara** – IT23675384

---

## 🏫 Academic Project

**Sri Lanka Institute of Information Technology (SLIIT)**

**Information Systems Project Management**

**Project ID:** ISPM-2026-20

**Year:** 2026

---

⭐ If you found this project interesting, consider giving the repository a star!
