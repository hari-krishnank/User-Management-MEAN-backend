const { Router } = require('express');
const User = require('../models/users')
const router = Router()
const jwt = require('jsonwebtoken')
const multer = require('multer')

const path = require('path')

const bcrypt = require('bcrypt')

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, phone, is_admin } = req.body;
        console.log(req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: username,
            email,
            password: hashedPassword,
            phone,
            is_admin
        });

        const result = await newUser.save();

        const { _id } = result.toJSON()
        const token = jwt.sign({ _id: _id }, "secret")
        res.setHeader('Authorization', `Bearer ${token}`);

        console.log('token...', token);
        return res.status(201).json({ message: 'Registered successfully', token: token });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!(await bcrypt.compare(req.body.password,user.password))) {
            console.log('loginpass',user.password);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ _id: user._id }, "secret");
        console.log('login token', token);
        res.setHeader('AuthorizationLogin', `Bearer ${token}`);

        return res.status(200).json({ message: 'Login successful', token: token });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './file');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        console.log('dsadasdasda', filename);
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });


router.post('/userProfile', upload.single('image'), async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, 'secret');
        console.log('decoded and verified token.........:', decoded);
        const user = await User.findById(decoded._id);
        if (user) {
            let imagePath = null;
            if (req.file) {
                user.image = req.file.filename;

                const save = await user.save();
                imagePath = req.file.filename;
                console.log('saved user', save);
            }

            console.log('image path....', imagePath);
            return res.status(200).json({
                username: user.name,
                email: user.email,
                phone: user.phone,
                image: imagePath
            });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});





router.post('/verifyToken', async (req, res) => {
    const { token } = req.body;
    try {
        const verified = jwt.verify(token, "secret");
        console.log('verify cheyyunna token.....', verified);
        return res.status(200).json({ valid: true });
    } catch (error) {
        return res.status(401).json({ valid: false });
    }
});


module.exports = router;