# 🏥 Health Data Information and Management System (HDIMS)

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-Framework-000000?logo=express)
![Firebase](https://img.shields.io/badge/Firebase-Database-FFCA28?logo=firebase)

Welcome to **HDIMS**, the future of medical data organization! HDIMS is a comprehensive platform designed to streamline health data management for doctors, patients, and administrators, ensuring secure, accessible, and organized medical records.

---

## ✨ Key Features

### 👨‍⚕️ For Doctors
- **Secure Login & Registration**: Seamlessly authenticate and access the platform.
- **Patient Management**: Access patient records, medical history, and reports efficiently.
- **Update Records**: Add or modify patient information and prescriptions securely.

### 🤒 For Patients
- **Personal Dashboard**: View your personalized health data in one place.
- **Medical Records & Reports**: Easily access past medical history and test reports.
- **Medications Tracking**: Keep track of your current and past prescriptions.

### 🛡️ For Administrators
- **System Configuration**: Manage users and oversee system security.
- **Hospital Oversight**: Access tools designed for hospital administration to ensure smooth operations.

---

## 🔐 Default Login Credentials

### Hospital Admin
- **ID:** `001-0001`
- **Password:** `default2`

### Doctor
- **ID:** `001-0001-00001`
- **Password:** `deepti`

### Patient
For viewing and updating the patient database, as well as patient login:
- **ID:** `001-AA0002`
- **Password:** `koushik`

**Note:** You can create your own doctor's ID to log in, as well as your own patient ID. All of this procedure is done in the **Hospital Admin** page.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database / Auth**: Firebase
- **Deployment**: Netlify & Netlify Functions (Serverless)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A Firebase project set up.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshithsr20/Health-Data-information-and-Management-System.git
   cd Health-Data-information-and-Management-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add your Firebase configuration keys and any other necessary environment variables:
     ```env
     PORT=3000
     # Add other Firebase credentials here
     ```

4. **Run the local development server:**
   ```bash
   npm run server
   ```
   *Note: This starts the backend node server. You can open `index.html` in your browser to view the frontend landing page.*

---

## 📁 Project Structure

```text
Health-Data-information-and-Management-System/
├── frontend/             # Frontend assets (HTML, CSS, JS scripts, images)
│   ├── scripts/          # Client-side JavaScript
│   ├── styles/           # CSS stylesheets
│   └── images/           # Image assets
├── server/               # Backend Node.js/Express server logic
│   └── server.js         # Main server file
├── netlify/              # Netlify Functions for serverless deployment
├── .env                  # Environment variables (git-ignored)
├── firebaseConfig.js     # Firebase initialization and setup
├── index.html            # Main landing page
├── package.json          # Node project metadata and scripts
└── netlify.toml          # Netlify configuration file
```

---

## 🌐 Deployment

This application is configured for serverless deployment via **Netlify**. The `netlify.toml` and `netlify/` directory contain the necessary configurations to wrap the Express backend into Netlify Functions using `serverless-http`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/harshithsr20/Health-Data-information-and-Management-System/issues).

---

## 📝 License

This project is licensed under the [ISC License](LICENSE).

---

*Built with ❤️ by H3K.*
