const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

	const storage = multer.diskStorage({
		destination:(req,file,cb) => {
			cb(null, 'public/images');
		},
		filename: (req,file,cb) => {
			cb(null, file.originalname);
		}
	});

	const upload = multer({storage: storage});

const connection = mysql.createConnection({
	host: 'db4free.net',
	user: 'jaakss',
	password: 'Xavier1035H',
	database: 'miniproject691',
});

connection.connect((err) => {
	if (err) {
		console.error('Error connecting to MySQL:', err);
		return;
	}
	console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));
// enable from processing
app.use(
	express.urlencoded({
		extended: false,
	})
);

app.get('/productsearch', (req, res) => {
	const sql = 'SELECT * FROM product';

	connection.query(sql, (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Error Retrieving products');
		}
		res.render('productsearch', { product: results });
	});
});

app.get('/', (req, res) => {
	const sql = 'SELECT * FROM product';

	connection.query(sql, (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Error Retrieving products');
		}
		res.render('homepage_index', { product: results });
	});
});

// start
app.get('/', (req, res) => {
	const sql = 'SELECT * FROM product';

	connection.query(sql, (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Error Retrieving products');
		}
		res.render('homepage_index', { product: results });
	});
});

app.get('/homepage/:id', (req, res) => {
	const product_id = req.params.id;
	const sql = 'SELECT * FROM product WHERE product_id = ?';

	connection.query(sql, [product_id], (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Internal Server Error');
		}

		if (results.length > 0) {
			res.render('homepage', { product: results[0] });
		} else {
			res.status(404).send('Product not found');
		}
	});
});

//product start	
app.get('/product', (req, res) => {
	const sql = 'SELECT * FROM product';

	connection.query(sql, (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Error Retrieving products');
		}
		res.render('index', { product: results });
	});
});

app.get('/product/:id', (req, res) => {
	const product_id = req.params.id;
	const sql = 'SELECT * FROM product WHERE product_id = ?';

	connection.query(sql, [product_id], (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Internal Server Error');
		}

		if (results.length > 0) {
			res.render('product', { product: results[0] });
		} else {
			res.status(404).send('Product not found');
		}
	});
});

app.get('/coaches', (req, res) => {
	const sql = 'SELECT * FROM coach';

	connection.query(sql, (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Error Retrieving products');
		}
		res.render('coachesindex', { coach: results });
	});
});

app.get('/coaches/:id', (req, res) => {
	const product_id = req.params.id;
	const sql = 'SELECT * FROM coach WHERE coach_id = ?';

	connection.query(sql, [product_id], (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Internal Server Error');
		}

		if (results.length > 0) {
			res.render('coach', { coach: results[0] });
		} else {
			res.status(404).send('Coach not found');
		}
	});
});

app.get('/addProduct', (req, res) => {
	res.render('addProduct');
});

app.post('/addProduct', upload.single('product_image'), (req, res) => {
	// Extract product data from the request body
	const {product_name,product_quantity,product_price,product_description } = req.body;
	let product_image;
	if (req.file){
		product_image = req.file.filename;
	} else {
		product_image = null;
	}
	const sql = 'INSERT INTO product (product_name, product_quantity, product_price, product_image) VALUES (?,?,?,?)';
	connection.query(sql, [product_name,product_quantity,product_price,product_image], (error,results) => {
		if (error) {
			console.error('Error updating product:', error);
			res.status(500).send('Error updating product');
		} else {
			res.redirect('/');
	}}
);
});

app.get('/editProduct/:id', (req, res) => {
	const product_id = req.params.id;
	const sql = 'SELECT * FROM product WHERE product_id = ?';
	// Fetch data from MySQL based on the product ID
	connection.query(sql, [product_id], (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Error retrieving product by ID');
		}
		// Check if any product with the given ID was found
		if (results.length > 0) {
			// Render HTML page with the product data
			res.render('editProduct', { product: results[0] });
		} else {
			// If no product with the given ID was found, render a 404 page or handle it accordingly
			res.status(404).send('Product not found');
		}
	});
});

app.post('/editProduct/:id', upload.single('product_image'),(req, res) => {
	const product_id = req.params.id;
	// Extract product data from the request body
	const { name,quantity,price, description} = req.body;
	let product_image = req.body.currentImage;
	if (req.file){
		product_image = req.file.filename;
	}
	const sql = 'UPDATE product SET product_name = ? , product_quantity = ?, product_price = ?, product_description = ? , product_image =? WHERE product_id = ?';

	// Insert the new product into the database
	connection.query(sql,[name, quantity, price, description, product_image, product_id],(error, results) => {
			if (error) {
				// Handle any error that occurs during the database operation
				console.error('Error updating product:', error);
				res.status(500).send('Error updating product');
			} else {
				// Send a success response
				res.redirect('/');
		}}
	);
});

