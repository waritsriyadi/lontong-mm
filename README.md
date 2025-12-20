# 🥣 Lontong MM - Integrated POS & Ordering System

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA-blue)
![Tech Stack](https://img.shields.io/badge/Backend-Firebase-orange)
![AI](https://img.shields.io/badge/AI-TensorFlow.js-yellow)

## 📋 Overview

**Lontong MM** is a comprehensive web-based application designed to digitalize operations for a culinary MSME (UMKM). The system bridges the gap between customers and business management through a dual-interface approach:

1.  **Customer Facing:** A responsive Progressive Web App (PWA) for browsing menus, reading testimonials, and placing orders directly via WhatsApp automation.
2.  **Admin Dashboard (POS):** A powerful control panel for the business owner to track sales, manage inventory, and analyze business performance using AI-driven insights.

This project demonstrates a full **Software Development Life Cycle (SDLC)**, from requirement gathering to deployment and rigorous testing.

---

## 📸 Project Showcase

### A. Customer Interface (Client-Side)
*Designed for ease of use, speed, and mobile responsiveness using Bootstrap 5.*

| Landing Page & Branding | Smart Menu & Toppings |
| :---: | :---: |
| ![Landing Page](./assets/index.JPG) | ![Menu Selection](./assets/indexpesan.JPG) |
| *Clean UI with operational hours status* | *Dynamic topping logic & live subtotal* |

| WhatsApp Checkout Integration | Social Proof (Testimonials) |
| :---: | :---: |
| ![Checkout Modal](./assets/indexcheckout.JPG) | ![Testimonials](./assets/indextesti.JPG) |
| *Auto-formatting message for WhatsApp API* | *Lazy-loaded slider with image compression* |

<br>

### B. Admin Dashboard (POS & Analytics)
*Powered by Real-time Firestore Database & Machine Learning.*

#### 1. Real-Time Analytics Dashboard
Visualizing financial health (Revenue, Profit, Share) using **Chart.js**. Data updates instantly via Firestore real-time listeners (`onSnapshot`).
![Admin Dashboard](./assets/admin.JPG)

#### 2. 🧠 AI-Powered Stock Prediction (TensorFlow.js)
Implemented a **Neural Network** model directly in the browser to predict future stock needs (Lontong/Egg/Bakwan) based on historical sales trends. Also includes Customer Segmentation (RFM Analysis) logic.
![AI Prediction](./assets/admintensor.JPG)

#### 3. Transaction Details & Reporting
Drill-down capability to view specific buyer details and generate instant reports.
![Transaction Detail](./assets/admindetail.JPG)

---

## ✨ Key Features

### 🛒 Client-Side (Customer App)
* **Dynamic Menu:** Real-time menu & pricing updates fetched from Firestore.
* **Smart Cart System:** Local state management for cart operations with subtotal calculation.
* **WhatsApp Checkout:** Automated message formatting including order details, delivery address, and payment method (QRIS/COD).
* **PWA Capability:** Installable as a native app with Service Worker support for offline caching.

### 📊 Admin-Side (POS & Dashboard)
* **Transaction Management (CRUD):** Complete capability to Create, Read, Update, and Delete sales records.
* **Offline Persistence:** Uses Firestore `enableIndexedDbPersistence` to ensure the app works even when the network is unstable.
* **AI Integration:** Client-side Machine Learning using TensorFlow.js to forecast inventory demand.
* **Pull-to-Refresh:** Mobile-friendly UX for updating data on touch devices.

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
    Since this is a static web app, you can use Python or VS Code Live Server:
    ```bash
    # Python 3
    python -m http.server 8000
    ```
    Visit `http://localhost:8000` in your browser.

---

## 🧪 Quality Assurance & Testing Strategy

As a **QA Engineer**, I treated this project as a testing ground for various QA methodologies:

* **Manual Exploratory Testing:** Verified UI responsiveness across devices (Mobile, Tablet, Desktop) using Bootstrap's grid system.
* **Edge Case Handling:**
    * Tested network disconnects (verified `enableIndexedDbPersistence` behavior).
    * Validated input fields against negative values and special characters (SQL Injection prevention via Firestore Rules).
* **Performance Testing:** Optimized image loading and script execution to achieve high Lighthouse scores for PWA standards.

---

## 👤 Author

**Warits Riyadi**
* **Role:** QA Engineer & Fullstack Developer
* **LinkedIn:** [linkedin.com/in/waritsriyadi](https://www.linkedin.com/in/waritsriyadi)
* **Email:** waritsryds@gmail.com

---

**Note:** *This project was developed for a real-world use case to support local MSME digitalization in Batam, Indonesia.*
