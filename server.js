//server.js
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./db");


const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
    console.log("Register endpoint hit");
    const { username, email, password } = req.body;
    console.log("password",password);
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    

        // Insert the new user into the database
        const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) throw err;
            res.status(201).send("User registered successfully");
        });
    } catch (error) {
        res.status(500).send("Error registering user");
    }
});

// User login
router.post('/login', (req, res) => {
    console.log("here");
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    // Find the user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        // 3. Check if user exists
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];
        console.log("User ",user);
        if (!user.password) {
            console.log("No hashed password stored for user:", email);
            return res.status(500).send('Password not set for this account');
        }

        try {
            // ✅ 4. Compare passwords safely
            const isMatch = await bcrypt.compare(password, user.password);
            console.log("Password matched",isMatch);
            if (isMatch) {
                res.status(200).send('Login successful');
            } else {
                res.status(401).send('Invalid credentials');
            }
        } catch (compareError) {
            console.error('Bcrypt error:', compareError);
            res.status(500).send('Error checking password');
        }
    });
});

//User read
router.get("/users", async(req,res) => {
    try {
        const data = await db.promise().query(
          `SELECT *  from users;`
        );
        
        res.status(202).json({
          users: data[0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//uSER REad
router.get("/user/:id", async(req, res) => {
    try {
        const {id} = req.params
        const data = await db.promise().query(
          `SELECT *  from users where id = ?`,[id]
        );
        res.status(200).json({
          user: data[0][0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//User Update
router.patch("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password,address, is_admin } = req.body;
    const hashedPassword= await bcrypt.hash(password,10)
    await db.promise().query(
        `UPDATE users set username = ?, email = ?, password = ?, address = ?, is_admin= ? where id = ?`,
        [ username, email, hashedPassword, address, is_admin, id]
      );
    res.status(200).json({
      message: "updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

//User Delete
router.delete("/user/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.promise().query(
          `DELETE FROM  users where id = ?`,
          [id]
        );
      res.status(200).json({
        message: "deleted",
      });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  });

  //create play
router.post("/createplay", (req, res) => {
  console.log("Register endpoint hit");
  const { playname, director, duration, genre, added_by } = req.body;

  const query = "INSERT INTO plays (playname, director, duration, genre, added_by) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [playname, director, duration, genre, added_by], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Error creating play");
    }
    res.status(201).send("Play created successfully");
  });
});


//play R
router.get("/play/:id", async(req,res)=>{
  try{
    const { id } =req.params;
    const data = await db.promise().query(
      `SELECT *  from plays where id = ?`,[id]
      );
        res.status(200).json({
          plays: data[0][0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//play R
router.get("/plays", async(req, res) => {
    try {
        const data = await db.promise().query(
          `SELECT *  from plays;`
        );
        res.status(202).json({
          plays: data[0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//play U
router.patch("/play/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { playname, director, genre, duration, added_by } = req.body;
    await db.promise().query(
        `UPDATE plays set playname = ?, director = ?, genre = ?, duration = ?, added_by = ? where id = ?`,
        [ playname, director, genre, duration, added_by, id]
      );
    
    res.status(200).json({
      message: "updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

//play D
router.delete("/play/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.promise().query(
          `DELETE FROM  plays where id = ?`,
          [id]
        );
      res.status(200).json({
        message: "deleted",
      });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  });

//activeplay create
router.post("/createacplay", (req, res) => {
  console.log("Register endpoint hit");
  const { time, total_occupancy, play_id } = req.body;

  const query = "INSERT INTO active_play (time, total_occupancy, play_id) VALUES (?, ?, ?)";
  db.query(query, [time, total_occupancy, play_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Error creating play");
    }
    res.status(201).send("Play created successfully");
  });
});

//activeplay read
router.get("/active_play", async(req, res) => {
    try {
        const data = await db.promise().query(
          `SELECT *  from active_play;`
        );
        res.status(202).json({
          active_play: data[0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//activeplay sinngle read
router.get("/active_play/:id", async(req,res)=>{
  try{
    const { id } =req.params;
    const data = await db.promise().query(
      `SELECT *  from active_play where id = ?`,[id]
      );
        res.status(200).json({
          active_play: data[0][0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//activeplay update
router.patch("/active_play/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { time, total_occupancy, play_id } = req.body;
    await db.promise().query(
        `UPDATE active_play set time = ?, total_occupancy = ?, play_id = ? where id = ?`,
        [ time, total_occupancy, play_id, id]
      );
    
    res.status(200).json({
      message: "updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

//activeplay delete
router.delete("/active_play/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.promise().query(
          `DELETE FROM  active_play where id = ?`,
          [id]
        );
      res.status(200).json({
        message: "deleted",
      });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  });

//bookings create
router.post("/booking", (req, res) => {
  console.log("Register endpoint hit");
  const { activeplay_id, seatno, payment_id, user_id } = req.body;

  const query = "INSERT INTO bookings (activeplay_id, seatno, payment_id, user_id) VALUES (?, ?, ?, ?)";
  db.query(query, [activeplay_id, seatno, payment_id, user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Booking Failed.");
    }
    res.status(201).send("Show Booked Successfully.");
  });
});

//booking read w
router.get("/bookingrw", async(req, res) => {
    try {
        const data = await db.promise().query(
          `SELECT *  from bookings;`
        );
        res.status(202).json({
          bookings: data[0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//booking read s
router.get("/bookingrs/:id", async(req,res)=>{
  try{
    const { id } =req.params;
    const data = await db.promise().query(
      `SELECT *  from bookings where id = ?`,[id]
      );
        res.status(200).json({
          bookings: data[0][0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//booking update
router.patch("/booking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { activeplay_id, seatno, payment_id, user_id } = req.body;
    await db.promise().query(
        `UPDATE bookings set activeplay_id = ?, seatno = ?, payment_id = ?, user_id = ? where id = ?`,
        [ activeplay_id, seatno, payment_id, user_id, id]
      );
    
    res.status(200).json({
      message: "updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

//eswea integration
router.get("/pay-with-esewa",(req,res,next)=>{
}) 

router.get("/success",()=>{
//handle success callback
})

router.get("/failure",()=>{
//handle failure callback
})

//html form
router.get("/pay-with-esewa",(req,res,next)=>{
    let order_price=req.query.price
    let tax_amount=0
    let amount=order_price
    let transaction_uuid=generateRandomString()
    let product_code="EPAYTEST"
    let product_service_charge = 0
    let product_delivery_charge = 0
    let secretKey="8gBm/:&EnhH.1/q"
    let signature=generateSignature(`total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`,secretKey)

 
    res.send(`
    <body>
        <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
            <input type="text" id="amount" name="amount" value="${amount}" required>
            <input type="text" id="tax_amount" name="tax_amount" value ="${tax_amount}" required>
            <input type="text" id="total_amount" name="total_amount" value="${amount}" required>
            <input type="text" id="transaction_uuid" name="transaction_uuid" value="${transaction_uuid}" required>
            <input type="text" id="product_code" name="product_code" value ="EPAYTEST" required>
            <input type="text" id="product_service_charge" name="product_service_charge" value="${product_service_charge}" required>
            <input type="text" id="product_delivery_charge" name="product_delivery_charge" value="${product_delivery_charge}" required>\
            <input type="text" id="success_url" name="success_url" value="http://localhost:3000/success" required>
            <input type="text" id="failure_url" name="failure_url" value="http://localhost:3000/failure" required>
            <input type="text" id="signed_field_names" name="signed_field_names" value="total_amount,transaction_uuid,product_code" required>
            <input type="text" id="signature" name="signature" value="${signature}" required>
            <input value="Submit" type="submit">
         </form>
    </body>
    `)
    })

router.get("/failure", (req, res) => {
    console.log(req.query);
    res.json({ message: "Payment failed" });
});

router.get("/success", (req, res) => {
    let token = req.query.data;
    let queryBody = JSON.parse(Buffer.from(token, "base64").toString("ascii"));
    res.json({ "message": `Payment Info ${queryBody}` });
});


module.exports = router;