app.get('/deleteProduct/:id', (req, res) => {
    const product_id = req.params.id;
    const sql = 'DELETE FROM product WHERE product_id = ?';
    
    connection.query(sql, [product_id], (error, results) => {
      if (error) {
        // Handle any error that occurs during the database operation
        console.error('Error deleting student:', error);
        return res.status(500).send('Error deleting product');
      } else {
        // Send a success response
        res.redirect('/');
      }
    });
  });

//Coach Start
app.get('/coach', (req, res) => {
	const sql = 'SELECT * FROM coach';

	connection.query(sql, (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Error Retrieving coach');
		}
		res.render('index1', { coach: results });
	});
});

app.get('/coach/:id', function (req, res) {
	const coach_id = req.params.id;
	const sql = 'SELECT * FROM coach WHERE coach_id = ?';

	connection.query(sql, [coach_id], (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Internal Server Error');
		}

		if (results.length > 0) {
			res.render('coach', { coach: results[0] });
		} else {
			res.status(404).send('Coach not found');
		}
	});
});

app.get('/addCoach', (req, res) => {
	res.render('addCoach');
});

app.post('/addCoach', upload.single('coach_image'), (req, res) => {
	// Extract coach data from the request body
	const { coach_name, coach_description,coach_gender,coach_age,coach_fee } = req.body;

	let coach_image;
	if (req.file){
		coach_image = req.file.filename;
	} else {
		coach_image = null;
	}

	const sql = 'INSERT INTO coach (coach_name, coach_description,coach_gender,coach_age,coach_fee,coach_image) VALUES (?,?,?,?,?,?)';
	connection.query(sql, [coach_name, coach_description,coach_gender,coach_age,coach_fee,coach_image], (error,results) => {
		if (error) {
			console.error('Error updating coach:', error);
			res.status(500).send('Error updating coach');
		} else {
			res.redirect('/coach');
	}}
);
});


app.get('/editCoach/:id', (req, res) => {
	const coach_id = req.params.id;
	const sql = 'SELECT * FROM coach WHERE coach_id = ?';
	// Fetch data from MySQL based on the coach ID
	connection.query(sql, [coach_id], (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Error retrieving coach by ID');
		}
		// Check if any coach with the given ID was found
		if (results.length > 0) {
			// Render HTML page with the coach data
			res.render('editCoach', { coach: results[0] });
		} else {
			// If no coach with the given ID was found, render a 404 page or handle it accordingly
			res.status(404).send('Coach not found');
		}
	});
});

app.post('/editCoach/:id', upload.single('coach_image'),(req, res) => {
	const coach_id = req.params.id;
	// Extract coach data from the request body
	const { coach_name,coach_description,coach_gender,coach_age,coach_fee } = req.body;
	let coach_image = req.body.currentImage;
	if (req.file){
		coach_image = req.file.filename;
	}
	const sql = 'UPDATE coach SET coach_name = ? , coach_description = ?,coach_gender = ?, coach_age = ?, coach_fee = ?, coach_image =? WHERE coach_id = ?';

	// Insert the new coach into the database
	connection.query(sql,[coach_name,coach_description,coach_gender,coach_age,coach_fee,coach_image,coach_id],(error, results) => {
			if (error) {
				// Handle any error that occurs during the database operation
				console.error('Error updating coach:', error);
				res.status(500).send('Error updating coach');
			} else {
				// Send a success response
				res.redirect('/coach');
			}
		}
	);
});

app.get('/deletecoach/:id', (req, res) => {
	const coach_id = req.params.id;
	const sql = 'DELETE FROM coach WHERE coach_id = ?';
	connection.query(sql, [coach_id], (error, results) => {
		if (error) {
			// Handle any error that occurs during the database operation
			console.error('Error deleting coach:', error);
			res.status(500).send('Error deleting coach');
		} else {
			// Send a success response
			res.redirect('/coach');
		}
	});
});
//info start
app.get('/info', (req, res) => {
	const sql = 'SELECT * FROM info';

	connection.query(sql, (error, results) => {
		if (error) {
			console.error('Database query error:', error.message);
			return res.status(500).send('Error Retrieving info');
		}
		res.render('info_index',{ info: results });
	});
});

app.get('/deleteinfo/:id', (req, res) => {
	const badminton_id = req.params.id;
	const sql = 'DELETE FROM info WHERE badminton_id = ?';
	connection.query(sql, [badminton_id], (error, results) => {
		if (error) {
			// Handle any error that occurs during the database operation
			console.error('Error deleting info:', error);
			res.status(500).send('Error deleting info');
		} else {
			// Send a success response
			res.redirect('/info');
		}
	});
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
