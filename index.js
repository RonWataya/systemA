const express = require("express");
const cors = require("cors");
const db = require("./config/db.js"); // Import your database connection from db.js
const sgMail = require('@sendgrid/mail');
const app = express();
const sendgridApiKey = '';

// parse requests of content-type - application/json
//app.use(express.json());
app.use(express.json({ limit: '50mb' }));
// parse requests of content-type - application/x-www-form-urlencoded
//app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



// Add Access Control Allow Origin headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(cors({
    origin: '*'
}));
// Set the SendGrid API key
sgMail.setApiKey(sendgridApiKey);



// Define a route for fetching and printing "portifolio" data as JSON
app.get("/api/portifolio", (req, res) => {
    db.query("SELECT * FROM portifolio", (error, results) => {
        if (error) {
            console.error("Error fetching portifolio data:", error);
            res.status(500).json({ message: "Error fetching portifolio data" });
        } else {
            console.log("Portifolio data fetched successfully");
            res.status(200).json(results);
        }
    });
});
app.get("/api/ideas", (req, res) => {
    db.query("SELECT * FROM businessIdeas", (error, results) => {
        if (error) {
            console.error("Error fetching portifolio data:", error);
            res.status(500).json({ message: "Error fetching portifolio data" });
        } else {
            console.log("Ideas data fetched successfully");
            res.status(200).json(results);
        }
    });
});
//Update the user profile table 
// Update the user profile table
app.post("/api/users/update", (req, res) => {
    const formData = req.body;
    const phone = formData.phone;
    const photo = formData.photo;
    console.log(photo);

    // Create an array to hold the SET clauses for the SQL query
    const setClauses = [];

    // Create an array to hold the values for the SQL query
    const values = [];

    // Function to add a clause to the setClauses array and push the value to the values array
    const addClause = (field, value) => {
        if (value !== undefined && value !== null && value !== '') {
            setClauses.push(`${field}=?`);
            values.push(value);
        }
    };

    // Add clauses for each field
    addClause('firstName', formData.firstName);
    addClause('lastName', formData.lastName);
    addClause('occupation', formData.occupation);
    addClause('otherphone', formData.otherphone);
    addClause('address', formData.address);
    addClause('twitter', formData.twitter);
    addClause('facebook', formData.facebook);
    addClause('instagram', formData.instagram);
    addClause('linkedin', formData.linkedin);
    addClause('about', formData.about);
    addClause('photo', formData.photo);

    // If there are fields to update, perform the update
    if (setClauses.length > 0) {
        const setClause = setClauses.join(', ');

        // Perform user update logic (update data in the database)
        const query = `UPDATE users SET ${setClause} WHERE phone=${phone}`;

        db.query(query, values, (error, results) => {
            if (error) {
                console.error("Error updating user:", error);
                res.status(500).json({ message: "Error updating user" });
            } else {
                console.log("User updated successfully");
                res.status(200).json({ message: "User updated successfully" });
            }
        });
    } else {
        // No fields to update
        res.status(400).json({ message: "No fields to update" });
    }
});

//Password reset
app.post("/api/users/passwordReset", (req, res) => {
    const formData = req.body;
    const email = formData.email;
    const password = formData.password;

    // Perform user update logic (update data in the database)
    const query = `UPDATE users SET password=? WHERE email=?`;
    const values = [password, email];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ message: "Error updating user" });
        } else {
            console.log("User updated successfully");
            res.status(200).json({ message: "User updated successfully" });
        }
    });
});

//Delete request
app.post("/api/users/deleteRequest", (req, res) => {
    const formData = req.body;
    const email = formData.email;
    const phone = formData.phone;
    const accountid = formData.accountID;
    const reason = formData.reason;

    // Perform user update logic (insert data into the database)
    const query = "INSERT INTO deleteAccounts (email, phone, accountid, reason) VALUES (?, ?, ?, ?)";
    const values = [email, phone, accountid, reason];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error("Error inserting delete request:", error);
            res.status(500).json({ message: "Error inserting delete request" });
        } else {
            console.log("Delete request inserted successfully");
            res.status(200).json({ message: "Delete request inserted successfully" });
        }
    });
});


//fetching updated data after new updates are made in the profile
app.get("/api/users/:phone", (req, res) => {
    const phone = req.params.phone;
    db.query("SELECT * FROM users WHERE phone = ?", [phone], (error, results) => {
        if (error) {
            console.error("Error fetching updated user data:", error);
            res.status(500).json({ message: "Error fetching updated user data" });
        } else {
            console.log("Updated user data fetched successfully");
            res.status(200).json(results[0]); // Assuming the query returns a single user
        }
    });
});

