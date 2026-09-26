require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');

const cartRoutes =require('./routes/cartRoutes')
const productRoutes = require('./routes/productRoutes')
const OrderRoutes = require('./routes/orderRoutes')
const authRoutes =require('./routes/authRoutes')
const wishlistRoutes =require('./routes/wishlistRoutes')
const paymentRoutes =require('./routes/paymentRoutes')

const app = express ()
app.use(cors());
app.use(express.json())

app.use('/api/cart',cartRoutes)
app.use('/api/product',productRoutes)
app.use('/api/order',OrderRoutes)
app.use('/api/auth/',authRoutes)
app.use('/api/wishlist',wishlistRoutes)
app.use('/api/payment',paymentRoutes)

mongoose.connect(
    (process.env.MONGO_URI)
)
.then(()=>console.log("MongoDB Connected"))
.catch(err=> console.log(" DB Connection Error:", err))
const PORT= process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})