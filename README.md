# 🥣 Lontong MM - Integrated POS & Ordering System

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA-blue)
![Tech Stack](https://img.shields.io/badge/Backend-Firebase-orange)
![AI](https://img.shields.io/badge/AI-TensorFlow.js-yellow)

## 📋 Overview

**Lontong MM** is a comprehensive web-based application designed to digitalize operations for a culinary MSME (UMKM). The system bridges the gap between customers and business management through a dual-interface approach:

1.  **Customer Facing:** A responsive Progressive Web App (PWA) for browsing menus, reading testimonials, and placing orders directly via WhatsApp automation.
2.  **Admin Dashboard (POS):** A powerful control panel for the business owner to track sales, manage inventory, and analyze business performance using AI-driven insights.

This project demonstrates a full software development lifecycle (SDLC), from requirement gathering to deployment and testing.

---

## ✨ Key Features

### 🛒 Client-Side (Customer App)
* **Dynamic Menu:** Real-time menu & pricing updates fetched from Firestore.
* **Smart Cart System:** Local state management for cart operations with subtotal calculation.
* **WhatsApp Checkout:** Automated message formatting including order details, delivery address, and payment method (QRIS/COD).
* **Image Compression:** Client-side image compression (Canvas API) for testimonial uploads to save bandwidth.
* **Lazy Loading:** Optimized performance for images and testimonial sliders.

### 📊 Admin-Side (POS & Dashboard)
* **Transaction Management (CRUD):** Complete capability to Create, Read, Update, and Delete sales records.
* **Real-time Analytics:** Interactive charts (Chart.js) visualizing Revenue, Profit, and Sales trends.
* **🤖 AI-Powered Stock Prediction:** Implemented **TensorFlow.js** (Neural Network) to predict future stock requirements (Lontong/Egg/Bakwan) based on historical sales data.
* **Customer Segmentation:** Automated logic to identify "Loyal Customers," "Big Spenders (Sultans)," and "At-Risk Customers" (RFM Analysis).
* **PWA Support:** Installable as a native-like application on Android/iOS.
* **Data Export:** CSV Export functionality for offline accounting.

---

## 🛠 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **UI Framework** | Bootstrap 5, Bootstrap Icons |
| **Backend / DB** | Google Firebase (Firestore NoSQL) |
| **Deployment** | Firebase Hosting |
| **Data Science / AI** | **TensorFlow.js** (Client-side Machine Learning), Chart.js |
| **Tools** | Git, VS Code, SwiperJS |

---

## 🏗 System Architecture

The application operates on a **Serverless Architecture** using Firebase.

1.  **Frontend:** Fetches configuration and data directly from Firestore.
2.  **Logic Layer:**
    * *Stock Prediction:* Executed client-side using a browser-based TensorFlow model to reduce server costs.
    * *Business Logic:* JavaScript handles cart calculations and WhatsApp API bridging.
3.  **Database:** Cloud Firestore stores Transactions, Menu Settings, and Testimonials in real-time.

---

## 📸 Screenshots

| Customer UI | Admin Dashboard | AI Analysis |
| :---: | :---: | :---: |
| ![Customer UI](path/to/screenshot1.png) | ![Admin Dashboard](path/to/screenshot2.png) | ![AI Analysis](path/to/screenshot3.png) |

---

## 🚀 Installation & Setup

To run this project locally, follow these steps:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/waritsriyadi/lontong-mm.git](https://github.com/waritsriyadi/lontong-mm.git)
    cd lontong-mm
    ```

2.  **Configure Firebase**
    * Create a project in [Firebase Console](https://console.firebase.google.com/).
    * Enable **Firestore Database**.
    * Copy your web app configuration keys.
    * Update `script.js` and `scriptadmin.js` with your config:
    ```javascript
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        // ...
    };
    ```

3.  **Run Locally**
    You can use VS Code's "Live Server" extension or Python:
    ```bash
    # Python 3
    python -m http.server 8000
    ```
    Visit `http://localhost:8000` in your browser.

4.  **Access Admin Panel**
    * Go to `/admin.html`
    * Default PIN (for demo): `123456`

---

## 🧪 Quality Assurance & Testing

As a QA-focused engineer, this project serves as a practice ground for:
* **Manual Testing:** Exploratory testing on various mobile viewports (Responsive Design).
* **Edge Case Handling:** Testing inputs for "Negative Values", "Empty Fields", and "Network Disconnects" (Firestore Persistence enabled).
* **Performance Testing:** Ensuring Lighthouse score > 90 for Performance and PWA.

---

## 👤 Author

**Warits Riyadi**
* **Role:** Fullstack Developer & QA Engineer
* **LinkedIn:** [linkedin.com/in/waritsriyadi](https://www.linkedin.com/in/waritsriyadi)
* **Email:** waritsryds@gmail.com

---

**Note:** *This project was developed for a real-world use case to support local MSME digitalization.*
