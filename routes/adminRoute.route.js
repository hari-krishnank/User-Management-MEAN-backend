const { Router } = require('express');
const User = require('../models/users')
const adminRouter = Router();
const jwt = require('jsonwebtoken')

const bcrypt = require('bcrypt')

adminRouter.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email, is_admin: true });
        if (!user) {
            return res.status(400).send({
                message: "User not found"
            })
        }
        if (!await (bcrypt.compare(req.body.password, user.password))) {
            console.log(user.password);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const adminToken = jwt.sign({ _id: user._id }, "secret");
        console.log('login token', adminToken);
        res.setHeader('AuthorizationAdminLogin', `Bearer ${adminToken}`);

        return res.status(200).json({ message: 'Login successful', adminToken: adminToken });
    } catch (error) {
        console.log(error.message);
    }
})


adminRouter.get('/users', async (req, res) => {
    try {
        //   const user = await User.find({});
        const user = await User.find({}, { _id: 0 });
        res.send(user);
        console.log(user);
    } catch (error) {
        console.log(error.message);
    }
})


adminRouter.get('/editDetails/:email', async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.params.email });
        console.log('edit cheyyanam', userData);
        if (!userData) {
            return res.send({
                message: "Something went wrong"
            })
        }
        res.send(userData);
    } catch (error) {
        console.log(error.message);
    }
})

adminRouter.post('/editUser/:id', async (req, res) => {
    try {
        const { name, phone } = req.body;
        const userUpdate = await User.findByIdAndUpdate(req.params.id, { name, phone }, { new: true });
        if (!userUpdate) {
            return res.status(404).send({
                message: "User not found"
            });
        }
        res.send({
            message: "User updated successfully"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ error: "Internal server error" });
    }
});


adminRouter.post('/deleteUser/:userId', async (req, res) => {
    try {
        const deleteUser = await User.deleteOne({ email: req.params.userId });
        console.log('Delete cheyyanda usere kitti..', deleteUser);
        if (!deleteUser) {
            return res.status(404).send({
                message: "Deletion went wrong"
            });
        }
        res.send(deleteUser);
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ error: "Internal server error" });
    }
});


adminRouter.post('/createuser', async (req, res) => {
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

        await newUser.save();

        return res.status(201).json({ message: 'Created successfully' });
    } catch (error) {
        console.log(error.message);
    }
})


module.exports = adminRouter