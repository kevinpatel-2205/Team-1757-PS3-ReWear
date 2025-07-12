# 👕 ReWear App — Odoo x Hackathon 2025

A sustainable product listing platform designed to promote reuse and responsible shopping. Built with a user-first approach, ReWear allows customers to list, explore, and manage clothing items with ease — while giving admins the tools to moderate and maintain content quality.



##  Team ID: 1757

| Name                     | Role                                   |
|--------------------------|----------------------------------------|
| Bhavi SheetalKumar Patel | Team Leader / Database Admin (Schema Developer) |
| Nimesh Prajapati         | API Developer + QA and Testing         |
| Amit Prajapati           | Backend Developer                      |
| Kevin Patel              | UI/UX Developer                        |


##  System Architecture

                [ ReWear App (Frontend) ]
                          |
       --------------------------------------------
       |                                          |
[Backend API Server]                  ↔     [Image Storage]
       ↕                                          ↕
[MongoDB Server (Local DB)]          ←→     [Image URLs]
```

- Frontend: Cross-platform responsive app.
- Backend: REST APIs for handling data and user logic.
- Database: MongoDB used for storing users, products, metadata.
- Image Storage: Hosts uploaded item images with URL reference.


##  API Status Codes

1. 200 (Success)
- Database Connected Successful
- API CRUD Success
- Network Fetch Success
- Image Upload/Get Success
- Login Logout/Auth Success

2. 201 (Created)
- Product added
- Resource Created
- Create new User

3. 204 (No Content)
- No Products found

4. 401 (Unauthorized)
- Invalid Credentials

5. 403 (Forbidden)
- Can Login but cannot have admin Permissions

6. 404 (Not Found)
- No Resource Found

7. 500 (Internal Server Error)
- Database Connection/SQL Error


##  User Roles

###  Admin
- Approve/reject items
- Remove spam/inappropriate content
- Access admin dashboard

###  Registered Users
- Register & login securely
- View/upload product images
- List new items for reuse
- Edit profile and manage dashboard


##  Testing & Validation