// Define a route for fetching and sending "reviews" data as JSON
app.get("/api/reviews", (req, res) => {
    db.query("SELECT * FROM reviews", (error, results) => {
        if (error) {
            console.error("Error fetching reviews data:", error);
            res.status(500).json({ message: "Error fetching reviews data" });
        } else {
            console.log("Reviews data fetched successfully");
            res.status(200).json(results);
        }
    });
});


//Buusiness functions
app.post("/api/ideas/create", (req, res) => {
    // Parse the JSON data from the request body

    const formData = req.body;
    console.log('Received Form Data:', formData);
    const Data = [formData.ideaName,formData.Summary,formData.Market,formData.Traction,formData.Founders,formData.Category,formData.userId,formData.userName,formData.Email,formData.Phone,formData.Country,formData.Photo];
   

    // Perform user registration logic (insert data into the database)
    // Replace the following lines with your actual user registration code
    db.query("INSERT INTO businessIdeas (name, summary, market, traction, founders, category, userId, username, useremail, userphone, nationality, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", Data,
    (error, results) => {
            if (error) {
                console.error("Error:", error);
                res.status(500).json({ message: "Error" });
            } else {
                console.log("Profile successfully");
                // Clear the session storage
                //  req.session.formData = null; // Replace 'formData' with your actual session variable name
                res.status(200).json({ message: "Profile successfully" });
            }
        });
});
// update the business profile table





app.post("/api/ideas/update", (req, res) => {
    const formData = req.body;
   
    console.log(formData);

    // Create an array to hold the SET clauses for the SQL query
    const setClauses = [];

    // Create an array to hold the values for the SQL query
    const values = [];

    // Function to add a clause to the setClauses array and push the value to the values array
    const addClause = (field, value) => {
        if (value !== undefined && value !== null && value !== '') {
            setClauses.push(`${field}=?`);
            values.push(value);
        }
    };

   
  // Add clauses for each field
  addClause('name', formData.ideaName);
  addClause('summary', formData.Summary);
  addClause('market', formData.Market);
  addClause('traction', formData.Traction);
  addClause('founders', formData.Founders);
  addClause('category', formData.Category);
  addClause('useremail', formData.Email);
  addClause('userphone', formData.Phone);
  addClause('nationality', formData.Country);
  addClause('photo', formData.Photo);
  
    // If there are fields to update, perform the update
    if (setClauses.length > 0) {
        const setClause = setClauses.join(', ');

        // Perform user update logic (update data in the database)
        const query = `UPDATE businessIdeas SET ${setClause} WHERE userId=${formData.userId}`;

        db.query(query, values, (error, results) => {
            if (error) {
                console.error("Error updating user:", error);
                res.status(500).json({ message: "Error updating user" });
            } else {
                console.log("User updated successfully");
                res.status(200).json({ message: "success" });
            }
        });
    } else {
        // No fields to update
        res.status(400).json({ message: "No fields to update" });
    }
});

//Delete business profile
//Delete request
app.post("/api/ideas/delete", (req, res) => {
    const formData = req.body;
    console.log(formData)

    // Perform user delete logic (delete data from the database)
    const query = `DELETE FROM businessIdeas WHERE id = ?`;

    db.query(query, [formData.ideaId], (error, results) => {
        if (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ message: "Error deleting user" });
        } else {
            console.log("deleted successfully");
            res.status(200).json({ message: "deleted" });
        }
    });
});

app.get("/api/users/ideas/:userId", (req, res) => {
    const userId = req.params.userId;

    db.query("SELECT * FROM businessIdeas WHERE userId = ? LIMIT 1", [userId], (error, results) => {
        if (error) {
            console.error("Error fetching updated user data:", error);
            res.status(500).json({ message: "Error fetching updated user data" });
        } else {
            console.log("Business data fetched successfully");

            // Construct the response object with the desired properties
            const responseObject = results.length > 0
                ? {
                    id: results[0].id,
                    name: results[0].name,
                    summary: results[0].summary,
                    market: results[0].market,
                    traction: results[0].traction,
                    username: results[0].username,
                    founders: results[0].founders,
                    useremail: results[0].useremail,
                    userphone: results[0].userphone,
                    userId: results[0].userId,
                    nationality: results[0].nationality,
                    category: results[0].category,
                    photo: results[0].photo,
                    // Add other properties as needed
                  }
                : {}; // Empty object if no results

            // Send the constructed object as a JSON response
            res.status(200).json(responseObject);
        }
    });
});
// set port, listen for requests
const PORT = 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log(sendgridApiKey);
});