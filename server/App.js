require("dotenv").config()
const express = require("express")
const morgan = require('morgan')
const multer = require('multer')
const { body , validationResult, check} = require('express-validator')
let productsData = require("./model/product")

const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.use(express.static("public")) // To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.

const PORT = parseInt(process.env.SERVER_PORT) || 3002

// to see how static files :- images , style sheets are served in the back end 
app.get('/',(req,res) => {
    res.sendFile(__dirname+ "/index.html")
})

// to upload file to local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
     
      cb(null, file.fieldname + '-' + file.originalname)
    }
  })
  
const upload = multer({ storage: storage })

app.post('/',upload.single("avater"), (req,res)=>{
    res.send("Data has uploaded")
})

app.get('/products', (req, res)=>{
    res.json({
        message:"return all products",
        productsData
    })
})

app.get('/products/:id([0-9]+)', (req,res)=>{
   
    try {
        const id = Number(req.params.id)
        const product = productsData.find(product=>product.id === id )
        if(!product){
            return res.json({
                message:`product with id = ${id} is not found`,
            })
        }

        return res.json({
            product
        })
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})



const isAdmin = (req,res,next) =>{
    req.body.isAdmin = false
    next()
}
/*const isValidInput = [
    check('title').trim().
                    notEmpty().
                    withMessage("title is missing").
                    isLength({min:2}).
                    withMessage("Minimum length should be 2").isLength({max:120}).
                    withMessage("Maximum length should be 120"),
    check("price").notEmpty().withMessage("price missed").isNumeric().withMessage("Provide number"),
    check("stock").notEmpty().withMessage("stock is missing").isNumeric().withMessage("Provide number")
]*/



app.post('/products',body("title").trim().notEmpty().withMessage("title is missing")
.isLength({min:2}).withMessage("title should be >= 2 character"), body("price").notEmpty().withMessage("price should not empty")
.isNumeric().withMessage("you provide text")
, (req,res)=>{

    try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({errors:errors.array()})
            }
            else{
            const {id} = req.body
            const product = productsData.find(product=>product.id === id)
            if(!product){
                productsData.push(req.body)
                return res.status(201).json({
                    message: "new product is added"
                })
            }
            return res.status(500).json({
                message: `product is existed with id =${id}`
            })
            }
            
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

app.delete('/products/:id([0-9]+)',isAdmin,(req,res)=>{
    const id = Number(req.params.id)

    try {
        if(req.body.isAdmin){
            productsData = productsData.filter(product=>product.id !== id)
            if(!productsData){
                return res.status(400).json({
                    message: `There is no data with id=${id} to delete`
                })
            }
            return res.status(201).json({
                message: `data with id =${id} successfully deleted `,
            })
        }
        else{
            res.status(401).json({
                message:"you are not authorized to do the action"
            })
        }
    }
         catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
        }
    
)

app.use('*', (req,res) => {
    res.status(400).json({
        message:"Parameter is not good try with numbers"
    })
})

app.listen(PORT,()=>{
    console.log(`App is running @ ${PORT} http://localhost:${PORT}`)
})
