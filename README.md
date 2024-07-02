
live-link:- https://assignment-no-11-2de58.web.app/

client-side:- https://github.com/MdSaifulIslamRafsan/CareerLinkup-client-side

## Overview
This repository contains the backend server-side codebase for a job-seeking website, designed to handle job application integration, add, and delete functionality using MongoDB for data storage.


## Installation

- Clone the Repository:

```sh
git clone https://github.com/MdSaifulIslamRafsan/CareerLinkup-server-side.git
cd CareerLinkup-server-side
```

- Install Dependencies:

```sh
npm install
```

- Set Up Environment Variables:
  
Create a .env file in the root directory with the following variables:

```sh
# MongoDB Configuration
DB_USER=your_database_username
DB_PASSWORD=your_database_password

# Authentication Token Secret
ACCESS_TOKEN_SECRET=your_access_token_secret

```
- Start the Development Server:

```sh
nodemon index.js
```

## Features

- Deadline Management: Stay informed about application deadlines, preventing users from applying for jobs past the deadline and ensuring fairness in the hiring process.
     
- Personalized Job Management: Maintain control over posted jobs with options to update or delete listings, empowering users to manage their career opportunities effectively.

- Email Integration: Seamlessly communicate with candidates and employers through integrated email functionality.


## Technologies Used
- Frontend: React , tailwind
- Backend: Express
- Database: MongoDB
- Payment Gateway: Stripe
- Hosting & Authentication: Firebase
- Image Hosting: imgBB
- Token Management: JWT (JSON Web Tokens)
